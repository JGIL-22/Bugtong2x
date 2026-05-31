export interface UserProfile {
  uid: string;
  displayName: string;
  avatar: string;
  points: number;
  currentLevel: number;
  highestLevel?: number;
  bestScore?: number;
  streak?: number;
  createdAt: string;
  updatedAt: string;
}

export type GameState = 'START' | 'AVATAR_SELECT' | 'DIFFICULTY_SELECT' | 'LEVEL_INTRO' | 'PLAYING' | 'LEADERBOARD';
export type Difficulty = 'EASY' | 'AVERAGE' | 'HARD';
