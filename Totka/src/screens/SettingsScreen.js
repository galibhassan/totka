import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all medicines and history? This cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete All',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@totka_medicines');
              await AsyncStorage.removeItem('@totka_history');
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Totka</Text>
          <View style={styles.infoCard}>
            <Text style={styles.appName}>Totka</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Your personal medicine reminder app. Never miss a dose again.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureCard}>
            <View style={styles.featureItem}>
              <Ionicons name="notifications" size={24} color="#4CAF50" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Smart Reminders</Text>
                <Text style={styles.featureDesc}>Get notified at your medicine times</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-done" size={24} color="#4CAF50" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Track Progress</Text>
                <Text style={styles.featureDesc}>Mark medicines as taken</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={24} color="#4CAF50" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Daily History</Text>
                <Text style={styles.featureDesc}>View your medicine history by date</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <View style={styles.infoCard}>
            <Text style={styles.stepTitle}>1. Add Medicine</Text>
            <Text style={styles.stepDesc}>Go to Reminders tab and tap the + button</Text>

            <Text style={styles.stepTitle}>2. Set Times</Text>
            <Text style={styles.stepDesc}>Enter medicine name and times you need to take it</Text>

            <Text style={styles.stepTitle}>3. Get Reminders</Text>
            <Text style={styles.stepDesc}>Receive notifications at scheduled times</Text>

            <Text style={styles.stepTitle}>4. Mark as Done</Text>
            <Text style={styles.stepDesc}>Press the Done button after taking medicine</Text>

            <Text style={styles.stepTitle}>5. View History</Text>
            <Text style={styles.stepDesc}>Check your medicine history in the History tab</Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearAllData}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  featureDesc: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  stepDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
