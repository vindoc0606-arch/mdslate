import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X } from 'lucide-react';

interface Subject {
  subject_name: string;
  image_url: string;
}

export default function AdminSubjectUpload() {
  console.log("AdminSubjectUpload rendered");
  const [subjectName, setSubjectName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSubjects = async () => {
    const { data, error } = await supabase.from('subject_backgrounds').select('*');
    if (error) {
        console.error("Admin: Error fetching subjects:", error);
    } else {
        console.log("Admin: Fetched subjects:", data);
        if (data) setSubjects(data);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
        setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!subjectName || !file) {
      setMessage('Please enter a subject name and select an image.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('subject-backgrounds')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('subject-backgrounds')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('subject_backgrounds')
        .insert([{ subject_name: subjectName.trim(), image_url: urlData.publicUrl }]);

      if (dbError) throw dbError;

      setMessage('Subject uploaded successfully!');
      setSubjectName('');
      setFile(null);
      setPreviewUrl(null);
      fetchSubjects(); 
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-[2rem] border border-stone-200">
      <h2 className="text-2xl font-black mb-6">Upload Subject Background</h2>
      <input
        type="text"
        placeholder="Subject Name"
        value={subjectName}
        onChange={(e) => setSubjectName(e.target.value)}
        className="w-full p-4 mb-4 border rounded-xl"
      />
      
      <div className="mb-6">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
        />
        {!previewUrl ? (
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center gap-4 text-stone-500 hover:text-stone-900 hover:border-stone-500 transition-colors"
             >
                <Upload size={32} />
                <span className="font-bold">Select Image</span>
             </button>
        ) : (
            <div className="relative">
                <img src={previewUrl} alt="Preview" className="w-full aspect-square object-cover rounded-2xl" />
                <button 
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg"
                 >
                    <X size={20} />
                </button>
            </div>
        )}
      </div>
      
      <button
        onClick={handleUpload}
        disabled={uploading || !file || !subjectName}
        className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold w-full"
      >
        {uploading ? 'Uploading...' : 'Upload Subject'}
      </button>
      {message && <p className="mt-4 font-bold">{message}</p>}
      
      <div className="mt-12">
        <h3 className="text-xl font-black mb-4">Existing Subjects</h3>
        <div className="grid grid-cols-2 gap-4">
          {subjects.map((sub) => (
            <div key={sub.subject_name} className="border p-4 rounded-xl">
              <p className="font-bold text-sm tracking-tight">{sub.subject_name}</p>
              <img src={sub.image_url} alt={sub.subject_name} className="w-full aspect-square object-cover mt-2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
