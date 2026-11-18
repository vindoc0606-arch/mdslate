/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Phone, MapPin, GraduationCap, ArrowRight, Rocket } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { UserProfile } from '../types';

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    mobile: '',
    college: '',
    state: ''
  });

  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Please fill all fields.');
        return;
      }
      const { error } = await login(formData.email, formData.password);
      if (error) setError(error.message);
    } else {
      // Validation checks
      if (!formData.email || !formData.password || !formData.name || !formData.mobile || !formData.college || !formData.state) {
        setError('Please fill all fields.');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        return;
      }
      
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.mobile)) {
        setError('Please enter a valid 10-digit mobile number starting with 6-9.');
        return;
      }
      
      const profile: UserProfile = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        college: formData.college,
        state: formData.state,
        role: 'student'
      };
      
      const { error } = await signup(profile, formData.password);
      if (error) {
        setError(error.message);
      } else {
        alert('Account created! You can now sign in.');
        setIsLogin(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 -right-40 w-96 h-96 rounded-full bg-purple-500 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 rounded-full bg-pink-500 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-white rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-sky-200 mix-blend-multiply filter blur-2xl opacity-40" />
            <div className="absolute top-10 -right-10 w-32 h-32 rounded-full bg-indigo-200 mix-blend-multiply filter blur-2xl opacity-40" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-center h-20 overflow-hidden mb-6">
              <img src="/logo.png" alt="Cuspyd Logo" className="h-full w-auto object-contain" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">MDSPrep</h1>
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">by Cuspyd</p>
            <p className="text-slate-600 font-medium italic mb-6">
              Built on Accuracy. Driven by AI. Designed for NEET MDS
            </p>                
            
            <motion.div 
              className="absolute bottom-2 left-2 text-red-600"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x: [0, 450],
                y: [0, -250], 
                opacity: [0, 1, 0]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Rocket size={24} />
              <div className="absolute top-6 left-1 w-2 h-2 rounded-full bg-slate-300" />
            </motion.div>

            <motion.div 
              className="absolute bottom-12 left-2 text-purple-600"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x: [0, 450],
                y: [0, -250], 
                opacity: [0, 1, 0]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 0.5 }}
            >
              <Rocket size={24} />
              <div className="absolute top-6 left-1 w-2 h-2 rounded-full bg-slate-300" />
            </motion.div>
            
          </div>
        </div>


        <div className="glass p-8 rounded-[2rem] shadow-xl border border-slate-100">
          <div className="flex p-1 bg-slate-50 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Get Started
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in">
                {error}
              </div>
            )}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Input 
                    icon={User} 
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <Input 
                    icon={Phone} 
                    placeholder="Mobile Number" 
                    value={formData.mobile}
                    onChange={(e: any) => setFormData({...formData, mobile: e.target.value})}
                    required
                  />
                  <Input 
                    icon={GraduationCap} 
                    placeholder="College or University" 
                    value={formData.college}
                    onChange={(e: any) => setFormData({...formData, college: e.target.value})}
                    required
                  />
                  <Input 
                    icon={MapPin} 
                    placeholder="State" 
                    value={formData.state}
                    onChange={(e: any) => setFormData({...formData, state: e.target.value})}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <Input 
              icon={Mail} 
              type="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={(e: any) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              icon={Lock} 
              type="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={(e: any) => setFormData({...formData, password: e.target.value})}
            />

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors mt-6 shadow-xl"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function Input({ icon: Icon, ...props }: any) {
  return (
    <motion.div 
        whileHover={{ scale: 1.01 }}
        className="relative p-[1px] rounded-2xl bg-slate-200 overflow-hidden" 
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-[1px] bg-white rounded-[15px]" />
        <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                className="w-full bg-transparent border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium" 
                {...props} 
            />
        </div>
    </motion.div>
  );
}
