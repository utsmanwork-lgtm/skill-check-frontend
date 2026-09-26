#!/usr/bin/env node
/**
 * Service-role-only test admin provisioning. It never writes the password to disk.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/provision-test-admin.mjs email password
 */
const [email, password] = process.argv.slice(2);
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !password || !url || !serviceKey) {
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, email, password');
  process.exit(1);
}
if (password.length < 12) {
  console.error('Password must be at least 12 characters');
  process.exit(1);
}
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };
const request = async (path, options = {}) => {
  const response = await fetch(`${url}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
  return response.status === 204 ? null : response.json();
};
const users = await request('/auth/v1/admin/users?per_page=1000');
const found = users.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
const user = found
  ? await request(`/auth/v1/admin/users/${found.id}`, { method: 'PUT', body: JSON.stringify({ password, email_confirm: true }) })
  : await request('/auth/v1/admin/users', { method: 'POST', body: JSON.stringify({ email, password, email_confirm: true }) });
await request(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`, {
  method: 'PATCH',
  headers: { Prefer: 'return=minimal' },
  body: JSON.stringify({ role: 'admin', aktif: true }),
});
console.log(`test credential ${found ? 'rotated' : 'provisioned'} for authorized admin`);
