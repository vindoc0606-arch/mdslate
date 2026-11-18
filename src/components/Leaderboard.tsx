/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Trophy, Medal, User, Crown, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rankers, setRankers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankers() {
      // Fetch user performance data for Ranker tests ordered by Rank
      const { data, error } = await supabase
        .from('exam_sessions')
        .select(`
          answers,
          user_id,
          profiles ( name, college )
        `)
        .eq('type', 'RANKER')
        .eq('is_completed', true)

      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        console.log('Fetched leaderboard data:', data);
        let finalData = data || [];
        
        // --- DUMMY DATA FOR DEVELOPMENT ---
        if (process.env.NODE_ENV === 'development' && finalData.length === 0) {
            console.warn('Leaderboard is empty. Injecting dummy data.');
            finalData = [
                { user_id: '1', answers: { results: { score: 230 } }, profiles: { name: 'Alice', college: 'Harvard' } },
                { user_id: '2', answers: { results: { score: 210 } }, profiles: { name: 'Bob', college: 'Stanford' } },
                { user_id: '3', answers: { results: { score: 195 } }, profiles: { name: 'Charlie', college: 'MIT' } },
                { user_id: '4', answers: { results: { score: 180 } }, profiles: { name: 'David', college: 'Yale' } },
                { user_id: '5', answers: { results: { score: 170 } }, profiles: { name: 'Eve', college: 'Princeton' } },
            ];
        }
        
        // Group sessions by user_id and keep highest score
        const bestScores: Record<string, any> = {};
        (finalData || []).forEach((r: any) => {
            const score = r.answers?.results?.score || r.answers?.score || 0;
            if (!bestScores[r.user_id] || bestScores[r.user_id].score < score) {
                bestScores[r.user_id] = {
                  id: r.user_id,
                  name: r.profiles?.name || 'Anonymous',
                  college: r.profiles?.college || 'Unknown',
                  score: score
                };
            }
        });
        
        const formatted = Object.values(bestScores)
            .sort((a,b) => (b as any).score - (a as any).score)
            .map((r, i) => ({ ...r, rank: i + 1 }));
        setRankers(formatted);
      }
      setLoading(false);
    }
    fetchRankers();
  }, []);

  const filteredRankers = rankers.filter(r => 
    (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.rank.toString() === searchTerm
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Dev debug info */}
      {process.env.NODE_ENV === 'development' && rankers.length === 0 && !loading && (
        <div className="p-4 bg-amber-100 text-amber-800 rounded-lg">
            Debug: No data found in 'exam_sessions'. Ensure data exists in database.
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All India Leaderboard</h1>
          <p className="text-slate-500 font-medium">Real-time performance rankings</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search Rank or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rankers.slice(0, 3).map((ranker, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={ranker.id}
            className={`relative p-6 rounded-[2rem] border-2 flex flex-col items-center text-center ${
              i === 0 ? 'bg-amber-50 border-amber-200 ring-4 ring-amber-50' : 
              i === 1 ? 'bg-slate-50 border-slate-200 shadow-sm' : 
              'bg-orange-50 border-orange-100'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              i === 0 ? 'bg-amber-400 text-white animate-bounce' : 
              i === 1 ? 'bg-slate-400 text-white' : 
              'bg-orange-400 text-white'
            }`}>
              {i === 0 ? <Crown size={32} /> : i === 1 ? <Medal size={32} /> : <Trophy size={32} />}
            </div>
            <div className="absolute top-4 right-4 text-xs font-black opacity-20 text-slate-900 select-none">#{ranker.rank}</div>
            <h3 className="font-black text-xl text-slate-900">{ranker.name}</h3>
            <p className="text-sm font-bold text-slate-500 mb-4">{ranker.college}</p>
            <div className={`px-4 py-1.5 rounded-full font-black text-sm ${
              i === 0 ? 'bg-amber-400 text-white' : 'bg-slate-900 text-white'
            }`}>
              {ranker.score} / 240
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">AIR Rank</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Candidate</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Score</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">College</th>
              <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-medium">Loading leaderboard...</td>
              </tr>
            ) : filteredRankers.map((ranker) => (
              <tr key={ranker.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                <td className="px-8 py-6">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                    ranker.rank <= 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {ranker.rank}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{ranker.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-black text-slate-900">{ranker.score}</span>
                  <span className="text-slate-400 text-xs ml-1">pts</span>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500">{ranker.college}</td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRankers.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-medium">
            No candidates found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
