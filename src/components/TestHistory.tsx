import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Trophy, Target, Zap, Clock } from 'lucide-react';

export default function TestHistory({ onViewResult }: { onViewResult: (results: any) => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Fetch attempts linked to tests
    const { data } = await supabase
      .from('exam_sessions')
      .select('*, tests(*)')
      .eq('user_id', user.id)
      .eq('is_completed', true);
    if (data) {
      setSessions(data);
      const grouped = data.reduce((acc, session) => {
        const type = session.tests?.type || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(session);
        return acc;
      }, {} as Record<string, any[]>);
      setGroupedSessions(grouped);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Exam History</h1>
        {Object.entries(groupedSessions).map(([type, typeSessions]) => (
            <div key={type} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-700">{type}</h2>
                {typeSessions.map((session: any) => (
                    <div key={session.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                        <div>
                            <h3 className="font-bold text-slate-900">{session.tests?.title}</h3>
                            <p className="text-sm text-slate-500">
                              {session.tests?.id || "N/A"}
                            </p>
                        </div>
                        <button 
                          onClick={() => onViewResult(session)}
                          className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm"
                        >
                          View Results
                        </button>
                    </div>
                ))}
            </div>
        ))}
        {sessions.length === 0 && <p className="text-slate-500">No completed exams yet.</p>}
    </div>
  );
}
