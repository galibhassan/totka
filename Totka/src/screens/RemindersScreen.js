import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getTodaysMedicines, markMedicineTaken, deleteMedicine } from '../utils/storage';
import { scheduleNotification } from '../utils/notifications';

const RemindersScreen = () => {
  const [medicines, setMedicines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [times, setTimes] = useState(['']);

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [])
  );

  const loadMedicines = async () => {
    const todaysMedicines = await getTodaysMedicines();
    setMedicines(todaysMedicines);
  };

  const handleAddMedicine = async () => {
    if (!medicineName.trim()) {
      Alert.alert('Error', 'Please enter medicine name');
      return;
    }

    const validTimes = times.filter(t => t.trim() && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t.trim()));
    if (validTimes.length === 0) {
      Alert.alert('Error', 'Please enter valid times in HH:MM format');
      return;
    }

    try {
      const { addMedicine } = require('../utils/storage');
      const newMedicine = await addMedicine(medicineName, validTimes);

      // Schedule notifications for all times
      validTimes.forEach(time => {
        scheduleNotification(newMedicine.id, medicineName, time);
      });

      setMedicineName('');
      setTimes(['']);
      setModalVisible(false);
      loadMedicines();
      Alert.alert('Success', 'Medicine added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add medicine');
    }
  };

  const handleMarkDone = async (medicineId, medicineName, time) => {
    try {
      await markMedicineTaken(medicineId, medicineName, time);
      loadMedicines();
      Alert.alert('Success', `${medicineName} marked as taken at ${time}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark medicine as taken');
    }
  };

  const handleDeleteMedicine = (medicineId) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            await deleteMedicine(medicineId);
            loadMedicines();
          },
        },
      ]
    );
  };

  const addTimeField = () => {
    setTimes([...times, '']);
  };

  const updateTimeField = (index, value) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const removeTimeField = (index) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes.length === 0 ? [''] : newTimes);
  };

  const renderMedicineItem = ({ item }) => (
    <View style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <Text style={styles.medicineName}>{item.name}</Text>
        <TouchableOpacity onPress={() => handleDeleteMedicine(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.timesContainer}>
        {item.times.map((time, index) => {
          const isTaken = item.todaysStatus && item.todaysStatus[time]?.taken;
          return (
            <View key={index} style={styles.timeItem}>
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>{time}</Text>
                {isTaken && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
              </View>
              {!isTaken && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => handleMarkDone(item.id, item.name, time)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {medicines.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No medicines added yet</Text>
            <Text style={styles.emptySubText}>Add your first medicine reminder</Text>
          </View>
        ) : (
          <FlatList
            data={medicines}
            renderItem={renderMedicineItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setMedicineName('');
          setTimes(['']);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Medicine</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="black" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Medicine Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Aspirin, Vitamin C"
                value={medicineName}
                onChangeText={setMedicineName}
              />

              <Text style={styles.label}>Times to take (HH:MM format)</Text>
              {times.map((time, index) => (
                <View key={index} style={styles.timeInputRow}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="09:00"
                    value={time}
                    onChangeText={value => updateTimeField(index, value)}
                    maxLength={5}
                  />
                  {times.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeTimeField(index)}
                    >
                      <Ionicons name="remove-circle" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addTimeButton} onPress={addTimeField}>
                <Ionicons name="add-circle" size={24} color="#4CAF50" />
                <Text style={styles.addTimeButtonText}>Add another time</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleAddMedicine}
                >
                  <Text style={styles.submitButtonText}>Add Medicine</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  timesContainer: {
    gap: 8,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  removeButton: {
    padding: 4,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  addTimeButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RemindersScreen;
