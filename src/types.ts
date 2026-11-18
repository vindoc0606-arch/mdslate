/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DayContent {
    id: string;
    target_date: string;
    testsToComplete: number;
    revisionTopics: string[];
}

export const EXAM_DATE = new Date('2026-05-02');

export type SubjectId = 
  | 'anatomy' | 'physiology_biochem' | 'dental_anatomy' | 'pathology_micro' | 'pharmacology' | 'medicine' | 'surgery'
  | 'materials' | 'oral_path' | 'oral_med_rad' | 'pedodontics' | 'orthodontics' | 'periodontology' | 'prosthodontics' | 'conservative_endo' | 'oral_surgery' | 'public_health';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  part: 'A' | 'B';
  weightage: number;
}

export const SUBJECTS: Record<SubjectId, SubjectInfo> = {
  anatomy: { id: 'anatomy', name: 'General Anatomy', part: 'A', weightage: 14 },
  physiology_biochem: { id: 'physiology_biochem', name: 'General Human Physiology and Biochemistry', part: 'A', weightage: 14 },
  dental_anatomy: { id: 'dental_anatomy', name: 'Dental Anatomy, Embryology & Oral Histology', part: 'A', weightage: 14 },
  pathology_micro: { id: 'pathology_micro', name: 'General Pathology and Microbiology', part: 'A', weightage: 14 },
  pharmacology: { id: 'pharmacology', name: 'General and Dental Pharmacology and Therapeutics', part: 'A', weightage: 14 },
  medicine: { id: 'medicine', name: 'General Medicine', part: 'A', weightage: 15 },
  surgery: { id: 'surgery', name: 'General Surgery', part: 'A', weightage: 15 },
  
  materials: { id: 'materials', name: 'Dental Materials', part: 'A', weightage: 14 },
  oral_path: { id: 'oral_path', name: 'Oral Pathology and Oral Microbiology', part: 'A', weightage: 14 },
  oral_med_rad: { id: 'oral_med_rad', name: 'Oral Medicine and Radiology', part: 'B', weightage: 14 },
  pedodontics: { id: 'pedodontics', name: 'Pedodontics and Preventive Dentistry', part: 'B', weightage: 14 },
  orthodontics: { id: 'orthodontics', name: 'Orthodontics & Dentofacial Orthopedics', part: 'B', weightage: 14 },
  periodontology: { id: 'periodontology', name: 'Periodontology', part: 'B', weightage: 14 },
  prosthodontics: { id: 'prosthodontics', name: 'Prosthodontics and Crown & Bridge', part: 'B', weightage: 14 },
  conservative_endo: { id: 'conservative_endo', name: 'Conservative Dentistry and Endodontics', part: 'B', weightage: 14 },
  oral_surgery: { id: 'oral_surgery', name: 'Oral and Maxillofacial Surgery', part: 'B', weightage: 14 },
  public_health: { id: 'public_health', name: 'Public Health Dentistry', part: 'B', weightage: 14 },
};

export const SUBJECT_BDS_YEAR: Record<SubjectId, 'BDS-I' | 'BDS-II' | 'BDS-III' | 'BDS-IV'> = {
  anatomy: 'BDS-I',
  physiology_biochem: 'BDS-I',
  dental_anatomy: 'BDS-I',
  pathology_micro: 'BDS-II',
  pharmacology: 'BDS-II',
  medicine: 'BDS-III',
  surgery: 'BDS-III',
  materials: 'BDS-II',
  oral_path: 'BDS-II',
  oral_med_rad: 'BDS-III',
  pedodontics: 'BDS-IV',
  orthodontics: 'BDS-IV',
  periodontology: 'BDS-III',
  prosthodontics: 'BDS-IV',
  conservative_endo: 'BDS-IV',
  oral_surgery: 'BDS-IV',
  public_health: 'BDS-IV',
};

export interface Question {
  id: string;
  subjectId: SubjectId;
  year: 'BDS-I' | 'BDS-II' | 'BDS-III' | 'BDS-IV';
  text: string;
  options: string[];
  correctOption: number; // 0-3
  explanation: string;
  topic?: string;
  imageUrl?: string;
}

export interface TestGenerated {
  id: string;
  title: string;
  type: 'RANKER' | 'MOCK' | 'MT' | 'ST';
  questions: string[]; // List of question IDs
  weightage: Record<string, number>;
  status: 'DRAFT' | 'LOCKED' | 'PUBLISHED' | 'SCHEDULED';
  subjectId?: SubjectId; // Added subjectId
  publishDate?: string; // ISO string
  autoKeyReleaseDate?: string; // ISO string
  createdAt: string; // ISO string
  answerKey?: Record<string, number>; // questionId -> optionIndex
  explanations?: Record<string, string>; // questionId -> explanation
  adminMessage?: string; // Upcomming exam or status message
}

export interface ExamSession {
  id: string;
  type: 'GT' | 'MT' | 'ST'; // Grand Test, Mini Test, Subject Test
  startTime: number;
  endTime?: number;
  answers: Record<string, number>; // questionId -> selectedOption
  markedForReview: string[]; // questionId[]
  isCompleted: boolean;
}

export interface UserPerformance {
  userId: string;
  examResults: {
    examId: string;
    score: number;
    subjectWiseScores: Record<SubjectId, { correct: number; total: number }>;
    timestamp: number;
  }[];
  air: number; // Simulated AIR
}

export interface UserProfile {
  name: string;
  email: string;
  mobile: string;
  college: string;
  state: string;
  role: 'student' | 'admin';
}
