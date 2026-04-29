/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  Zap, 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  Link as LinkIcon, 
  Upload, 
  AlertCircle,
  Edit2
} from 'lucide-react';
import { AuditProgram, Activity } from '../../types';
import { calculateMetrics, fmt, getDaysDiff, addDaysToDate } from '../../lib/utils';
import { SITE_OPTIONS, PIC_OPTIONS } from '../../constants';

interface AuditDetailProps {
  program?: AuditProgram;
  onBack: () => void;
  onSave: (program: AuditProgram) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AuditDetail({ program: initialProgram, onBack, onSave, onDelete }: AuditDetailProps) {
  const [program, setProgram] = useState<AuditProgram | undefined>(initialProgram);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  if (!program) return <div className="p-20 text-center">Program data not found</div>;

  const metrics = calculateMetrics(program.activities, '2099-12-31');
  const firstDate = program.activities.length > 0 ? program.activities[0].start : null;
  const lastDate = program.activities.length > 0 ? program.activities[program.activities.length - 1].end : null;

  const updateProgram = (field: keyof AuditProgram, value: any) => {
    setProgram(prev => prev ? { ...prev, [field]: value } : undefined);
  };

  const handleInputChange = (id: string, field: keyof Activity, value: any) => {
    if (!program) return;
    const activities = [...program.activities];
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) return;

    let row = { ...activities[index], [field]: value };
    
    // Logic from original code for date dependencies
    if (field === 'end' && index < activities.length - 1 && value) {
      activities[index + 1].start = addDaysToDate(value, 1);
    }
    if (field === 'start' && value && (!row.end || row.end < value)) {
      row.end = value;
    }
    if (field === 'actualEnd' && value && index < activities.length - 1) {
      const nextStart = addDaysToDate(value, 1);
      activities[index + 1].actualStart = nextStart;
      if (!activities[index + 1].actualEnd) activities[index + 1].actualEnd = nextStart;
      if (activities[index + 1].actualEnd) {
        activities[index + 1].actualDays = getDaysDiff(activities[index + 1].actualStart, activities[index + 1].actualEnd);
      }
    }
    if (field === 'actualEnd' && value && !row.end) row.end = value;
    if (field === 'actualStart' && value && (!row.actualEnd || row.actualEnd < value)) {
      row.actualEnd = value;
    }

    const currentStart = row.actualStart;
    const currentEnd = row.actualEnd;
    if (currentStart && currentEnd) {
      const diff = getDaysDiff(currentStart, currentEnd);
      row.actualDays = diff > 0 ? diff : 0;
    } else {
      row.actualDays = 0;
    }

    activities[index] = row;
    updateProgram('activities', activities);
  };

  const handleAddActivity = (unplanned = false) => {
    if (!program) return;
    const last = program.activities[program.activities.length - 1];
    let newStart = new Date().toISOString().split('T')[0];
    if (last && last.end) newStart = addDaysToDate(last.end, 1);
    
    let newActualStart = '';
    let newActualEnd = '';
    let newActualDays = 0;
    
    if (last && last.actualEnd) {
      newActualStart = addDaysToDate(last.actualEnd, 1);
      newActualEnd = newActualStart;
      newActualDays = 1;
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      activity: unplanned ? 'Unplanned' : '',
      category: 'Site Visit',
      start: unplanned ? '' : newStart,
      end: unplanned ? '' : newStart,
      actualStart: unplanned ? new Date().toISOString().split('T')[0] : newActualStart,
      actualEnd: unplanned ? new Date().toISOString().split('T')[0] : newActualEnd,
      actualDays: unplanned ? 1 : newActualDays,
      link: ''
    };
    updateProgram('activities', [...program.activities, newActivity]);
  };

  const handleSave = async () => {
    if (!program) return;
    setIsSaving(true);
    await onSave(program);
    setIsSaving(false);
  };

