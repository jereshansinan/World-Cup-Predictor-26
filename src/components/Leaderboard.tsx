import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { UserStats } from '../types';
import { TEAM_FLAGS, getTeamFlagUrl } from '../utils';
import { Shield, Medal, Award, Flame, AlertTriangle } from 'lucide-react';

export function Leaderboard() {
  const [rankings, setRankings] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qUsers = collection(db, 'users');
    const unsubscribe = onSnapshot(qUsers, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          userId: data.id,
          name: data.name,
          supportedTeams: data.supportedTeams || [],
          totalPoints: data.totalPoints ?? 0,
          correctOutcomes: data.correctOutcomes ?? 0,
          exactScores: data.exactScores ?? 0,
          teamPenalties: data.teamPenalties ?? 0,
          teamBonuses: data.teamBonuses ?? 0
        });
      });

      // Sort by points descending, then correct outcomes descending, then exact match scores descending
      list.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return b.correctOutcomes - a.correctOutcomes;
      });

      setRankings(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6" id="leaderboard_ranking_container">
      {/* Interactive Leaderboard Header Info */}
      <div className="flex justify-between items-center pb-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
            League Standing Table
          </h2>
          <p className="text-xs text-white/75 font-sans leading-relaxed">
            Real-time predictor reckonings. Correct Winner = <strong className="text-white">3 PTS</strong> | Exact Score = <strong className="text-white">+2 PTS</strong> | Supported Wins = <strong className="text-emerald-400">+2 PTS</strong> | Supported Draws = <strong className="text-emerald-300">+1 PTS</strong> | Supported Fails = <strong className="text-red-400">-2 PTS</strong>.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/50 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#ffb703] border-t-transparent animate-spin"></div>
          <span>Drafting final stand tables...</span>
        </div>
      ) : rankings.length === 0 ? (
        <div className="p-8 text-center bg-black/45 rounded-xl border border-white/10 text-white/40 font-display">
          No matches linked yet. Connect profiles at the main lobby to initialize.
        </div>
      ) : (
        <div className="bg-zinc-950/80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl" id="leaderboard_scroll_viewport">
          {/* Scrollable table container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/80 text-white/60 text-[10px] sm:text-xs uppercase tracking-wider font-display font-medium border-b border-white/15">
                  <th className="py-3 px-4 text-center w-12">Pos</th>
                  <th className="py-3 px-4">Manager</th>
                  <th className="py-3 px-4 text-center">Supported Squads</th>
                  <th className="py-3 px-4 text-center">Correct Wins (3pt)</th>
                  <th className="py-3 px-4 text-center">Exacts (+2pt)</th>
                  <th className="py-3 px-4 text-center text-emerald-400">Flag Bonuses</th>
                  <th className="py-3 px-4 text-center text-red-400">Flag Penalties</th>
                  <th className="py-3 px-4 text-right pr-6 text-[#ffb703] font-bold">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {rankings.map((user, index) => {
                  const pos = index + 1;
                  const isFirst = pos === 1;

                  return (
                    <motion.tr
                       key={user.userId}
                       whileHover={{ backgroundColor: 'rgba(255, 183, 3, 0.03)' }}
                       className={`transition duration-150 ${
                         isFirst 
                           ? 'bg-[#ffb703]/5 text-[#ffb703] font-semibold' 
                           : 'text-white/90'
                       }`}
                       id={`manager_row_${user.userId}`}
                     >
                       {/* Rank Position Column */}
                       <td className="py-3.5 px-4 text-center font-mono font-bold">
                         <div className="flex justify-center items-center">
                           {isFirst ? (
                             <motion.span 
                               animate={{ scale: [1, 1.15, 1] }}
                               transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                               className="text-lg"
                               title="League Crown Champion"
                               id="crown_leader_mark"
                             >
                               👑
                             </motion.span>
                           ) : (
                             <span className="text-white/60 font-mono text-xs">
                               {pos}
                             </span>
                           )}
                         </div>
                       </td>
 
                       {/* Name Card */}
                       <td className="py-3.5 px-4 font-display font-medium tracking-wide">
                         <div className="flex items-center gap-1.5">
                           <span className={`${isFirst ? 'text-[#ffb703] font-bold text-sm select-all' : 'text-white/90'}`}>
                             {user.name}
                           </span>
                           {isFirst && (
                             <span className="text-[9px] bg-[#ffb703] text-black px-1.5 py-0.5 rounded font-extrabold leading-none uppercase">
                               Leader
                             </span>
                           )}
                         </div>
                       </td>

                      {/* Loved lists flag motifs */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
                          {user.supportedTeams.map((team: string) => (
                            <img
                              key={team}
                              src={getTeamFlagUrl(team)}
                              alt={team}
                              className="w-5 h-3.5 object-cover rounded shadow-sm cursor-help filter drop-shadow hover:scale-115 transition shrink-0"
                              title={team}
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                      </td>

                      {/* Correct Outcomes Stats */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="bg-black/30 border border-white/5 px-2.5 py-1 rounded text-white/80">
                          {user.correctOutcomes}
                        </span>
                      </td>

                      {/* Exact Scores Stats */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="bg-black/30 border border-white/5 px-2.5 py-1 rounded text-[#ffb703]/90 font-semibold">
                          {user.exactScores}
                        </span>
                      </td>

                      {/* Team Bonuses Stats */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {(user.teamBonuses ?? 0) > 0 ? (
                          <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold">
                            +{user.teamBonuses}
                          </span>
                        ) : (
                          <span className="text-white/30 font-medium">-</span>
                        )}
                      </td>

                      {/* Team Penalties Stats */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {user.teamPenalties > 0 ? (
                          <span className="bg-[#e63946]/10 border border-[#e63946]/20 px-2 py-0.5 rounded text-[#e63946] font-bold">
                            -{user.teamPenalties}
                          </span>
                        ) : (
                          <span className="text-white/30 font-medium">-</span>
                        )}
                      </td>

                      {/* Total accumulated points score details */}
                      <td className="py-3.5 px-4 text-right pr-6 font-mono font-black text-sm sm:text-base">
                        <span className={isFirst ? "text-[#ffb703] font-black filter drop-shadow-[0_0_8px_rgba(255,183,3,0.4)]" : "text-white"}>
                          {user.totalPoints} PTS
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
