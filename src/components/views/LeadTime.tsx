/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Timer, Send, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuditProgram } from '../../types';
import { formatDate, fmt } from '../../lib/utils';

interface LeadTimeProps {
  programs: AuditProgram[];
  onUpdateProgram: (program: AuditProgram) => Promise<void>;
}

export default function LeadTime({ programs, onUpdateProgram }: LeadTimeProps) {
  const [inputLinks, setInputLinks] = useState<Record<string, string>>({});
  const [submitDates, setSubmitDates] = useState<Record<string, string>>({});

  const handleClosingDateChange = async (prog: AuditProgram, newDate: string) => {
    const activities = prog.activities.map(a => {
      if (a.activity === 'Closing Meeting') return { ...a, actualEnd: newDate };
      return a;
    });
    await onUpdateProgram({ ...prog, activities });
  };

  const handleSubmitReport = async (prog: AuditProgram) => {
    const link = inputLinks[prog.id];
    const submitDate = submitDates[prog.id] || new Date().toISOString().split('T')[0];
    
    if (!link) return alert("Mohon isi link laporan terlebih dahulu");
    
    // Convert selected date to ISO string for storage consistency
    const submittedAt = new Date(submitDate).toISOString();
    
    await onUpdateProgram({ 
      ...prog, 
      finalReport: { link, submittedAt } 
    });
  };

  return (
    <div className="max-w-7xl mx-auto pt-6 px-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Lead Time Audit Report</h1>
        <p className="text-slate-500 mt-1">Pemantauan durasi penyelesaian laporan audit dari tanggal Closing Meeting (Target Max 5 Hari).</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 w-1/4">Project Name</th>
                <th className="px-6 py-5">Closing Meeting Date</th>
                <th className="px-6 py-5">Submit Audit Report</th>
                <th className="px-6 py-5">Submission Details</th>
                <th className="px-6 py-5 text-center">Lead Time</th>
                <th className="px-6 py-5 text-center border-l border-slate-100 bg-slate-50/50">Achievement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programs.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Belum ada program untuk dipantau.</td></tr>
              )}
              {programs.map(prog => {
                const closingActivity = (prog.activities.find(a => a.activity === 'Closing Meeting') || {}) as any;
                const closingDate = closingActivity.actualEnd || closingActivity.end || '';
                let leadTimeDisplay = '-';
                let achievement = 0;
                
                if (closingDate && prog.finalReport?.submittedAt) {
                  const msPerDay = 1000 * 60 * 60 * 24;
                  // Normalize dates to midnight to get accurate day difference
                  const start = new Date(closingDate);
                  start.setHours(0,0,0,0);
                  const end = new Date(prog.finalReport.submittedAt);
                  end.setHours(0,0,0,0);

                  const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / msPerDay);
                  leadTimeDisplay = diffDays + " Days";
                  achievement = diffDays <= 5 ? 100 : (5 / diffDays) * 100;
                }

                return (
                  <tr key={prog.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 font-bold text-slate-800">{prog.title}</td>
                    <td className="px-6 py-5">
                      <input 
                        type="date" 
                        value={closingDate} 
                        onChange={(e) => handleClosingDateChange(prog, e.target.value)} 
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-white font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </td>
                    <td className="px-6 py-5">
                      {!prog.finalReport ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <div className="flex gap-2">
                             <input 
                              type="date"
                              value={submitDates[prog.id] || new Date().toISOString().split('T')[0]}
                              onChange={(e) => setSubmitDates(prev => ({ ...prev, [prog.id]: e.target.value }))}
                              className="border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] bg-slate-50 outline-none focus:bg-white w-28 font-bold text-slate-600"
                            />
                            <input 
                              type="text" 
                              placeholder="Paste Link LHA..." 
                              value={inputLinks[prog.id] || ''} 
                              onChange={(e) => setInputLinks(prev => ({ ...prev, [prog.id]: e.target.value }))} 
                              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-full bg-slate-50 outline-none focus:bg-white"
                            />
                            <button 
                              onClick={() => handleSubmitReport(prog)} 
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all active:scale-95 shadow-md shadow-blue-100"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium italic">Pilih tanggal submit & tempel link</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 w-fit">
                            <CheckCircle2 size={14}/>
                            <span className="text-xs uppercase tracking-tight">Submitted</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            On: {formatDate(prog.finalReport.submittedAt)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {prog.finalReport ? (
                        <a 
                          href={prog.finalReport.link.startsWith('http') ? prog.finalReport.link : `https://${prog.finalReport.link}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1.5 underline decoration-blue-200 underline-offset-4"
                        >
                          <LinkIcon size={14}/> View Report
                        </a>
                      ) : (
                        <span className="text-slate-300 italic text-xs">Waiting submission...</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-700">
                      {leadTimeDisplay}
                    </td>
                    <td className="px-6 py-5 text-center border-l border-slate-100 bg-slate-50/30">
                      {leadTimeDisplay !== '-' ? (
                        <div className="flex flex-col items-center">
                          <span className={`text-lg font-black ${achievement >= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {fmt(achievement)}%
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Target 5 Days</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
