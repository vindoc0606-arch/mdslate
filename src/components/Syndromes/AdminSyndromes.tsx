import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Trash2, X } from 'lucide-react';

export default function AdminSyndromes() {
  const [syndromeName, setSyndromeName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!syndromeName || files.length === 0) {
      alert('Please provide a syndrome name and at least one image.');
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `syndromes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('syndromes')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('syndromes')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase.from('syndromes').insert({
          name: syndromeName,
          description: description,
          image_url: publicUrlData.publicUrl,
        });

        if (insertError) throw insertError;
      }

      alert('Syndrome images uploaded successfully!');
      setSyndromeName('');
      setDescription('');
      setFiles([]);
    } catch (e) {
      console.error(e);
      alert('Error uploading syndrome.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
      <h2 className="text-2xl font-bold">Manage Syndromes</h2>
      <div className="space-y-4">
        <input 
          className="w-full p-3 border rounded-xl" 
          placeholder="Syndrome Name" 
          value={syndromeName}
          onChange={e => setSyndromeName(e.target.value)} 
        />
        <textarea 
          className="w-full p-3 border rounded-xl" 
          placeholder="Description" 
          value={description}
          onChange={e => setDescription(e.target.value)} 
        />
        
        <div>
            <label className="block text-sm font-bold mb-2">Upload Bulk Images</label>
            <input 
              type="file" 
              multiple 
              onChange={e => setFiles(Array.from(e.target.files || []))} 
            />
        </div>
        
        <button 
          className="bg-blue-600 text-white p-3 rounded-lg font-bold" 
          onClick={handleUpload} 
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Syndrome Images'}
        </button>
      </div>
    </div>
  );
}
