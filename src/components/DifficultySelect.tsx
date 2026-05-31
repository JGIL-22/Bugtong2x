import { GameState, Difficulty } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { audio } from '../utils/audio';

interface DifficultySelectProps {
  setGameState: (state: GameState) => void;
  setDifficulty: (diff: Difficulty) => void;
}

export default function DifficultySelect({ setGameState, setDifficulty }: DifficultySelectProps) {
  const handleSelect = (diff: Difficulty) => {
    audio.playClick();
    setDifficulty(diff);
    setGameState('LEVEL_INTRO');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-8 sm:p-12 rounded-[40px] shadow-2xl flex flex-col items-center border-[8px] border-amber-100 max-w-md w-full relative z-10"
    >
      <button onClick={() => { audio.playClick(); setGameState('START'); }} className="absolute top-6 left-6 p-2 hover:bg-slate-100 text-slate-500 rounded-full transition">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h1 className="text-3xl font-black text-amber-600 mb-8 italic tracking-tight uppercase text-center mt-4">Level ng Laro</h1>
      
      <div className="flex flex-col gap-4 w-full">
        <button 
          onMouseEnter={() => audio.playHover()}
          onClick={() => handleSelect('EASY')}
          className="w-full py-4 px-6 text-xl font-black text-white bg-green-500 hover:bg-green-400 rounded-2xl shadow-sm border-b-4 border-green-600 uppercase tracking-tighter transition-colors text-center"
        >
          Madali <span className="text-sm font-bold opacity-80 block">(Easy)</span>
        </button>
        <button 
          onMouseEnter={() => audio.playHover()}
          onClick={() => handleSelect('AVERAGE')}
          className="w-full py-4 px-6 text-xl font-black text-white bg-amber-500 hover:bg-amber-400 rounded-2xl shadow-sm border-b-4 border-amber-600 uppercase tracking-tighter transition-colors text-center"
        >
          Katamtaman <span className="text-sm font-bold opacity-80 block">(Average)</span>
        </button>
        <button 
          onMouseEnter={() => audio.playHover()}
          onClick={() => handleSelect('HARD')}
          className="w-full py-4 px-6 text-xl font-black text-white bg-rose-500 hover:bg-rose-400 rounded-2xl shadow-sm border-b-4 border-rose-600 uppercase tracking-tighter transition-colors text-center"
        >
          Mahirap <span className="text-sm font-bold opacity-80 block">(Hard)</span>
        </button>
      </div>
    </motion.div>
  );
}
