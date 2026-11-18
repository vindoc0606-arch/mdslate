/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';
import { SubjectId, Question } from '../types';

interface BulkUploaderProps {
  onUploadSuccess: (questions: Question[]) => void;
  selectedSubject: SubjectId;
  selectedYear: 'BDS-I' | 'BDS-II' | 'BDS-III' | 'BDS-IV';
}

export default function BulkUploader({ onUploadSuccess, selectedSubject, selectedYear }: BulkUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stagedQuestions, setStagedQuestions] = useState<Question[] | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setFeedback(null);
    setStagedQuestions(null);

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileExt === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => handleData(results.data),
          error: (err) => handleError(err.message)
        });
      } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          handleData(jsonData);
        };
        reader.readAsArrayBuffer(file);
      } else {
        handleError('Unsupported file format. Please upload CSV or Excel.');
      }
    } catch (err) {
      handleError('Failed to process file.');
    }
  };

  const handleData = (data: any[]) => {
    try {
      const questions: Question[] = data.map((row, index) => {
        const options = [row.A, row.B, row.C, row.D].filter(Boolean);
        
        let correctOption = 0;
        const answerStr = String(row.Answer || '').trim().toUpperCase();
        if (answerStr === 'A' || answerStr === row.A) correctOption = 0;
        else if (answerStr === 'B' || answerStr === row.B) correctOption = 1;
        else if (answerStr === 'C' || answerStr === row.C) correctOption = 2;
        else if (answerStr === 'D' || answerStr === row.D) correctOption = 3;

        return {
          id: `bulk_${Date.now()}_${index}`,
          subjectId: selectedSubject,
          year: selectedYear,
          text: row.Question || row.question,
          options: options.length > 0 ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOption,
          explanation: row.Explanation || row.explanation || '',
          topic: row.Topic || row.topic || ''
        };
      });

      if (questions.length === 0) throw new Error('No valid questions found in file.');

      setStagedQuestions(questions);
      setFeedback({ type: 'success', message: `Parsed ${questions.length} questions. Please click Submit to upload.` });
    } catch (err: any) {
      handleError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (stagedQuestions) {
      setIsProcessing(true);
      onUploadSuccess(stagedQuestions);
      setStagedQuestions(null);
      setIsProcessing(false);
    }
  };


  const handleError = (msg: string) => {
    setFeedback({ type: 'error', message: msg });
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`
          relative border-2 border-dashed rounded-[2rem] p-10 transition-all text-center
          ${isProcessing ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-white border-blue-100 hover:border-blue-400 cursor-pointer'}
        `}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (isProcessing) return;
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
      >
        <input 
          type="file" 
          id="bulk-upload" 
          className="hidden" 
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
          disabled={isProcessing}
        />
        <label htmlFor="bulk-upload" className="cursor-pointer">
          <div className="flex flex-col items-center">
            {isProcessing ? (
              <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
            ) : (
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Upload size={32} />
              </div>
            )}
            <h3 className="text-lg font-bold text-slate-900">Upload Question Bank</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
              Drag and drop your spreadsheet here or click to browse. Supports CSV, XLSX.
            </p>
          </div>
        </label>
      </div>

      {stagedQuestions && (
        <button 
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl hover:bg-blue-700 transition"
        >
          Submit {stagedQuestions.length} Questions
        </button>
      )}

      {feedback && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {feedback.type === 'success' ? <CheckCircle className="shrink-0" size={20} /> : <XCircle className="shrink-0" size={20} />}
          <div className="text-sm font-semibold">
            {feedback.message}
          </div>
        </div>
      )}
    </div>
  );
}
