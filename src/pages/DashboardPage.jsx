import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { supabase } from '../services/supabaseClient';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progres, setProgres] = useState([]);
  const [stats, setStats] = useState({ total: 0, lulus: 0, proses: 0, belumMulai: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (authLoading || !user || !profile) return;
    loadData();
  }, [user, profile, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase.from('v_progres').select('*');
      if (err) throw err;

      setProgres(data || []);
      setStats({
        total: data?.length || 0,
        lulus: data?.filter(p => p.status === 'lulus').length || 0,
        proses: data?.filter(p => p.status === 'proses').length || 0,
        belumMulai: data?.filter(p => p.status === 'belum_mulai').length || 0,
      });
    } catch (err) {
      console.error('Load data error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = progres.filter(
    p =>
      p.nama_siswa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nama_skill_check?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nis?.includes(searchTerm)
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6" role="alert">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Total Progress</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Lulus / Proses / Belum Mulai</p>
          <p className="text-lg font-bold text-gray-900 mt-2">
            <span className="text-green-600">{stats.lulus}</span> / <span className="text-yellow-600">{stats.proses}</span> / <span className="text-gray-600">{stats.belumMulai}</span>
          </p>
        </div>
      </div>

      {profile.role === 'admin' && (
        <div className="flex gap-3 mb-8">
          <button onClick={() => navigate('/admin')} className="btn-primary">Master Data</button>
          <button onClick={() => navigate('/analytics')} className="btn-secondary">Analytics</button>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="search-progress" className="hidden">Cari progress</label>
        <input id="search-progress" type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari siswa, skill, atau NIS..." className="input-field" />
      </div>

      <div className="card overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Tidak ada data progress.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Siswa</th><th>NIS</th><th>Skill</th><th>Progress</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={`${p.siswa_id}-${p.skill_check_id}`}>
                  <td>{p.nama_siswa}</td>
                  <td>{p.nis}</td>
                  <td>{p.nama_skill_check}</td>
                  <td>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.persen}%` }} /></div>
                    <span className="text-xs text-gray-600">{p.tercentang}/{p.total} ({p.persen}%)</span>
                  </td>
                  <td><span className={`badge badge-${p.status === 'lulus' ? 'success' : p.status === 'proses' ? 'warning' : 'info'}`}>{p.status === 'lulus' ? 'Lulus' : p.status === 'proses' ? 'Proses' : 'Belum Mulai'}</span></td>
                  <td><button onClick={() => navigate(`/student/${p.siswa_id}`)} className="text-blue-600 font-medium">Detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
