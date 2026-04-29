/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  LayoutGrid, 
  List, 
  CalendarRange, 
  Plus, 
  Sparkles, 
  Download, 
  Upload, 
  Trash2, 
  ExternalLink,
  MapPin,
  User as UserIcon,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { AuditProgram, DashboardLayout } from '../../types';
import { calculateMetrics, fmt, formatDate } from '../../lib/utils';

interface AuditDashboardProps {
  programs: AuditProgram[];
  onOpenDetail: (id: string) => void;
  onCreateProgram: () => void;
  onDeleteProgram: (id: string) => void;
  isAdmin: boolean;
}

export default function AuditDashboard({ 
  programs, 
  onOpenDetail, 
  onCreateProgram, 
  onDeleteProgram,
  isAdmin
}: AuditDashboardProps) {
  const [layout, setLayout] = useState<DashboardLayout>('grid');
  
  const GLOBAL_CUT_OFF = '2099-12-31';
  
  let totalScore = 0;
  let totalActivePrograms = 0;
  programs.forEach(prog => {
    const m = calculateMetrics(prog.activities, GLOBAL_CUT_OFF);
    if (m.actualDays > 0) {
      totalScore += m.achievement;
      totalActivePrograms++;
    }
  });
  const globalAverage = totalActivePrograms > 0 ? totalScore / totalActivePrograms : 0;

  const handleExport = () => {
    const dataStr = JSON.stringify({ programs }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Audit_Programs_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto pt-6 px-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Audit Program</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola dan pantau program audit operasional secara real-time.</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="bg-white border border-slate-300 rounded-lg flex items-center shadow-sm overflow-hidden">
            <button onClick={handleExport} className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-r border-slate-300 transition">
              <Download size={16}/>
            </button>
            <button className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-not-allowed opacity-50">
              <Upload size={16}/>
            </button>
          </div>
          <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <button onClick={() => setLayout('grid')} className={`p-2 rounded-md ${layout === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setLayout('list')} className={`p-2 rounded-md ${layout === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
              <List size={18} />
            </button>
            <button onClick={() => setLayout('blueprint')} className={`p-2 rounded-md ${layout === 'blueprint' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
              <CalendarRange size={18} />
            </button>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 items-center opacity-50 cursor-not-allowed">
            <Sparkles size={18} className="text-yellow-200" /> AI
          </button>
          <button 
            onClick={onCreateProgram} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md shadow-blue-200"
          >
            <Plus size={18} /> Baru
          </button>
        </div>
      </div>

      {/* Hero Stat */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 shadow-lg mb-8 text-white flex justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <TrendingUp size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Achievement</span>
          </div>
          <div className="text-5xl font-bold mb-1 tracking-tight">{fmt(globalAverage)}%</div>
          <div className="text-blue-100 text-sm font-medium">Average score across {totalActivePrograms} active programs</div>
        </div>
        <div className="relative z-10 flex items-center justify-center w-24 h-24">
          <Activity className="text-white opacity-20 w-full h-full" />
          <Activity className="text-white opacity-80 absolute" size={48} />
        </div>
        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      {programs.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center text-slate-400">
          <FolderOpen size={48} className="mb-4 text-slate-300"/>
          <h3 className="text-lg font-medium text-slate-600">Belum ada program</h3>
          <p className="mb-6">Silakan buat program audit baru untuk memulai.</p>
          <button onClick={onCreateProgram} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100">
            <Plus size={20}/> Buat Program Pertama
          </button>
        </div>
      ) : (
        <>
          {layout === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map(prog => {
                const m = calculateMetrics(prog.activities, GLOBAL_CUT_OFF);
                return (
                  <div 
                    key={prog.id} 
                    onClick={() => onOpenDetail(prog.id)} 
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        if (window.confirm('Hapus program audit ini?')) {
                          onDeleteProgram(prog.id); 
                        }
                      }} 
                      className="absolute top-3 right-3 p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 bg-white/80 backdrop-blur-sm rounded-full transition-all z-30 shadow-sm border border-transparent hover:border-rose-100 cursor-pointer" 
                      title="Hapus"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${m.achievement >= 100 ? 'bg-emerald-500' : (m.achievement >= 80 ? 'bg-blue-500' : 'bg-amber-500')}`}></div>
                    
                    <div className="flex justify-between items-start mb-4 pl-2">
                      <div className="pr-8">
                        <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{prog.title}</h3>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded border border-orange-100 flex items-center gap-1">
                            <MapPin size={10} /> {prog.site}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 flex items-center gap-1">
                            <UserIcon size={10} /> {prog.pic}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4 pl-2 text-center bg-slate-50 rounded-lg py-3 border border-slate-100">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Plan</div>
                        <div className="text-lg font-bold text-blue-600">{m.plannedDays}<span className="text-xs font-normal ml-0.5">d</span></div>
                      </div>
                      <div className="border-x border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Act</div>
                        <div className="text-lg font-bold text-emerald-600">{m.actualDays}<span className="text-xs font-normal ml-0.5">d</span></div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Score</div>
                        <div className="text-lg font-bold text-purple-600">{fmt(m.achievement)}%</div>
                      </div>
                    </div>

                    <div className="pl-2">
                      <div className="flex justify-between text-xs mb-1 text-slate-400">
                        <span>Efficiency</span>
                        <span className={m.achievement >= 100 ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>{fmt(m.achievement)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${m.achievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                          style={{ width: `${Math.min(m.achievement, 100)}%` }}
                        ></div>
                      </div>
                      {m.overdueCount > 0 ? (
                        <div className="mt-3 text-xs text-amber-600 flex items-center gap-1 font-bold">
                          <AlertCircle size={14} /> {m.overdueCount}d delay
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-emerald-600 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={14} /> On Track
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {layout === 'list' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Site</th>
                      <th className="px-6 py-4">PIC</th>
                      <th className="px-6 py-4 text-center">Plan</th>
                      <th className="px-6 py-4 text-center">Act</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {programs.map(prog => {
                      const m = calculateMetrics(prog.activities, GLOBAL_CUT_OFF);
                      return (
                        <tr key={prog.id} className="hover:bg-slate-50 group">
                          <td className="px-6 py-4 font-bold text-slate-800">{prog.title}</td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded border border-orange-100 inline-flex items-center gap-1">
                              <MapPin size={10}/> {prog.site}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 inline-flex items-center gap-1">
                              <UserIcon size={10}/> {prog.pic}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-blue-600">{m.plannedDays}</td>
                          <td className="px-6 py-4 text-center font-bold text-emerald-600">{m.actualDays}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold ${m.achievement >= 100 ? 'text-emerald-600' : 'text-purple-600'}`}>
                              {fmt(m.achievement)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {m.overdueCount > 0 ? (
                              <span className="flex items-center gap-1 text-amber-600 font-bold text-xs"><AlertCircle size={14}/> {m.overdueCount}d Delay</span>
                            ) : (
                              <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle2 size={14}/> OK</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => onOpenDetail(prog.id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                <ExternalLink size={18} />
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault();
                                  e.stopPropagation(); 
                                  if (window.confirm('Hapus program audit ini?')) {
                                    onDeleteProgram(prog.id); 
                                  }
                                }} 
                                className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-full transition-all z-30 cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {layout === 'blueprint' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">Program Blueprint</h3>
                <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">Visual Timeline View</div>
              </div>
              <div className="space-y-4">
                {programs.map(prog => {
                  const m = calculateMetrics(prog.activities, GLOBAL_CUT_OFF);
                  return (
                    <div 
                      key={prog.id} 
                      className="flex items-center group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                      onClick={() => onOpenDetail(prog.id)}
                    >
                      <div className="w-48 flex-shrink-0 pr-4">
                        <div className="font-bold text-sm text-slate-800 truncate">{prog.title}</div>
                        <div className="text-[10px] text-slate-400 flex gap-2 mt-1">
                          <span className="flex items-center gap-0.5"><MapPin size={8}/> {prog.site}</span>
                        </div>
                      </div>
                      <div className="flex-1 relative h-8 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                        <div 
                          className="absolute h-full top-0 bg-blue-500/10 border-x-2 border-blue-500 flex items-center px-3"
                          style={{ left: '0%', width: `${Math.min(m.achievement, 100)}%` }}
                        >
                          <span className="text-[10px] font-bold text-blue-700">{fmt(m.achievement)}% Progress</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
