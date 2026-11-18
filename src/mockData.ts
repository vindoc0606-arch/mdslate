/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, SubjectId } from './types';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    subjectId: 'anatomy',
    year: 'BDS-I',
    text: 'Which of the following nerves is responsible for the sensory innervation of the anterior two-thirds of the tongue?',
    options: ['Glossopharyngeal nerve', 'Lingual nerve', 'Hypoglossal nerve', 'Vagus nerve'],
    correctOption: 1,
    explanation: 'The lingual nerve, a branch of the mandibular division of the trigeminal nerve (V3), provides general sensory innervation to the anterior two-thirds of the tongue.'
  },
  {
    id: 'q2',
    subjectId: 'materials',
    year: 'BDS-II',
    text: 'Which type of gypsum product is commonly known as "Dental Stone, High Strength"?',
    options: ['Type I', 'Type III', 'Type IV', 'Type V'],
    correctOption: 2,
    explanation: 'Type IV gypsum is high-strength dental stone, used for dies where high abrasion resistance and minimal expansion are required.'
  },
  {
    id: 'q3',
    subjectId: 'prosthodontics',
    year: 'BDS-III',
    text: 'The "Balanced Occlusion" concept is primarily essential for which type of prosthesis?',
    options: ['Single Crown', 'Fixed Partial Denture', 'Complete Denture', 'Inlay'],
    correctOption: 2,
    explanation: 'Balanced occlusion is critical for complete dentures to provide stability during functional and non-functional movements.'
  },
  {
    id: 'q4',
    subjectId: 'oral_surgery',
    year: 'BDS-IV',
    text: 'Which of the following muscles is the primary opener of the mouth?',
    options: ['Masseter', 'Temporalis', 'Lateral Pterygoid', 'Medial Pterygoid'],
    correctOption: 2,
    explanation: 'The lateral pterygoid muscle (primarily the inferior head) is responsible for depression (opening) and protrusion of the mandible.'
  }
];

// Helper to generate more dummy questions across all subjects
export const getFullMockQuestions = (): Question[] => {
  const allQuestions = [...MOCK_QUESTIONS];
  // Fill in at least one question per subject if missing
  return allQuestions;
};
