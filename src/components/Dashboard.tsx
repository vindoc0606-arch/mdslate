import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Zap, CalendarDays, Rocket, CheckCircle, Timer, Search, Target, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DayContent, EXAM_DATE } from '../types';
import WeightageTreeView from './WeightageTreeView';
import Planner from './Planner';
import HighYieldComponent from './HighYieldComponent';

const weightageData = [
    // ...
];
const COLORS = ['#0284c7', '#1e293b'];

export default function Dashboard() {
  const today = new Date();
  const diffInTime = EXAM_DATE.getTime() - today.getTime();
  const diffInDays = Math.max(0, Math.ceil(diffInTime / (1000 * 3600 * 24)));

  const [view, setView] = useState<'home' | 'weightage' | 'practice' | 'highYield'>('home');
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [plannerVisible, setPlannerVisible] = useState(false);
  const [dayContent, setDayContent] = useState<Record<string, DayContent>>({});

  useEffect(() => {
    async function fetchContent() {
        const { data } = await supabase.from('dashboard_content').select('*');
        if (data) {
            const contentMap: Record<string, DayContent> = {};
            data.forEach(item => contentMap[item.target_date] = item);
            setDayContent(contentMap);
        }
    }
    fetchContent();
  }, []);

  const handleStartTest = (testName: string) => {
      if (testName === 'High Yield') {
          setView('highYield');
      } else {
          setSelectedTest(testName);
          setView('practice');
      }
  };

  if (view === 'weightage') {
      return (
          <WeightageTreeView onBack={() => setView('home')} />
      )
  }
  
  if (view === 'highYield') {
      return (
          <HighYieldComponent onBack={() => setView('home')} />
      )
  }
  
  if (view === 'practice') {
      return (
          <div className="p-8">
              <button className="text-slate-600 font-bold mb-4" onClick={() => setView('home')}>← Back</button>
              <h2 className="text-4xl font-heading font-black text-primary-main">Practice Exam - {selectedTest}</h2>
              {/* Add practice content here */}
          </div>
      )
  }

  return (
    <div className="space-y-8 pb-12 p-6 bg-background-app min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        {/* Countdown for NEET MDS Exam */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center items-center relative"
        >
            <h1 className="text-sm font-heading font-bold text-secondary-main mb-4 tracking-widest uppercase text-center">NEET MDS Countdown</h1>
            <motion.div 
                animate={{ rotateY: 360, scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="text-6xl font-heading font-black text-primary-main"
            >
                {diffInDays}
            </motion.div>
            <p className="text-slate-500 font-medium mt-2 text-base">days until exam</p>

            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-4 right-4 text-secondary-main"
            >
              <Rocket size={24} fill="currentColor" />
            </motion.div>
        </motion.div>

        {/* Roadmap */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
        >
            <h3 className="text-lg font-heading font-bold text-primary-main mb-6 flex items-center gap-2">
                <BookOpen className="text-secondary-main" size={20} /> Exam Roadmap
            </h3>
            <button onClick={() => setView('weightage')} className="w-full p-6 text-left rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all flex justify-between items-center">
                <span className="font-heading font-bold text-primary-main text-lg">View Weightage</span>
                <Zap className="text-secondary-main" size={20} />
            </button>
        </motion.div>
        
        {/* Planner Tile */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50"
            onClick={() => setPlannerVisible(!plannerVisible)}
        >
            <h3 className="text-lg font-heading font-bold text-primary-main mb-6 flex items-center gap-2">
                <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <CalendarDays className="text-secondary-main" size={20} />
                </motion.div> Daily Planner
            </h3>
            <p className="text-secondary-main font-bold text-base">View your scheduled tasks</p>
        </motion.div>

        {/* Planner Content */}
        {plannerVisible && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="md:col-span-3"
            >
                <Planner onStartTest={handleStartTest} dayContent={dayContent} diffInDays={diffInDays} />
            </motion.div>
        )}

        {/* Motivational Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-heading font-black text-primary-main">NEET MDS 2026 FINAL COUNTDOWN!</h2>
            <p className="text-xl font-bold text-slate-700 mt-2">Exam Date: May 2, 2026 (Tomorrow)</p>
            <p className="text-2xl font-bold text-secondary-main mt-4 italic">You've prepared for this moment. Now, go own it!</p>
          </div>

          {/* Last-Minute Checklist */}
          <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="text-2xl font-heading font-bold text-primary-main mb-6 text-center">Last-Minute Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { title: "Admit Card", desc: "Colored printout (QR/Barcode clearly visible)" },
                { title: "Valid Photo ID", desc: "Aadhaar / Passport / Driving License (Original)" },
                { title: "Reach Early", desc: "Gates close at 1:30 PM sharp" },
                { title: "Travel Plan", desc: "Plan your route and buffer time today." },
                { title: "No Extra Items", desc: "Avoid last-minute stress at security check." },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2"><CheckCircle className="text-green-600" /></div>
                  <h4 className="font-bold text-primary-main">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Strategy */}
          <div className="mb-8 p-6 rounded-2xl bg-white border border-slate-100">
             <h3 className="text-2xl font-heading font-bold text-primary-main mb-6 text-center">Exam Strategy (240 MCQs | 3 Hours)</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                 {[
                     { title: "Speed + Accuracy", desc: "Balance both to maximize your score.", icon: Target },
                     { title: "Don't Get Stuck", desc: "Mark & move. Come back if time permits.", icon: Timer },
                     { title: "Scan for Clues", desc: "In clinical scenarios, identify key findings & keywords.", icon: Search },
                     { title: "Use Elimination", desc: "Eliminate wrong options and reduce the risk.", icon: Zap },
                     { title: "Maintain Momentum", desc: "Part A (100 Qs) → Part B (140 Qs). Stay consistent!", icon: TrendingUp },
                 ].map((item, i) => (
                     <div key={i} className="flex flex-col items-center text-center p-4">
                         <div className="text-secondary-main text-2xl mb-2"><item.icon size={32} /></div>
                         <h4 className="font-bold text-primary-main">{item.title}</h4>
                         <p className="text-sm text-slate-600">{item.desc}</p>
                     </div>
                 ))}
             </div>
             <p className="text-center font-bold text-red-600 mt-4 underline">Negative marking: -1 for each wrong answer. Be strategic, not risky.</p>
          </div>
          
          <div className="text-center">
              <p className="text-lg italic text-slate-700">You've spent years mastering everything from Oral Pathology to Orthodontics. Tomorrow is just about showing what you know. Trust your instincts—they're sharper than you think!</p>
              <p className="text-3xl font-heading font-black text-primary-main mt-6">GOOD LUCK! GO SECURE THAT PG SEAT!</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
