import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        if (!nama.trim()) {
          setError('Nama wajib diisi');
          return;
        }
        const data = await register(email, password, nama.trim());
        if (data?.user?.identities?.length === 0) {
          setError('Email sudah terdaftar. Silakan login.');
          return;
        }
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-f8fafc p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-sm border border-e5e7eb">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {isRegister ? 'Daftar Akun' : 'Login Skill Check'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="input-field" placeholder="Nama lengkap" autoComplete="name" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="email@domain.com" autoComplete="email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-field" placeholder="Minimal 6 karakter" autoComplete={isRegister ? 'new-password' : 'current-password'} />
          </div>
          {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : (isRegister ? 'Daftar' : 'Login')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button type="button" onClick={toggleMode} className="text-blue-600 hover:text-blue-800 font-medium underline">
            {isRegister ? 'Login' : 'Daftar'}
          </button>
        </p>
        <p className="text-center text-xs text-gray-500">Akun baru menunggu aktivasi admin.</p>
      </div>
    </div>
  );
}
