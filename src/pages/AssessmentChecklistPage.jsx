import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { supabase } from '../services/supabaseClient';

export default function AssessmentChecklistPage() {
  const navigate = useNavigate();
  const { studentId, skillId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [resetting, setResetting] = useState(false);
  const [student, setStudent] = useState(null);
  const [skill, setSkill] = useState(null);
  const [instruksi, setInstruksi] = useState([]);
  const [penilaian, setPenilaian] = useState({});

  useEffect(() => {
    loadData();
  }, [studentId, skillId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        { data: siswaData, error: siswaErr },
        { data: skillData, error: skillErr },
        { data: instruksiData, error: instruksiErr },
        { data: penilaianData, error: penilaianErr },
      ] = await Promise.all([
        supabase.from('siswa').select('id, nis, nama').eq('id', studentId).single(),
        supabase.from('skill_check').select('id, kode, nama, deskripsi').eq('id', skillId).single(),
        supabase.from('instruksi_kerja').select('id, urutan, deskripsi, aktif').eq('skill_check_id', skillId).eq('aktif', true).order('urutan'),
        supabase.from('penilaian').select('siswa_id, instruksi_id').eq('siswa_id', studentId),
      ]);

      if (siswaErr) throw siswaErr;
      if (skillErr) throw skillErr;
      if (instruksiErr) throw instruksiErr;
      if (penilaianErr) throw penilaianErr;

      setStudent(siswaData);
      setSkill(skillData);
      setInstruksi(instruksiData || []);

      const penilaianMap = {};
      (penilaianData || []).forEach(p => {
        penilaianMap[p.instruksi_id] = true;
      });
      setPenilaian(penilaianMap);
    } catch (err) {
      console.error('Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleInstruksi = async (instruksiId, isChecked) => {
    try {
      setSaving(true);
      if (isChecked) {
        const { error: err } = await supabase.from('penilaian').delete().eq('siswa_id', studentId).eq('instruksi_id', instruksiId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('penilaian').insert({ siswa_id: studentId, instruksi_id: instruksiId });
        if (err) throw err;
      }

      setPenilaian(prev => ({
        ...prev,
        [instruksiId]: !isChecked,
      }));
    } catch (err) {
      console.error('Toggle error:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!resetReason.trim()) {
      setError('Alasan reset wajib diisi.');
      return;
    }

    try {
      setResetting(true);
      setError(null);

      const { error: err } = await supabase.rpc('reset_skill_check', {
        p_siswa: studentId,
        p_skill: skillId,
        p_alasan: resetReason.trim(),
      });

      if (err) throw err;

      setPenilaian({});
      setResetReason('');
      setShowResetConfirm(false);
    } catch (err) {
      console.error('Reset error:', err);
      setError(err.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-8"><div className="spinner" /></div></AppLayout>;
  }

  const checkedCount = Object.values(penilaian).filter(Boolean).length;
  const percent = instruksi.length > 0 ? Math.round((checkedCount / instruksi.length) * 100) : 0;
  const isComplete = checkedCount === instruksi.length && instruksi.length > 0;

  return (
    <AppLayout title="Checklist Penilaian">
      <button onClick={() => navigate(`/student/${studentId}`)} className="btn-secondary mb-6">Kembali ke Detail Siswa</button>

      {error && <div className="bg-red-50 border border-red-200 rounded p-4 mb-6" role="alert"><p className="text-red-600">{error}</p></div>}

      <section className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><p className="text-sm text-gray-600">Siswa</p><p className="text-lg font-semibold">{student?.nama}</p></div>
          <div><p className="text-sm text-gray-600">Skill</p><p className="text-lg font-semibold">{skill?.nama}</p></div>
          <div><p className="text-sm text-gray-600">Progress</p><div className="progress-bar mt-2"><div className="progress-fill" style={{ width: `${percent}%` }} /></div><p className="text-sm text-gray-600 mt-1">{checkedCount}/{instruksi.length} ({percent}%)</p></div>
        </div>
      </section>

      <section className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">Instruksi Kerja Checklist</h3>
        {instruksi.length === 0 ? (
          <p className="text-gray-500">Tidak ada instruksi kerja untuk skill ini.</p>
        ) : (
          <div className="space-y-3">
            {instruksi.map(item => {
              const isChecked = !!penilaian[item.id];
              return (
                <label key={item.id} className="flex items-start gap-3 p-4 border rounded cursor-pointer hover:bg-f8fafc transition-colors">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleInstruksi(item.id, isChecked)}
                    disabled={saving}
                    className="mt-1 cursor-pointer"
                    aria-label={`Checklist untuk: ${item.deskripsi}`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.urutan}. {item.deskripsi}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex gap-3">
        <button onClick={() => navigate(`/student/${studentId}`)} className="btn-secondary flex-1">Kembali</button>
        <button
          onClick={() => setShowResetConfirm(true)}
          disabled={checkedCount === 0 || resetting}
          className="btn-danger flex-1"
        >
          Reset Progress
        </button>
      </section>

      {showResetConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h4 className="text-lg font-semibold mb-3">Reset Checklist</h4>
            <p className="text-gray-600 mb-4">Semua centang untuk siswa ini akan dihapus. Masukkan alasan reset.</p>
            <textarea
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
              placeholder="Alasan reset (wajib diisi)..."
              className="textarea-field mb-4"
              rows={3}
              disabled={resetting}
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowResetConfirm(false); setResetReason(''); }} className="btn-secondary flex-1" disabled={resetting}>Batal</button>
              <button onClick={handleReset} disabled={resetting || !resetReason.trim()} className="btn-danger flex-1">{resetting ? 'Mereset...' : 'Reset'}</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
