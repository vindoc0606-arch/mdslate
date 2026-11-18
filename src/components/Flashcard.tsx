import React, { useState } from 'react';
import { motion } from 'motion/react';

interface FlashcardProps {
  questionContent: React.ReactNode;
  answerContent: React.ReactNode;
}

export default function Flashcard({ questionContent, answerContent }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="w-full aspect-[4/3] sm:aspect-video [perspective:1000px] cursor-pointer group" onClick={() => setFlipped(!flipped)}>
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <motion.div 
            className="absolute inset-0 [backface-visibility:hidden] bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl flex items-center justify-center"
            animate={{ boxShadow: flipped ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.1)' }}
        >
            {questionContent}
            {!flipped && (
                <motion.div 
                    className="absolute bottom-4 text-xs font-bold text-white/70 animate-pulse"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    Tap to flip
                </motion.div>
            )}
        </motion.div>
        
        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-blue-600/20 backdrop-blur-sm rounded-3xl p-6 shadow-xl flex items-center justify-center [transform:rotateY(180deg)] border border-white/10">
            <div className="text-white text-center">
                {answerContent}
            </div>
        </div>
      </motion.div>
    </div>
  );
}
