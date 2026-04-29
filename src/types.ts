/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Activity {
  id: string;
  activity: string;
  category?: string;
  start: string;
  end: string;
  actualStart: string;
  actualEnd: string;
  actualDays: number;
  link: string;
}

export interface FinalReport {
  link: string;
  submittedAt: string;
}

export interface AuditProgram {
  id: string;
  title: string;
  pic: string;
  site: string;
  docLink: string;
  finalReport?: FinalReport | null;
  activities: Activity[];
}

export interface AccuracyFolder {
  id: string;
  name: string;
}

export interface AccuracyData {
  id: string;
  folderId: string | null;
  projectName: string;
  site: string;
  planStart: string;
  completed: boolean;
  evidence: string;
}

export interface SharedBoard {
  programs: AuditProgram[];
  accuracyData: AccuracyData[];
  accuracyFolders: AccuracyFolder[];
  createdAt?: string;
}

export type ViewType = 'dashboard' | 'detail';
export type MenuType = 'audit' | 'analytics' | 'accuracy' | 'leadTime' | 'settings';
export type DashboardLayout = 'grid' | 'list' | 'blueprint';