  return (
    <div className="max-w-screen-2xl mx-auto pt-6 px-6 pb-20">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          {isEditingTitle ? (
            <input 
              type="text" 
              autoFocus 
              value={program.title} 
              onChange={(e) => updateProgram('title', e.target.value)} 
              onBlur={() => setIsEditingTitle(false)} 
              className="text-2xl font-bold text-slate-900 border-b-2 border-blue-500 outline-none w-full bg-transparent" 
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)} 
              className="text-2xl font-bold text-slate-900 cursor-pointer hover:text-blue-600 flex items-center gap-2 group"
            >
              {program.title} 
              <Edit2 size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <span className="animate-spin">◌</span> : <Save size={18} />}
            Simpan
          </button>
          <button 
            onClick={() => {
              if (confirm('Hapus program ini?')) {
                onDelete(program.id);
                onBack();
              }
            }} 
            className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-6 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">PIC</label>
            <select 
              value={program.pic} 
              onChange={(e) => updateProgram('pic', e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              {PIC_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">Site</label>
            <select 
              value={program.site} 
              onChange={(e) => updateProgram('site', e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              {SITE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">Plan Start</label>
            <input type="date" value={firstDate || ''} disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-bold text-slate-500" />
          </div>
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">Plan End</label>
            <input type="date" value={lastDate || ''} disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-bold text-slate-500" />
          </div>
          <div className="sm:col-span-4 lg:col-span-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">Surat Perintah Audit</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <LinkIcon size={14} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  value={program.docLink || ''} 
                  onChange={(e) => updateProgram('docLink', e.target.value)} 
                  placeholder="Paste Link..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium h-[42px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Planned Days</span>
            <Calendar className="text-blue-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-slate-800">{fmt(metrics.plannedDays)} <span className="text-sm font-medium text-slate-400">days</span></div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Actual Days</span>
            <CheckCircle2 className="text-emerald-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-slate-800">{fmt(metrics.actualDays)} <span className="text-sm font-medium text-slate-400">days</span></div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500"></div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Achievement Score</span>
            <BarChart3 className="text-purple-400" size={20} />
          </div>
          <div className={`text-3xl font-bold ${metrics.achievement >= 100 ? 'text-emerald-600' : 'text-purple-600'}`}>{fmt(metrics.achievement)}%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] text-slate-500 font-extrabold uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 w-12 text-center">No</th>
                <th className="px-4 py-4 min-w-[200px]">Activity</th>
                <th className="px-4 py-4">Plan Start</th>
                <th className="px-4 py-4">Plan End</th>
                <th className="px-4 py-4 text-center">Plan (D)</th>
                <th className="px-4 py-4 bg-emerald-50/20 text-emerald-800">Act Start</th>
                <th className="px-4 py-4 bg-emerald-50/20 text-emerald-800">Act End</th>
                <th className="px-4 py-4 text-center bg-emerald-50/30 font-bold text-emerald-700">Act (D)</th>
                <th className="px-4 py-4 text-center bg-emerald-50/50 text-emerald-700">Act %</th>
                <th className="px-4 py-4 w-48">Link CCP</th>
                <th className="px-3 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {program.activities.map((row, idx) => {
                const dur = getDaysDiff(row.start, row.end);
                let aPct = 0;
                let isOver = false;
                if (row.actualDays > 0 && dur > 0) {
                  if (row.actualDays <= dur) aPct = 100;
                  else {
                    aPct = (dur / row.actualDays) * 100;
                    isOver = true;
                  }
                } else if (dur === 0 && row.actualDays > 0) {
                  aPct = 100;
                }
                const isUnplanned = dur === 0;
                return (
                  <tr key={row.id} className={`hover:bg-slate-50/80 group transition-colors ${isUnplanned ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3 text-slate-400 text-center font-bold text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={row.activity} 
                        onChange={(e) => handleInputChange(row.id, 'activity', e.target.value)} 
                        className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none font-medium h-8" 
                        placeholder="Nama Aktivitas..." 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input type="date" value={row.start} onChange={(e) => handleInputChange(row.id, 'start', e.target.value)} className="bg-transparent text-xs font-bold outline-none w-28 text-slate-600 focus:text-blue-600"/>
                    </td>
                    <td className="px-4 py-3">
                      <input type="date" value={row.end} onChange={(e) => handleInputChange(row.id, 'end', e.target.value)} className="bg-transparent text-xs font-bold outline-none w-28 text-slate-600 focus:text-blue-600"/>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">
                      {isUnplanned ? <span className="text-[10px] text-amber-600 font-bold px-1.5 py-0.5 bg-amber-100 rounded-full border border-amber-200">UNP</span> : dur}
                    </td>
                    <td className="px-4 py-3 bg-emerald-50/10">
                      <input type="date" value={row.actualStart || ''} onChange={(e) => handleInputChange(row.id, 'actualStart', e.target.value)} className="bg-transparent text-xs font-bold outline-none w-28 text-emerald-800"/>
                    </td>
                    <td className="px-4 py-3 bg-emerald-50/10">
                      <input type="date" value={row.actualEnd || ''} onChange={(e) => handleInputChange(row.id, 'actualEnd', e.target.value)} className="bg-transparent text-xs font-bold outline-none w-28 text-emerald-800"/>
                    </td>
                    <td className="px-4 py-3 text-center bg-emerald-50/20 font-extrabold text-emerald-700">{row.actualDays > 0 ? row.actualDays : '-'}</td>
                    <td className="px-4 py-3 bg-emerald-50/40 min-w-[100px]">
                      <div className="flex flex-col gap-1">
                        <div className={`flex justify-between text-[10px] font-extrabold leading-tight ${isOver ? 'text-amber-700' : 'text-emerald-700'}`}>
                          <span>{fmt(aPct)}%</span>
                          {isOver && <span className="uppercase text-[8px] animate-pulse">Overdue</span>}
                        </div>
                        <div className="w-full bg-white/50 rounded-full h-1 overflow-hidden border border-emerald-100">
                          <div 
                            className={`h-full transition-all duration-700 rounded-full ${isOver ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(aPct, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <input 
                          type="text" 
                          value={row.link || ''} 
                          onChange={(e) => handleInputChange(row.id, 'link', e.target.value)} 
                          className="w-full bg-transparent border-b border-dashed border-slate-200 focus:border-blue-400 outline-none text-xs h-8 placeholder:text-slate-300" 
                          placeholder="Link Lampiran..." 
                        />
                        {row.link && (
                          <a 
                            href={row.link.startsWith('http') ? row.link : `https://${row.link}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 hover:text-blue-700 text-[10px] flex items-center gap-1 font-bold mt-1"
                          >
                            <LinkIcon size={10} /> Open CCP
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button 
                        onClick={() => {
                          const updated = program.activities.filter(a => a.id !== row.id);
                          updateProgram('activities', updated);
                        }} 
                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-rose-50 rounded-md"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={11} className="px-4 py-6 bg-slate-50/30">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleAddActivity(false)} 
                      className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 p-3 rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
                    >
                      <Plus size={18}/> Tambah Planned Activity
                    </button>
                    <button 
                      onClick={() => handleAddActivity(true)} 
                      className="flex-1 bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 p-3 rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
                    >
                      <Zap size={18}/> Tambah Unplanned / Ad-hoc
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-900 border-t border-slate-800 text-white">
              <tr>
                <td colSpan={8} className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest opacity-60">Total Lead Time / Overdue Stat</td>
                <td colSpan={3} className="px-6 py-4">
                  {metrics.overdueCount > 0 ? (
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <AlertCircle size={18}/> 
                      <span>+{fmt(metrics.overdueCount)} Days Accumulative Delay</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 size={18}/> 
                      <span>Target Achieved (On Time)</span>
                    </div>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
