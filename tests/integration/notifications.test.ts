import { describe, it, expect } from 'vitest';
import { createNotification, getUserNotifications, markNotificationRead } from '@lib/notifications/notifications';

// Integration tests for notifications

describe('Notifications Integration', () => {
  let notificationId: string;
  const testUserId = 'user-test-1';

  it('should create a notification', async () => {
    const id = await createNotification({
      userId: testUserId,
      // 'info' is not part of NotificationType; use 'system' which always exists
      type: 'system',
      title: 'Test notification',
      body: 'details',
    });
    expect(typeof id).toBe('string');
    notificationId = id;
  });

  it('should fetch notifications for user', async () => {
    const notifications = await getUserNotifications(testUserId);
    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.some(n => n.id === notificationId)).toBe(true);
  });

  it('should delete the notification', async () => {
    const deleted = await markNotificationRead(notificationId, testUserId);
    expect(deleted).toBe(true);
    const notifications = await getUserNotifications(testUserId, { unreadOnly: true });
    expect(notifications.some(n => n.id === notificationId)).toBe(false);
  });
});
