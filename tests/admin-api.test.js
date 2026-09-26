import { describe, expect, it } from 'vitest';
import { isManagedRole, parseUserUpdate } from '../api/admin/validation.js';

describe('admin credential API validation', () => {
  it('accepts only managed roles', () => {
    expect(isManagedRole('admin')).toBe(true);
    expect(isManagedRole('guru')).toBe(true);
    expect(isManagedRole('pending')).toBe(true);
    expect(isManagedRole('owner')).toBe(false);
  });

  it('rejects empty and short password reset payloads', () => {
    expect(() => parseUserUpdate({ password: 'short' })).toThrow('Password must be at least 12 characters');
    expect(() => parseUserUpdate({ password: '' })).toThrow('Password must be at least 12 characters');
  });

  it('rejects unknown fields and accepts secure user updates', () => {
    expect(() => parseUserUpdate({ role: 'admin', unknown: true })).toThrow('Unsupported update field');
    expect(parseUserUpdate({ role: 'guru', aktif: false, password: 'Rotated-admin-pass1!' })).toEqual({
      role: 'guru', aktif: false, password: 'Rotated-admin-pass1!',
    });
  });
});
