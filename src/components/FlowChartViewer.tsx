import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function FlowChartViewer() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);
    const [showFlowChart, setShowFlowChart] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        async function fetch() {
            const { data } = await supabase.from('flow_chart_questions').select('*');
            if (data) setQuestions(data);
        }
        fetch();
    }, []);

    if (selected) {
        return (
            <div className='p-8 space-y-4 min-h-screen bg-slate-50'>
                <button onClick={() => { setSelected(null); setShowFlowChart(false); setShowExplanation(false); }} className='text-slate-600 font-bold'>← Back</button>
                <div className='bg-white p-6 rounded-xl shadow-md'>
                    <h2 className='text-2xl font-bold mb-4'>{selected.question_text}</h2>
                    <div className='space-x-4'>
                        <button onClick={() => setShowFlowChart(true)} className='bg-indigo-600 text-white p-2 rounded-lg font-bold'>View Flow Chart</button>
                        <button onClick={() => setShowExplanation(true)} className='bg-sky-600 text-white p-2 rounded-lg font-bold'>Answer & Explanation</button>
                    </div>
                </div>
                
                {showExplanation && (
                    <div className='mt-4 p-6 bg-yellow-50 rounded-xl border-l-4 border-yellow-500'>
                        <h3 className='font-bold text-lg text-yellow-900'>Correct Answer: {selected.correct_answer}</h3>
                        <p className='text-yellow-800 mt-2'>{selected.explanation}</p>
                    </div>
                )}
                
                {showFlowChart && (
                    <div className='mt-8 p-6 bg-white rounded-xl shadow-md'>
                        <h3 className='font-bold text-xl mb-4'>AI Generated Flow Chart Step-by-Step</h3>
                        <div className='bg-slate-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-sm'>
                            {JSON.stringify(selected.generated_flowchart, null, 2)}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className='p-8 bg-slate-50 min-h-screen flex items-center justify-center'>
            <div className='text-center'>
                <h1 className='text-3xl font-bold mb-6'>Flow Chart Questions</h1>
                <p className='text-xl text-slate-600'>Will available by 28 April 2026 6 PM Onwards</p>
            </div>
        </div>
    )
}
