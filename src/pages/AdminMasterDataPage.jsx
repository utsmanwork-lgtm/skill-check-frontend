import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { supabase } from '../services/supabaseClient';

const initialRombel = { nama: '', tingkat: '', tahun_ajaran: '' };
const initialSiswa = { nis: '', nama: '', rombel_id: '', aktif: true };

function csvValue(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export default function AdminMasterDataPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [tab, setTab] = useState('rombel');
  const [rombels, setRombels] = useState([]);
  const [students, setStudents] = useState([]);
  const [rombelForm, setRombelForm] = useState(initialRombel);
  const [siswaForm, setSiswaForm] = useState(initialSiswa);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [{ data: rombelData, error: rombelErr }, { data: siswaData, error: siswaErr }] = await Promise.all([
        supabase.from('rombel').select('*').order('nama'),
        supabase.from('siswa').select('id, nis, nama, rombel_id, aktif, rombel(nama)').order('nama'),
      ]);
      if (rombelErr) throw rombelErr;
      if (siswaErr) throw siswaErr;
      setRombels(rombelData || []);
      setStudents(siswaData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setRombelForm(initialRombel);
    setSiswaForm(initialSiswa);
  };

  const submitRombel = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const payload = {
        nama: rombelForm.nama.trim(),
        tingkat: rombelForm.tingkat.trim(),
        tahun_ajaran: rombelForm.tahun_ajaran.trim(),
      };
      if (editingId) {
        const { error: err } = await supabase.from('rombel').update(payload).eq('id', editingId);
        if (err) throw err;
        setNotice('Rombel diperbarui.');
      } else {
        const { error: err } = await supabase.from('rombel').insert(payload);
        if (err) throw err;
        setNotice('Rombel ditambahkan.');
      }
      clearForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitSiswa = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const payload = {
        nis: siswaForm.nis.trim(),
        nama: siswaForm.nama.trim(),
        rombel_id: siswaForm.rombel_id || null,
        aktif: siswaForm.aktif,
      };
      if (editingId) {
        const { error: err } = await supabase.from('siswa').update(payload).eq('id', editingId);
        if (err) throw err;
        setNotice('Siswa diperbarui.');
      } else {
        const { error: err } = await supabase.from('siswa').insert(payload);
        if (err) throw err;
        setNotice('Siswa ditambahkan.');
      }
      clearForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (table, id) => {
    if (!window.confirm('Hapus data ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      setError(null);
      const { error: err } = await supabase.from(table).delete().eq('id', id);
      if (err) throw err;
      setNotice('Data dihapus.');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const editRombel = (item) => {
    setEditingId(item.id);
    setRombelForm({ nama: item.nama, tingkat: item.tingkat, tahun_ajaran: item.tahun_ajaran });
  };

  const editSiswa = (item) => {
    setEditingId(item.id);
    setSiswaForm({ nis: item.nis, nama: item.nama, rombel_id: item.rombel_id || '', aktif: item.aktif });
  };

  const exportSiswa = () => {
    const rows = [
      ['NIS', 'Nama', 'Rombel', 'Status'],
      ...students.map(student => [student.nis, student.nama, student.rombel?.nama || '', student.aktif ? 'Aktif' : 'Tidak aktif']),
    ];
    const csv = `﻿${rows.map(row => row.map(csvValue).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'data-siswa.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-8"><div className="spinner" /></div></AppLayout>;
  }

  return (
    <AppLayout title="Master Data">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary mb-6">Kembali ke Dashboard</button>
      {error && <div className="bg-red-50 border border-red-200 rounded p-4 mb-4" role="alert"><p className="text-red-600">{error}</p></div>}
      {notice && <div className="bg-green-100 border rounded p-4 mb-4"><p className="text-green-600">{notice}</p></div>}

      <div className="flex gap-2 mb-6 border-b">
        <button className={tab === 'rombel' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setTab('rombel'); clearForm(); }}>Rombel</button>
        <button className={tab === 'siswa' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setTab('siswa'); clearForm(); }}>Siswa</button>
      </div>

      {tab === 'rombel' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="card">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Tambah'} Rombel</h3>
            <form onSubmit={submitRombel} className="space-y-4">
              <div><label htmlFor="rombel-nama">Nama Rombel</label><input id="rombel-nama" value={rombelForm.nama} onChange={(e) => setRombelForm({ ...rombelForm, nama: e.target.value })} className="input-field mt-1" required maxLength={100} /></div>
              <div><label htmlFor="rombel-tingkat">Tingkat</label><input id="rombel-tingkat" value={rombelForm.tingkat} onChange={(e) => setRombelForm({ ...rombelForm, tingkat: e.target.value })} className="input-field mt-1" required maxLength={30} placeholder="Contoh: X" /></div>
              <div><label htmlFor="rombel-tahun">Tahun Ajaran</label><input id="rombel-tahun" value={rombelForm.tahun_ajaran} onChange={(e) => setRombelForm({ ...rombelForm, tahun_ajaran: e.target.value })} className="input-field mt-1" required maxLength={30} placeholder="2026/2027" /></div>
              <div className="flex gap-3"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>{editingId && <button type="button" onClick={clearForm} className="btn-secondary">Batal</button>}</div>
            </form>
          </section>
          <section className="card overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Daftar Rombel</h3>
            {rombels.length === 0 ? <p className="text-gray-500">Belum ada rombel.</p> : <table><thead><tr><th>Nama</th><th>Tingkat</th><th>Tahun</th><th>Aksi</th></tr></thead><tbody>{rombels.map(item => <tr key={item.id}><td>{item.nama}</td><td>{item.tingkat}</td><td>{item.tahun_ajaran}</td><td><div className="flex gap-2"><button onClick={() => editRombel(item)} className="text-blue-600 font-medium">Edit</button><button onClick={() => deleteItem('rombel', item.id)} className="text-red-600 font-medium">Hapus</button></div></td></tr>)}</tbody></table>}
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="card">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Tambah'} Siswa</h3>
            <form onSubmit={submitSiswa} className="space-y-4">
              <div><label htmlFor="siswa-nis">NIS</label><input id="siswa-nis" value={siswaForm.nis} onChange={(e) => setSiswaForm({ ...siswaForm, nis: e.target.value })} className="input-field mt-1" required maxLength={50} /></div>
              <div><label htmlFor="siswa-nama">Nama Siswa</label><input id="siswa-nama" value={siswaForm.nama} onChange={(e) => setSiswaForm({ ...siswaForm, nama: e.target.value })} className="input-field mt-1" required maxLength={150} /></div>
              <div><label htmlFor="siswa-rombel">Rombel</label><select id="siswa-rombel" value={siswaForm.rombel_id} onChange={(e) => setSiswaForm({ ...siswaForm, rombel_id: e.target.value })} className="select-field mt-1"><option value="">Tanpa Rombel</option>{rombels.map(rombel => <option key={rombel.id} value={rombel.id}>{rombel.nama}</option>)}</select></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={siswaForm.aktif} onChange={(e) => setSiswaForm({ ...siswaForm, aktif: e.target.checked })} /> Siswa aktif</label>
              <div className="flex gap-3"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>{editingId && <button type="button" onClick={clearForm} className="btn-secondary">Batal</button>}</div>
            </form>
          </section>
          <section className="card overflow-x-auto">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Daftar Siswa</h3><button onClick={exportSiswa} className="btn-secondary">Ekspor CSV</button></div>
            {students.length === 0 ? <p className="text-gray-500">Belum ada siswa.</p> : <table><thead><tr><th>NIS</th><th>Nama</th><th>Rombel</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{students.map(item => <tr key={item.id}><td>{item.nis}</td><td>{item.nama}</td><td>{item.rombel?.nama || '-'}</td><td><span className={`badge ${item.aktif ? 'badge-success' : 'badge-danger'}`}>{item.aktif ? 'Aktif' : 'Tidak aktif'}</span></td><td><div className="flex gap-2"><button onClick={() => editSiswa(item)} className="text-blue-600 font-medium">Edit</button><button onClick={() => deleteItem('siswa', item.id)} className="text-red-600 font-medium">Hapus</button></div></td></tr>)}</tbody></table>}
          </section>
        </div>
      )}
    </AppLayout>
  );
}
