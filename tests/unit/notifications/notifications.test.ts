import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockInsert, mockUpdate, mockSelect,
  mockInsertValues, mockUpdateSet, mockUpdateWhere,
  mockSelectFrom, mockSelectWhere, mockOrderBy, mockLimit, mockOffset,
} = vi.hoisted(() => {
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockSelect = vi.fn();
  const mockInsertValues = vi.fn().mockResolvedValue(undefined);
  const mockUpdateSet = vi.fn();
  const mockUpdateWhere = vi.fn();
  const mockSelectFrom = vi.fn();
  const mockSelectWhere = vi.fn();
  const mockOrderBy = vi.fn();
  const mockLimit = vi.fn();
  const mockOffset = vi.fn();
  return { mockInsert, mockUpdate, mockSelect, mockInsertValues, mockUpdateSet, mockUpdateWhere, mockSelectFrom, mockSelectWhere, mockOrderBy, mockLimit, mockOffset };
});

// insert chain
mockInsert.mockReturnValue({ values: mockInsertValues });

// update chain
mockUpdate.mockReturnValue({ set: mockUpdateSet });
mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
mockUpdateWhere.mockResolvedValue({ rowCount: 1 });

// select chain
mockSelect.mockReturnValue({ from: mockSelectFrom });
mockSelectFrom.mockReturnValue({ where: mockSelectWhere, orderBy: mockOrderBy });
mockSelectWhere.mockReturnValue({ orderBy: mockOrderBy, limit: mockLimit });
mockOrderBy.mockReturnValue({ limit: mockLimit });
mockLimit.mockReturnValue({ offset: mockOffset });
mockOffset.mockResolvedValue([]);

vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn().mockResolvedValue({
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect,
  }),
}));

vi.mock('@database/schemas', () => ({
  notification: {
    id: 'notification.id',
    userId: 'notification.userId',
    type: 'notification.type',
    title: 'notification.title',
    body: 'notification.body',
    targetType: 'notification.targetType',
    targetId: 'notification.targetId',
    data: 'notification.data',
    isRead: 'notification.isRead',
    readAt: 'notification.readAt',
    createdAt: 'notification.createdAt',
  },
}));

import {
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getUserNotifications,
  getUnreadCount,
  registerSSEClient,
  removeSSEClient,
} from '@lib/notifications/notifications';

describe('notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chains
    mockInsert.mockReturnValue({ values: mockInsertValues });
    mockInsertValues.mockResolvedValue(undefined);
    mockUpdate.mockReturnValue({ set: mockUpdateSet });
    mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdateWhere.mockResolvedValue({ rowCount: 1 });
    mockSelect.mockReturnValue({ from: mockSelectFrom });
    mockSelectFrom.mockReturnValue({ where: mockSelectWhere, orderBy: mockOrderBy });
    mockSelectWhere.mockReturnValue({ orderBy: mockOrderBy, limit: mockLimit });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockReturnValue({ offset: mockOffset });
    mockOffset.mockResolvedValue([]);
  });

  describe('createNotification()', () => {
    it('inserts notification and returns an ID', async () => {
      const id = await createNotification({
        userId: 'user-1',
        type: 'message',
        title: 'New message',
        body: 'Hello',
      });
      expect(typeof id).toBe('string');
      expect(id).toHaveLength(36); // UUID length
      expect(mockInsert).toHaveBeenCalled();
    });

    it('sets defaults for optional fields', async () => {
      await createNotification({
        userId: 'user-1',
        type: 'system',
        title: 'System update',
      });
      const insertedValues = mockInsertValues.mock.calls[0][0];
      expect(insertedValues.body).toBeNull();
      expect(insertedValues.targetType).toBeNull();
      expect(insertedValues.targetId).toBeNull();
      expect(insertedValues.data).toBeNull();
      expect(insertedValues.isRead).toBe(false);
    });
  });

  describe('markNotificationRead()', () => {
    it('returns true when rowCount > 0', async () => {
      mockUpdateWhere.mockResolvedValue({ rowCount: 1 });
      const result = await markNotificationRead('n1', 'u1');
      expect(result).toBe(true);
    });

    it('returns false when rowCount is 0', async () => {
      mockUpdateWhere.mockResolvedValue({ rowCount: 0 });
      const result = await markNotificationRead('n1', 'u1');
      expect(result).toBe(false);
    });
  });

  describe('markAllNotificationsRead()', () => {
    it('returns rowCount', async () => {
      mockUpdateWhere.mockResolvedValue({ rowCount: 5 });
      const result = await markAllNotificationsRead('u1');
      expect(result).toBe(5);
    });

    it('returns 0 when no unread notifications', async () => {
      mockUpdateWhere.mockResolvedValue({ rowCount: 0 });
      const result = await markAllNotificationsRead('u1');
      expect(result).toBe(0);
    });
  });

  describe('getUserNotifications()', () => {
    it('returns notifications array', async () => {
      mockOffset.mockResolvedValue([
        { id: 'n1', title: 'Test' },
      ]);
      const result = await getUserNotifications('u1');
      expect(result).toEqual([{ id: 'n1', title: 'Test' }]);
    });

    it('accepts limit and offset options', async () => {
      await getUserNotifications('u1', { limit: 5, offset: 10 });
      expect(mockLimit).toHaveBeenCalledWith(5);
      expect(mockOffset).toHaveBeenCalledWith(10);
    });
  });

  describe('getUnreadCount()', () => {
    it('returns count of unread notifications', async () => {
      mockSelectWhere.mockResolvedValue([{}, {}, {}]);
      const count = await getUnreadCount('u1');
      expect(count).toBe(3);
    });

    it('returns 0 when no unread', async () => {
      mockSelectWhere.mockResolvedValue([]);
      const count = await getUnreadCount('u1');
      expect(count).toBe(0);
    });
  });

  describe('SSE client management', () => {
    it('registers and removes SSE client', () => {
      const controller = {} as ReadableStreamDefaultController;
      // Should not throw
      registerSSEClient('u1', controller);
      removeSSEClient('u1', controller);
    });

    it('removing non-existent client does not throw', () => {
      const controller = {} as ReadableStreamDefaultController;
      expect(() => removeSSEClient('unknown', controller)).not.toThrow();
    });

    it('pushes SSE events to registered clients on notification create', async () => {
      const enqueueFn = vi.fn();
      const controller = { enqueue: enqueueFn } as unknown as ReadableStreamDefaultController;
      registerSSEClient('sse-user', controller);

      await createNotification({
        userId: 'sse-user',
        type: 'message',
        title: 'SSE test',
      });

      expect(enqueueFn).toHaveBeenCalled();
      const encoded = enqueueFn.mock.calls[0][0];
      const decoded = new TextDecoder().decode(encoded);
      expect(decoded).toContain('"event":"notification"');
      expect(decoded).toContain('"title":"SSE test"');

      // Cleanup
      removeSSEClient('sse-user', controller);
    });

    it('removes controller if enqueue throws', async () => {
      const failController = {
        enqueue: vi.fn().mockImplementation(() => { throw new Error('closed'); }),
      } as unknown as ReadableStreamDefaultController;
      registerSSEClient('fail-user', failController);

      // Should not throw despite enqueue failure
      await expect(
        createNotification({
          userId: 'fail-user',
          type: 'system',
          title: 'Fail test',
        }),
      ).resolves.toBeDefined();

      removeSSEClient('fail-user', failController);
    });
  });
});
