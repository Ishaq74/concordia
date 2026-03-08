import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAuthApi } = vi.hoisted(() => {
  const mockAuthApi = {
    listOrganizations: vi.fn().mockResolvedValue({ organizations: [] }),
    createOrganization: vi.fn().mockResolvedValue({ id: 'org-1' }),
    listMembers: vi.fn().mockResolvedValue({ members: [] }),
    addMember: vi.fn().mockResolvedValue({ ok: true }),
    updateMemberRole: vi.fn().mockResolvedValue({ ok: true }),
    setActiveOrganization: vi.fn().mockResolvedValue({ ok: true }),
  };
  return { mockAuthApi };
});

vi.mock('@lib/auth/auth', () => ({
  auth: { api: mockAuthApi },
}));

import {
  listOrganizations,
  createOrganization,
  listOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMember,
  setActiveOrganization,
} from '@lib/admin/organizations';

describe('admin/organizations', () => {
  const headers = new Headers({ Authorization: 'Bearer test' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listOrganizations()', () => {
    it('lists organizations with headers and query', async () => {
      await listOrganizations(headers, { limit: 5 });
      expect(mockAuthApi.listOrganizations).toHaveBeenCalledWith({
        headers,
        query: { limit: 5 },
      });
    });

    it('defaults to empty query', async () => {
      await listOrganizations(headers);
      expect(mockAuthApi.listOrganizations).toHaveBeenCalledWith({
        headers,
        query: {},
      });
    });
  });

  describe('createOrganization()', () => {
    it('creates organization with name and slug', async () => {
      await createOrganization(headers, { name: 'My Org', slug: 'my-org' });
      expect(mockAuthApi.createOrganization).toHaveBeenCalledWith({
        headers,
        body: { name: 'My Org', slug: 'my-org' },
      });
    });
  });

  describe('listOrganizationMembers()', () => {
    it('lists members by organization ID', async () => {
      await listOrganizationMembers(headers, 'org-1');
      expect(mockAuthApi.listMembers).toHaveBeenCalledWith({
        headers,
        query: { organizationId: 'org-1' },
      });
    });
  });

  describe('addOrganizationMember()', () => {
    it('adds member with organizationId, userId, role', async () => {
      await addOrganizationMember(headers, {
        organizationId: 'org-1',
        userId: 'u1',
        role: 'member',
      });
      expect(mockAuthApi.addMember).toHaveBeenCalledWith({
        headers,
        body: {
          organizationId: 'org-1',
          userId: 'u1',
          role: 'member',
        },
      });
    });
  });

  describe('updateOrganizationMember()', () => {
    it('updates member role', async () => {
      await updateOrganizationMember(headers, {
        organizationId: 'org-1',
        memberId: 'm1',
        role: 'admin',
      });
      expect(mockAuthApi.updateMemberRole).toHaveBeenCalledWith({
        headers,
        body: {
          organizationId: 'org-1',
          memberId: 'm1',
          role: 'admin',
        },
      });
    });
  });

  describe('setActiveOrganization()', () => {
    it('sets active organization', async () => {
      await setActiveOrganization(headers, 'org-1');
      expect(mockAuthApi.setActiveOrganization).toHaveBeenCalledWith({
        headers,
        body: { organizationId: 'org-1' },
      });
    });
  });
});
