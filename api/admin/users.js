import { createClient } from '@supabase/supabase-js';
import { parseUserUpdate } from './validation.js';

const json = (res, status, body) => res.status(status).json(body);
const adminClient = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function requireAdmin(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw Object.assign(new Error('Authentication required'), { status: 401 });
  const service = adminClient();
  const { data: { user }, error } = await service.auth.getUser(token);
  if (error || !user) throw Object.assign(new Error('Invalid session'), { status: 401 });
  const { data: profile, error: profileError } = await service.from('profiles').select('role').eq('id', user.id).single();
  if (profileError || profile?.role !== 'admin') throw Object.assign(new Error('Admin role required'), { status: 403 });
  return service;
}

export default async function handler(req, res) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json(res, 500, { error: 'Server configuration is incomplete' });
  try {
    const service = await requireAdmin(req);
    if (req.method === 'GET') {
      const [{ data: users, error: usersError }, { data: profiles, error: profilesError }] = await Promise.all([
        service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        service.from('profiles').select('id,nama,role,aktif,created_at'),
      ]);
      if (usersError) throw usersError;
      if (profilesError) throw profilesError;
      const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
      return json(res, 200, { users: users.users.map((user) => ({ id: user.id, email: user.email, ...profileById.get(user.id) })) });
    }
    if (req.method === 'PATCH') {
      const id = String(req.query.id || '');
      if (!id) return json(res, 400, { error: 'User ID is required' });
      const update = parseUserUpdate(req.body);
      const profilePatch = {};
      if ('role' in update) profilePatch.role = update.role;
      if ('aktif' in update) profilePatch.aktif = update.aktif;
      if (Object.keys(profilePatch).length) {
        const { error } = await service.from('profiles').update(profilePatch).eq('id', id);
        if (error) throw error;
      }
      if (update.password) {
        const { error } = await service.auth.admin.updateUserById(id, { password: update.password });
        if (error) throw error;
      }
      return json(res, 200, { ok: true });
    }
    res.setHeader('Allow', 'GET, PATCH');
    return json(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return json(res, error.status || 400, { error: error.message || 'Request failed' });
  }
}
