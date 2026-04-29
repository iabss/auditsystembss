/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { MenuType, ViewType, AuditProgram } from './types';
import { ADMIN_EMAILS } from './constants';
import LoginScreen from './components/auth/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import AuditDashboard from './components/views/AuditDashboard';
import AuditDetail from './components/views/AuditDetail';
import Analytics from './components/views/Analytics';
import Accuracy from './components/views/Accuracy';
import LeadTime from './components/views/LeadTime';
import Settings from './components/views/Settings';
import { Loader2 } from 'lucide-react';
import { useAuditData } from './hooks/useAuditData';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuType>('audit');
  const [view, setView] = useState<ViewType>('dashboard');
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const auditDataControls = useAuditData(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && u.email && ADMIN_EMAILS.includes(u.email)) {
        // Bootstrap admin status if email matches
        const adminDoc = doc(db, 'admins', u.uid);
        const snap = await getDoc(adminDoc);
        if (!snap.exists()) {
          await setDoc(adminDoc, { email: u.email, role: 'admin' });
        }
      }
      setAuthInitialized(true);
    });
    return unsubscribe;
  }, []);

  if (!authInitialized) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400 flex-col gap-2 bg-slate-50">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-xs font-medium">Menghubungkan ke Database...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'audit':
        if (view === 'detail' && currentProgramId) {
          const program = auditDataControls.programs.find(p => p.id === currentProgramId);
          return (
            <AuditDetail 
              program={program} 
              onBack={() => setView('dashboard')}
              onSave={auditDataControls.saveProgram}
              onDelete={auditDataControls.deleteProgram}
            />
          );
        }
        return (
          <AuditDashboard 
            programs={auditDataControls.programs}
            onOpenDetail={(id) => {
              setCurrentProgramId(id);
              setView('detail');
            }}
            onCreateProgram={async () => {
              const newId = Date.now().toString();
              const today = new Date().toISOString().split('T')[0];
              
              const addDaysToIso = (iso: string, days: number) => {
                const d = new Date(iso);
                d.setDate(d.getDate() + days);
                return d.toISOString().split('T')[0];
              };

              const deskStart = today;
              const deskEnd = addDaysToIso(deskStart, 4); // 5 hari

              const openStart = addDaysToIso(deskEnd, 1);
              const openEnd = openStart; // 1 hari

              const auditStart = addDaysToIso(openEnd, 1);
              const auditEnd = addDaysToIso(auditStart, 9); // 10 hari

              const closeStart = addDaysToIso(auditEnd, 1);
              const closeEnd = closeStart; // 1 hari

              const lhaStart = addDaysToIso(closeEnd, 1);
              const lhaEnd = addDaysToIso(lhaStart, 2); // 3 hari

              const newProgram: AuditProgram = {
                id: newId,
                title: `Audit Program Baru ${auditDataControls.programs.length + 1}`,
                pic: user.displayName || 'Auditor',
                site: 'AGM',
                docLink: '',
                activities: [
                  { id: (Date.now() + 1).toString(), activity: 'Desk Audit', start: deskStart, end: deskEnd, actualStart: '', actualEnd: '', actualDays: 0, link: '' },
                  { id: (Date.now() + 2).toString(), activity: 'Opening Meeting', start: openStart, end: openEnd, actualStart: '', actualEnd: '', actualDays: 0, link: '' },
                  { id: (Date.now() + 3).toString(), activity: 'Pelaksanaan Audit', start: auditStart, end: auditEnd, actualStart: '', actualEnd: '', actualDays: 0, link: '' },
                  { id: (Date.now() + 4).toString(), activity: 'Closing Meeting', start: closeStart, end: closeEnd, actualStart: '', actualEnd: '', actualDays: 0, link: '' },
                  { id: (Date.now() + 5).toString(), activity: 'Submit LHA', start: lhaStart, end: lhaEnd, actualStart: '', actualEnd: '', actualDays: 0, link: '' },
                ]
              };
              await auditDataControls.saveProgram(newProgram);
              setCurrentProgramId(newId);
              setView('detail');
            }}
            onDeleteProgram={auditDataControls.deleteProgram}
            isAdmin={auditDataControls.isAdmin}
          />
        );
      case 'analytics':
        return <Analytics programs={auditDataControls.programs} />;
      case 'accuracy':
        return (
          <Accuracy 
            data={auditDataControls.accuracyData}
            folders={auditDataControls.accuracyFolders}
            onSaveItem={auditDataControls.saveAccuracyItem}
            onDeleteItem={auditDataControls.deleteAccuracyItem}
            onSaveFolder={auditDataControls.saveAccuracyFolder}
            onDeleteFolder={auditDataControls.deleteAccuracyFolder}
            isAdmin={auditDataControls.isAdmin}
          />
        );
      case 'leadTime':
        return <LeadTime programs={auditDataControls.programs} onUpdateProgram={auditDataControls.saveProgram} />;
      case 'settings':
        return <Settings user={user} isAdmin={auditDataControls.isAdmin} />;
      default:
        return <div>Module not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen} 
        activeMenu={activeMenu} 
        setActiveMenu={(menu) => {
          setActiveMenu(menu);
          setView('dashboard');
        }}
        user={user}
      />
      <main className="flex-1 overflow-y-auto relative scroll-smooth no-scrollbar">
        {renderContent()}
      </main>
    </div>
  );
}
