import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Brain, Target } from 'lucide-react';

const weightageData = [
  { name: 'Part A', value: 128, subjects: [
    { name: 'General Anatomy', weight: 14 },
    { name: 'General Physiology & Biochem', weight: 14 },
    { name: 'Dental Anatomy & Histology', weight: 14 },
    { name: 'General Pathology & Microbiology', weight: 14 },
    { name: 'Gen & Dental Pharmacology', weight: 14 },
    { name: 'General Medicine', weight: 15 },
    { name: 'General Surgery', weight: 15 },
    { name: 'Dental Materials', weight: 14 },
    { name: 'Oral Pathology & Microbiology', weight: 14 },
  ]},
  { name: 'Part B', value: 112, subjects: [
    { name: 'Oral Medicine & Radiology', weight: 14 },
    { name: 'Pedodontics', weight: 14 },
    { name: 'Orthodontics', weight: 14 },
    { name: 'Periodontology', weight: 14 },
    { name: 'Prosthodontics', weight: 14 },
    { name: 'Conservative Dentistry', weight: 14 },
    { name: 'Oral Surgery', weight: 14 },
    { name: 'Public Health Dentistry', weight: 14 },
  ]},
];

export default function WeightageTreeView({ onBack }: { onBack: () => void }) {
  const [selectedPart, setSelectedPart] = useState<typeof weightageData[0] | null>(null);

  return (
    <div className="space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-stone-600 font-bold mb-4">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
            { label: 'Total Questions', value: '240' },
            { label: 'Total Marks', value: '960' },
            { label: 'Duration', value: '3 Hours' },
            { label: 'Marking', value: '+4 / -1' },
        ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-[0_0_15px_rgba(0,0,0,0.05)] text-center ring-1 ring-stone-100 italic">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-stone-900">{stat.value}</p>
            </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm ring-1 ring-stone-100">
        <h2 className="text-3xl font-black text-stone-900 mb-8">Exam Weightage Flowchart</h2>
        
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
            {weightageData.map((part) => (
                <motion.button
                    key={part.name}
                    onClick={() => setSelectedPart(part)}
                    whileHover={{ scale: 1.05 }}
                    className={`p-8 w-full md:w-64 rounded-3xl border-2 ${selectedPart?.name === part.name ? 'border-sky-400 bg-sky-50' : 'border-sky-200 bg-sky-50'} shadow-sm ring-1 ring-sky-100`}
                >
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                      <Target className="text-sky-500 mx-auto mb-4" size={40} />
                    </motion.div>
                    <h3 className="text-xl font-black text-sky-900">{part.name}</h3>
                    <p className="text-sm font-bold text-sky-700">{part.value} Questions</p>
                </motion.button>
            ))}
        </div>

        {selectedPart && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 bg-stone-50 p-8 rounded-[2rem] border border-stone-200 ring-1 ring-stone-100"
            >
                <h3 className="text-xl font-black text-stone-900 mb-6">{selectedPart.name} Subjects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedPart.subjects.map(sub => (
                        <div key={sub.name} className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm ring-1 ring-stone-100">
                            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }}>
                              <BookOpen className="text-stone-400 mb-3" size={24} />
                            </motion.div>
                            <p className="text-sm font-bold text-stone-500 mb-1 tracking-wider uppercase break-words">{sub.name}</p>
                            <p className="text-2xl font-black text-stone-900">{sub.weight} Qs</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
      </div>
    </div>
  );
}
