import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAllHistoryDates, getHistoryByDate } from '../utils/storage';

const HistoryScreen = () => {
  const [historyDates, setHistoryDates] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
  const [historyData, setHistoryData] = useState({});

  useFocusEffect(
    useCallback(() => {
      loadHistoryDates();
    }, [])
  );

  const loadHistoryDates = async () => {
    const dates = await getAllHistoryDates();
    setHistoryDates(dates);
  };

  const handleExpandDate = async (date) => {
    if (expandedDate === date) {
      setExpandedDate(null);
    } else {
      if (!historyData[date]) {
        const data = await getHistoryByDate(date);
        setHistoryData(prev => ({
          ...prev,
          [date]: data,
        }));
      }
      setExpandedDate(date);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const renderHistoryItem = ({ item: date }) => {
    const history = historyData[date];
    const isExpanded = expandedDate === date;

    return (
      <View style={styles.historyCard}>
        <TouchableOpacity
          style={styles.dateHeader}
          onPress={() => handleExpandDate(date)}
        >
          <View>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            {history && (
              <Text style={styles.dateSubText}>
                {Object.keys(history.medicines || {}).length} medicines
              </Text>
            )}
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#4CAF50"
          />
        </TouchableOpacity>

        {isExpanded && history && (
          <View style={styles.medicinesContainer}>
            {Object.entries(history.medicines || {}).map(([medicineId, medicineData]) => (
              <View key={medicineId} style={styles.medicineHistoryItem}>
                <Text style={styles.medicineNameHistory}>{medicineData.name}</Text>
                <View style={styles.timesListHistory}>
                  {Object.entries(medicineData.times || {}).map(([time, status]) => (
                    <View key={time} style={styles.timeStatusItem}>
                      <Text style={styles.timeStatusText}>{time}</Text>
                      {status.taken ? (
                        <View style={styles.takenBadge}>
                          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                          <Text style={styles.takenText}>Taken</Text>
                        </View>
                      ) : (
                        <View style={styles.missedBadge}>
                          <Ionicons name="close-circle" size={18} color="#FF6B6B" />
                          <Text style={styles.missedText}>Missed</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {historyDates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No history yet</Text>
          <Text style={styles.emptySubText}>Your medicine history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={historyDates}
          renderItem={renderHistoryItem}
          keyExtractor={item => item}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F9F9F9',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  medicinesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    padding: 12,
  },
  medicineHistoryItem: {
    marginBottom: 16,
  },
  medicineNameHistory: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  timesListHistory: {
    gap: 8,
  },
  timeStatusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  timeStatusText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  takenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
  },
  takenText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  missedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  missedText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
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
});

export default HistoryScreen;
