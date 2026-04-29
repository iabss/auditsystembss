/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PieChart, Users, FolderOpen, TrendingUp, User as UserIcon } from 'lucide-react';
import { AuditProgram } from '../../types';

interface AnalyticsProps {
  programs: AuditProgram[];
}

export default function Analytics({ programs }: AnalyticsProps) {
  const picStats: Record<string, { count: number; active: number }> = {};
  let totalProjects = 0;
  
  programs.forEach(p => {
    totalProjects++;
    if (!picStats[p.pic]) picStats[p.pic] = { count: 0, active: 0 };
    picStats[p.pic].count++;
    // Simple heuristic: if any activity has actualEnd, it's active or done
    if (p.activities.some(a => a.actualEnd)) picStats[p.pic].active++;
  });

  return (
    <div className="max-w-6xl mx-auto pt-6 px-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Team Analytics</h1>
        <p className="text-slate-500 mt-1">Distribusi beban kerja dan progres tim auditor secara keseluruhan.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><FolderOpen size={28}/></div>
          <div>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{totalProjects}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Programs</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl"><Users size={28}/></div>
          <div>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{Object.keys(picStats).length}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active PICs</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl"><TrendingUp size={28}/></div>
          <div>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{totalProjects > 0 ? Math.round((Object.values(picStats).reduce((a,b)=>a+b.active,0) / totalProjects) * 100) : 0}%</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Engagement Rate</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-3">
            <UserIcon size={20} className="text-indigo-500"/> Project Distribution
          </h3>
          <div className="space-y-6">
            {Object.entries(picStats).map(([name, stat]) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">{name}</span>
                  <span className="text-slate-400 font-bold">{stat.count} Projects</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/50">
                  <div 
                    className="bg-indigo-500 h-full rounded-full shadow-inner transition-all duration-1000" 
                    style={{ width: `${(stat.count / totalProjects) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <PieChart size={40} className="text-slate-300"/>
          </div>
          <h3 className="font-bold text-xl text-slate-800 mb-2">Advanced Insights</h3>
          <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
            Integrasi dengan AI akan segera hadir untuk memberikan rekomendasi optimasi beban kerja tim berdasarkan durasi historis.
          </p>
        </div>
      </div>
    </div>
  );
}
