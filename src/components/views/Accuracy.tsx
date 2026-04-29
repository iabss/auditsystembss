/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Fragment } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Folder, 
  FolderOpen, 
  X, 
  Check, 
  MapPin, 
  RefreshCw, 
  Cloud 
} from 'lucide-react';
import { AccuracyData, AccuracyFolder } from '../../types';
import { SITE_OPTIONS, DEFAULT_ACCURACY_DATA } from '../../constants';
import { fmt } from '../../lib/utils';

interface AccuracyProps {
  data: AccuracyData[];
  folders: AccuracyFolder[];
  onSaveItem: (item: AccuracyData) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onSaveFolder: (folder: AccuracyFolder) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  isAdmin: boolean;
}

export default function Accuracy({ 
  data, 
  folders, 
  onSaveItem, 
  onDeleteItem, 
  onSaveFolder, 
  onDeleteFolder,
  isAdmin 
}: AccuracyProps) {
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const displayedData = activeFolderId === 'all' 
    ? data 
    : data.filter(item => item.folderId === activeFolderId);

  const todayStr = new Date().toISOString().split('T')[0];
  const ytdData = displayedData.filter(r => r.planStart <= todayStr);
  const ytdTarget = ytdData.length;
  const ytdRealized = ytdData.filter(r => r.completed).length;
  const ytdAchievement = ytdTarget > 0 ? (ytdRealized / ytdTarget) * 100 : 0;

  const handleAddItem = async () => {
    const folderId = activeFolderId === 'all' ? (folders.length > 0 ? folders[0].id : null) : activeFolderId;
    const newItem: AccuracyData = {
      id: Date.now().toString(),
      folderId: folderId,
      projectName: 'Proyek Baru',
      site: 'AGM',
      planStart: new Date().toISOString().split('T')[0],
      completed: false,
      evidence: ''
    };
    await onSaveItem(newItem);
  };

  const handleUpdateItem = async (id: string, field: keyof AccuracyData, value: any) => {
    const item = data.find(i => i.id === id);
    if (item) {
      setIsSaving(true);
      await onSaveItem({ ...item, [field]: value });
      setIsSaving(false);
    }
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    const newFolder = { id: `folder_${Date.now()}`, name: newFolderName };
    await onSaveFolder(newFolder);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  // Grouping logic
  const sortedData = [...displayedData].sort((a, b) => new Date(a.planStart).getTime() - new Date(b.planStart).getTime());
  const groupedData: Record<string, AccuracyData[]> = sortedData.reduce((acc, item) => {
    const date = item.planStart ? new Date(item.planStart) : null;
    const monthKey = date ? date.toLocaleString('id-ID', { month: 'long', year: 'numeric' }) : 'Unknown';
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(item);
    return acc;
  }, {} as Record<string, AccuracyData[]>);

  return (
    <div className="max-w-7xl mx-auto pt-6 px-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Akurasi Project Audit</h1>
          <p className="text-slate-500 mt-1 text-sm">Pemantauan realisasi project terhadap rencana tahunan.</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${isSaving ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {isSaving ? <><RefreshCw size={12} className="animate-spin"/> Syncing</> : <><Cloud size={12}/> Synced</>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Clock size={20}/></div>
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Planned</h3>
          </div>
          <div className="text-3xl font-bold text-slate-800">{displayedData.length} <span className="text-sm font-medium text-slate-400">Items</span></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 size={20}/></div>
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Completed</h3>
          </div>
          <div className="text-3xl font-bold text-slate-800">{displayedData.filter(r => r.completed).length} <span className="text-sm font-medium text-slate-400">Items</span></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><TrendingUp size={20}/></div>
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Achievement YTD</h3>
          </div>
          <div className={`text-3xl font-bold ${ytdAchievement >= 100 ? 'text-emerald-600' : 'text-purple-600'}`}>
            {fmt(ytdAchievement)}%
          </div>
        </div>
      </div>

      {/* Folders */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        <button 
          onClick={() => setActiveFolderId('all')}
          className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 shadow-sm ${
            activeFolderId === 'all' 
              ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-50' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {activeFolderId === 'all' ? <FolderOpen size={16}/> : <Folder size={16}/>}
          Semua Proyek
        </button>
        
        {folders.map(folder => (
          <div key={folder.id} className="relative group flex items-center">
            <button 
              onClick={() => setActiveFolderId(folder.id)}
              className={`whitespace-nowrap pl-4 pr-10 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 shadow-sm ${
                activeFolderId === folder.id 
                  ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-50' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <Folder size={16}/>
              {folder.name}
            </button>
            <span 
              role="button"
              tabIndex={0}
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                if (window.confirm(`Hapus kategori "${folder.name}" beserta seluruh isinya?`)) {
                  onDeleteFolder(folder.id).catch(err => console.error('Delete folder failed:', err)); 
                }
              }}
              className={`absolute right-2 p-1.5 rounded-full transition-all cursor-pointer z-20 ${
                activeFolderId === folder.id
                  ? 'text-white/60 hover:text-white hover:bg-white/20'
                  : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'
              }`}
              title="Hapus Kategori"
            >
              <X size={14} />
            </span>
          </div>
        ))}

        {!isAddingFolder && (
          <button 
            onClick={() => setIsAddingFolder(true)}
            className="whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-bold bg-slate-50 text-slate-400 border border-dashed border-slate-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center gap-1"
          >
            <Plus size={16}/> Kategori
          </button>
        )}

        {isAddingFolder && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-blue-200 shadow-lg animate-in zoom-in duration-200">
            <input 
              type="text" 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nama..." 
              className="text-sm px-3 py-1 outline-none bg-transparent w-32 placeholder-slate-400"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
            />
            <button onClick={handleAddFolder} className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"><Check size={12}/></button>
            <button onClick={() => setIsAddingFolder(false)} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition"><X size={12}/></button>
          </div>
        )}
      </div>

      {/* Content */}
      {displayedData.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center text-slate-400">
          <FolderOpen size={48} className="mb-4 text-slate-300"/>
          <h3 className="text-lg font-medium text-slate-600">Kategori Kosong</h3>
          <p className="mb-6 text-sm">Belum ada item akurasi untuk kategori ini.</p>
          <button onClick={handleAddItem} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100">
            <Plus size={18}/> Tambah Item
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-48 border-r border-slate-100">Periode Rencana</th>
                  <th className="px-6 py-4 w-28 text-center border-r border-slate-100">Target</th>
                  <th className="px-6 py-4 min-w-[300px]">Detail Project</th>
                  <th className="px-6 py-4 text-center w-40 bg-emerald-50/20 text-emerald-800 font-bold border-l border-slate-100">Score</th>
                  <th className="px-6 py-4 w-52 text-center bg-slate-50/50">Status & Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(groupedData).map(([month, items]) => {
                  const actualCount = items.filter(i => i.completed).length;
                  const score = (actualCount / items.length) * 100;
                  return (
                    <Fragment key={month}>
                      {items.map((row, index) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 group transition-colors">
                          {index === 0 && (
                            <td rowSpan={items.length} className="px-6 py-6 align-top font-bold text-slate-700 bg-slate-50/30 border-r border-slate-100">
                              <div className="sticky top-4">
                                <div className="text-sm">{month}</div>
                              </div>
                            </td>
                          )}
                          {index === 0 && (
                            <td rowSpan={items.length} className="px-6 py-6 align-top text-center font-bold text-blue-600 bg-slate-50/30 border-r border-slate-100">
                              <div className="sticky top-4">
                                <div className="text-xs uppercase opacity-40 mb-1">Plan</div>
                                <div className="text-xl">{items.length}</div>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 align-middle relative">
                            <div className="flex flex-col gap-1 pr-8">
                              <input 
                                type="text" 
                                value={row.projectName} 
                                onChange={(e) => handleUpdateItem(row.id, 'projectName', e.target.value)} 
                                className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-slate-800 h-8" 
                                placeholder="Proyek..." 
                              />
                              <div className="flex gap-3 items-center mt-1">
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                  <MapPin size={10} />
                                  <select 
                                    value={row.site} 
                                    onChange={(e) => handleUpdateItem(row.id, 'site', e.target.value)} 
                                    className="bg-transparent border-none outline-none cursor-pointer focus:text-blue-600"
                                  >
                                    {SITE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                  Plan: <input type="date" value={row.planStart} onChange={(e) => handleUpdateItem(row.id, 'planStart', e.target.value)} className="bg-transparent outline-none focus:text-blue-600 cursor-pointer"/>
                                </span>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (window.confirm('Hapus item akurasi ini?')) {
                                  onDeleteItem(row.id).catch(err => console.error('Delete item failed:', err));
                                }
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-slate-300 hover:text-rose-500 bg-white/80 backdrop-blur-sm rounded-full z-40 transition-all opacity-100 shadow-sm border border-transparent hover:border-rose-100 cursor-pointer"
                              title="Hapus Kegiatan"
                            >
                              <Trash2 size={18}/>
                            </button>
                          </td>
                          {index === 0 && (
                            <td rowSpan={items.length} className="px-6 py-6 align-middle text-center bg-emerald-50/10 border-l border-slate-100">
                              <div className="sticky top-4">
                                <div className={`text-2xl font-black ${score >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{fmt(score)}%</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{actualCount} / {items.length} Selesai</div>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 align-middle bg-slate-50/20">
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => handleUpdateItem(row.id, 'completed', !row.completed)}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                                  row.completed 
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-500'
                                }`}
                              >
                                {row.completed ? <><CheckCircle2 size={14}/> Realized</> : 'Mark Complete'}
                              </button>
                              <input 
                                type="text" 
                                value={row.evidence || ''} 
                                onChange={(e) => handleUpdateItem(row.id, 'evidence', e.target.value)} 
                                placeholder="Link / Bukti..." 
                                className="w-full text-[10px] border border-slate-200 rounded-md py-1.5 px-3 bg-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <button 
              onClick={handleAddItem} 
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 py-3 rounded-xl border border-dashed border-slate-300 bg-white shadow-sm transition-all hover:bg-white hover:border-blue-400"
            >
              <Plus size={18}/> Tambah Kegiatan di Sini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
