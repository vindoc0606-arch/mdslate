import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Pin, Zap, Clock, Target as TargetIcon, CheckCircle2 } from 'lucide-react';
import { DayContent, EXAM_DATE } from '../types';

const TEST_TYPES = [
  { name: 'Ranker Test', duration: 180, label: '3 Hours' },
  { name: 'Mini Test', duration: 30, label: '30 Min' },
  { name: 'Subject Test', duration: 30, label: '30 Min' },
  { name: 'High Yield', duration: 30, label: '30 Min' },
];

export default function Planner({ 
    onStartTest, 
    dayContent, 
    diffInDays 
}: { 
    onStartTest: (name: string) => void;
    dayContent: Record<string, DayContent>;
    diffInDays: number;
}) {
  const [selectedTest, setSelectedTest] = useState(TEST_TYPES[0]);
  
  const attemptedExams = useMemo(() => [
      { name: 'Mini Test', status: 'Completed' },
      { name: 'High Yield', status: 'Completed' },
  ], []);

  const attemptedCount = attemptedExams.length;

  const daysLeft = diffInDays;

  const testsNeeded = useMemo(() => {
      if(selectedTest.name === 'Ranker Test') return Math.max(2, Math.floor(daysLeft / 3));
      return daysLeft;
  }, [selectedTest, daysLeft]);

  return (
    <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-200 ring-1 ring-stone-100 italic relative overflow-hidden space-y-12">
      <h2 className="text-2xl font-black text-stone-900 text-center">Daily Planner - {selectedTest.name}</h2>
      
      <div className="flex flex-col items-center justify-center gap-12">
        <div className="relative">
            <div className="text-7xl font-mono font-bold text-stone-900 bg-white p-8 rounded-[2rem] border-4 border-amber-400 shadow-inner flex items-baseline gap-2">
                {selectedTest.duration} <span className="text-3xl text-stone-500 font-bold">min</span>
            </div>
            <div className="text-center text-xs font-bold text-stone-400 mt-2 tracking-widest uppercase">Duration</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            {TEST_TYPES.map((test) => (
                <motion.button 
                    key={test.name} 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedTest(test)}
                    className={`relative w-full aspect-square p-6 rounded-2xl shadow-lg rotate-[-1deg] flex flex-col items-center justify-center font-bold text-center border-b-4 ${selectedTest.name === test.name ? 'ring-4 ring-stone-900' : ''} ${
                        test.name === 'Ranker Test' ? 'bg-amber-100 border-amber-400 text-amber-900' :
                        test.name === 'Mini Test' ? 'bg-cyan-100 border-cyan-400 text-cyan-900' :
                        test.name === 'Subject Test' ? 'bg-emerald-100 border-emerald-400 text-emerald-900' :
                        'bg-violet-100 border-violet-400 text-violet-900'
                    }`}
                >
                    <Pin className="absolute -top-3 text-red-500" size={24} fill="currentColor" />
                    <span className="text-stone-800">{test.name}</span>
                </motion.button>
            ))}
        </div>

        <div className="text-center">
            <p className="text-lg text-stone-600 mb-4 italic">Target: <span className="font-bold text-stone-900">{testsNeeded} tests</span> to be taken today.</p>
        </div>
        
        <div className="w-full border-t border-stone-200 pt-6">
            <h4 className="font-black text-stone-900 mb-4">Attempted Exams ({attemptedCount}):</h4>
            <div className="flex gap-4">
                {attemptedExams.map(ex => (
                    <div key={ex.name} className="px-4 py-2 bg-stone-200 rounded-full text-stone-700 font-bold text-sm">
                        {ex.name} - {ex.status}
                    </div>
                ))}
            </div>
        </div>
      </div>

       {/* Roadmap Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {[...Array(diffInDays + 1)].map((_, i) => {
            const dayNum = i - diffInDays;
            const isToday = dayNum === -diffInDays;
            const isExamDay = dayNum === 0;
            const dateStr = new Date(EXAM_DATE.getTime() + (dayNum * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
            const content = dayContent[dateStr];
            
            let status = 'Upcoming';
            let borderColor = 'border-amber-200';
            let Icon = Zap;
            
            if (isToday) { status = 'Today'; borderColor = 'border-indigo-500'; Icon = Clock; }
            else if (dayNum < -diffInDays) { status = 'Completed'; borderColor = 'border-emerald-500'; Icon = CheckCircle2; }
            else if (isExamDay) { status = 'Exam Day'; borderColor = 'border-rose-500'; Icon = TargetIcon; }

            return (
            <motion.div 
                key={dayNum}
                className="group w-full h-[300px] perspective"
            >
                <motion.div 
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-full preserve-3d"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className={`absolute w-full h-full p-6 rounded-[2rem] border-2 ${borderColor.replace('border-', 'border-')} bg-stone-50 backface-hidden ring-1 ring-stone-100 flex flex-col justify-between`} style={{ backfaceVisibility: 'hidden' }}>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-stone-100 ${isToday ? 'text-stone-700' : isExamDay ? 'text-stone-900' : 'text-stone-600'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <h4 className="text-xl font-black text-stone-900">
                                        {isExamDay ? 'Exam Day' : `Day ${dayNum}`}
                                    </h4>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    isToday ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 
                                    isExamDay ? 'bg-rose-100 text-rose-800 border border-rose-200' : 
                                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                    {status}
                                </span>
                            </div>
                            <div className="space-y-3 text-sm text-stone-600">
                                <div className="bg-white p-3 rounded-xl border border-stone-100">
                                    <strong className="text-stone-900 block mb-1">Tests to Complete:</strong> {content?.testsToComplete || 0}
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-stone-100">
                                    <strong className="text-stone-900 block mb-1">Revision Subjects:</strong>
                                    <ul className="list-disc list-inside">
                                        {(content?.revisionTopics || []).map((topic, index) => (
                                            <li key={index}>{topic}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                    </div>

                    <div className="absolute w-full h-full p-6 rounded-[2rem] border-2 border-stone-200 bg-white backface-hidden ring-1 ring-stone-100 flex flex-col justify-center items-center rotate-y-180" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                            <h4 className="text-xl font-black text-stone-900 mb-4">Secret Tip!</h4>
                            <p className="text-center italic text-stone-600">{content?.tip || "Keep going!"}</p>
                    </div>
                </motion.div>
            </motion.div>
            );
        })}
      </div>

    </div>
  );
}
