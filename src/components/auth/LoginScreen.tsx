/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { AlertCircle, Loader2 } from 'lucide-react';

const LOGO_URL = "/logo.jpeg"; 

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      let msg = err.message;
      if (msg.includes('auth/invalid-email')) msg = "Format email salah.";
      if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) msg = "Email atau password salah.";
      if (msg.includes('auth/wrong-password')) msg = "Password salah.";
      if (msg.includes('auth/email-already-in-use')) msg = "Email sudah terdaftar. Silakan login.";
      if (msg.includes('auth/weak-password')) msg = "Password terlalu lemah (min 6 karakter).";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      let msg = err.message;
      if (msg.includes('auth/popup-closed-by-user')) msg = "Login dibatalkan.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-auto flex items-center justify-center">
            <img 
              src={LOGO_URL}
              alt="Audit System Logo" 
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/100x100?text=Audit";
              }}
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Audit System Pro</h2>
        <p className="text-center text-slate-500 mb-6 text-sm">
          {isRegister ? "Buat akun baru untuk memulai" : "Masuk untuk mengakses dashboard"}
        </p>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white border border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50 transition flex justify-center items-center gap-2 mb-4 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Masuk dengan Google
        </button>

        <div className="flex items-center justify-between mb-4">
          <div className="h-[1px] bg-slate-200 w-full"></div>
          <span className="text-xs text-slate-400 px-2 uppercase font-medium">Atau</span>
          <div className="h-[1px] bg-slate-200 w-full"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="nama@perusahaan.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 min-w-[16px]" /> 
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegister ? 'Daftar Akun' : 'Masuk dengan Email')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500">{isRegister ? "Sudah punya akun?" : "Belum punya akun?"}</span>
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="ml-1 text-blue-600 font-bold hover:underline font-medium"
          >
            {isRegister ? "Login di sini" : "Daftar sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
