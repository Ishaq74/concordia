import { describe, it, expect, vi, beforeEach } from 'vitest';

// Reset module cache between tests to test caching behaviour
let loadAdminAccessArtifacts: typeof import('@lib/auth/admin-access-control').loadAdminAccessArtifacts;
let getAdminStatements: typeof import('@lib/auth/admin-access-control').getAdminStatements;
let reloadAdminAccessControl: typeof import('@lib/auth/admin-access-control').reloadAdminAccessControl;

describe('auth/admin-access-control', () => {
  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('@lib/auth/admin-access-control');
    loadAdminAccessArtifacts = mod.loadAdminAccessArtifacts;
    getAdminStatements = mod.getAdminStatements;
    reloadAdminAccessControl = mod.reloadAdminAccessControl;
  });

  describe('loadAdminAccessArtifacts()', () => {
    it('returns an object with statements and roles', async () => {
      const artifacts = await loadAdminAccessArtifacts();
      expect(artifacts).toHaveProperty('statements');
      expect(artifacts).toHaveProperty('roles');
      expect(typeof artifacts.statements).toBe('object');
      expect(typeof artifacts.roles).toBe('object');
    });

    it('returns the same cached object on second call', async () => {
      const first = await loadAdminAccessArtifacts();
      const second = await loadAdminAccessArtifacts();
      expect(first).toBe(second); // same reference
    });
  });

  describe('getAdminStatements()', () => {
    it('returns statements before any load (falls back to defaults)', () => {
      const statements = getAdminStatements();
      expect(typeof statements).toBe('object');
    });

    it('returns cached statements after load', async () => {
      const artifacts = await loadAdminAccessArtifacts();
      const statements = getAdminStatements();
      expect(statements).toBe(artifacts.statements);
    });
  });

  describe('reloadAdminAccessControl()', () => {
    it('invalidates cache and re-populates', async () => {
      await loadAdminAccessArtifacts();
      await reloadAdminAccessControl();
      const second = await loadAdminAccessArtifacts();
      // After reload, a new object is built from defaults
      // (not the same reference since cache was nulled)
      expect(second).toHaveProperty('statements');
      expect(second).toHaveProperty('roles');
    });
  });
});
