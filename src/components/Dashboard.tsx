import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, doc, setDoc, query, where, getDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { syncScoresAndPoints } from '../firebaseUtils';
import { MatchFixture, Prediction } from '../types';
import { TEAM_FLAGS, isMatchLocked, formatNiceDate, getTeamFlagUrl } from '../utils';
import { Shield, Clock, Lock, Trophy, Plus, Minus, CheckCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

interface DashboardProps {
  userProfile: any;
}

export function Dashboard({ userProfile }: DashboardProps) {
  const [fixtures, setFixtures] = useState<MatchFixture[]>([]);
  const [predictions, setPredictions] = useState<{ [matchId: string]: Prediction }>({});
  const [pendingPredictions, setPendingPredictions] = useState<{ [matchId: string]: { home: number; away: number } }>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ [matchId: string]: 'saved' | 'saving' | 'error' | null }>({});

  const [searchTeam, setSearchTeam] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const userId = (userProfile?.id || userProfile?.name || '').toLowerCase();
  const supportedTeams: string[] = userProfile?.supportedTeams || [];

  // Admin Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncResult, setSyncResult] = useState<{ realApiCount: number; fetchError: string | null } | null>(null);
  const [syncErrorMessage, setSyncErrorMessage] = useState('');

  const handleFetchAndSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncResult(null);
    setSyncErrorMessage('');
    try {
      const result = await syncScoresAndPoints();
      setSyncResult(result);
      setSyncStatus('success');
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncErrorMessage('Failed to fetch from World Cup API.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Listen to matches
  useEffect(() => {
    const qMatches = collection(db, 'matches');
    const unsubscribe = onSnapshot(qMatches, (snapshot) => {
      const list: MatchFixture[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as MatchFixture);
      });
      // Sort matches in reverse chronological order so first played matches go to the bottom
      list.sort((a, b) => {
        const timeDiff = new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime();
        if (timeDiff !== 0) return timeDiff;
        // If identical dates, sort by ID descending so chronologically earlier match stays lower
        return b.id.localeCompare(a.id);
      });
      setFixtures(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'matches');
    });

    return unsubscribe;
  }, []);

  // Listen to predictions of the logged in user
  useEffect(() => {
    if (!userId) return;
    const qPredictions = query(collection(db, 'predictions'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(qPredictions, (snapshot) => {
      const preds: { [matchId: string]: Prediction } = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as Prediction;
        preds[data.matchId] = data;
      });
      setPredictions(preds);

      // Initialize pending counters for any prediction not loaded/updated yet
      const pending: { [matchId: string]: { home: number; away: number } } = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as Prediction;
        pending[data.matchId] = {
          home: data.homeScorePredicted ?? 0,
          away: data.awayScorePredicted ?? 0
        };
      });
      setPendingPredictions((prev) => ({ ...pending, ...prev }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'predictions');
    });

    return unsubscribe;
  }, [userId]);

  const handleScoreChange = (matchId: string, side: 'home' | 'away', change: number) => {
    const current = pendingPredictions[matchId] || { home: 0, away: 0 };
    const nextValue = Math.max(0, current[side] + change); // cannot go below 0
    setPendingPredictions({
      ...pendingPredictions,
      matchId: matchId, // required key mapping compatibility
      [matchId]: {
        ...current,
        [side]: nextValue
      }
    });

    // Reset status back to null since there are unsaved changes
    if (saveStatus[matchId]) {
      setSaveStatus({ ...saveStatus, [matchId]: null });
    }
  };

  const handleSaveAndLock = async (matchId: string, forceLock: boolean = false) => {
    const score = pendingPredictions[matchId] || { home: 0, away: 0 };
    const predictionId = `${userId}_${matchId}`;
    const predictionRef = doc(db, 'predictions', predictionId);

    setSaveStatus({ ...saveStatus, [matchId]: 'saving' });

    try {
      await setDoc(predictionRef, {
        id: predictionId,
        userId: userId,
        matchId: matchId,
        homeScorePredicted: score.home,
        awayScorePredicted: score.away,
        pointsEarned: predictions[matchId]?.pointsEarned ?? null,
        locked: forceLock ? true : (predictions[matchId]?.locked ?? false)
      }, { merge: true });

      setSaveStatus({ ...saveStatus, [matchId]: 'saved' });
      // Clear saved feedback after 2 seconds
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [matchId]: null }));
      }, 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus({ ...saveStatus, [matchId]: 'error' });
    }
  };

  const filteredFixtures = fixtures.filter((match) => {
    const matchesTeam = searchTeam
      ? match.homeTeam.toLowerCase().includes(searchTeam.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchTeam.toLowerCase())
      : true;

    const matchesDate = selectedDate
      ? match.matchDate === selectedDate
      : true;

    return matchesTeam && matchesDate;
  });

  return (
    <div className="space-y-6" id="predictions_dashboard_container">
      {/* Admin Only API Sync Section */}
      {userId?.toLowerCase() === 'jereshan' && (
        <div className="bg-zinc-950/90 p-5 rounded-2xl border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.1)] relative overflow-hidden" id="admin_sync_panel">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                ⚙️ Admin Control Panel (Jereshan Only)
              </h3>
              <p className="text-xs text-white/70 mt-1 max-w-xl">
                Fetch actual Match result outcomes from the World Cup API and automatically compute points & update league leaderboard.
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleFetchAndSync}
              disabled={isSyncing}
              className="w-full md:w-auto py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-400/20"
              id="admin_sync_btn"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  Syncing API...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-zinc-950" />
                  Sync Results & Points
                </>
              )}
            </button>
          </div>

          {/* Sync Status Banner */}
          {syncStatus === 'success' && (
            <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 font-display uppercase">
                <CheckCircle className="w-4 h-4" /> Championship Sync Accomplished!
              </span>
              {syncResult && (
                <div className="text-[11px] text-zinc-300 font-mono">
                  {syncResult.realApiCount > 0 ? (
                    <span className="text-emerald-400 font-semibold font-sans">
                      ⚡ Updated {syncResult.realApiCount} Live Matches!
                    </span>
                  ) : (
                    <span>⚽ No new finished matches in official API feed.</span>
                  )}
                  {syncResult.fetchError && (
                    <span className="text-amber-400 text-[10px] ml-2 block sm:inline">
                      (API State: {syncResult.fetchError})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {syncStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 font-semibold flex items-center gap-1.5 font-sans">
              <AlertTriangle className="w-4 h-4" />
              {syncErrorMessage || 'Failed to update from World Cup API server.'}
            </div>
          )}
        </div>
      )}

      {/* 3 Supported Teams Panel */}
      <div className="bg-zinc-950/60 p-5 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden" id="active_supporting_squads_panel">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffb703]/5 blur-3xl rounded-full"></div>
        <h3 className="font-display font-medium text-sm uppercase tracking-widest text-[#ffb703] mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#ffb703]" /> Active Supporting squads
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {supportedTeams.map((team, idx) => (
            <motion.div
              key={team}
              whileHover={{ scale: 1.02 }}
              className="bg-black/35 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-md relative"
              id={`supported_team_${idx}`}
            >
              <div className="mb-2 filter drop-shadow shrink-0">
                <img src={getTeamFlagUrl(team)} alt={team} className="w-10 h-7 object-cover rounded shadow-md border border-white/10" referrerPolicy="no-referrer" />
              </div>
              <span className="font-display font-bold text-xs sm:text-sm text-white block truncate max-w-full">
                {team}
              </span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5 block">
                Priority #{idx + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scrollable match fixtures section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
              Fixture Board
            </h2>
            <p className="text-xs text-white/75 font-sans">
              Enter scores to predict results. Predictions close on match dates.
            </p>
          </div>
        </div>

        {/* Dynamic Search & Date Filters */}
        <div className="bg-zinc-950/40 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-3 items-end mb-4" id="fixtures_filter_panel">
          <div className="flex-1 w-full">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#ffb703] mb-1">Search squad/team</label>
            <input
              type="text"
              placeholder="e.g. Spain, South Africa..."
              value={searchTeam}
              onChange={(e) => setSearchTeam(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ffb703] transition"
              id="filter_team_input"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#ffb703] mb-1">Filter by date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffb703] transition cursor-pointer"
              id="filter_date_select"
            >
              <option value="" className="bg-zinc-900">📅 All dates</option>
              {(Array.from(new Set(fixtures.map(f => f.matchDate))) as string[])
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                .map(date => (
                  <option key={date} value={date} className="bg-zinc-900">
                    {date}
                  </option>
                ))
              }
            </select>
          </div>
          {(searchTeam || selectedDate) && (
            <button
              type="button"
              onClick={() => {
                setSearchTeam('');
                setSelectedDate('');
              }}
              className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-zinc-300 rounded-lg text-xs font-mono uppercase tracking-widest border border-white/5 cursor-pointer transition"
              id="reset_filters_btn"
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-white/50 flex flex-col items-center gap-3">
            <Clock className="w-8 h-8 animate-spin text-[#ffb703]" />
            <span>Drafting matches feed...</span>
          </div>
        ) : (
          <div className="fixtures-container-theme p-3 sm:p-5 max-h-[640px] overflow-y-auto space-y-3" id="fixtures_scroll_viewport">
            {filteredFixtures.length === 0 ? (
              <div className="py-12 text-center text-white/50 border border-white/5 bg-zinc-950/20 rounded-xl flex flex-col items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-zinc-500" />
                <span className="text-xs font-sans">No matches found for your search criteria.</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTeam('');
                    setSelectedDate('');
                  }}
                  className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-xs text-white uppercase font-mono tracking-wider cursor-pointer transition"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredFixtures.map((match) => {
              const prediction = predictions[match.id];
              const isLockedByTime = isMatchLocked(match.matchDate, match.status);
              const isUserLocked = prediction?.locked === true;
              const isLocked = isLockedByTime || isUserLocked;

              const actualScoreHome = match.homeScoreActual;
              const actualScoreAway = match.awayScoreActual;
              const isFinished = match.status === 'finished';

              const currentScore = pendingPredictions[match.id] || {
                home: prediction?.homeScorePredicted ?? 0,
                away: prediction?.awayScorePredicted ?? 0
              };

              // Has prediction been changed but not saved?
              const originalHome = prediction?.homeScorePredicted ?? 0;
              const originalAway = prediction?.awayScorePredicted ?? 0;
              const isModified = prediction 
                ? (currentScore.home !== originalHome || currentScore.away !== originalAway)
                : (currentScore.home !== 0 || currentScore.away !== 0);

              return (
                <div
                  key={match.id}
                  className={`border p-3.5 sm:p-4 rounded-xl transition-all duration-150 ${
                    isFinished 
                      ? 'bg-black/40 border-white/5' 
                      : isLocked 
                      ? 'bg-black/30 border-white/5 opacity-85' 
                      : 'bg-black/25 border-white/10 hover:border-white/20 hover:bg-black/35 shadow-sm'
                  } relative`}
                  id={`fixture_card_${match.id}`}
                >
                  {/* Top bar with high density typography and status flags */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                    <span className="text-xs text-white/60 font-display font-medium tracking-wide flex items-center gap-1.5">
                      📅 {formatNiceDate(match.matchDate).toUpperCase()}
                    </span>

                    {/* Status Pill matching the spec theme */}
                    <div className="flex items-center gap-2">
                      {isFinished ? (
                        <span className="bg-emerald-950/80 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase font-display font-bold text-emerald-400">
                          Completed
                        </span>
                      ) : isLocked ? (
                        <span className="status-pill status-locked flex items-center gap-1 border border-white/5">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      ) : (
                        <span className="status-pill status-open font-display">
                          Open Predict
                        </span>
                      )}
                    </div>
                  </div>

                  {/* High Density Grid Row layout */}
                  <div className="grid grid-cols-12 gap-1.5 items-center">
                    {/* Home Team */}
                    <div className="col-span-4 text-center md:text-right flex flex-col md:flex-row-reverse items-center justify-center md:justify-start gap-2">
                      <div className="filter drop-shadow shrink-0">
                        <img src={getTeamFlagUrl(match.homeTeam)} alt={match.homeTeam} className="w-8 h-5.5 object-cover rounded shadow-md border border-white/10" referrerPolicy="no-referrer" />
                      </div>
                      <div className="text-center md:text-right min-w-0">
                        <span className="font-display font-bold text-xs sm:text-sm text-white block truncate">
                          {match.homeTeam}
                        </span>
                        {supportedTeams.includes(match.homeTeam) && (
                          <span className="text-[9px] bg-[#ffb703]/20 text-[#ffb703] font-bold tracking-wider uppercase px-1 rounded border border-[#ffb703]/20">
                            FAVE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scores & Predictors Layout with high-density .score-box elements */}
                    <div className="col-span-4 text-center px-1">
                      {/* Actual Score (if match finished) */}
                      {isFinished && (
                        <div className="mb-1">
                          <span className="text-[9px] uppercase font-semibold text-zinc-500 block">
                            Final Result
                          </span>
                          <span className="font-mono text-sm font-extrabold text-white px-2 py-0.5 bg-black/50 border border-white/5 rounded">
                            {actualScoreHome} - {actualScoreAway}
                          </span>
                        </div>
                      )}

                      {/* Scoreboard Boxes prediction values */}
                      <div className="flex flex-col items-center justify-center">
                        {isLocked ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {prediction && prediction.homeScorePredicted !== null && prediction.homeScorePredicted !== undefined && prediction.awayScorePredicted !== null && prediction.awayScorePredicted !== undefined ? (
                              <>
                                <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-display font-bold text-sm shadow">
                                  {prediction.homeScorePredicted}
                                </div>
                                <span className="text-white/40 font-bold">-</span>
                                <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-display font-bold text-sm shadow">
                                  {prediction.awayScorePredicted}
                                </div>
                              </>
                            ) : (
                              <span className="text-red-400 font-mono text-[10px] py-1">NO PREDICTION</span>
                            )}
                          </div>
                        ) : (
                          /* Interactive Counter with white score-boxes as per templates */
                          <div className="p-1 bg-black/40 border border-white/5 rounded-xl flex items-center justify-center gap-1.5">
                            {/* Home Counter */}
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleScoreChange(match.id, 'home', -1)}
                                className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white text-zinc-300 flex items-center justify-center cursor-pointer transition active:scale-90"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center font-display font-bold text-xs select-none">
                                {currentScore.home}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleScoreChange(match.id, 'home', 1)}
                                className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white text-zinc-300 flex items-center justify-center cursor-pointer transition active:scale-90"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <span className="text-white/30 font-bold">-</span>

                            {/* Away Counter */}
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleScoreChange(match.id, 'away', -1)}
                                className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white text-zinc-300 flex items-center justify-center cursor-pointer transition active:scale-90"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center font-display font-bold text-xs select-none">
                                {currentScore.away}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleScoreChange(match.id, 'away', 1)}
                                className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white text-zinc-300 flex items-center justify-center cursor-pointer transition active:scale-90"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="col-span-4 text-center md:text-left flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
                      <div className="filter drop-shadow shrink-0">
                        <img src={getTeamFlagUrl(match.awayTeam)} alt={match.awayTeam} className="w-8 h-5.5 object-cover rounded shadow-md border border-white/10" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-display font-bold text-xs sm:text-sm text-white block truncate">
                          {match.awayTeam}
                        </span>
                        {supportedTeams.includes(match.awayTeam) && (
                          <span className="text-[9px] bg-[#ffb703]/20 text-[#ffb703] font-bold tracking-wider uppercase px-1 rounded border border-[#ffb703]/20">
                            FAVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prediction Points details & Lock buttons control block footer */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs">
                    {isFinished ? (
                      <div>
                        {prediction && prediction.pointsEarned !== null && prediction.pointsEarned !== undefined ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-display font-bold uppercase ${
                            prediction.pointsEarned === 5 
                              ? 'bg-[#ffb703]/20 border border-[#ffb703]/30 text-[#ffb703]'
                              : prediction.pointsEarned === 3
                              ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                          }`}>
                            🏆 Earned: {prediction.pointsEarned} PTS
                            {prediction.pointsEarned === 5 && ' (EXACT BONUS!)'}
                            {prediction.pointsEarned === 3 && ' (OUTCOME!)'}
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-display uppercase text-[10px]">No Prediction Added</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] text-white/45 uppercase font-display">
                        {isLocked ? 'Match closed for entries' : 'Draft scores & lock in to finalize'}
                      </div>
                    )}

                    {/* Action buttons */}
                    {!isLocked && (
                      <div className="flex gap-2 w-full sm:w-auto items-center justify-end">
                        {isModified && (
                          <span className="text-[9px] text-amber-400 font-semibold uppercase animate-pulse mr-1">
                            ● Draft changes
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSaveAndLock(match.id, false)}
                          disabled={saveStatus[match.id] === 'saving'}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-display font-bold uppercase transition"
                        >
                          Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveAndLock(match.id, true)}
                          disabled={saveStatus[match.id] === 'saving'}
                          className="px-2.5 py-1 bg-[#ffb703] hover:bg-amber-400 text-zinc-950 rounded text-[10px] font-display font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                        >
                          <Lock className="w-3 h-3" /> Lock In
                        </button>
                      </div>
                    )}

                    {saveStatus[match.id] === 'saved' && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        ✓ Saved
                      </span>
                    )}
                  </div>
                </div>
              );
            })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
