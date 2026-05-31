import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GameState, Difficulty } from '../types';
import { riddles, avatars } from '../data/gamedata';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowLeft, Star, Heart, XSquare, Volume2, VolumeX } from 'lucide-react';
import clsx from 'clsx';
import { audio } from '../utils/audio';
import AvatarImage from './AvatarImage';
import confetti from 'canvas-confetti';

interface GameScreenProps {
  setGameState: (state: GameState) => void;
  difficulty: Difficulty;
}

export default function GameScreen({ setGameState, difficulty }: GameScreenProps) {
  const { profile, updateProfile } = useAuth();
  
  const [sessionRiddles, setSessionRiddles] = useState<typeof riddles>([]);
  const [currentRiddleIdx, setCurrentRiddleIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [hintTriggered, setHintTriggered] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasShownWinPopup, setHasShownWinPopup] = useState(false);
  const [muted, setMuted] = useState(audio.isMuted);
  const initialTime = difficulty === 'HARD' ? 20 : 15;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  const handleToggleMute = () => {
    setMuted(audio.toggleMute());
    if (!audio.isMuted) audio.playClick();
  };

  const initGame = () => {
    const filteredRiddles = riddles.filter(r => r.difficulty === difficulty);
    const shuffled = filteredRiddles
      .map(r => ({ ...r, options: [...r.options].sort(() => Math.random() - 0.5) }))
      .sort(() => Math.random() - 0.5);
    setSessionRiddles(shuffled);
    setCurrentRiddleIdx(0);
    setLives(3);
    setIsGameOver(false);
    setHasWon(false);
    setHasShownWinPopup(false);
    setSelectedOption(null);
    setTypedAnswer('');
    setIsAnimating(false);
    setHintTriggered(false);
    setTimeLeft(initialTime);
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  useEffect(() => {
    if (isGameOver || hasWon || isAnimating || showQuitConfirm || sessionRiddles.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, hasWon, isAnimating, showQuitConfirm, currentRiddleIdx, sessionRiddles.length]);

  useEffect(() => {
    if (currentRiddleIdx === 15 && !hasWon && !isGameOver && !hasShownWinPopup) {
      setHasWon(true);
      setHasShownWinPopup(true);
      if (profile) {
          const winBonus = 100;
          updateProfile({ 
              points: profile.points + winBonus,
              bestScore: Math.max(profile.bestScore || 0, profile.points + winBonus)
          });
      }
      audio.playCorrect();
      
      const duration = 5000;
      const end = Date.now() + duration;

      const frame = () => {
          confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.8 },
              colors: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#F43F5E']
          });
          confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.8 },
              colors: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#F43F5E']
          });

          if (Date.now() < end) {
              requestAnimationFrame(frame);
          }
      };
      frame();
    }
  }, [currentRiddleIdx, hasWon, isGameOver, profile, updateProfile]);

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && !isAnimating && !hasWon) {
      audio.playTick();
    }
  }, [timeLeft, isAnimating, hasWon]);

  const skipToNextQuestion = () => {
    setSessionRiddles(prev => {
      const newArr = [...prev];
      if (currentRiddleIdx < newArr.length - 1) {
        const randIdx = currentRiddleIdx + 1 + Math.floor(Math.random() * (newArr.length - currentRiddleIdx - 1));
        const temp = newArr[currentRiddleIdx];
        newArr[currentRiddleIdx] = newArr[randIdx];
        newArr[randIdx] = temp;
      }
      return newArr;
    });
  };

  const handleTimeOut = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setHintTriggered(true);
    if (difficulty === 'HARD') {
      setTypedAnswer(currentRiddle.answer.toUpperCase());
    }
    
    setTimeout(async () => {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => {
          audio.playGameOver();
          setIsGameOver(true);
          if (profile) {
            updateProfile({ points: 0 });
          }
        }, 2500);
      } else {
        skipToNextQuestion();
        setSelectedOption(null);
        setTypedAnswer('');
        setIsAnimating(false);
        setHintTriggered(false);
        setTimeLeft(initialTime);
      }
    }, 2500);
  };

  if (sessionRiddles.length === 0) return null;

  const currentRiddle = sessionRiddles[currentRiddleIdx % sessionRiddles.length];
  const userAvatarObj = avatars.find((a) => a.id === profile?.avatar) || avatars[0];

  const checkAnswer = async (answerToCheck: string) => {
    if (isAnimating || !answerToCheck.trim()) return;
    
    setSelectedOption(answerToCheck);
    setIsAnimating(true);

    const isCorrect = answerToCheck.trim().toLowerCase() === currentRiddle.answer.toLowerCase();
    
    if (isCorrect) {
      audio.playCorrect();
    } else {
      audio.playWrong();
    }
    
    setTimeout(async () => {
      if (isCorrect) {
        if (profile) {
          const pointsToAdd = difficulty === 'HARD' ? 30 : difficulty === 'AVERAGE' ? 20 : 10;
          const newPoints = profile.points + pointsToAdd;
          const newStreak = (profile.streak || 0) + 1;
          const newBest = Math.max(profile.bestScore || 0, newPoints);
          
          updateProfile({
            points: newPoints,
            streak: newStreak,
            bestScore: newBest
          });
        }
        setCurrentRiddleIdx(prev => prev + 1);
        setSelectedOption(null);
        setTypedAnswer('');
        setIsAnimating(false);
        setHintTriggered(false);
        setTimeLeft(initialTime);
      } else {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setHintTriggered(true);
          setTimeout(() => {
            audio.playGameOver();
            setIsGameOver(true);
            if (profile) {
              updateProfile({ points: 0 });
            }
          }, 2500);
        } else {
          setHintTriggered(true);
          setTimeout(() => {
            skipToNextQuestion();
            setSelectedOption(null);
            setTypedAnswer('');
            setIsAnimating(false);
            setHintTriggered(false);
            setTimeLeft(initialTime);
          }, 2500);
        }
      }
    }, 1500);
  };

  const handleOptionSelect = (option: string) => {
    audio.playClick();
    checkAnswer(option);
  };

  const handleTypingSubmit = (e: FormEvent) => {
    e.preventDefault();
    audio.playClick();
    checkAnswer(typedAnswer);
  };

  const getHardHint = (answer: string) => {
    const chars = answer.split('');
    return chars.map((c, i) => {
      if (c === ' ') return '\u00A0\u00A0';
      if (i === 0 || i === chars.length - 1) return c.toUpperCase();
      return '_';
    }).join(' ');
  };

  const handleHint = () => {
    if (lives > 1 && !hintTriggered && !isAnimating && selectedOption === null) {
      audio.playClick();
      setLives(l => l - 1);
      setIsAnimating(true);
      setHintTriggered(true);
      if (difficulty !== 'HARD') {
        setSelectedOption(currentRiddle.answer);
      } else {
        setTypedAnswer(currentRiddle.answer.toUpperCase());
      }

      setTimeout(() => {
        skipToNextQuestion();
        setSelectedOption(null);
        setTypedAnswer('');
        setIsAnimating(false);
        setHintTriggered(false);
        setTimeLeft(initialTime);
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto relative z-10 text-slate-800 pb-2 sm:pb-2 pt-10 sm:pt-2 px-2 sm:px-4">
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-3xl p-2 sm:p-5 border-b-[4px] border-slate-200 shadow-sm mb-2 shrink-0 z-20 gap-2 sm:gap-4 w-full mt-4 sm:mt-0">
         <div className="flex items-center justify-between w-full sm:w-auto gap-2">
           <div className="flex items-center gap-1.5 sm:gap-2">
               <h1 className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight italic mt-1 leading-none drop-shadow-[0_2px_0_rgba(217,119,6,0.3)]">Bugtong<sup className="text-[10px] sm:text-xs">2x</sup></h1>
               <span className={clsx(
                 "px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white mt-1",
                 difficulty === 'EASY' ? "bg-green-500" : difficulty === 'AVERAGE' ? "bg-amber-500" : "bg-rose-500"
               )}>
                 {difficulty}
               </span>
           </div>
           
           <div className="flex sm:hidden items-center gap-3">
             <div className="flex flex-col items-end justify-center">
                 <div className="flex items-center gap-1">
                   {[1, 2, 3].map(l => (
                     <Heart key={l} className={clsx("w-3.5 h-3.5", l <= lives ? "fill-rose-500 text-rose-500" : "fill-slate-200 text-slate-200")} />
                   ))}
                 </div>
                 <button onClick={() => { audio.playClick(); setShowQuitConfirm(true); }} className="text-[8px] uppercase font-black tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 px-2 py-0.5 rounded-full transition-colors border border-rose-100 mt-1.5 shadow-sm">
                   Quit
                 </button>
             </div>
             <button onClick={handleToggleMute} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-400 shrink-0 shadow-sm transition-colors active:scale-95 hover:text-amber-500" title={muted ? "Unmute" : "Mute"}>
                 {muted ? <VolumeX className="w-4 h-4"/> : <Volume2 className="w-4 h-4"/>}
             </button>
             <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-400 bg-amber-100 shrink-0 shadow-sm">
               <AvatarImage avatarId={userAvatarObj.id} className="w-full h-full border-none shadow-none rounded-none" />
             </div>
           </div>
         </div>
         
         <div className="flex items-center justify-center w-full sm:w-auto bg-slate-50 px-3 sm:px-6 py-2 sm:py-2 rounded-2xl border border-slate-100 gap-3 sm:gap-6">
             <div className="text-center sm:text-right flex-1 sm:flex-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Score</span>
                <div className="flex items-center justify-center sm:justify-end gap-1 text-blue-600 font-black leading-none mt-1 sm:mt-1.5">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-blue-600" />
                  {profile?.points || 0}
                </div>
             </div>
             <div className="w-px h-6 sm:h-8 bg-slate-200"></div>
             <div className="text-center flex-1 sm:flex-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Streak</span>
                <div className="flex items-center justify-center gap-0.5 text-amber-600 font-black leading-none mt-0.5 sm:mt-1 text-lg">
                  🔥 {profile?.streak || 0}
                </div>
             </div>
             <div className="w-px h-6 sm:h-8 bg-slate-200"></div>
             <div className="text-center sm:text-left flex-1 sm:flex-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Best</span>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-emerald-600 font-black leading-none mt-1 sm:mt-1.5">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  {profile?.bestScore || 0}
                </div>
             </div>
         </div>
         
         <div className="hidden sm:flex items-center gap-4">
           <div className="flex flex-col text-right">
              <p className="font-bold text-[13px] leading-none mb-1">{profile?.displayName}</p>
              <p className="text-[9px] text-green-600 font-bold uppercase">● Cloud Synced</p>
           </div>
           
           <div className="flex flex-col items-center justify-center px-1">
             <div className="flex items-center gap-1.5">
               {[1, 2, 3].map(l => (
                 <Heart key={l} className={clsx("w-5 h-5", l <= lives ? "fill-rose-500 text-rose-500" : "fill-slate-200 text-slate-200")} />
               ))}
             </div>
             <button onClick={() => { audio.playClick(); setShowQuitConfirm(true); }} className="text-[9px] uppercase font-black tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1 rounded-full transition-colors mt-2 active:scale-95 border border-rose-100 shadow-sm">
               Quit Game
             </button>
           </div>
           
           <button onClick={handleToggleMute} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 border-[2px] border-slate-200 text-slate-400 shrink-0 shadow-sm transition-colors hover:text-amber-500 active:scale-95" title={muted ? "Unmute" : "Mute"}>
                {muted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
           </button>

           <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-yellow-400 bg-amber-100 shrink-0 shadow-sm">
             <AvatarImage avatarId={userAvatarObj.id} className="w-full h-full border-none shadow-none rounded-none" />
           </div>
         </div>
       </div>

       {/* Game Board */}
       <div className="flex-1 flex flex-col justify-center pt-8 sm:pt-8 pb-2 w-full mt-6 sm:mt-4">
         <AnimatePresence mode='wait'>
           <motion.div
             key={currentRiddle.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ 
               opacity: 1, 
               scale: 1,
               boxShadow: !isAnimating && timeLeft <= 5 ? "inset 0px 0px 120px 20px rgba(225, 29, 72, 0.25)" : "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)"
             }}
             transition={{ 
               boxShadow: { duration: 0.5, repeat: !isAnimating && timeLeft <= 5 ? Infinity : 0, repeatType: "reverse", ease: "easeInOut" }
             }}
             exit={{ opacity: 0, scale: 1.05 }}
             className={clsx(
               "bg-white rounded-3xl sm:rounded-[40px] border-[4px] sm:border-[8px] border-b-[6px] sm:border-b-[10px] w-full max-w-2xl mx-auto p-3 flex flex-col items-center justify-center relative transition-colors duration-500",
               !isAnimating && timeLeft <= 5 ? "border-rose-400" : "border-amber-100 border-t-white border-x-white shadow-xl"
             )}
           >
              <div className="flex w-full items-start justify-between mb-2 sm:mb-4 px-2 sm:px-4 shrink-0 relative max-w-lg">
                <div className="px-3 sm:px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-yellow-200 shrink-0 shadow-sm">
                  LEVEL {currentRiddleIdx + 1}
                </div>
                
                <div className="absolute left-1/2 -top-8 transform -translate-x-1/2 flex items-center justify-center">
                  {timeLeft <= 5 && !isAnimating && (
                     <motion.div
                       className="absolute inset-0 rounded-full bg-rose-400 blur-xl"
                       animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.3, 1] }}
                       transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                     />
                  )}
                  <div 
                    className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-90 blur-0 shadow-sm"
                  >
                    <svg className="w-full h-full transform -rotate-90 z-10 relative drop-shadow-sm" viewBox="0 0 100 100">
                      <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                      <motion.circle
                        className={clsx("transition-colors", timeLeft <= 5 ? "text-rose-500" : "text-amber-500")}
                        strokeWidth="8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                        initial={{ strokeDasharray: "263.89 263.89", strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 263.89 - (263.89 * timeLeft) / initialTime }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                       <span className={clsx("text-2xl sm:text-3xl font-black drop-shadow-sm transition-colors", timeLeft <= 5 ? "text-rose-600" : "text-amber-600")}>
                         {timeLeft}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="px-3 sm:px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-yellow-200 shrink-0 shadow-sm">
                  {difficulty}
                </div>
              </div>
              <div className="h-4 sm:h-6 w-full shrink-0" />
              <h2 className="text-lg sm:text-2xl font-black text-slate-800 leading-tight mb-2 sm:mb-4 italic text-center max-w-lg">
                "{currentRiddle.question}"
              </h2>

              {difficulty === 'HARD' ? (
                <form onSubmit={handleTypingSubmit} className="w-full max-w-sm flex flex-col gap-2 sm:gap-3 shrink-0">
                  {hintTriggered && selectedOption !== null && (
                     <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-amber-600 font-black tracking-widest uppercase mb-1 sm:mb-2 text-xl sm:text-2xl text-center">
                         {currentRiddle.answer.toUpperCase()}
                     </motion.div>
                  )}
                  <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    disabled={selectedOption !== null || hintTriggered}
                    placeholder="Ilagay ang iyong sagot..."
                    className={clsx(
                      "w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-[3px] font-black uppercase tracking-widest outline-none transition-all text-center text-sm sm:text-base",
                      selectedOption !== null || hintTriggered
                        ? (selectedOption?.trim().toLowerCase() === currentRiddle.answer.toLowerCase() || (hintTriggered && selectedOption === null))
                          ? "border-green-500 bg-green-50 text-green-700 shadow-inner"
                          : "border-rose-500 bg-rose-50 text-rose-700 shadow-inner"
                        : "border-slate-200 bg-slate-50 focus:border-amber-400 focus:bg-white text-slate-700"
                    )}
                  />
                  <motion.button
                    disabled={selectedOption !== null || !typedAnswer.trim() || hintTriggered}
                    whileHover={selectedOption === null && typedAnswer.trim() && !hintTriggered ? { scale: 1.02 } : {}}
                    whileTap={selectedOption === null && typedAnswer.trim() && !hintTriggered ? { scale: 0.98 } : {}}
                    type="submit"
                    className="w-full py-3 sm:py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-sm border-b-4 border-amber-600 transition-all disabled:opacity-50 disabled:grayscale text-sm sm:text-base"
                  >
                    Sagutin
                  </motion.button>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3 w-full max-w-lg shrink-0">
                   {currentRiddle.options.map((option) => {
                     const isSelected = selectedOption === option;
                     const isCorrectAnswer = option.toLowerCase() === currentRiddle.answer.toLowerCase();
                     const isHinted = hintTriggered && isCorrectAnswer;
                     
                     let buttonStyles = "bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700";
                     if (selectedOption || isHinted) {
                        if ((isSelected || isHinted) && isCorrectAnswer) {
                           buttonStyles = "bg-green-100 border-green-500 text-green-700 shadow-sm relative z-20";
                        } else if (isSelected && !isCorrectAnswer) {
                           buttonStyles = "bg-rose-50 border-rose-500 text-rose-700";
                        } else {
                           buttonStyles = "bg-slate-50 border-slate-200 text-slate-400 grayscale opacity-50";
                        }
                     }

                     return (
                       <motion.button
                         key={option}
                         disabled={selectedOption !== null || hintTriggered}
                         whileHover={selectedOption === null && !hintTriggered ? { scale: 1.02 } : {}}
                         whileTap={selectedOption === null && !hintTriggered ? { scale: 0.98 } : {}}
                         onClick={() => handleOptionSelect(option)}
                         className={clsx(
                           "p-2 sm:p-5 text-[13px] sm:text-base rounded-2xl border-2 font-black uppercase tracking-tighter transition-all duration-300",
                           buttonStyles
                         )}
                       >
                         {option}
                       </motion.button>
                     );
                   })}
                </div>
              )}

              <div className="mt-2 sm:mt-8 flex justify-center w-full shrink-0">
                 <button
                   onClick={handleHint}
                   disabled={lives <= 1 || hintTriggered || selectedOption !== null}
                   className="px-4 py-1.5 sm:px-5 sm:py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 disabled:grayscale rounded-full font-bold text-[11px] sm:text-sm uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 transition-colors border border-indigo-200 shadow-sm"
                 >
                    💡 Sirit Na! <span className="flex items-center text-rose-500 ml-1">(-1 <Heart className="w-3.5 h-3.5 fill-rose-500 ml-0.5" />)</span>
                 </button>
              </div>
           </motion.div>
         </AnimatePresence>

         <AnimatePresence>
           {hasWon && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 rounded-[40px]"
               >
                  <motion.div 
                     initial={{ scale: 0.8, y: 50 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.8, y: 50 }}
                     className="bg-white p-6 sm:p-8 rounded-[40px] shadow-2xl flex flex-col items-center border-[8px] border-amber-100 max-w-sm w-full"
                  >
                     <div className="text-5xl sm:text-6xl mb-4">🏆</div>
                     <h2 className="text-2xl sm:text-3xl font-black text-amber-500 mb-2 italic tracking-tight uppercase text-center">Congratulations!</h2>
                     <p className="text-slate-500 font-bold mb-8 text-center text-sm sm:text-base">Nalagpasan mo na ang Level 15! Ang husay mo!</p>
                     <div className="flex flex-col gap-3 w-full">
                       <button 
                         onClick={() => {
                           audio.playClick();
                           setHasWon(false);
                           setTimeLeft(initialTime);
                         }}
                         className="w-full py-3.5 text-sm sm:text-base font-black text-amber-600 bg-amber-100 hover:bg-amber-200 rounded-2xl shadow-sm border-b-4 border-amber-300 uppercase tracking-tighter transition-colors"
                       >
                          Ipagpatuloy ang Laro
                       </button>
                       <button 
                         onClick={() => { audio.playClick(); setGameState('LEADERBOARD'); }}
                         className="w-full py-3.5 text-sm sm:text-base font-black text-white bg-amber-500 hover:bg-amber-400 rounded-2xl shadow-sm border-b-4 border-amber-600 uppercase tracking-tighter transition-colors"
                       >
                          Tingnan ang Leaderboard
                       </button>
                     </div>
                  </motion.div>
               </motion.div>
           )}
         </AnimatePresence>

         <AnimatePresence>
           {isGameOver && !hasWon && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 rounded-[40px]"
               >
                  <motion.div 
                     initial={{ scale: 0.8, y: 50 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.8, y: 50 }}
                     className="bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center border-[8px] border-rose-100 max-w-sm w-full"
                  >
                     <div className="text-6xl mb-4">💔</div>
                     <h2 className="text-4xl font-black text-rose-600 mb-2 italic tracking-tight uppercase text-center">Game Over</h2>
                     <p className="text-slate-500 font-bold mb-8 text-center">Naubusan ka ng buhay. Handa ka na bang subukan ulit?</p>
                     <button 
                       onClick={() => { audio.playClick(); initGame(); }}
                       className="w-full py-4 text-lg font-black text-white bg-rose-500 hover:bg-rose-400 rounded-2xl shadow-sm border-b-4 border-rose-600 uppercase tracking-tighter transition-colors"
                     >
                        Ulitin
                     </button>
                  </motion.div>
               </motion.div>
           )}
         </AnimatePresence>

         <AnimatePresence>
           {showQuitConfirm && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 rounded-[40px]"
               >
                  <motion.div 
                     initial={{ scale: 0.8, y: 50 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.8, y: 50 }}
                     className="bg-white p-6 sm:p-8 rounded-[40px] shadow-2xl flex flex-col items-center border-[8px] border-amber-100 max-w-sm w-full"
                  >
                     <div className="text-5xl sm:text-6xl mb-4">🚪</div>
                     <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 italic tracking-tight uppercase text-center">Quit Game?</h2>
                     <p className="text-slate-500 font-bold mb-6 text-center leading-snug text-sm sm:text-base">Mawawala ang iyong progress para sa kasalukuyang level kung ikaw ay aalis. Sigurado ka ba?</p>
                     <div className="flex gap-3 w-full">
                       <button 
                         onClick={() => { audio.playClick(); setShowQuitConfirm(false); }}
                         className="flex-1 py-3 sm:py-4 text-sm sm:text-base font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors uppercase tracking-tight"
                       >
                          Cancel
                       </button>
                       <button 
                         onClick={() => {
                           audio.playClick();
                           if (profile) {
                             updateProfile({ points: 0 });
                           }
                           setShowQuitConfirm(false);
                           setGameState('START');
                         }}
                         className="flex-1 py-3 sm:py-4 text-sm sm:text-base font-black text-white bg-rose-500 hover:bg-rose-400 rounded-2xl shadow-sm border-b-4 border-rose-600 uppercase tracking-tight transition-colors"
                       >
                          Quit
                       </button>
                     </div>
                  </motion.div>
               </motion.div>
           )} 
         </AnimatePresence>
       </div>
    </div>
  );
}
