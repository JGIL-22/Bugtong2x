/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameState, Difficulty } from './types';
import StartScreen from './components/StartScreen';
import AvatarSelect from './components/AvatarSelect';
import GameScreen from './components/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import DifficultySelect from './components/DifficultySelect';
import LevelIntro from './components/LevelIntro';
import { AnimatePresence } from 'motion/react';
import bgFilipino from './assets/images/bg_filipino_1779439922206.png';

function GameController() {
  const { user, profile, loading } = useAuth();
  const [gameState, setGameState] = useState<GameState>('START');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col bg-amber-50 font-sans text-slate-800 selection:bg-yellow-200">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-30 bg-cover bg-center transition-opacity"
        style={{ backgroundImage: `url(${bgFilipino})` }}
      ></div>

      {loading && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-amber-50/80 backdrop-blur-sm gap-3 text-amber-600 font-bold">
            <div className="w-6 h-6 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            Nagloload...
         </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center py-2 sm:py-4 px-2 sm:px-6">
         {gameState === 'START' && <StartScreen setGameState={setGameState} />}
         {gameState === 'AVATAR_SELECT' && <AvatarSelect setGameState={setGameState} />}
         {gameState === 'DIFFICULTY_SELECT' && <DifficultySelect setGameState={setGameState} setDifficulty={setDifficulty} />}
         {gameState === 'LEVEL_INTRO' && <LevelIntro setGameState={setGameState} difficulty={difficulty} />}
         {gameState === 'PLAYING' && <GameScreen setGameState={setGameState} difficulty={difficulty} />}
         {gameState === 'LEADERBOARD' && <LeaderboardScreen setGameState={setGameState} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameController />
    </AuthProvider>
  );
}
