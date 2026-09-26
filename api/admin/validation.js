export const MANAGED_ROLES = new Set(['admin', 'guru', 'pending']);

export function isManagedRole(role) {
  return typeof role === 'string' && MANAGED_ROLES.has(role);
}

export function parseUserUpdate(input) {
  if (!input || typeof input !== 'object') throw new Error('Invalid JSON body');
  const allowed = new Set(['role', 'aktif', 'password']);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) throw new Error('Unsupported update field');
  }
  const output = {};
  if ('role' in input) {
    if (!isManagedRole(input.role)) throw new Error('Invalid role');
    output.role = input.role;
  }
  if ('aktif' in input) {
    if (typeof input.aktif !== 'boolean') throw new Error('aktif must be boolean');
    output.aktif = input.aktif;
  }
  if ('password' in input) {
    if (typeof input.password !== 'string' || input.password.length < 12) {
      throw new Error('Password must be at least 12 characters');
    }
    output.password = input.password;
  }
  if (Object.keys(output).length === 0) throw new Error('No update provided');
  return output;
}
