/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuditProgram, AccuracyData, AccuracyFolder } from './types';

export const PIC_OPTIONS = ['Habibie', 'Josua', 'Farhan', 'Majid', 'Rangga', 'Tika'];

export const SITE_OPTIONS = [
  'AGM', 'BAYAN', 'CDI', 'MBL MINING', 'MBL HAULING', 
  'MHU', 'PALARAN', 'SAMARINDA', 'Hauling', 'Head Office', 
  'MAS', 'MSJ'
];

export const ADMIN_EMAILS = [
  "taultmajid5@gmail.com",
  "admin@perusahaan.com"
];

export const DEFAULT_ACCURACY_FOLDERS: AccuracyFolder[] = [
  { id: 'af1', name: 'Audit Operasional' },
  { id: 'af2', name: 'Audit Management System' }
];

export const DEFAULT_PROGRAMS: AuditProgram[] = [
  {
    id: '1',
    title: 'Audit Program IT Operasional',
    pic: 'Habibie',
    site: 'AGM',
    docLink: '',
    activities: [
      { id: '1', activity: 'Desk Audit', start: '2024-09-01', end: '2024-09-05', actualStart: '2024-09-01', actualEnd: '2024-09-05', actualDays: 5, link: '' },
      { id: '2', activity: 'Opening Meeting', start: '2024-09-06', end: '2024-09-06', actualStart: '2024-09-06', actualEnd: '2024-09-06', actualDays: 1, link: '' },
      { id: '3', activity: 'Pelaksanaan Audit', start: '2024-09-07', end: '2024-09-18', actualStart: '2024-09-07', actualEnd: '2024-09-18', actualDays: 12, link: '' },
      { id: '4', activity: 'Closing Meeting', start: '2024-09-19', end: '2024-09-19', actualStart: '2024-09-19', actualEnd: '2024-09-19', actualDays: 1, link: '' },
      { id: '5', activity: 'Submit LHA', start: '2024-09-20', end: '2024-09-25', actualStart: '2024-09-20', actualEnd: '2024-09-23', actualDays: 4, link: '' },
    ]
  }
];

export const DEFAULT_ACCURACY_DATA: AccuracyData[] = [
  { id: '1', folderId: 'af1', projectName: 'Audit Closing Project AGM', site: 'AGM', planStart: '2024-01-01', completed: true, evidence: '' },
  { id: '2', folderId: 'af1', projectName: 'Audit Closing Project MAS', site: 'MAS', planStart: '2024-01-01', completed: true, evidence: '' },
  { id: '3', folderId: 'af1', projectName: 'Audit SM', site: 'SAMARINDA', planStart: '2024-01-01', completed: true, evidence: '' },
  { id: '4', folderId: 'af1', projectName: 'Audit Operasional SM', site: 'SAMARINDA', planStart: '2024-02-01', completed: true, evidence: '' },
  { id: '5', folderId: 'af1', projectName: 'Audit Operasional MHU', site: 'MHU', planStart: '2024-04-01', completed: false, evidence: '' },
  { id: '6', folderId: 'af1', projectName: 'Audit Operasional IP Bayan', site: 'BAYAN', planStart: '2024-07-01', completed: false, evidence: '' },
  { id: '7', folderId: 'af1', projectName: 'Audit Operasional MBL-M', site: 'MBL MINING', planStart: '2024-08-01', completed: false, evidence: '' },
  { id: '8', folderId: 'af2', projectName: 'Audit ISO 9001 Stage 1', site: 'HO', planStart: '2024-11-01', completed: false, evidence: '' },
];
