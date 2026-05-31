import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Difficulty } from '../types';
import { Flame, Leaf, Zap } from 'lucide-react';
import { audio } from '../utils/audio';

interface LevelIntroProps {
  setGameState: (state: GameState) => void;
  difficulty: Difficulty;
}

export default function LevelIntro({ setGameState, difficulty }: LevelIntroProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown - 1 > 0) {
          audio.playCountdownBeep();
        } else {
          audio.playCountdownGo();
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setGameState('PLAYING');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, setGameState]);

  useEffect(() => {
    audio.playCountdownBeep();
  }, []);

  const config = {
    EASY: {
      text: 'Madali',
      color: 'text-green-500',
      bg: 'bg-green-500',
      border: 'border-green-100',
      icon: <Leaf className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mb-2 sm:mb-4 animate-bounce drop-shadow-md" />,
      particleColor: "bg-green-400"
    },
    AVERAGE: {
      text: 'Katamtaman',
      color: 'text-amber-500',
      bg: 'bg-amber-500',
      border: 'border-amber-100',
      icon: <Zap className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 mb-2 sm:mb-4 animate-pulse drop-shadow-md" />,
      particleColor: "bg-amber-400"
    },
    HARD: {
      text: 'Mahirap',
      color: 'text-rose-500',
      bg: 'bg-rose-500',
      border: 'border-rose-100',
      icon: <Flame className="w-16 h-16 sm:w-20 sm:h-20 text-rose-500 mb-2 sm:mb-4 animate-pulse drop-shadow-md" />,
      particleColor: "bg-rose-400"
    }
  }[difficulty];

  const renderParticles = () => {
    if (difficulty === 'EASY') {
      return Array.from({ length: 12 }).map((_, i) => (
        <motion.div
           key={i}
           initial={{ opacity: 0, y: -50, x: Math.random() * 200 - 100, rotate: 0 }}
           animate={{
             opacity: [0, 1, 1, 0],
             y: [ -50, 200, 450 ],
             x: (Math.random() * 200 - 100) + (i % 2 === 0 ? 100 : -100),
             rotate: 360
           }}
           transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "linear", delay: Math.random() * 3 }}
           className="absolute text-green-300 drop-shadow-sm z-0"
           style={{ left: `calc(50% + ${Math.random() * 150 - 75}px)`, top: -50 }}
         >
           <Leaf size={Math.random() * 15 + 15} className="opacity-70" fill="currentColor" />
         </motion.div>
      ));
    }

    if (difficulty === 'AVERAGE') {
       return Array.from({ length: 8 }).map((_, i) => (
         <motion.div
           key={i}
           initial={{ opacity: 0, scale: 0, rotate: Math.random() * 360 }}
           animate={{
             opacity: [0, 1, 0],
             scale: [0.5, 1.2, 0.5]
           }}
           transition={{ duration: 0.3 + Math.random() * 0.5, repeat: Infinity, repeatDelay: Math.random() * 1.5, ease: "easeInOut" }}
           className="absolute text-amber-300 drop-shadow-md z-0"
           style={{ left: `calc(50% + ${Math.random() * 240 - 120}px)`, top: `calc(50% + ${Math.random() * 240 - 120}px)` }}
         >
           <Zap size={Math.random() * 25 + 20} className="opacity-50" fill="currentColor" />
         </motion.div>
       ));
    }

    if (difficulty === 'HARD') {
      return Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 50, x: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.9, 0],
            y: Math.random() * -350 - 50,
            x: Math.random() * 100 - 50,
            scale: [0, Math.random() * 1.5 + 0.5, 0],
          }}
          transition={{
            duration: 1 + Math.random() * 1.5,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
          className={`absolute rounded-full bg-gradient-to-t from-orange-500 via-rose-500 to-yellow-300 blur-[8px] mix-blend-screen z-0`}
          style={{
            width: Math.random() * 30 + 15,
            height: Math.random() * 50 + 20,
            left: `calc(50% + ${Math.random() * 160 - 80}px)`,
            bottom: -50,
          }}
        />
      ));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className={`bg-white p-8 sm:p-12 rounded-[40px] shadow-2xl flex flex-col items-center justify-center border-[8px] sm:border-[10px] ${config.border} max-w-sm w-full relative z-10 overflow-hidden min-h-[400px] sm:min-h-[450px]`}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/20 to-transparent z-10" />
        {renderParticles()}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {config.icon}
        <h1 className={`text-4xl sm:text-5xl font-black ${config.color} uppercase tracking-tight italic mb-8 drop-shadow-sm text-center`}>
          {config.text}
        </h1>

        <div className="flex flex-col items-center justify-center h-32 w-full mt-4">
          <p className="text-slate-400 font-black uppercase tracking-widest mb-4 text-sm sm:text-base">Handa sa</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 1.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`text-[5rem] sm:text-[6rem] leading-none font-black ${config.color} drop-shadow-md`}
            >
              {countdown > 0 ? countdown : (
                <span className="text-[3.5rem] sm:text-[4.5rem] uppercase -mt-4 block break-keep whitespace-nowrap">Simula!</span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
