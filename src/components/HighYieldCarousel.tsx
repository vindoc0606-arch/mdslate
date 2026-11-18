import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import Flashcard from './Flashcard';

export default function HighYieldCarousel() {
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    supabase.from('high_yield_topics').select('*').then(({ data }) => {
        setTopics(data || []);
        if (data && data.length > 0) setSelectedSubject(data[0].subject || 'General');
    });
  }, []);

  const subjects = useMemo(() => {
      const uniqueSubjects = new Map<string, string>();
      topics.filter(t => t.subject && t.subject.toLowerCase() !== 'general').forEach(t => {
          const s = t.subject;
          uniqueSubjects.set(s.toLowerCase(), s);
      });
      return Array.from(uniqueSubjects.values());
  }, [topics]);

  const filteredTopics = useMemo(() => {
      return topics.filter(t => (t.subject || 'General').toLowerCase() === (selectedSubject || 'General').toLowerCase());
  }, [topics, selectedSubject]);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
        setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  if (topics.length === 0) return null;
  const currentTopic = filteredTopics[index];

  return (
    <div className="w-full bg-transparent rounded-3xl p-4 sm:p-6 overflow-hidden text-slate-900 border border-white/10 backdrop-blur-md shadow-2xl">
      {/* Subject Selector */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
        {subjects.map(subject => (
            <button 
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedSubject === subject ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
                {subject}
            </button>
        ))}
      </div>

      <div className="text-center mb-6">
          <h2 className="flex justify-center items-center gap-3 text-3xl md:text-4xl font-black text-blue-900 uppercase tracking-tighter mb-2">
            <Lightbulb className="text-blue-900" size={32} />
            High Yield Questions
          </h2>
          <p className="text-lg font-bold text-blue-700 animate-pulse">Tap on Question for answer</p>
      </div>

      <div className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-black text-blue-300 uppercase tracking-widest">{currentTopic?.subject || 'General'}</p>
        <h3 className="text-2xl font-black tracking-tight text-white">{currentTopic?.topic_name || 'Topic Not Available'}</h3>
      </div>
      
      {currentTopic && (
        <div className="relative w-full">
          <Flashcard 
              key={index}
              questionContent={
                  <img 
                      src={currentTopic.question_image_url} 
                      className="object-contain w-full h-full p-4" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" font-size="20" text-anchor="middle" fill="gray">Image Not Found</text></svg>'; }}
                  />
              }
              answerContent={
                  <img 
                      src={currentTopic.answer_image_url} 
                      className="object-contain w-full h-full p-4" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" font-size="20" text-anchor="middle" fill="white">Image Not Found</text></svg>'; }}
                  />
              }
          />

          {/* Animated Navigation */}
          <motion.button 
             onClick={(e) => { e.stopPropagation(); setIndex(i => (i - 1 + filteredTopics.length) % filteredTopics.length); }} 
             className="absolute top-1/2 -translate-y-1/2 left-3 p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg z-20"
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             animate={{ boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.7)", "0 0 10px 10px rgba(59, 130, 246, 0)"] }}
             transition={{ repeat: Infinity, duration: 1.5 }}
          >
              <ArrowLeft size={24}/>
          </motion.button>
          
          <motion.button 
             onClick={(e) => { e.stopPropagation(); setIndex(i => (i + 1) % filteredTopics.length); }} 
             className="absolute top-1/2 -translate-y-1/2 right-3 p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg z-20"
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             animate={{ boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.7)", "0 0 10px 10px rgba(59, 130, 246, 0)"] }}
             transition={{ repeat: Infinity, duration: 1.5 }}
          >
              <ArrowRight size={24}/>
          </motion.button>
          
          <div className="text-center mt-6">
              <span className="text-xs font-black text-white/50 tracking-widest uppercase bg-white/10 px-4 py-1.5 rounded-full">
                  {index + 1} / {filteredTopics.length}
              </span>
          </div>
        </div>
      )}
    </div>
  );
}
