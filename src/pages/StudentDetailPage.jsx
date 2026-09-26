import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { supabase } from '../services/supabaseClient';

export default function StudentDetailPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [{ data: siswa, error: siswaError }, { data: progressRows, error: progressError }] = await Promise.all([
        supabase.from('siswa').select('id, nis, nama, aktif, rombel(nama, tingkat, tahun_ajaran)').eq('id', studentId).single(),
        supabase.from('v_progres').select('*').eq('siswa_id', studentId),
      ]);

      if (siswaError) throw siswaError;
      if (progressError) throw progressError;
      setStudent(siswa);
      setProgress(progressRows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-8"><div className="spinner" /></div></AppLayout>;
  }

  return (
    <AppLayout title="Detail Siswa">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary mb-6">Kembali ke Dashboard</button>
      {error && <div className="bg-red-50 border border-red-200 rounded p-4 mb-6" role="alert"><p className="text-red-600">{error}</p></div>}
      {!student ? (
        <div className="card text-center"><p className="text-gray-600">Siswa tidak ditemukan.</p></div>
      ) : (
        <>
          <section className="card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><p className="text-sm text-gray-600">Nama Siswa</p><p className="text-lg font-semibold">{student.nama}</p></div>
              <div><p className="text-sm text-gray-600">NIS</p><p className="text-lg font-semibold">{student.nis}</p></div>
              <div><p className="text-sm text-gray-600">Rombel</p><p className="text-lg font-semibold">{student.rombel?.nama || '-'}</p></div>
              <div><p className="text-sm text-gray-600">Tahun Ajaran</p><p className="text-lg font-semibold">{student.rombel?.tahun_ajaran || '-'}</p></div>
            </div>
          </section>

          <section className="card">
            <h3 className="text-lg font-semibold mb-4">Progress per Skill</h3>
            {progress.length === 0 ? <p className="text-gray-500">Belum ada skill aktif.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progress.map(item => (
                  <article key={item.skill_check_id} className="border rounded p-4">
                    <div className="flex justify-between gap-3 mb-3">
                      <div><p className="font-semibold">{item.nama_skill_check}</p><p className="text-sm text-gray-600">{item.kode}</p></div>
                      <span className={`badge badge-${item.status === 'lulus' ? 'success' : item.status === 'proses' ? 'warning' : 'info'}`}>{item.status === 'lulus' ? 'Lulus' : item.status === 'proses' ? 'Proses' : 'Belum Mulai'}</span>
                    </div>
                    <div className="progress-bar mb-2"><div className="progress-fill" style={{ width: `${item.persen}%` }} /></div>
                    <p className="text-sm text-gray-600 mb-4">{item.tercentang} dari {item.total} instruksi selesai ({item.persen}%)</p>
                    <button onClick={() => navigate(`/student/${studentId}/skill/${item.skill_check_id}/assessment`)} className="btn-primary w-full">{item.status === 'belum_mulai' ? 'Mulai Penilaian' : 'Lihat Checklist'}</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}
