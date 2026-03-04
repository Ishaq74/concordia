import { describe, it, expect } from 'vitest';
import { createNotification, getNotificationsForUser, deleteNotification } from '@/database/notifications';

// Integration tests for notifications

describe('Notifications Integration', () => {
  let notificationId: string;
  const testUserId = 'user-test-1';

  it('should create a notification', async () => {
    const result = await createNotification({
      userId: testUserId,
      type: 'info',
      message: 'Test notification',
    });
    expect(result).toHaveProperty('id');
    notificationId = result.id;
    expect(result.userId).toBe(testUserId);
  });

  it('should fetch notifications for user', async () => {
    const notifications = await getNotificationsForUser(testUserId);
    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.some(n => n.id === notificationId)).toBe(true);
  });

  it('should delete the notification', async () => {
    const deleted = await deleteNotification(notificationId);
    expect(deleted).toBe(true);
    const notifications = await getNotificationsForUser(testUserId);
    expect(notifications.some(n => n.id === notificationId)).toBe(false);
  });
});
