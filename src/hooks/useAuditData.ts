/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { AuditProgram, AccuracyData, AccuracyFolder } from '../types';
import { DEFAULT_PROGRAMS, DEFAULT_ACCURACY_DATA, DEFAULT_ACCURACY_FOLDERS } from '../constants';

export function useAuditData(user: any) {
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [accuracyData, setAccuracyData] = useState<AccuracyData[]>([]);
  const [accuracyFolders, setAccuracyFolders] = useState<AccuracyFolder[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Sync Programs
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'programs'), orderBy('id', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        return { ...doc.data(), id: doc.id } as any;
      });
      setPrograms(data);
      setIsDataLoaded(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'programs');
    });
    return unsubscribe;
  }, [user]);

  // Sync Accuracy Data
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'accuracyData'), (snapshot) => {
      const data = snapshot.docs.map(doc => {
        return { ...doc.data(), id: doc.id } as any;
      });
      setAccuracyData(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'accuracyData');
    });
    return unsubscribe;
  }, [user]);

  // Sync Folders
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'accuracyFolders'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AccuracyFolder));
      setAccuracyFolders(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'accuracyFolders');
    });
    return unsubscribe;
  }, [user]);

  // Check Admin Status
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'admins', user.uid), (docSnap) => {
      setIsAdmin(docSnap.exists());
    });
    return unsubscribe;
  }, [user]);

  const saveProgram = async (program: AuditProgram) => {
    const docId = program.id;
    const path = `programs/${docId}`;
    try {
      await setDoc(doc(db, 'programs', docId), program, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteProgram = async (id: string) => {
    console.log('Attempting to delete program:', id);
    const path = `programs/${id}`;
    try {
      await deleteDoc(doc(db, 'programs', id));
      console.log('Successfully deleted program:', id);
    } catch (error) {
      console.error('Delete program failed:', error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveAccuracyItem = async (item: AccuracyData) => {
    const docId = item.id;
    const path = `accuracyData/${docId}`;
    try {
      await setDoc(doc(db, 'accuracyData', docId), item, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteAccuracyItem = async (id: string) => {
    console.log('Attempting to delete accuracy item:', id);
    const path = `accuracyData/${id}`;
    try {
      await deleteDoc(doc(db, 'accuracyData', id));
      console.log('Successfully deleted accuracy item:', id);
    } catch (error) {
      console.error('Delete accuracy item failed:', error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveAccuracyFolder = async (folder: AccuracyFolder) => {
    const path = `accuracyFolders/${folder.id}`;
    try {
      await setDoc(doc(db, 'accuracyFolders', folder.id), folder, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteAccuracyFolder = async (id: string) => {
    console.log('Attempting to delete accuracy folder:', id);
    const path = `accuracyFolders/${id}`;
    try {
      await deleteDoc(doc(db, 'accuracyFolders', id));
      console.log('Successfully deleted accuracy folder:', id);
    } catch (error) {
      console.error('Delete accuracy folder failed:', error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const resetToTemplate = async () => {
    try {
      // Clear existing
      // For simplicity in this scale, we just push defaults. 
      // In production, you'd batch delete first.
      for (const p of DEFAULT_PROGRAMS) await saveProgram(p);
      for (const a of DEFAULT_ACCURACY_DATA) await saveAccuracyItem(a);
      for (const f of DEFAULT_ACCURACY_FOLDERS) await saveAccuracyFolder(f);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch_reset');
    }
  };

  return {
    programs,
    accuracyData,
    accuracyFolders,
    isAdmin,
    isDataLoaded,
    saveProgram,
    deleteProgram,
    saveAccuracyItem,
    deleteAccuracyItem,
    saveAccuracyFolder,
    deleteAccuracyFolder,
    resetToTemplate
  };
}
