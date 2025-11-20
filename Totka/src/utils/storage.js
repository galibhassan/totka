import AsyncStorage from '@react-native-async-storage/async-storage';

const MEDICINES_KEY = '@totka_medicines';
const HISTORY_KEY = '@totka_history';

// Medicine object structure:
// {
//   id: string (timestamp)
//   name: string
//   times: string[] (array of times like "09:00", "13:00")
// }

// History object structure:
// {
//   date: string (YYYY-MM-DD)
//   medicines: {
//     medicineId: {
//       name: string
//       times: { time: string, taken: boolean, timestamp: number }[]
//     }
//   }
// }

export const getMedicines = async () => {
  try {
    const data = await AsyncStorage.getItem(MEDICINES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting medicines:', error);
    return [];
  }
};

export const saveMedicines = async (medicines) => {
  try {
    await AsyncStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
  } catch (error) {
    console.error('Error saving medicines:', error);
  }
};

export const addMedicine = async (name, times) => {
  try {
    const medicines = await getMedicines();
    const newMedicine = {
      id: Date.now().toString(),
      name,
      times: times.sort(),
    };
    medicines.push(newMedicine);
    await saveMedicines(medicines);
    return newMedicine;
  } catch (error) {
    console.error('Error adding medicine:', error);
  }
};

export const deleteMedicine = async (medicineId) => {
  try {
    const medicines = await getMedicines();
    const filtered = medicines.filter(m => m.id !== medicineId);
    await saveMedicines(filtered);
  } catch (error) {
    console.error('Error deleting medicine:', error);
  }
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting history:', error);
    return {};
  }
};

export const saveHistory = async (history) => {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

export const markMedicineTaken = async (medicineId, medicineName, time) => {
  try {
    const history = await getHistory();
    const today = new Date().toISOString().split('T')[0];

    if (!history[today]) {
      history[today] = { medicines: {} };
    }

    if (!history[today].medicines[medicineId]) {
      history[today].medicines[medicineId] = {
        name: medicineName,
        times: {},
      };
    }

    history[today].medicines[medicineId].times[time] = {
      taken: true,
      timestamp: Date.now(),
    };

    await saveHistory(history);
  } catch (error) {
    console.error('Error marking medicine as taken:', error);
  }
};

export const getTodaysMedicines = async () => {
  try {
    const medicines = await getMedicines();
    const history = await getHistory();
    const today = new Date().toISOString().split('T')[0];

    return medicines.map(medicine => ({
      ...medicine,
      todaysStatus: (history[today]?.medicines[medicine.id]?.times || {}),
    }));
  } catch (error) {
    console.error('Error getting today\'s medicines:', error);
    return [];
  }
};

export const getHistoryByDate = async (date) => {
  try {
    const history = await getHistory();
    return history[date] || null;
  } catch (error) {
    console.error('Error getting history by date:', error);
    return null;
  }
};

export const getAllHistoryDates = async () => {
  try {
    const history = await getHistory();
    return Object.keys(history).sort().reverse();
  } catch (error) {
    console.error('Error getting history dates:', error);
    return [];
  }
};
