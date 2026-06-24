import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { seedInitialData } from './firebaseUtils';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Leaderboard } from './components/Leaderboard';
import { Trophy, LogOut, Radio, User, Loader2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TEAM_FLAGS, getTeamFlagUrl } from './utils';

export default function App() {
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard'>('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
  });

  // Handle document class toggles on theme state changes
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [theme]);

  // 1. Initial Seeding of Database if empty on App load
  useEffect(() => {
    const triggerSeed = async () => {
      try {
        await seedInitialData();
      } catch (err) {
        console.error('Failed to auto-seed initial matches data:', err);
      }
    };
    triggerSeed();
  }, []);

  // 2. Listen to Authentication State and Bind Player Profile Real-Time
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        try {
          // Listen to the player profile in Firestore associated with this Auth UID
          const q = query(collection(db, 'users'), where('authUid', '==', user.uid));
          
          unsubscribeProfile = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              const data = snapshot.docs[0].data();
              if (data && !data.id) {
                data.id = snapshot.docs[0].id; // Fallback to document key e.g "sanjay"
              }
              setCurrentUserProfile(data);
            } else {
              // Fallback - check if profile is already mapped by name portion key (e.g. for non-anonymous user)
              const emailPrefix = user.email?.split('@')[0] || '';
              if (emailPrefix) {
                const queryNameRef = query(collection(db, 'users'), where('id', '==', emailPrefix));
                getDocs(queryNameRef).then((nameSnap) => {
                  if (!nameSnap.empty) {
                    const data = nameSnap.docs[0].data();
                    if (data && !data.id) {
                      data.id = nameSnap.docs[0].id;
                    }
                    setCurrentUserProfile(data);
                  } else {
                    setCurrentUserProfile(null);
                  }
                }).catch((e) => {
                  console.error('Fallback profile lookup error:', e);
                  setCurrentUserProfile(null);
                });
              } else {
                // For anonymous auth / active profile transition, preserve the already-selected profile state 
                // instead of resetting it back to null, which resolves the 2-second reload/flicker issue.
                setCurrentUserProfile((prev) => prev ? prev : null);
              }
            }
          }, (error) => {
            console.error('UserProfile snapshot listener failed:', error);
          });
        } catch (error) {
          console.error('Error loading player profile: ', error);
          setCurrentUserProfile(null);
        }
      } else {
        setCurrentUserProfile(null);
      }
      setAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      setCurrentUserProfile(null);
    } catch (err) {
      console.error('Logout failed: ', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-emerald-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="font-display font-medium text-sm tracking-widest uppercase">
          pitching stadium...
        </span>
      </div>
    );
  }

  if (!currentUserProfile) {
    return (
      <Login 
        onLoginSuccess={(profile) => {
          setCurrentUserProfile(profile);
        }} 
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  return (
    <div className="min-h-screen stadium-pitch text-white flex flex-col relative overflow-x-hidden">
      {/* Decorative Pitch Aesthetics */}
      <div className="pitch-overlay opacity-60"></div>
      <div className="field-lines opacity-40"></div>
      <div className="field-circle opacity-30"></div>

      {/* Dynamic Header */}
      <header className="bg-zinc-950/80 border-b border-white/10 sticky top-0 z-30 backdrop-blur-md relative">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Logo Brand with High Density Header layout */}
          <div className="flex items-center gap-3">
            <div className="bg-[#ffb703] p-2 border border-[#ffb703]/30 rounded-xl shadow-[0_0_15px_rgba(255,183,3,0.25)] text-zinc-950">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-medium text-3xl sm:text-4xl text-white uppercase tracking-tight leading-none">
                CPF World cup Predicter
              </h1>
              <span className="text-[10px] text-[#ffb703] font-display tracking-widest font-bold uppercase block mt-0.5">
                🏆 FIFA World Cup 2026
              </span>
            </div>
          </div>

          {/* Profile Controls Header aligning with design html */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* User Profile Box from High Density styling */}
            <div className="user-profile">
              <div className="text-left">
                <div className="supporting-badge">Active Participant</div>
                <div className="text-base sm:text-lg font-black text-white hover:text-[#ffb703] transition leading-none">
                  {currentUserProfile.name} <span className="text-[#ffb703] font-mono text-xs font-bold">({currentUserProfile.totalPoints ?? 0} pts)</span>
                </div>
              </div>

              <div className="w-[1px] h-8 bg-zinc-800"></div>

              <div>
                <div className="supporting-badge">Fave Squads</div>
                <div className="teams-list">
                  {currentUserProfile.supportedTeams?.map((team: string) => (
                    <span key={team} className="flag-pill flex items-center gap-1.5 bg-white/10 border border-white/15 px-2 py-1 rounded text-xs" title={team}>
                      <img src={getTeamFlagUrl(team)} alt={team} className="w-4 h-3 object-cover rounded shadow-sm shrink-0" referrerPolicy="no-referrer" />
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Toggle option */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`px-3 py-2 border rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase font-display leading-none ${
                theme === 'light' 
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800' 
                  : 'bg-zinc-900/60 hover:bg-zinc-800 border-white/10 text-white'
              }`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              id="theme_toggle_header_btn"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#ffb703]" />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 border border-red-700 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase font-display"
              title="Logout Profile"
              id="logout_header_btn"
            >
              <LogOut className="w-3.5 h-3.5 text-white" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Pitch Stage Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 relative z-10">
        {/* Navigation Tabs */}
        <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-white/10 mb-6 max-w-md shadow-lg" id="tab_navigator_bar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 text-xs font-display font-medium uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-[#ffb703] text-zinc-950 shadow-md font-bold'
                : 'text-zinc-300 hover:text-white'
            }`}
            id="tab_dashboard_trigger"
          >
            <Radio className="w-3.5 h-3.5" /> Upcoming Fixtures
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 text-xs font-display font-medium uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-[#ffb703] text-zinc-950 shadow-md font-bold'
                : 'text-zinc-300 hover:text-white'
            }`}
            id="tab_leaderboard_trigger"
          >
            <Trophy className="w-3.5 h-3.5" /> League Standings
          </button>
        </div>

        {/* Content Screens */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'dashboard' ? (
              <Dashboard userProfile={currentUserProfile} />
            ) : (
              <Leaderboard />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer bar */}
      <footer className="py-6 border-t border-zinc-900 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
        ⚽ CPF World cup Predicter 2026 • Real Time Data Server • Safe Sandbox
      </footer>
    </div>
  );
}
