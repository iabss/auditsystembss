/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Settings as SettingsIcon, LogOut, RefreshCw, ShieldCheck, Mail, Database } from 'lucide-react';
import { ADMIN_EMAILS } from '../../constants';

interface SettingsProps {
  user: User;
  isAdmin: boolean;
}

export default function Settings({ user, isAdmin }: SettingsProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-10 px-6 pb-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
          <SettingsIcon size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium">Informasi akun dan konfigurasi sistem.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-10 text-center border-b border-slate-100 bg-slate-50/50">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-inner mx-auto mb-6 relative group">
             <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-black text-white uppercase group-hover:scale-105 transition-transform duration-500">
               {user.email ? user.email[0] : 'U'}
             </div>
             <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md border border-slate-100">
                <div className={`w-3 h-3 rounded-full ${isAdmin ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`}></div>
             </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">{user.displayName || user.email?.split('@')[0]}</h3>
          <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-sm tracking-wide mb-8">
            <Mail size={16}/>
            <span>{user.email}</span>
          </div>
          
          <div className="bg-white p-6 rounded-2xl text-left border border-slate-100 shadow-sm max-w-lg mx-auto">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Security Information</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className={isAdmin ? 'text-emerald-500' : 'text-slate-300'} />
                  <span className="text-sm font-bold text-slate-600">Access Role</span>
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  isAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isAdmin ? 'Administrator' : 'General User'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-blue-500" />
                  <span className="text-sm font-bold text-slate-600">Storage Service</span>
                </div>
                <span className="text-xs font-bold text-slate-400">Cloud Firestore</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Administrator Access List</h4>
          <div className="flex flex-wrap gap-2 mb-10">
            {ADMIN_EMAILS.map(email => (
              <span key={email} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                {email}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleLogout} 
              className="bg-rose-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-rose-100"
            >
              <LogOut size={20}/> Log Out Account
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-slate-600 border border-slate-200 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <RefreshCw size={20}/> Refresh Application
            </button>
          </div>
          <p className="mt-8 text-center text-[10px] text-slate-300 italic">
            Audit System Pro v1.0.0 • Persistent Shared Database Active
          </p>
        </div>
      </div>
    </div>
  );
}
