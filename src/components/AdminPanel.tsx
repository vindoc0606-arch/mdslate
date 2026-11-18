/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Settings, Save, X, Calendar, FileText, LayoutGrid, Users, Activity, Lightbulb, GitBranch } from 'lucide-react';
import { SUBJECTS, Question, SubjectId, TestGenerated } from '../types';
import ManualQuestionForm from './ManualQuestionForm';
import BulkUploader from './BulkUploader';
import TestArchitect from './TestArchitect';
import AdminUsersPanel from './AdminUsersPanel';
import ExamActivityPanel from './ExamActivityPanel';
import AdminHighYield from './AdminHighYield';
import AdminFeatureToggle from './AdminFeatureToggle';
import FlowChartAdminPanel from './FlowChartAdminPanel';
import AdminSyndromes from './Syndromes/AdminSyndromes';
import { supabase } from '../lib/supabase';
import { generateQuestionsFromPYQs } from '../services/aiGenerator';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'pool' | 'generator' | 'tests' | 'users' | 'activity' | 'highYield' | 'features' | 'dashboardContent' | 'flowChartAdmin'>('pool');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [dashboardContent, setDashboardContent] = useState({ quote: '', tip: '', trick: '' });
  
  useEffect(() => {
    async function fetchContent() {
        if (!targetDate) return;
        const { data } = await supabase.from('dashboard_content').select('*').eq('target_date', targetDate).single();
        if (data) {
            setDashboardContent({ quote: data.quote, tip: data.tip, trick: data.trick });
        } else {
            setDashboardContent({ quote: '', tip: '', trick: '' });
        }
    }
    if (activeTab === 'dashboardContent') fetchContent();
  }, [activeTab, targetDate]);

  const updateDashboardContent = async () => {
      const { error } = await supabase.from('dashboard_content').upsert({
          target_date: targetDate,
          ...dashboardContent
      });
      if (error) alert('Error saving: ' + error.message);
      else alert('Content saved for ' + targetDate);
  };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('anatomy');
  const [selectedYear, setSelectedYear] = useState<'BDS-I' | 'BDS-II' | 'BDS-III' | 'BDS-IV'>('BDS-I');
  const [tests, setTests] = useState<TestGenerated[]>([]);
  const [editingTest, setEditingTest] = useState<TestGenerated | null>(null);

  useEffect(() => {
    fetchQuestions();
    fetchTests();
  }, [selectedSubject]);

  const fetchQuestions = async () => {
    console.log('Fetching all questions with pagination...');
    let allQuestions: Question[] = [];
    let rangeStart = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .range(rangeStart, rangeStart + pageSize - 1);

        if (error) {
            console.error('Error fetching questions:', error);
            hasMore = false;
        } else {
            console.log(`Fetched ${data.length} questions in range ${rangeStart}-${rangeStart + pageSize - 1}`);
            if (data.length > 0) {
                const mappedQuestions = data.map(q => ({
                    ...q,
                    subjectId: q.subject_id,
                    imageUrl: q.image_url // Ensure imageUrl is mapped
                }));
                allQuestions = [...allQuestions, ...mappedQuestions];
                rangeStart += pageSize;
            }
            if (data.length < pageSize) {
                hasMore = false;
            }
        }
    }

    console.log('Total questions fetched:', allQuestions.length);
    setQuestions(allQuestions);
  };
    
  const fetchTests = async () => {
    console.log('Fetching tests...');
    const { data, error } = await supabase.from('tests').select('*');
    if (error) {
      console.error('Error fetching tests:', error);
      alert('Error fetching tests: ' + error.message);
    } else {
      console.log('Fetched tests data:', data);
      setTests(data || []);
    }
  };

  const handleUpdateTest = async () => {
    if (!editingTest) return;
    const { error } = await supabase.from('tests').update({
        adminMessage: editingTest.adminMessage,
        answerKey: editingTest.answerKey,
        explanations: editingTest.explanations
    }).eq('id', editingTest.id);
    if (!error) {
        alert('Updated!');
        setEditingTest(null);
        fetchTests();
    }
  };

  const handleDeleteTest = async (testId: string) => {
    console.log('Attempting to delete test:', testId);
    if (!confirm('Are you sure you want to delete this test?')) return;
    
    try {
        console.log('Calling Supabase delete for:', testId);
        const { error } = await supabase.from('tests').delete().eq('id', testId);
        
        if (error) {
            console.error('--- DEBUG: Delete error detail:', error);
            alert('Failed to delete test: ' + error.message);
        } else {
            console.log('--- DEBUG: Delete call completed successfully (no error object)');
            alert('Test deleted successfully!');
            fetchTests();
        }
    } catch (e) {
        console.error('--- DEBUG: Unexpected error in handleDeleteTest:', e);
        alert('An unexpected error occurred during deletion.');
    }
  };

  const handleDeleteAllTests = async () => {
    if (!confirm('Are you absolutely sure you want to delete ALL existing tests? This action is irreversible.')) return;
    
    console.log('Fetching all tests to delete...');
    const { data: allTests, error: fetchError } = await supabase.from('tests').select('id');
    
    if (fetchError) {
      console.error('Error fetching tests for deletion:', fetchError);
      alert('Failed to fetch tests: ' + fetchError.message);
      return;
    }

    if (allTests && allTests.length > 0) {
      console.log(`Deleting ${allTests.length} tests...`);
      for (const test of allTests) {
          const { error: delError } = await supabase.from('tests').delete().eq('id', test.id);
          if (delError) {
              console.error('Delete error for ' + test.id + ':', delError);
          }
      }
      alert('Deletion attempt completed. Refreshing...');
      fetchTests();
    } else {
      alert('No tests found to delete.');
    }
  };

  const handleDeleteAllSTTests = async () => {
    if (!confirm('Are you strictly sure you want to delete all ST (Subject) tests? This is irreversible.')) return;
    
    console.log('Fetching all tests to filter ST...');
    const { data: allTests, error } = await supabase.from('tests').select('id, title, type');
    
    if (error) {
        alert('Failed to fetch tests: ' + error.message);
        return;
    }

    const stTests = allTests.filter(t => t.type === 'ST' || t.title.toLowerCase().includes('subject'));
    
    if (stTests.length === 0) {
        alert('No ST tests found.');
        return;
    }

    console.log(`Deleting ${stTests.length} ST tests:`, stTests);
    for (const test of stTests) {
        const { error: delError } = await supabase.from('tests').delete().eq('id', test.id);
        if (delError) {
            console.error('Delete error for ' + test.id + ':', delError);
        }
    }
    alert(`Deletion attempt completed for ${stTests.length} ST tests. Refreshing...`);
    fetchTests();
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async (testType: 'RANKER' | 'MOCK') => {
    setIsGenerating(true);
    console.log(`AI Generation for ${testType} triggered - start`);
    try {
        const count = testType === 'RANKER' ? 240 : 100;
        const aiQuestions = await generateQuestionsFromPYQs(selectedSubject, selectedYear, count);
        const uploadedQuestions = await handleBulkUpload(aiQuestions);
        
        if (uploadedQuestions.length === 0) throw new Error('No questions were uploaded.');
        
        // Add the test entry to the 'tests' table
        const newTestEntry = {
            title: `${testType} Test - ${new Date().toLocaleDateString()} (AI Generated)`,
            type: testType === 'RANKER' ? 'ST' : 'MT', // Map to DB constraint types
            questions: uploadedQuestions.map(q => q.id), 
            status: 'PUBLISHED',
            created_at: new Date().toISOString()
        };
        
        console.log('--- DEBUG: Generating AI Test payload:', newTestEntry);
        console.log('--- DEBUG: newTestEntry.type:', newTestEntry.type);
        
        const { data, error } = await supabase.from('tests').insert(newTestEntry).select();
        
        if (error) throw new Error('Failed to create test record: ' + error.message);
        
        console.log('--- DEBUG: AI Test created:', data);
        
        await fetchTests();
        
        alert(`AI ${testType} Test generation successful. ${uploadedQuestions.length} questions added and test created.`);
    } catch (error) {
        console.error('AI Generation error:', error);
        alert('Error initiating AI generation: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
        setIsGenerating(false);
    }
  };

  const handleGenerateTest = async (test: any) => {
    console.log('Inserting test:', test);
    const formattedTest = {
        title: test.title,
        type: test.type, // Use the actual type
        questions: test.questions,
        status: test.status,
        created_at: test.createdAt
    };
    console.log('--- DEBUG: Formatted test object being sent:', formattedTest);
    const { data, error } = await supabase.from('tests').insert(formattedTest).select();
    if (error) {
      console.error('Supabase insertion error:', error);
      alert('Failed to publish: ' + error.message);
    } else {
      console.log('Test published successfully:', data);
      alert('Successfully published!');
      fetchTests();
      setActiveTab('tests');
    }
  };

  const handleBulkUpload = async (newQns: Question[]) => {
    console.log('Attempting to upload questions:', newQns);
    
    // Ensure data conforms to Supabase schema - mapping 'correctOption' to 'correct_option' if necessary
    const formattedQuestions = newQns.map(q => ({
        subject_id: q.subjectId,
        year: q.year,
        text: q.text,
        options: q.options,
        correct_option: q.correctOption,
        explanation: q.explanation,
        topic: q.topic
    }));

    const { data, error } = await supabase.from('questions').insert(formattedQuestions).select();
    
    if (error) {
      console.error('Supabase upload error:', error);
      alert('Failed to upload questions: ' + error.message);
      return [];
    } else {
      console.log('Upload successful:', data);
      fetchQuestions();
      alert('Successfully uploaded ' + newQns.length + ' questions!');
      return data;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Command Center</h1>
          <p className="text-slate-500 font-medium">Manage your {questions.length} questions and generate exam schedules.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'pool', label: 'Question Bank', icon: BookOpen },
          { id: 'generator', label: 'Test Architect', icon: LayoutGrid },
          { id: 'tests', label: 'Published Tests', icon: FileText },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'activity', label: 'Activity', icon: Activity },
          { id: 'highYield', label: 'High Yield', icon: LayoutGrid },
          { id: 'features', label: 'Features', icon: Settings },
          { id: 'dashboardContent', label: 'Dashboard Content', icon: Lightbulb },
          { id: 'flowChartAdmin', label: 'Flow Charts', icon: GitBranch },
          { id: 'syndromes', label: 'Syndromes', icon: LayoutGrid },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => {
              console.log('Switching tab to:', tab.id);
              setActiveTab(tab.id as any);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pool' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="text-blue-600" /> Bulk Data Ingestion
                </h3>
                <div className="flex gap-2">
                  <select 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value as SubjectId)}
                    className="bg-slate-50 p-2 rounded-xl text-sm font-bold border border-slate-200"
                  >
                    {Object.values(SUBJECTS).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value as any)}
                    className="bg-slate-50 p-2 rounded-xl text-sm font-bold border border-slate-200"
                  >
                    {['BDS-I', 'BDS-II', 'BDS-III', 'BDS-IV'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <BulkUploader 
                selectedSubject={selectedSubject}
                selectedYear={selectedYear}
                onUploadSuccess={handleBulkUpload}
              />
            </div>
            <ManualQuestionForm onSuccess={fetchQuestions} />
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Database Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-xs uppercase font-black text-blue-600 tracking-widest mb-1">Total Bank</p>
                  <p className="text-2xl font-black text-slate-900">{questions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'generator' && (
        <TestArchitect 
          questions={questions} 
          onGenerate={handleGenerateTest} 
          onUpdateQuestions={setQuestions}
        />
      )}

      {activeTab === 'tests' && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">Exam Control Center</h2>
            <div className="flex gap-2">
                <button 
                  onClick={handleDeleteAllSTTests}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700"
                >
                  Delete All ST Tests
                </button>
                <button 
                  onClick={handleDeleteAllTests}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-700"
                >
                  Delete All Tests
                </button>
                <button 
                  onClick={() => handleGenerateAI('RANKER')} 
                  disabled={isGenerating}
                  className={`bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isGenerating ? 'Generating...' : 'Gen Ranker Test (AI)'}
                </button>
                <button 
                  onClick={() => handleGenerateAI('MOCK')} 
                  disabled={isGenerating}
                  className={`bg-purple-800 text-white px-4 py-2 rounded-xl font-bold text-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isGenerating ? 'Generating...' : 'Gen Mock Test (AI)'}
                </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test.id} className="p-8 bg-white border border-slate-200 rounded-[2rem] flex flex-col gap-4">
                <h4 className="font-black text-slate-900 text-lg leading-tight">{test.title}</h4>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setEditingTest(test)}
                        className="flex-1 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100"
                    >
                        <Settings size={14}/> Manage
                    </button>
                    <button 
                        onClick={() => handleDeleteTest(test.id)}
                        className="flex-1 text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-100"
                    >
                        <X size={14}/> Delete
                    </button>
                </div>
              </div>
            ))}
          </div>

          {editingTest && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white p-8 rounded-3xl w-full max-w-lg space-y-4">
                   <h3 className="font-black text-xl">Manage Test Config</h3>
                   <input 
                      placeholder="Admin Status Message (e.g., Coming Soon)"
                      value={editingTest.adminMessage || ''}
                      onChange={e => setEditingTest({...editingTest, adminMessage: e.target.value})}
                      className="w-full p-3 border rounded-xl"
                   />
                   <div className="flex gap-2">
                       <button onClick={handleUpdateTest} className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold">Save Changes</button>
                       <button onClick={() => setEditingTest(null)} className="p-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
                   </div>
               </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && <AdminUsersPanel />}
      {activeTab === 'activity' && <ExamActivityPanel />}
      {activeTab === 'highYield' && <AdminHighYield />}
      {activeTab === 'features' && <AdminFeatureToggle />}
      {activeTab === 'flowChartAdmin' && <FlowChartAdminPanel />}
      {activeTab === 'syndromes' && <AdminSyndromes />}
      {activeTab === 'dashboardContent' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Manage Dashboard Content</h2>
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full p-4 border rounded-xl" />
              <textarea placeholder="Quote of the Day" value={dashboardContent.quote} onChange={e => setDashboardContent({...dashboardContent, quote: e.target.value})} className="w-full p-4 border rounded-xl" />
              <textarea placeholder="Tip of the Day" value={dashboardContent.tip} onChange={e => setDashboardContent({...dashboardContent, tip: e.target.value})} className="w-full p-4 border rounded-xl" />
              <textarea placeholder="Trick of the Day" value={dashboardContent.trick} onChange={e => setDashboardContent({...dashboardContent, trick: e.target.value})} className="w-full p-4 border rounded-xl" />
              <button onClick={updateDashboardContent} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Update Content</button>
          </div>
      )}
    </div>
  );
}
