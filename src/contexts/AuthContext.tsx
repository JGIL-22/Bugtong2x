import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, loginWithGoogle, loginWithFacebook, loginWithApple, logout, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  loginFacebook: () => Promise<void>;
  loginApple: () => Promise<void>;
  logoutUser: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      }
    }, (error) => {
      console.error("Auth state change error:", error);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Fallback loading timeout to prevent infinite load
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      clearTimeout(timeout);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial profile
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Manlalaro',
          avatar: '',
          points: 0,
          currentLevel: 0,
          highestLevel: 1,
          bestScore: 0,
          streak: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDoc(doc(db, 'users', user.uid), newProfile).catch(error => {
          try {
            handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
          } catch(e) {}
        });
      }
      setLoading(false);
    }, (error) => {
      clearTimeout(timeout);
      setLoading(false);
      try {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } catch(e) {}
    });

    return () => {
      clearTimeout(timeout);
      unsubscribeProfile();
    };
  }, [user]);

  const login = async () => {
    await loginWithGoogle();
  };

  const loginFacebook = async () => {
    await loginWithFacebook();
  };

  const loginApple = async () => {
    await loginWithApple();
  };

  const logoutUser = async () => {
    if (profile) await updateProfile({ streak: 0 });
    await logout();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const docRef = doc(db, 'users', user.uid);
    try {
      // Use optimistic local update
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      // Use setDoc with merge for better compatibility and avoiding 'not found' errors
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Failed to update profile:', e);
      // Removed the throw from handleFirestoreError locally to avoid crashing the app on silent saves
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, loginFacebook, loginApple, logoutUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
