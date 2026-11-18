/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { Brain, Star, TrendingUp, Zap, Sparkles, AlertCircle, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { getPerformanceAdvice } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { SUBJECTS } from '../types';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'];

export default function Analytics() {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PRIME' | 'MOCK' | 'MT' | 'ST'>('ALL');

  const performanceData = useMemo(() => {
    // Process real attempts to get aggregate scores
    return attempts.map(attempt => ({
        name: attempt.tests?.title || 'Unknown',
        // score: extracted from answers (JSONB)
        score: attempt.answers?.score || 0
    }));
  }, [attempts]);

  const subjectData = useMemo(() => {
     // Process real attempts to get aggregate scores
     return Object.values(SUBJECTS).map(subject => {
         const subjectAttempts = attempts.filter(a => a.tests?.subjectId === subject.id);
         const avgScore = subjectAttempts.length > 0 
            ? subjectAttempts.reduce((sum, a) => sum + (a.answers?.score || 0), 0) / subjectAttempts.length
            : 0;

         return {
             subject: subject.name.length > 15 ? subject.name.substring(0, 15) + '...' : subject.name,
             score: avgScore,
             fullMark: 100
         };
     });
  }, [attempts]);

  useEffect(() => {
    async function fetchData() {
        // Fetch attempts
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let query = supabase
            .from('exam_sessions')
            .select(`
                *,
                tests(*)
            `)
            .eq('user_id', user.id)
            .eq('is_completed', true);

        if (selectedCategory !== 'ALL') {
             query = query.eq('tests.type', selectedCategory);
        }
        
        const { data } = await query;
        if (data) {
            setAttempts(data);
            // After setting attempts, we can trigger advice generation based on *actual* data
        }
    }
    fetchData();
  }, [selectedCategory]);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const result = await getPerformanceAdvice({
        strongSubjects: ['Dental Materials', 'General Anatomy'],
        weakSubjects: ['Pedodontics', 'General Physiology'],
        averageScore: 72,
        timeRating: 0.8
      });
      setAdvice(result || '');
    } catch (error: any) {
      if (error.message === 'BUDGET_EXCEEDED') {
        setAdvice("It looks like the monthly spending cap for AI services has been reached. Please check the AI Studio project settings to manage your budget.");
      } else {
        setAdvice("Unable to load AI recommendations at this time.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 pb-12 p-6 bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen">
      <div className="flex items-center justify-between p-2 sticky top-0 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 z-10">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight pl-4">Performance Tracker</h1>
        <div className="flex items-center gap-1 p-1">
           {(['ALL', 'RANKER', 'MOCK', 'MT', 'ST'] as const).map(cat => (
             <button
               key={cat}
               onClick={() => setSelectedCategory(cat)}
               className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:bg-slate-100'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="p-16 text-center rounded-[3rem] bg-white border-2 border-dashed border-indigo-200 shadow-xl">
           <AlertCircle className="mx-auto text-indigo-400 mb-6" size={48} />
           <h2 className="text-2xl font-black text-slate-800 mb-2">No Data Available Yet</h2>
           <p className="text-slate-500 font-medium">Complete some practice exams or Ranker tests to see your performance here.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart Proportions */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
            <Brain className="text-violet-600" size={20} /> Subject Proficiency
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Proficiency"
                  dataKey="score"
                  stroke="#7c3aed"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  strokeWidth={4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grand Test Progress Pie Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
            <Target className="text-rose-600" size={20} /> Test Progress
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  dataKey="score"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={130}
                  paddingAngle={8}
                  cornerRadius={12}
                >
                  {performanceData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}

      {/* AI Solution Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Sparkles size={200} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Zap size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">AI Diagnostic & Strategy</h2>
          </div>
          
          <div className="space-y-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                  {advice || "Click below to generate your personalized study strategy based on your performance."}
                </p>
                {!advice && (
                  <button onClick={fetchAdvice} className="mt-4 px-6 py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition">
                      Generate Strategy
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
