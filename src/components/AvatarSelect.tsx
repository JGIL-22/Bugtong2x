import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GameState } from '../types';
import { avatars } from '../data/gamedata';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { audio } from '../utils/audio';
import AvatarImage from './AvatarImage';

interface AvatarSelectProps {
  setGameState: (state: GameState) => void;
}

export default function AvatarSelect({ setGameState }: AvatarSelectProps) {
  const { profile, updateProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar || avatars[0].id);
  const [muted, setMuted] = useState(audio.isMuted);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.avatar) {
      setSelectedAvatar(profile.avatar);
    }
  }, [profile]);

  useEffect(() => {
    // Scroll to selected avatar on mount
    if (listRef.current) {
      const idx = avatars.findIndex(a => a.id === selectedAvatar);
      if (idx !== -1) {
        const item = listRef.current.children[idx] as HTMLElement;
        if (item) {
          item.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
      }
    }
  }, []);

  const handleToggleMute = () => {
    setMuted(audio.toggleMute());
    if (!audio.isMuted) audio.playClick();
  };

  const handleSaveAndPlay = () => {
    audio.playClick();
    const avatarObj = avatars.find(a => a.id === selectedAvatar) || avatars[0];
    
    // Optimistically proceed to the next screen to prevent any perceived delay
    setGameState('DIFFICULTY_SELECT');

    // Update profile in the background
    updateProfile({
      avatar: avatarObj.id,
      displayName: avatarObj.name
    }).catch(console.error);
  };

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    audio.playClick();
  };

  const scrollList = (direction: 'up' | 'down') => {
    if (listRef.current) {
      const scrollAmount = 72;
      listRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const selectedAvatarObj = avatars.find(a => a.id === selectedAvatar);

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white rounded-[40px] border-b-[8px] border-amber-100 shadow-xl max-w-sm w-full mx-auto relative z-10 text-slate-800">
     <div className="flex justify-between w-full items-center mb-4">
         <div className="flex items-center gap-3">
           <button 
             onClick={() => { audio.playClick(); setGameState('START'); }}
             className="text-slate-400 hover:text-amber-500 transition-colors" title="Bumalik"
           >
             <ArrowLeft className="w-6 h-6" />
           </button>
           <h2 className="text-2xl font-black italic text-amber-600 tracking-tight leading-none">Player Alias</h2>
         </div>
         <div className="flex items-center gap-3">
           <button onClick={handleToggleMute} className="text-slate-400 hover:text-amber-500 transition-colors" title={muted ? "Unmute" : "Mute"}>
             {muted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
           </button>
         </div>
      </div>

      <div className="w-full relative mb-4">
        
        {/* Preview - Selected Avatar Large */}
        <div className="flex flex-col items-center mb-5">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedAvatar}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-amber-400 bg-amber-50 shadow-lg relative flex items-center justify-center shrink-0 ring-4 ring-amber-200/50"
            >
                <AvatarImage 
                  avatarId={selectedAvatarObj?.id || 'maria_clara'}
                  className="w-full h-full aspect-square border-none" 
                />
            </motion.div>
          </AnimatePresence>
          <motion.p 
            key={selectedAvatarObj?.name}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-3 text-lg font-black text-amber-600 tracking-tight"
          >
            {selectedAvatarObj?.name}
          </motion.p>
        </div>

        {/* Avatar Grid Picker */}
        <div className="relative">
          {/* Scroll Up Button */}
          <button 
            onClick={() => scrollList('up')}
            className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-white/90 shadow-md border border-amber-200 flex items-center justify-center text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-all backdrop-blur-sm"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <div 
            className="relative overflow-hidden rounded-2xl border-2 border-amber-200/60 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/50"
            style={{ 
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)', 
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)' 
            }}
          >
            <div 
              ref={listRef}
              className="h-[216px] overflow-y-auto py-3 px-2 avatar-scroll"
            >
              <div className="grid grid-cols-4 gap-2">
                {avatars.map((a) => {
                  const isSelected = a.id === selectedAvatar;
                  return (
                    <motion.button
                      key={a.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSelectAvatar(a.id)}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-100 ring-2 ring-amber-400 shadow-sm' 
                          : 'hover:bg-amber-50/80'
                      }`}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 transition-all duration-200 ${
                        isSelected 
                          ? 'border-2 border-amber-400 shadow-md ring-2 ring-amber-200' 
                          : 'border-2 border-slate-200/80'
                      }`}>
                        <AvatarImage 
                          avatarId={a.id}
                          className="w-full h-full aspect-square border-none" 
                        />
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-bold leading-tight text-center line-clamp-2 transition-colors ${
                        isSelected ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        {a.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scroll Down Button */}
          <button 
            onClick={() => scrollList('down')}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-white/90 shadow-md border border-amber-200 flex items-center justify-center text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-all backdrop-blur-sm"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
  
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSaveAndPlay}
        className="w-full py-4 text-lg font-black text-slate-800 bg-yellow-400 hover:bg-yellow-300 rounded-2xl shadow-sm border-b-4 border-yellow-500 flex items-center justify-center gap-2 uppercase tracking-tighter disabled:opacity-50 disabled:grayscale transition-all mt-2"
      >
        Pumili ng Level
      </motion.button>
    </div>
  );
}
