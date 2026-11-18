import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Unlock, Loader2 } from 'lucide-react';

export default function AdminFeatureToggle() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    const { data, error } = await supabase.from('feature_settings').select('*');
    if (error) {
        console.error('Error fetching features:', error);
        alert('Failed to load features. Ensure the `feature_settings` table exists and is populated.');
    } else {
        setFeatures(data || []);
    }
    setLoading(false);
  };

  const toggleFeature = async (key: string, currentStatus: boolean) => {
    await supabase
      .from('feature_settings')
      .update({ is_visible: !currentStatus })
      .eq('feature_key', key);
    fetchFeatures();
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">Feature Access Control</h2>
      {features.length === 0 ? (
        <div className="p-8 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
            <h3 className="font-bold mb-2">Table Empty or Not Found</h3>
            <p>Ensure you have run the SQL to create and populate the <code>feature_settings</code> table.</p>
        </div>
      ) : (
        <div className="grid gap-4">
            {features.map((f) => (
            <div key={f.feature_key} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm">
                <span className="font-bold capitalize">{f.feature_key.replace('_', ' ')}</span>
                <button 
                onClick={() => toggleFeature(f.feature_key, f.is_visible)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${f.is_visible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                >
                {f.is_visible ? <Unlock size={18} /> : <Lock size={18} />}
                {f.is_visible ? 'Unlocked (Visible)' : 'Locked (Hidden)'}
                </button>
            </div>
            ))}
        </div>
      )}
    </div>
  );
}
