// Notification service - Mock implementation for now
import { NotificationItem, NotificationSettings } from '../types';

export const notificationService = {
  async getNotifications(userId: string) {
    // Mock implementation - replace with real API when tables are created
    return { 
      data: null, 
      error: null 
    };
  },

  async markAsRead(userId: string, notificationId: string) {
    // Mock implementation - replace with real API when tables are created
    return { 
      data: { success: true }, 
      error: null 
    };
  },

  async markAllAsRead(userId: string) {
    // Mock implementation - replace with real API when tables are created
    return { 
      data: { success: true }, 
      error: null 
    };
  },

  async getNotificationSettings(userId: string) {
    // Mock implementation - replace with real API when tables are created
    return { 
      data: null, 
      error: null 
    };
  },

  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>) {
    // Mock implementation - replace with real API when tables are created
    return { 
      data: settings, 
      error: null 
    };
  }
};