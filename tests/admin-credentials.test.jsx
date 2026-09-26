import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: {} } })),
    },
    removeSubscription: vi.fn(),
  },
}));

import { isManagedRole, parseUserUpdate } from '../api/admin/validation.js';

describe('admin credential management security contracts', () => {
  it('accepts only supported roles', () => {
    expect(isManagedRole('admin')).toBe(true);
    expect(isManagedRole('guru')).toBe(true);
    expect(isManagedRole('pending')).toBe(true);
    expect(isManagedRole('owner')).toBe(false);
  });

  it('rejects a password reset below the security minimum', () => {
    expect(() => parseUserUpdate({ password: 'short' })).toThrow('Password must be at least 12 characters');
  });

  it('rejects unknown update fields', () => {
    expect(() => parseUserUpdate({ role: 'admin', password_hash: 'bad' })).toThrow('Unsupported update field');
  });

  it('accepts a role, active state, and transient password update', () => {
    expect(parseUserUpdate({ role: 'guru', aktif: false, password: 'Rotated-admin-pass1!' })).toEqual({
      role: 'guru', aktif: false, password: 'Rotated-admin-pass1!',
    });
  });
});
