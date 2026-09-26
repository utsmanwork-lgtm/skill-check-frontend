import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { supabase } from '../services/supabaseClient';

export default function DashboardAnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalSkill: 0,
    totalProgres: 0,
    lulusCount: 0,
    prosesCount: 0,
    belumMulaiCount: 0,
    rataRataPersen: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        { count: siswaCount, error: siswaErr },
        { count: skillCount, error: skillErr },
        { data: progresData, error: progresErr },
      ] = await Promise.all([
        supabase.from('siswa').select('*', { count: 'exact', head: true }).eq('aktif', true),
        supabase.from('skill_check').select('*', { count: 'exact', head: true }).eq('aktif', true),
        supabase.from('v_progres').select('*'),
      ]);

      if (siswaErr) throw siswaErr;
      if (skillErr) throw skillErr;
      if (progresErr) throw progresErr;

      const progres = progresData || [];
      const lulusCount = progres.filter(p => p.status === 'lulus').length;
      const prosesCount = progres.filter(p => p.status === 'proses').length;
      const belumMulaiCount = progres.filter(p => p.status === 'belum_mulai').length;
      const rataRataPersen = progres.length > 0 ? Math.round(progres.reduce((sum, p) => sum + p.persen, 0) / progres.length) : 0;

      setStats({
        totalSiswa: siswaCount || 0,
        totalSkill: skillCount || 0,
        totalProgres: progres.length,
        lulusCount,
        prosesCount,
        belumMulaiCount,
        rataRataPersen,
      });
    } catch (err) {
      console.error('Load stats error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-8"><div className="spinner" /></div></AppLayout>;
  }

  return (
    <AppLayout title="Analytics">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary mb-6">Kembali ke Dashboard</button>
      {error && <div className="bg-red-50 border border-red-200 rounded p-4 mb-6" role="alert"><p className="text-red-600">{error}</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card"><p className="text-gray-600 text-sm font-medium">Total Siswa (Aktif)</p><p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSiswa}</p></div>
        <div className="card"><p className="text-gray-600 text-sm font-medium">Total Skill (Aktif)</p><p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSkill}</p></div>
        <div className="card"><p className="text-gray-600 text-sm font-medium">Total Progress Records</p><p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProgres}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card"><p className="text-gray-600 text-sm font-medium mb-4">Status Distribution</p><div className="space-y-3"><div><p className="text-sm font-medium mb-1">Lulus: {stats.lulusCount}</p><div className="progress-bar"><div className="progress-fill" style={{ width: stats.totalProgres > 0 ? `${(stats.lulusCount / stats.totalProgres) * 100}%` : '0%', backgroundColor: '#16a34a' }} /></div></div><div><p className="text-sm font-medium mb-1">Proses: {stats.prosesCount}</p><div className="progress-bar"><div className="progress-fill" style={{ width: stats.totalProgres > 0 ? `${(stats.prosesCount / stats.totalProgres) * 100}%` : '0%', backgroundColor: '#ea580c' }} /></div></div><div><p className="text-sm font-medium mb-1">Belum Mulai: {stats.belumMulaiCount}</p><div className="progress-bar"><div className="progress-fill" style={{ width: stats.totalProgres > 0 ? `${(stats.belumMulaiCount / stats.totalProgres) * 100}%` : '0%', backgroundColor: '#6b7280' }} /></div></div></div></div>
        <div className="card"><p className="text-gray-600 text-sm font-medium mb-4">Summary</p><div className="space-y-3"><p className="text-base"><span className="font-semibold">Rata-rata Progress:</span> <span className="text-2xl font-bold text-blue-600">{stats.rataRataPersen}%</span></p><p className="text-base"><span className="font-semibold">Completion Rate:</span> <span className="text-2xl font-bold text-green-600">{stats.totalProgres > 0 ? Math.round((stats.lulusCount / stats.totalProgres) * 100) : 0}%</span></p><p className="text-sm text-gray-600 mt-4">Statistik ini didasarkan pada v_progres view dengan data siswa dan skill yang aktif.</p></div></div>
      </div>
    </AppLayout>
  );
}
