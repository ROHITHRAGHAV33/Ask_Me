"use client";

import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  options: string[];
  correct_option: number;
  explanation: string;
  category: string;
  points: number;
};

type Voter = {
  voter_id: string;
  username: string;
  coins: number;
};

type Vote = {
  question_id: string;
  selected_option: number;
  is_correct: boolean;
};

export default function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voter, setVoter] = useState<Voter | null>(null);
  const [leaderboard, setLeaderboard] = useState<Voter[]>([]);

  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [submittingVoteId, setSubmittingVoteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // For expanding nuggets
  const [expandedNugget, setExpandedNugget] = useState<number | null>(null);

  // Load initial data based on voter ID from local storage
  const loadData = async () => {
    try {
      const voterId = getVoterId();
      const res = await fetch(`/api/questions?voterId=${encodeURIComponent(voterId)}`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setVotes(data.votes);
        setVoter(data.voter);
        setLeaderboard(data.leaderboard);
        if (data.voter) {
          setUsernameInput(data.voter.username);
        }
      } else {
        setErrorMsg("Failed to load data from server");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load data";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const handleUpdateUsername = async () => {
    if (!voter || !usernameInput.trim()) return;
    setSavingUsername(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: voter.voter_id,
          username: usernameInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVoter(data);
        setEditingUsername(false);
        // Refresh leaderboard to show new username
        const lbRes = await fetch(`/api/questions?voterId=${encodeURIComponent(voter.voter_id)}`);
        const lbData = await lbRes.json();
        if (lbRes.ok) {
          setLeaderboard(lbData.leaderboard);
        }
      } else {
        setErrorMsg(data.error || "Failed to update profile name");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving name";
      setErrorMsg(message);
    } finally {
      setSavingUsername(false);
    }
  };

  const handleVote = async (questionId: string, optionIndex: number) => {
    if (!voter || submittingVoteId) return;
    setSubmittingVoteId(questionId);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/questions/${questionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: voter.voter_id,
          selectedOption: optionIndex,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        // Add vote to state
        const newVote: Vote = {
          question_id: questionId,
          selected_option: optionIndex,
          is_correct: data.isCorrect,
        };
        setVotes((prev) => [...prev, newVote]);

        // Update voter coins balance
        setVoter((prev) => (prev ? { ...prev, coins: data.coins } : null));

        // Refresh leaderboard with new scores
        const lbRes = await fetch(`/api/questions?voterId=${encodeURIComponent(voter.voter_id)}`);
        const lbData = await lbRes.json();
        if (lbRes.ok) {
          setLeaderboard(lbData.leaderboard);
        }
      } else {
        setErrorMsg(data.error || "Failed to submit vote");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error submitting vote";
      setErrorMsg(message);
    } finally {
      setSubmittingVoteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="mt-4 text-slate-400 text-sm">Entering the Arena...</p>
      </div>
    );
  }

  // Fitness Knowledge nuggets data
  const nuggets = [
    {
      title: "Myth: Spot Fat Reduction",
      short: "Doing crunches won't melt fat specifically off your belly.",
      full: "Spot reduction is a myth. When you exercise, your body burns fat globally from all areas, not just the muscle being worked. Crunches strengthen abdominal muscles, but fat loss comes from a caloric deficit, forcing your body to pull energy from fat reserves throughout your entire body.",
    },
    {
      title: "Law: Progressive Overload",
      short: "Muscles adapt to stress; you must gradually increase weights/reps.",
      full: "To grow muscle and gain strength, you must continuously challenge your muscles by increasing the stimulus over time. This is done by adding weight, performing more repetitions, increasing frequency, or improving technique. Without progressive overload, muscles have no reason to grow.",
    },
    {
      title: "Key: Active Recovery",
      short: "Rest days don't mean lying on the couch all day.",
      full: "Active recovery involves performing light exercises (like walking, yoga, or slow cycling) on rest days. This increases blood flow to damaged muscle tissues, flushing out waste products and delivering nutrient-rich blood to speed up recovery without adding muscular stress.",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Quiz Section (Left 2 columns on desktop) */}
      <div className="lg:col-span-2 space-y-6">
        {/* User profile details header card */}
        {voter && (
          <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 text-2xl font-bold">
                🏋️‍♂️
              </div>
              <div>
                {editingUsername ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      maxLength={25}
                      className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-sm text-white focus:border-emerald-400 outline-none w-44"
                    />
                    <button
                      onClick={handleUpdateUsername}
                      disabled={savingUsername}
                      className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 transition-colors disabled:opacity-50"
                    >
                      {savingUsername ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingUsername(false);
                        setUsernameInput(voter.username);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-white">
                      {voter.username}
                    </span>
                    <button
                      onClick={() => setEditingUsername(true)}
                      className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-0.5">Voter ID: {voter.voter_id.substring(0, 8)}...</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl px-5 py-3 flex items-center gap-3 shadow-inner">
              <span className="text-2xl animate-pulse">🪙</span>
              <div>
                <span className="block text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                  Balance Coins
                </span>
                <span className="text-xl font-black text-amber-400 tabular-nums">
                  {voter.coins} Pts
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-400 text-sm flex justify-between items-center">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* 10 Fitness Poll Questions */}
        <div className="space-y-6">
          {questions.map((q, idx) => {
            // Find if user already voted on this question
            const userVote = votes.find((v) => v.question_id === q.id);
            const isVoted = !!userVote;

            return (
              <div
                key={q.id}
                className={`glass-panel p-6 rounded-2xl relative ${
                  isVoted
                    ? userVote.is_correct
                      ? "border-emerald-500/40 bg-emerald-950/5 shadow-lg shadow-emerald-950/20"
                      : "border-rose-500/40 bg-rose-950/5 shadow-lg shadow-rose-950/20"
                    : ""
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-slate-950/70 border border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 px-2.5 py-1 rounded-full font-bold">
                    Q{idx + 1} • {q.category}
                  </span>
                  <span className="text-xs text-amber-400/90 font-medium">
                    🪙 {q.points} Coins
                  </span>
                </div>

                {/* Question body */}
                <h3 className="text-lg font-bold text-white mb-4 leading-relaxed">
                  {q.body}
                </h3>

                {/* Options grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = userVote?.selected_option === oIdx;
                    const isCorrectOption = q.correct_option === oIdx;

                    let buttonClass =
                      "w-full text-left p-3.5 rounded-xl border border-slate-700 bg-slate-950/20 hover:border-slate-500 text-slate-200 transition-all text-sm outline-none cursor-pointer";

                    if (isVoted) {
                      // Question has been voted on
                      if (isSelected) {
                        buttonClass = userVote.is_correct
                          ? "w-full text-left p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 text-sm font-semibold outline-none"
                          : "w-full text-left p-3.5 rounded-xl border-2 border-rose-500 bg-rose-500/10 text-rose-400 text-sm font-semibold outline-none";
                      } else if (isCorrectOption) {
                        // Highlight correct option if voter got it wrong
                        buttonClass =
                          "w-full text-left p-3.5 rounded-xl border border-emerald-500 bg-emerald-500/5 text-emerald-400/80 text-sm outline-none";
                      } else {
                        buttonClass =
                          "w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950/10 text-slate-600 text-sm outline-none cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => !isVoted && handleVote(q.id, oIdx)}
                        disabled={isVoted || submittingVoteId !== null}
                        className={buttonClass}
                      >
                        <div className="flex justify-between items-center">
                          <span>{opt}</span>
                          {isVoted && isSelected && (
                            <span>{userVote.is_correct ? "✓ Correct" : "✗ Wrong"}</span>
                          )}
                          {isVoted && !isSelected && isCorrectOption && (
                            <span className="text-xs text-emerald-500/80">Correct Answer</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Voter response feedback and explanations */}
                {isVoted && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mt-3">
                    <p className="text-xs text-slate-300 font-bold mb-1 uppercase tracking-wide flex items-center gap-1.5">
                      📖 Explanation & Insight:
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Section (Right 1 column on desktop) */}
      <div className="space-y-6">
        {/* Real-time Top 10 Leaderboard */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            🏆 Arena Leaderboard
          </h3>
          <ul className="space-y-3">
            {leaderboard.map((u, i) => {
              let medal = "▪️";
              let rankStyle = "text-slate-400";
              let cardGlow = "";

              if (i === 0) {
                medal = "🥇";
                rankStyle = "text-yellow-400 font-extrabold";
                cardGlow = "bg-yellow-500/5 border-yellow-500/20";
              } else if (i === 1) {
                medal = "🥈";
                rankStyle = "text-slate-300 font-extrabold";
                cardGlow = "bg-slate-300/5 border-slate-300/10";
              } else if (i === 2) {
                medal = "🥉";
                rankStyle = "text-amber-600 font-extrabold";
              }

              const isCurrentUser = voter && u.voter_id === voter.voter_id;

              return (
                <li
                  key={u.voter_id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border border-transparent ${cardGlow} ${
                    isCurrentUser ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-sm">{medal}</span>
                    <span className={`text-sm truncate max-w-40 ${isCurrentUser ? "font-bold text-emerald-400" : "text-slate-200"}`}>
                      {u.username}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[9px] uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold">
                        You
                      </span>
                    )}
                  </div>
                  <span className={`text-sm tabular-nums font-bold ${rankStyle}`}>
                    {u.coins} Pts
                  </span>
                </li>
              );
            })}

            {leaderboard.length === 0 && (
              <p className="text-sm text-slate-500 py-4 text-center">
                No contestants registered yet.
              </p>
            )}
          </ul>
        </div>

        {/* Fitness Knowledge Expansion Nuggets */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            📚 Fitness Nuggets
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Expand your fitness knowledge! Click any card to read deep science-based explanations.
          </p>
          <div className="space-y-3">
            {nuggets.map((n, idx) => {
              const isExpanded = expandedNugget === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setExpandedNugget(isExpanded ? null : idx)}
                  className={`p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/20 transition-all cursor-pointer select-none ${
                    isExpanded ? "bg-slate-900/40 border-slate-700 shadow-lg" : ""
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-200">{n.title}</h4>
                    <span className="text-xs text-emerald-400">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {n.short}
                  </p>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                      {n.full}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
