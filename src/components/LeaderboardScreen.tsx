import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { GameState, UserProfile } from '../types';
import { avatars } from '../data/gamedata';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { audio } from '../utils/audio';
import AvatarImage from './AvatarImage';

interface LeaderboardScreenProps {
  setGameState: (state: GameState) => void;
}

const FAKE_SCORING: UserProfile[] = [
  { uid: 'f1', displayName: 'Kapitan Tiago', avatar: 'pedro_penduko', points: 1550, currentLevel: 10, highestLevel: 10, createdAt: '', updatedAt: '' },
  { uid: 'f2', displayName: 'Maria Clara', avatar: 'maria_clara', points: 1420, currentLevel: 8, highestLevel: 8, createdAt: '', updatedAt: '' },
  { uid: 'f3', displayName: 'Crisostomo I.', avatar: 'ibarra', points: 1280, currentLevel: 6, highestLevel: 7, createdAt: '', updatedAt: '' },
  { uid: 'f4', displayName: 'Amihan', avatar: 'amihan', points: 950, currentLevel: 4, highestLevel: 5, createdAt: '', updatedAt: '' },
  { uid: 'f5', displayName: 'Juan Tamad', avatar: 'malakas', points: 880, currentLevel: 4, highestLevel: 4, createdAt: '', updatedAt: '' },
  { uid: 'f6', displayName: 'Alunsina', avatar: 'alunsina', points: 800, currentLevel: 3, highestLevel: 3, createdAt: '', updatedAt: '' },
  { uid: 'f7', displayName: 'Sisa', avatar: 'maria_clara', points: 650, currentLevel: 2, highestLevel: 3, createdAt: '', updatedAt: '' },
  { uid: 'f8', displayName: 'Nardong Putik', avatar: 'pedro_penduko', points: 500, currentLevel: 2, highestLevel: 2, createdAt: '', updatedAt: '' },
  { uid: 'f9', displayName: 'Prinsesa Urduja', avatar: 'amihan', points: 300, currentLevel: 1, highestLevel: 2, createdAt: '', updatedAt: '' },
  { uid: 'f10', displayName: 'Totoy Bato', avatar: 'ibarra', points: 50, currentLevel: 1, highestLevel: 1, createdAt: '', updatedAt: '' },
];

export default function LeaderboardScreen({ setGameState }: LeaderboardScreenProps) {
  const { profile } = useAuth();
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(50));
        const snapshots = await getDocs(q);
        const data = snapshots.docs.map(skipdoc => skipdoc.data() as UserProfile);
        
        // Ensure the current user's locally updated profile is included
        if (profile) {
            const existingIdx = data.findIndex(u => u.uid === profile.uid);
            if (existingIdx !== -1) {
                // Prefer local profile in case local has more up-to-date points 
                // before firestore sync completes
                data[existingIdx] = profile;
            } else {
                data.push(profile);
            }
        }

        // Merge real users with fake scoring and sort
        const realUids = new Set(data.map(u => u.uid));
        const finalData = [...data, ...FAKE_SCORING.filter(f => !realUids.has(f.uid))]
           .sort((a, b) => b.points - a.points)
           .slice(0, 50);
           
        setLeaders(finalData);
      } catch (e) {
        try {
          handleFirestoreError(e, OperationType.LIST, 'users');
        } catch(err) {}
        let fallbackData = [...FAKE_SCORING];
        if (profile) {
            const existingIdx = fallbackData.findIndex(u => u.uid === profile.uid);
            if (existingIdx !== -1) {
                fallbackData[existingIdx] = profile;
            } else {
                fallbackData.push(profile);
            }
        }
        setLeaders(fallbackData.sort((a, b) => b.points - a.points).slice(0, 50));
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto relative z-10 text-slate-800 p-4">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-[32px] border-b-[4px] border-slate-200 shadow-sm">
         <button onClick={() => { audio.playClick(); setGameState('START'); }} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
           <ArrowLeft className="w-6 h-6" />
         </button>
         <h2 className="text-xl font-black italic tracking-tight text-amber-600 flex items-center gap-2">
           <Trophy className="w-5 h-5 text-amber-500" /> Mga Nangunguna
         </h2>
         <div className="w-10 h-10"></div>
      </div>

      <div className="flex-1 bg-white border-b-[8px] border-amber-100 rounded-[40px] p-6 overflow-y-auto shadow-xl custom-scrollbar flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-400 font-bold uppercase tracking-widest animate-pulse text-sm">
             Kumukuha ng datos...
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex justify-center items-center h-full text-slate-400 font-bold uppercase tracking-widest text-sm">
             Wala pang nakakalaro.
          </div>
        ) : (
          leaders.map((leader, index) => {
             const userAvatarObj = avatars.find((a) => a.id === leader.avatar) || avatars[0];
             const isMe = profile?.uid === leader.uid;
             
             return (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.05 }}
                 key={leader.uid || index}
                 className={clsx(
                   "flex items-center gap-4 p-3 pr-4 rounded-2xl border-2 transition-all",
                   isMe ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-100"
                 )}
               >
                 <div className="w-6 text-center font-black text-lg flex justify-center shrink-0">
                   {index === 0 && <span className="text-amber-500 text-2xl">1</span>}
                   {index === 1 && <span className="text-slate-400 text-xl">2</span>}
                   {index === 2 && <span className="text-amber-700 text-xl">3</span>}
                   {index > 2 && <span className="text-slate-400">{index + 1}</span>}
                 </div>
                 
                 <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0">
                    <AvatarImage avatarId={userAvatarObj.id} className="w-full h-full border-none shadow-none rounded-none" />
                 </div>
                 
                 <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-sm sm:text-base text-slate-800 truncate" title={leader.displayName}>{leader.displayName || 'Manlalaro'}</h3>
                 </div>
                 
                 <div className="text-right font-black text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-sm">
                    {leader.points} pts
                 </div>
               </motion.div>
             )
          })
        )}
      </div>
    </div>
  );
}
