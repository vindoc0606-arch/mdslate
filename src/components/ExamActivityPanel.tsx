import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity } from 'lucide-react';

export default function ExamActivityPanel() {
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    // Joining with profiles to get user names
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*, profiles(name)');
    if (data) {
        const mapped = data.map(session => ({
            id: session.id,
            profiles: session.profiles,
            score: session.answers?.results?.score ?? 'N/A',
            status: session.is_completed ? 'COMPLETED' : 'IN_PROGRESS',
            started_at: session.end_time, // Using end_time as placeholder
        }));
        setAttempts(mapped);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mt-8">
      <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
        <Activity className="text-emerald-600" /> Exam Activity
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
              <th className="pb-4">Student</th>
              <th className="pb-4">Score</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {attempts.map(attempt => (
              <tr key={attempt.id} className="text-sm font-bold text-slate-900">
                <td className="py-4">{attempt.profiles?.name || 'Unknown'}</td>
                <td className="py-4">{attempt.score ?? 'N/A'}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${attempt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {attempt.status}
                  </span>
                </td>
                <td className="py-4">{new Date(attempt.started_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
