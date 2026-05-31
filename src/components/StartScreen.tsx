import { useState, useEffect } from 'react';
import { Trophy, Lightbulb, Facebook } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GameState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { triviaFacts } from '../data/trivia';
import { audio } from '../utils/audio';

interface StartScreenProps {
  setGameState: (state: GameState) => void;
}

export default function StartScreen({ setGameState }: StartScreenProps) {
  const { user, profile, login, loginFacebook, loginApple, logoutUser } = useAuth();
  const [trivia, setTrivia] = useState('');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTrivia(triviaFacts[Math.floor(Math.random() * triviaFacts.length)]);
  }, []);

  const handleStart = async () => {
    audio.init();
    audio.playClick();
    setError(null);
    if (!user) {
      try {
        await login();
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Error signing in with Google');
      }
    } else {
      if (profile?.avatar && profile?.displayName) {
        setGameState('DIFFICULTY_SELECT');
      } else {
        setGameState('AVATAR_SELECT');
      }
    }
  };

  const handleFacebook = async () => {
    audio.init();
    audio.playClick();
    setError(null);
    try {
      await loginFacebook();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error signing in with Facebook');
    }
  };

  return (
    <div className="flex flex-col items-center justify-start px-10 pt-16 pb-12 bg-white rounded-[40px] border-b-[8px] border-amber-100 shadow-xl max-w-sm w-full mx-auto text-center relative z-10 overflow-hidden min-h-[500px]">
      <motion.div 
        key={user ? 'logged-in' : 'logged-out'}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <h1 className="text-5xl font-black mb-1 text-amber-600 tracking-tight italic drop-shadow-[0_4px_0_rgba(217,119,6,0.3)] flex items-center justify-center">
          Bugtong
          <motion.sup 
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.6, delay: 0.3 }}
            className="text-2xl origin-bottom-left"
          >
            2x
          </motion.sup>
        </h1>
        <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-xs mt-3">Classic Pinoy Game</p>
      </motion.div>

      {!user ? (
        <div className="flex flex-col gap-3 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 rounded-2xl shadow-sm border border-slate-200 border-b-4 flex items-center justify-center gap-4 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-6 h-6 shrink-0" />
            <span className="text-base font-semibold text-slate-700">Continue with Google</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFacebook}
            className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166FE5] rounded-2xl shadow-sm border border-[#166FE5] border-b-4 flex items-center justify-center gap-4 transition-colors"
          >
            <Facebook className="w-5 h-5 text-white fill-current shrink-0" />
            <span className="text-base font-semibold text-white">Continue with Facebook</span>
          </motion.button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-500 font-semibold p-2 bg-rose-50 rounded-lg border border-rose-100"
            >
              {error.includes("auth/popup-closed-by-user") 
                ? "Sign-in popup closed before completing. Please try again."
                : error.includes("auth/unauthorized-domain") 
                  ? "This domain is not authorized in Firebase Auth. Add it to the Firebase console."
                  : error.includes("Cross-Origin") || error.includes("COOP") 
                    ? "Popups might be blocked by browser settings or iFrame restrictions. Please try opening the app in a new tab."
                    : error}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="w-full space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="w-full py-4 text-lg font-black text-slate-800 bg-yellow-400 hover:bg-yellow-300 rounded-2xl shadow-sm border-b-4 border-yellow-500 flex items-center justify-center gap-2 uppercase tracking-tighter transition-colors"
          >
            Ano, Tara?
          </motion.button>
        </div>
      )}
      
      {user && (
        <>
          <motion.button
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="mt-6 py-2 px-4 flex items-center gap-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-bold uppercase tracking-tighter italic"
             onClick={() => {
               audio.init();
               audio.playClick();
               setGameState('LEADERBOARD');
             }}
          >
            <Trophy className="w-5 h-5" />
            Mga Nangunguna
          </motion.button>
          
          <motion.button
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.55 }}
             className="mt-2 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-widest underline"
             onClick={() => {
               audio.init();
               audio.playClick();
               setGameState('AVATAR_SELECT');
             }}
          >
            Palitan ang Karakter
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-2 py-2 px-4 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
            onClick={async () => {
              audio.init();
              audio.playClick();
              try {
                await logoutUser();
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Sign out
          </motion.button>
          
          <AnimatePresence>
            {trivia && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 bg-amber-50/90 rounded-2xl p-4 border border-amber-200 flex flex-col items-center gap-2 max-w-sm w-full mx-auto backdrop-blur-sm relative z-10 shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-amber-600 font-bold uppercase tracking-widest text-[10px]">
                  <Lightbulb className="w-4 h-4" />
                  <span>Did You Know?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {trivia.replace('Did you know? ', '')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <div className="mt-auto text-[10px] text-slate-400 font-medium tracking-wide flex flex-col items-center justify-center gap-1 w-full border-t border-slate-100 pt-6">
        <p>Developed by <a href="https://jgcreates.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 font-bold">John Gil Mayor (JonVoyor)</a></p>
        <p>&copy; 2025 All rights reserved</p>
      </div>
    </div>
  );
}
