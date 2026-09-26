import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { supabase } from '../services/supabaseClient';
import { requestAdminUsers, updateAdminUser } from '../services/adminApi';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const withToken = async (callback) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Sesi login tidak ditemukan');
    return callback(session.access_token);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsers(await withToken(requestAdminUsers));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const updateUser = async (user, update, message) => {
    try {
      setSavingId(user.id);
      setError(null);
      await withToken((token) => updateAdminUser(token, user.id, update));
      setNotice(message);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const resetPassword = async (user) => {
    const password = window.prompt(`Masukkan password baru untuk ${user.email}. Minimal 12 karakter.`);
    if (password === null) return;
    if (password.length < 12) {
      setError('Password harus minimal 12 karakter.');
      return;
    }
    await updateUser(user, { password }, 'Password pengguna diperbarui. Password tidak disimpan oleh aplikasi.');
  };

  if (loading) return <AppLayout><div className="flex justify-center py-8"><div className="spinner" /></div></AppLayout>;

  return (
    <AppLayout title="Manajemen Pengguna">
      <div className="flex gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">Kembali ke Dashboard</button>
        <button onClick={loadUsers} className="btn-secondary">Muat ulang</button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded p-4 mb-4" role="alert">{error}</div>}
      {notice && <div className="bg-green-100 border rounded p-4 mb-4">{notice}</div>}
      <section className="card overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">Daftar akun</h3>
        <p className="text-sm text-gray-600 mb-4">Hanya admin dapat mengganti peran, status, atau password. Password dikirim langsung ke Supabase Auth dan tidak disimpan pada profil aplikasi.</p>
        <table>
          <thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}>
            <td>{user.nama || '-'}</td><td>{user.email || '-'}</td>
            <td><select aria-label={`Peran ${user.email}`} value={user.role || 'pending'} disabled={savingId === user.id} onChange={(event) => updateUser(user, { role: event.target.value }, 'Peran pengguna diperbarui.')} className="select-field"><option value="pending">Menunggu</option><option value="guru">Guru</option><option value="admin">Admin</option></select></td>
            <td><span className={`badge ${user.aktif ? 'badge-success' : 'badge-danger'}`}>{user.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
            <td><div className="flex flex-wrap gap-2"><button disabled={savingId === user.id} onClick={() => updateUser(user, { aktif: !user.aktif }, user.aktif ? 'Pengguna dinonaktifkan.' : 'Pengguna diaktifkan.')} className="text-blue-600 font-medium">{user.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button disabled={savingId === user.id} onClick={() => resetPassword(user)} className="text-red-600 font-medium">Reset password</button></div></td>
          </tr>)}</tbody>
        </table>
        {users.length === 0 && <p className="text-gray-500">Tidak ada pengguna untuk ditampilkan.</p>}
      </section>
    </AppLayout>
  );
}
