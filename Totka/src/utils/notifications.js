import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

export const scheduleNotification = async (medicineId, medicineName, time) => {
  try {
    // Parse time (format: "HH:MM")
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);

    // Calculate seconds until the notification time
    let secondsUntilNotification = Math.floor((notificationTime - now) / 1000);

    // If the time has passed today, schedule for tomorrow
    if (secondsUntilNotification < 0) {
      notificationTime.setDate(notificationTime.getDate() + 1);
      secondsUntilNotification = Math.floor((notificationTime - now) / 1000);
    }

    console.log(`Scheduling notification for ${medicineName} at ${time} (in ${secondsUntilNotification} seconds)`);

    // Schedule a one-time notification with seconds trigger
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medicine Reminder',
        body: `Time to take ${medicineName}!`,
        sound: 'default',
        priority: 'max',
        badge: 1,
        vibrate: [0, 500, 250, 500],
        data: {
          medicineId,
          medicineName,
          time,
          scheduledTime: notificationTime.toISOString(),
        },
        // iOS specific settings
        ...(Platform.OS === 'ios' && {
          sound: true,
        }),
        // Android specific settings
        ...(Platform.OS === 'android' && {
          sound: 'default',
          channelId: 'medicine-reminder',
          priority: 'max',
          vibrate: [0, 500, 250, 500],
        }),
      },
      trigger: {
        seconds: secondsUntilNotification,
        repeats: false, // Single notification, we'll reschedule after
      },
    });

    console.log(`Notification scheduled for ${medicineName} at ${time}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Reschedule notification for the next day after it fires
export const rescheduleNotificationForNextDay = async (medicineId, medicineName, time) => {
  try {
    // Schedule for tomorrow at the same time
    const [hours, minutes] = time.split(':').map(Number);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const secondsUntilNotification = Math.floor((tomorrow - now) / 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medicine Reminder',
        body: `Time to take ${medicineName}!`,
        sound: 'default',
        priority: 'max',
        badge: 1,
        vibrate: [0, 500, 250, 500],
        data: {
          medicineId,
          medicineName,
          time,
          scheduledTime: tomorrow.toISOString(),
        },
        ...(Platform.OS === 'ios' && {
          sound: true,
        }),
        ...(Platform.OS === 'android' && {
          sound: 'default',
          channelId: 'medicine-reminder',
          priority: 'max',
          vibrate: [0, 500, 250, 500],
        }),
      },
      trigger: {
        seconds: secondsUntilNotification,
        repeats: false,
      },
    });

    console.log(`Next notification rescheduled for ${medicineName} at ${time} tomorrow`);
  } catch (error) {
    console.error('Error rescheduling notification:', error);
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

// Cancel all notifications for a specific medicine
export const cancelMedicineNotifications = async (medicineId) => {
  try {
    const allNotifications = await getAllScheduledNotifications();
    const notificationsToCancel = allNotifications.filter(
      notification => notification.content.data?.medicineId === medicineId
    );
    
    for (const notification of notificationsToCancel) {
      await cancelNotification(notification.identifier);
    }
    console.log(`Cancelled ${notificationsToCancel.length} notifications for medicine ${medicineId}`);
  } catch (error) {
    console.error('Error canceling medicine notifications:', error);
  }
};

// Setup notification channels for Android
export const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medicine-reminder', {
      name: 'Medicine Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      sound: 'default',
      lightColor: '#4CAF50',
      bypassDnd: true,
    });
  }
};
