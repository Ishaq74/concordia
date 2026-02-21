import { notification } from '../schemas/notification.schema';

export const notificationData = [
  {
    id: 'notif-1',
    userId: 'user-1',
    message: 'Bienvenue sur la plateforme!',
    type: 'info',
    status: 'unread',
    isRead: false,
    createdAt: new Date('2026-02-20T10:00:00Z'),
    updatedAt: null,
  },
  {
    id: 'notif-2',
    userId: 'user-2',
    message: 'Votre profil a été mis à jour.',
    type: 'success',
    status: 'read',
    isRead: true,
    createdAt: new Date('2026-02-21T09:00:00Z'),
    updatedAt: new Date('2026-02-21T09:30:00Z'),
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    message: 'Erreur lors de la connexion.',
    type: 'error',
    status: 'archived',
    isRead: true,
    createdAt: new Date('2026-02-19T08:00:00Z'),
    updatedAt: new Date('2026-02-19T08:10:00Z'),
  },
];