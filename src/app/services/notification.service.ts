import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() {}

  async scheduleNotification(title: string, body: string, id: number, schedule: { at: Date }) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule,
          sound: undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: null
        }
      ]
    });
  }

  async requestPermissions() {
    return await LocalNotifications.requestPermissions();
  }

  log(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    // In a real-world scenario, you might want to send logs to a server or save them locally
  }
}

