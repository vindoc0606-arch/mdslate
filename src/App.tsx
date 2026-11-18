/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import HighYieldQuestions from './components/HighYieldQuestions';
import ExamSimulator from './components/ExamSimulator';
import AdminPanel from './components/AdminPanel';
import Landing from './components/Landing';
import PracticeExams from './components/PracticeExams';
import ExamResults from './components/ExamResults';
import TestHistory from './components/TestHistory';
import SyndromesViewer from './components/Syndromes/SyndromesViewer';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('highYield');
  const [isExaming, setIsExaming] = useState(false);
  const [completedResults, setCompletedResults] = useState<any>(null);
  const [currentTest, setCurrentTest] = useState<any>(null);
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchFeatures = async () => {
        const { data } = await supabase.from('feature_settings').select('feature_key, is_visible');
        if (data) {
            const config = data.reduce((acc, f) => ({ ...acc, [f.feature_key]: f.is_visible }), {});
            setFeatures(config);
        }
    };
    fetchFeatures();

    const channel = supabase.channel('feature_settings_changes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'feature_settings' }, fetchFeatures)
        .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handleStartExam = (e: any) => {
      setCurrentTest(e.detail);
      setIsExaming(true);
    };
    window.addEventListener('start-exam', handleStartExam);
    return () => window.removeEventListener('start-exam', handleStartExam);
  }, []);

  if (!user) {
    return <Landing />;
  }

  if (completedResults) {
    return (
      <ExamResults 
        results={completedResults} 
        onExit={() => {
          setCompletedResults(null);
        }} 
        onReattempt={() => {
           setCurrentTest(completedResults.test || completedResults.tests);
           setCompletedResults(null);
           setIsExaming(true);
        }}
        onLater={() => {
           setCompletedResults(null);
           setActiveTab('exams');
        }}
      />
    );
  }

  if (isExaming) {
    return (
      <ExamSimulator 
        test={currentTest}
        onComplete={async (results) => {
          setCompletedResults(results);
          setIsExaming(false);
          // Persist to Supabase
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from('exam_sessions').insert({
                user_id: user.id,
                test_id: typeof results.test.id === 'string' && results.test.id.startsWith('test_') ? null : results.test.id, 
                type: results.test.type,
                answers: results.results, // Saving everything including stats, not just choices
                is_completed: true,
                end_time: new Date().toISOString()
            });
            if (error) {
              console.error('Error saving session:', error);
              alert('Failed to save exam session. Please check console for details.');
            }
          }
        }} 
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'highYield':
        return <HighYieldQuestions />;
      case 'exams':
        return features.practice_exams !== false ? <PracticeExams /> : <HighYieldQuestions />;
      case 'syndromes':
        return <SyndromesViewer />;
      case 'history':
        return features.test_history !== false ? (
          <TestHistory onViewResult={async (session: any) => {
            const questionIds = session.tests.questions;
            const { data: questions } = await supabase
              .from('questions')
              .select('*')
              .in('id', questionIds);
            setCompletedResults({ ...session, questions });
          }} />
        ) : <HighYieldQuestions />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HighYieldQuestions />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} features={features}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
