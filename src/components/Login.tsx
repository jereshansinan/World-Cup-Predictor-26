import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Loader2, User } from 'lucide-react';
import { loginByProfile } from '../firebaseUtils';
import { SEED_USERS } from '../seed';

interface LoginProps {
  onLoginSuccess: (userProfile: any) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [selectedUser, setSelectedUser] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setErrorMessage('Please select a player.');
      return;
    }

    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      const userProfile = await loginByProfile(selectedUser);
      onLoginSuccess(userProfile);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen stadium-pitch flex flex-col justify-center items-center px-4 py-8 relative">
      <div className="pitch-overlay"></div>
      <div className="field-lines"></div>
      <div className="field-circle"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-zinc-950/95 border border-white/10 rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.6)] p-6 sm:p-8 backdrop-blur-lg relative z-10"
        id="login_card"
      >
        {/* Flag Ribbons Decorative Top Accent */}
        <div className="absolute -top-1 left-4 right-4 flex justify-between h-2 gap-1 overflow-hidden rounded-full">
          <div className="flex-1 bg-[#e63946]"></div>
          <div className="flex-[#ffb703] bg-[#ffb703]"></div>
          <div className="flex-1 bg-[#245c38]"></div>
          <div className="flex-1 bg-red-500"></div>
          <div className="flex-1 bg-blue-500"></div>
          <div className="flex-1 bg-green-500"></div>
        </div>

        {/* Header App Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-emerald-950 to-zinc-950 p-3 sm:p-4 border border-zinc-800 rounded-full mb-3 shadow-[0_0_20px_rgba(255,183,3,0.15)]">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#ffb703]" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 uppercase leading-none">
            CPF World cup Predicter
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* User Select field */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-zinc-400 font-display font-medium">
              Select Player Profile
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <User className="w-5 h-5 text-emerald-500/70" />
              </span>
              <select
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-zinc-950 border border-zinc-700/60 focus:border-emerald-500 rounded-xl pl-12 pr-10 py-3.5 leading-tight text-white focus:outline-none appearance-none transition"
                id="select_player_dropdown"
              >
                <option value="">-- Choose your name --</option>
                {[...SEED_USERS].sort((a, b) => a.name.localeCompare(b.name)).map((user) => (
                  <option key={user.name} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400">
                ⭐
              </div>
            </div>
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300 text-center" id="login_error_banner">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Submit validation button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 font-display font-bold uppercase tracking-wider text-zinc-950 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-400/30"
            id="login_submit_btn"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validating Pitch...
              </>
            ) : (
              'Enter Tournament'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
