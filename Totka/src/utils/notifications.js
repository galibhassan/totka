import * as Notifications from 'expo-notifications';

export const scheduleNotification = async (medicineId, medicineName, time) => {
  try {
    // Parse time (format: "HH:MM")
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0);

    // If time has passed today, schedule for tomorrow
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const secondsUntilNotification = Math.floor((notificationTime - now) / 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medicine Reminder',
        body: `Time to take ${medicineName}!`,
        sound: 'default',
        priority: 'high',
        data: {
          medicineId,
          medicineName,
          time,
        },
      },
      trigger: {
        seconds: secondsUntilNotification,
        repeats: true,
      },
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const getAllScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};
