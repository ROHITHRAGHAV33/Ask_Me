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

type NewsArticle = {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  date: string;
};

const defaultNews: NewsArticle[] = [
  {
    id: "n1",
    title: "The Science of Hypertrophy: Rep Ranges vs. Mechanical Tension",
    category: "Training",
    readTime: "4 min read",
    summary: "Recent studies challenge the traditional belief that 8-12 reps is the only zone for muscle growth, highlighting the role of mechanical tension.",
    content: "For decades, gym lore dictated that muscle hypertrophy only occurs in the 8-12 repetition range. However, recent meta-analyses in sports biomechanics have shown that hypertrophy can be achieved across a wide spectrum of reps (from 5 up to 30), provided that the sets are taken close to muscular failure. The primary driver of muscle growth is mechanical tension—the force exerted on muscle fibers during contraction. When you lift a light weight to failure, the high motor-unit recruitment creates high mechanical tension in the final reps, matching that of heavier loads. Takeaway: choose a weight that allows good form, but make sure you challenge yourself close to failure.",
    date: "June 5, 2026"
  },
  {
    id: "n2",
    title: "Zone 2 Cardio: The Biological Engine for Longevity",
    category: "Science",
    readTime: "3 min read",
    summary: "Why keeping your heart rate in a comfortable, aerobic zone is the secret to mitochondrial health and clean cellular energy production.",
    content: "Zone 2 training refers to exercise at a heart rate where you can maintain a conversation but feel the effort (about 60-70% of max heart rate). Biologically, Zone 2 is the level of intensity that maximizes mitochondrial function and fat oxidation. By training in this zone, you stimulate the growth and efficiency of mitochondria—the powerhouses of your cells. This improves metabolic flexibility, allowing your body to switch easily between burning fats and carbohydrates. Regular Zone 2 cardio acts as a preventive shield against metabolic diseases and significantly extends healthspan.",
    date: "June 4, 2026"
  },
  {
    id: "n3",
    title: "Creatine Monohydrate: Not Just for Muscles Anymore",
    category: "Biohacking",
    readTime: "4 min read",
    summary: "New clinical trials reveal that creatine supplementation significantly enhances cognitive task performance and protects against sleep deprivation.",
    content: "Creatine is renowned as the most effective supplement for power and strength. But exciting new research is shifting the spotlight to the brain. Your brain is a massive consumer of energy (ATP), and like muscles, it utilizes phosphocreatine to rapidly regenerate energy during intense cognitive stress. Clinical trials show that 5g of daily creatine supplementation improves working memory, executive function, and cognitive resilience, particularly under sleep-deprived conditions. Furthermore, it shows potential neuroprotective benefits against age-related cognitive decline.",
    date: "June 2, 2026"
  }
];

export default function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voter, setVoter] = useState<Voter | null>(null);
  const [leaderboard, setLeaderboard] = useState<Voter[]>([]);
  const [pollStats, setPollStats] = useState<Record<string, { counts: number[]; total: number }>>({});

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"quest" | "polls" | "ai" | "news">("quest");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile username edit state
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  // Voting state
  const [submittingVoteId, setSubmittingVoteId] = useState<string | null>(null);

  // Manual Quiz addition state
  const [showAddQuizForm, setShowAddQuizForm] = useState(false);
  const [quizBody, setQuizBody] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState("");
  const [quizCategory, setQuizCategory] = useState("Strength");
  const [quizPoints, setQuizPoints] = useState(10);
  const [addingQuiz, setAddingQuiz] = useState(false);

  // Manual Poll addition state
  const [showAddPollForm, setShowAddPollForm] = useState(false);
  const [pollBody, setPollBody] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [pollCategory, setPollCategory] = useState("Poll");
  const [pollPoints, setPollPoints] = useState(5);
  const [addingPoll, setAddingPoll] = useState(false);

  // AI Creator Form state
  const [aiDraft, setAiDraft] = useState("");
  const [aiIsPoll, setAiIsPoll] = useState(false);
  const [aiStyle, setAiStyle] = useState("standard");
  const [aiCategory, setAiCategory] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<Question | null>(null);
  const [aiSaving, setAiSaving] = useState(false);
  const [headerDraftInput, setHeaderDraftInput] = useState("");

  // News state
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(defaultNews);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [newsGenerating, setNewsGenerating] = useState(false);
  const [customNewsTopic, setCustomNewsTopic] = useState("");
  const [showNewsTopicInput, setShowNewsTopicInput] = useState(false);

  // Load initial data
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
        setPollStats(data.pollStats || {});
        if (data.voter) {
          setUsernameInput(data.voter.username);
        }
      } else {
        setErrorMsg("Failed to load data from server.");
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

  const triggerAlert = (type: "error" | "success", msg: string) => {
    if (type === "error") {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 6000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

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
        // Refresh leaderboard
        const lbRes = await fetch(`/api/questions?voterId=${encodeURIComponent(voter.voter_id)}`);
        const lbData = await lbRes.json();
        if (lbRes.ok) {
          setLeaderboard(lbData.leaderboard);
        }
        triggerAlert("success", "Contestant name updated successfully!");
      } else {
        triggerAlert("error", data.error || "Failed to update profile name");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving name";
      triggerAlert("error", message);
    } finally {
      setSavingUsername(false);
    }
  };

  const handleVote = async (questionId: string, optionIndex: number, isPollVote: boolean) => {
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

        // Update voter coins
        setVoter((prev) => (prev ? { ...prev, coins: data.coins } : null));

        // If it is a poll vote, update local poll percentages instantly
        if (isPollVote) {
          setPollStats((prev) => {
            const current = prev[questionId] || { counts: [0, 0, 0, 0], total: 0 };
            const updatedCounts = [...current.counts];
            if (optionIndex >= 0 && optionIndex < updatedCounts.length) {
              updatedCounts[optionIndex]++;
            }
            return {
              ...prev,
              [questionId]: {
                counts: updatedCounts,
                total: current.total + 1,
              },
            };
          });
          triggerAlert("success", `Vote cast! Earned ${questions.find(q => q.id === questionId)?.points ?? 5} coins.`);
        } else {
          if (data.isCorrect) {
            triggerAlert("success", `Correct answer! Earned ${data.coins - (voter?.coins ?? 0)} coins.`);
          } else {
            triggerAlert("error", `Incorrect answer! The correct choice was option #${data.correctOption + 1}.`);
          }
        }

        // Refresh leaderboard
        const lbRes = await fetch(`/api/questions?voterId=${encodeURIComponent(voter.voter_id)}`);
        const lbData = await lbRes.json();
        if (lbRes.ok) {
          setLeaderboard(lbData.leaderboard);
        }
      } else {
        triggerAlert("error", data.error || "Failed to submit vote");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error submitting vote";
      triggerAlert("error", message);
    } finally {
      setSubmittingVoteId(null);
    }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizBody.trim() || quizOptions.some(o => !o.trim())) {
      triggerAlert("error", "Please fill in the question body and all 4 options.");
      return;
    }
    setAddingQuiz(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: quizBody,
          options: quizOptions,
          correct_option: quizCorrect,
          explanation: quizExplanation,
          category: quizCategory,
          points: quizPoints,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions((prev) => [...prev, data]);
        // Reset form
        setQuizBody("");
        setQuizOptions(["", "", "", ""]);
        setQuizCorrect(0);
        setQuizExplanation("");
        setQuizCategory("Strength");
        setQuizPoints(10);
        setShowAddQuizForm(false);
        triggerAlert("success", "Quiz question added to the Quest Arena!");
      } else {
        triggerAlert("error", data.error || "Failed to create question");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error adding question";
      triggerAlert("error", message);
    } finally {
      setAddingQuiz(false);
    }
  };

  const handleAddPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollBody.trim() || pollOptions.some(o => !o.trim())) {
      triggerAlert("error", "Please fill in the poll question and all 4 options.");
      return;
    }
    setAddingPoll(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: pollBody,
          options: pollOptions,
          correct_option: -1, // -1 means it is a poll
          explanation: "Community Fitness Opinion Poll.",
          category: pollCategory,
          points: pollPoints,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions((prev) => [...prev, data]);
        // Initialize poll stats
        setPollStats((prev) => ({
          ...prev,
          [data.id]: { counts: [0, 0, 0, 0], total: 0 }
        }));
        // Reset form
        setPollBody("");
        setPollOptions(["", "", "", ""]);
        setPollCategory("Poll");
        setPollPoints(5);
        setShowAddPollForm(false);
        triggerAlert("success", "Your community poll has been posted online!");
      } else {
        triggerAlert("error", data.error || "Failed to create poll");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error adding poll";
      triggerAlert("error", message);
    } finally {
      setAddingPoll(false);
    }
  };

  const handleImproveWithAI = async (overrideDraft?: string) => {
    const draftToUse = overrideDraft !== undefined ? overrideDraft : aiDraft;
    if (!draftToUse.trim()) {
      triggerAlert("error", "Please enter a draft question or topic description first.");
      return;
    }
    setAiGenerating(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftQuestion: draftToUse,
          category: aiCategory,
          style: aiStyle,
          isPoll: aiIsPoll,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
        triggerAlert("success", "Gemini successfully optimized your question!");
      } else {
        triggerAlert("error", data.error || "Failed to improve question with AI");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error calling Gemini API";
      triggerAlert("error", message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleHeaderAiEnhance = () => {
    if (!headerDraftInput.trim()) return;
    setAiDraft(headerDraftInput);
    setActiveTab("ai");
    handleImproveWithAI(headerDraftInput);
    setHeaderDraftInput("");
  };

  const handleSaveAiResult = async () => {
    if (!aiResult) return;
    setAiSaving(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: aiResult.body,
          options: aiResult.options,
          correct_option: aiResult.correct_option,
          explanation: aiResult.explanation,
          category: aiResult.category,
          points: aiResult.correct_option === -1 ? 5 : 10,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions((prev) => [...prev, data]);
        if (data.correct_option === -1) {
          setPollStats((prev) => ({
            ...prev,
            [data.id]: { counts: [0, 0, 0, 0], total: 0 }
          }));
          triggerAlert("success", "AI Poll posted to Community Polls!");
        } else {
          triggerAlert("success", "AI Quiz Question saved to Quest Arena!");
        }
        setAiResult(null);
        setAiDraft("");
      } else {
        triggerAlert("error", data.error || "Failed to save AI question");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving question";
      triggerAlert("error", message);
    } finally {
      setAiSaving(false);
    }
  };

  const handleGenerateNewsInsight = async () => {
    setNewsGenerating(true);
    try {
      const res = await fetch("/api/ai/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: customNewsTopic,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const generatedArticle: NewsArticle = {
          id: `ai-${Date.now()}`,
          title: data.title,
          category: data.category,
          readTime: data.readTime,
          summary: data.summary,
          content: data.content,
          date: data.date,
        };
        setNewsArticles((prev) => [generatedArticle, ...prev]);
        setSelectedArticle(generatedArticle);
        setCustomNewsTopic("");
        setShowNewsTopicInput(false);
        triggerAlert("success", "New AI Fitness Insight generated!");
      } else {
        triggerAlert("error", data.error || "Failed to generate AI fitness insight.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error generating news";
      triggerAlert("error", message);
    } finally {
      setNewsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
          <span className="absolute text-xl animate-pulse">⚡</span>
        </div>
        <p className="mt-6 text-slate-400 text-sm tracking-widest font-bold uppercase pulse-glow">
          Entering the Arena...
        </p>
      </div>
    );
  }

  // Filter lists based on tab
  const quizQuestions = questions.filter((q) => q.correct_option >= 0);
  const pollQuestions = questions.filter((q) => q.correct_option === -1);

  return (
    <div className="space-y-6">
      {/* Voter Status Card */}
      {voter && (
        <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 border-l-4 border-l-cyan-500">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 text-2xl font-bold shadow-lg shadow-cyan-900/30">
              🏆
            </div>
            <div className="flex-1">
              {editingUsername ? (
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    maxLength={25}
                    className="cyber-input px-3 py-1.5 rounded-lg text-sm text-white w-48 font-semibold"
                  />
                  <button
                    onClick={handleUpdateUsername}
                    disabled={savingUsername}
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingUsername ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingUsername(false);
                      setUsernameInput(voter.username);
                    }}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-xl text-white tracking-tight glow-text-cyan">
                    {voter.username}
                  </span>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                  >
                    ✏️ Name
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Voter Hash: {voter.voter_id.substring(0, 16)}...</p>
            </div>
          </div>

          {/* AI Search Bar on Top Right/Center */}
          <div className="relative flex-1 max-w-sm w-full my-2 md:my-0">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔮</span>
            <input
              type="text"
              placeholder="Improve any fitness question with AI..."
              value={headerDraftInput}
              onChange={(e) => setHeaderDraftInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleHeaderAiEnhance();
                }
              }}
              className="cyber-input w-full pl-9 pr-24 py-2 rounded-xl text-xs text-slate-200 placeholder:text-slate-500"
            />
            <button
              onClick={handleHeaderAiEnhance}
              className="absolute right-1 top-1 bottom-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 px-3.5 rounded-lg text-slate-950 font-bold text-[10px] cursor-pointer transition-all active:scale-95 flex items-center justify-center"
            >
              Enhance
            </button>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl px-6 py-3.5 flex items-center gap-4 shadow-inner min-w-[200px] justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">🪙</span>
              <div>
                <span className="block text-[10px] uppercase font-black text-amber-500 tracking-wider">
                  Wallet Balance
                </span>
                <span className="text-xl font-black text-amber-400 tabular-nums">
                  {voter.coins} Coins
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Alerts */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-400 text-sm flex justify-between items-center animate-pulse">
          <span className="flex items-center gap-2">⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-sm flex justify-between items-center">
          <span className="flex items-center gap-2">✨ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Modern Dashboard Navigation Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => { setActiveTab("quest"); setErrorMsg(null); }}
          className={`tab-btn flex items-center gap-2 px-6 py-4.5 text-sm font-bold text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "quest" ? "active text-white border-cyan-500" : ""
          }`}
        >
          <span>⚔️</span> Quest Arena
        </button>
        <button
          onClick={() => { setActiveTab("polls"); setErrorMsg(null); }}
          className={`tab-btn flex items-center gap-2 px-6 py-4.5 text-sm font-bold text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "polls" ? "active text-white border-cyan-500" : ""
          }`}
        >
          <span>📊</span> Community Polls
        </button>
        <button
          onClick={() => { setActiveTab("ai"); setErrorMsg(null); }}
          className={`tab-btn flex items-center gap-2 px-6 py-4.5 text-sm font-bold text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ai" ? "active text-white border-cyan-500" : ""
          }`}
        >
          <span>🔮</span> AI Creator
        </button>
        <button
          onClick={() => { setActiveTab("news"); setErrorMsg(null); }}
          className={`tab-btn flex items-center gap-2 px-6 py-4.5 text-sm font-bold text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "news" ? "active text-white border-cyan-500" : ""
          }`}
        >
          <span>📰</span> Fitness Pulse
        </button>
      </div>

      {/* Main Tab Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE VIEW (Takes 2 cols on wide screens) */}
        <div className="lg:col-span-2 space-y-6">

          {/* ================= SECTION 3: QUEST ARENA ================= */}
          {activeTab === "quest" && (
            <div className="space-y-6">
              
              {/* Add Quiz Form Header */}
              <div className="glass-panel p-5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">Challenge the Community</h3>
                    <p className="text-xs text-slate-400 mt-1">Submit a fitness trivia question for lifters to solve!</p>
                  </div>
                  <button
                    onClick={() => setShowAddQuizForm(!showAddQuizForm)}
                    className="bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {showAddQuizForm ? "Close Form" : "Create Quiz Question ⚔️"}
                  </button>
                </div>

                {showAddQuizForm && (
                  <form onSubmit={handleAddQuiz} className="mt-5 space-y-4 pt-4 border-t border-slate-800">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">Question Body</label>
                      <textarea
                        value={quizBody}
                        onChange={(e) => setQuizBody(e.target.value)}
                        placeholder="Draft your question... (e.g., Which compound lift burns the most calories?)"
                        className="cyber-input w-full p-3 rounded-xl text-sm text-slate-200 h-20 placeholder:text-slate-600"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quizOptions.map((opt, i) => (
                        <div key={i}>
                          <label className="block text-xs text-slate-500 font-bold mb-1">Option #{i + 1}</label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const copy = [...quizOptions];
                              copy[i] = e.target.value;
                              setQuizOptions(copy);
                            }}
                            placeholder={`Choice ${i + 1}`}
                            className="cyber-input w-full p-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-600"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">Correct Option</label>
                        <select
                          value={quizCorrect}
                          onChange={(e) => setQuizCorrect(parseInt(e.target.value))}
                          className="cyber-input w-full p-2.5 rounded-xl text-sm text-slate-200 cursor-pointer"
                        >
                          <option value={0}>Option #1</option>
                          <option value={1}>Option #2</option>
                          <option value={2}>Option #3</option>
                          <option value={3}>Option #4</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">Category</label>
                        <select
                          value={quizCategory}
                          onChange={(e) => setQuizCategory(e.target.value)}
                          className="cyber-input w-full p-2.5 rounded-xl text-sm text-slate-200 cursor-pointer"
                        >
                          <option value="Strength">Strength</option>
                          <option value="Nutrition">Nutrition</option>
                          <option value="Cardio">Cardio</option>
                          <option value="Flexibility">Flexibility</option>
                          <option value="Recovery">Recovery</option>
                          <option value="Health">Health</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">Coins Value</label>
                        <input
                          type="number"
                          value={quizPoints}
                          onChange={(e) => setQuizPoints(Math.max(1, parseInt(e.target.value) || 10))}
                          className="cyber-input w-full p-2.5 rounded-xl text-sm text-slate-200"
                          min={1}
                          max={100}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">Explanation (Educational context)</label>
                      <input
                        type="text"
                        value={quizExplanation}
                        onChange={(e) => setQuizExplanation(e.target.value)}
                        placeholder="Explain why the selected option is correct..."
                        className="cyber-input w-full p-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingQuiz}
                      className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 font-bold p-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 text-sm"
                    >
                      {addingQuiz ? "Saving..." : "Add to Quest Arena ⚔️"}
                    </button>
                  </form>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {quizQuestions.slice().reverse().map((q) => {
                  const userVote = votes.find((v) => v.question_id === q.id);
                  const isVoted = !!userVote;

                  return (
                    <div
                      key={q.id}
                      className={`glass-panel p-6 rounded-2xl relative transition-all ${
                        isVoted
                          ? userVote.is_correct
                            ? "border-emerald-500/30 bg-emerald-950/5 shadow-emerald-950/20"
                            : "border-rose-500/30 bg-rose-950/5 shadow-rose-950/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="bg-slate-950/70 border border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 px-3 py-1 rounded-full font-black">
                          {q.category}
                        </span>
                        <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                          🪙 {q.points} Coins
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-4 leading-relaxed">
                        {q.body}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userVote?.selected_option === oIdx;
                          const isCorrectOption = q.correct_option === oIdx;

                          let buttonStyle = "w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 hover:border-slate-600 text-slate-300 transition-all text-sm outline-none cursor-pointer";

                          if (isVoted) {
                            if (isSelected) {
                              buttonStyle = userVote.is_correct
                                ? "w-full text-left p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 text-sm font-bold outline-none"
                                : "w-full text-left p-3.5 rounded-xl border-2 border-rose-500 bg-rose-500/10 text-rose-400 text-sm font-bold outline-none";
                            } else if (isCorrectOption) {
                              buttonStyle = "w-full text-left p-3.5 rounded-xl border border-emerald-500/50 bg-emerald-500/5 text-emerald-400/80 text-sm font-medium outline-none";
                            } else {
                              buttonStyle = "w-full text-left p-3.5 rounded-xl border border-slate-900 bg-slate-950/10 text-slate-600 text-sm outline-none cursor-not-allowed";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => !isVoted && handleVote(q.id, oIdx, false)}
                              disabled={isVoted || submittingVoteId !== null}
                              className={buttonStyle}
                            >
                              <div className="flex justify-between items-center">
                                <span>{opt}</span>
                                {isVoted && isSelected && (
                                  <span className="text-xs">{userVote.is_correct ? "✓ Correct" : "✗ Incorrect"}</span>
                                )}
                                {isVoted && !isSelected && isCorrectOption && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Answer</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {isVoted && (
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mt-3">
                          <p className="text-xs text-slate-400 font-black mb-1 uppercase tracking-wide flex items-center gap-1.5">
                            📖 Insight:
                          </p>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {quizQuestions.length === 0 && (
                  <p className="text-slate-500 text-center py-12 text-sm">No quiz challenges available yet. Be the first to create one!</p>
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION 2: COMMUNITY POLLS ================= */}
          {activeTab === "polls" && (
            <div className="space-y-6">
              
              {/* Create Poll Card */}
              <div className="glass-panel p-5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">Launch an Opinion Poll</h3>
                    <p className="text-xs text-slate-400 mt-1">Get instant feedback and vote tallies from fitness fans.</p>
                  </div>
                  <button
                    onClick={() => setShowAddPollForm(!showAddPollForm)}
                    className="bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {showAddPollForm ? "Close Form" : "Create New Poll 📊"}
                  </button>
                </div>

                {showAddPollForm && (
                  <form onSubmit={handleAddPoll} className="mt-5 space-y-4 pt-4 border-t border-slate-800">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">Poll Question</label>
                      <input
                        type="text"
                        value={pollBody}
                        onChange={(e) => setPollBody(e.target.value)}
                        placeholder="e.g., What is your favorite time of day to work out?"
                        className="cyber-input w-full p-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-600"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pollOptions.map((opt, i) => (
                        <div key={i}>
                          <label className="block text-xs text-slate-500 font-bold mb-1">Choice Option #{i + 1}</label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const copy = [...pollOptions];
                              copy[i] = e.target.value;
                              setPollOptions(copy);
                            }}
                            placeholder={`Choice ${i + 1}`}
                            className="cyber-input w-full p-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-600"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">Poll Category</label>
                        <input
                          type="text"
                          value={pollCategory}
                          onChange={(e) => setPollCategory(e.target.value)}
                          placeholder="e.g. Cardio, Diet, Workout"
                          className="cyber-input w-full p-2.5 rounded-xl text-sm text-slate-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">Coins Rewarded for Voting</label>
                        <input
                          type="number"
                          value={pollPoints}
                          onChange={(e) => setPollPoints(Math.max(1, parseInt(e.target.value) || 5))}
                          className="cyber-input w-full p-2.5 rounded-xl text-sm text-slate-200"
                          min={1}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={addingPoll}
                      className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 font-bold p-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 text-sm"
                    >
                      {addingPoll ? "Posting..." : "Post Community Poll 📊"}
                    </button>
                  </form>
                )}
              </div>

              {/* Poll List */}
              <div className="space-y-6">
                {pollQuestions.slice().reverse().map((q) => {
                  const userVote = votes.find((v) => v.question_id === q.id);
                  const isVoted = !!userVote;

                  // Get stats
                  const stats = pollStats[q.id] || { counts: [0, 0, 0, 0], total: 0 };
                  const total = stats.total || 0;

                  return (
                    <div key={q.id} className="glass-panel p-6 rounded-2xl relative border-l-4 border-l-cyan-500">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="bg-slate-950/70 border border-slate-800 text-[10px] uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full font-black">
                          🔥 COMMUNITY POLL • {q.category}
                        </span>
                        <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                          🪙 {q.points} Coins reward
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-4 leading-relaxed">
                        {q.body}
                      </h3>

                      <div className="space-y-3.5">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userVote?.selected_option === oIdx;
                          const voteCount = stats.counts[oIdx] || 0;
                          const percent = total > 0 ? Math.round((voteCount / total) * 100) : 0;

                          if (isVoted) {
                            return (
                              <div key={oIdx} className="relative p-3.5 rounded-xl border border-slate-800 overflow-hidden bg-slate-950/15">
                                {/* Percentage bar overlay */}
                                <div
                                  className={`absolute top-0 left-0 bottom-0 ${
                                    isSelected
                                      ? "bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border-r border-cyan-500/30"
                                      : "bg-slate-800/20"
                                  } poll-progress-bar`}
                                  style={{ width: `${percent}%` }}
                                />
                                
                                <div className="relative z-10 flex justify-between items-center text-sm font-semibold text-slate-200">
                                  <span className="flex items-center gap-2">
                                    {opt}
                                    {isSelected && (
                                      <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-black uppercase">My Vote</span>
                                    )}
                                  </span>
                                  <span className="text-xs tabular-nums text-slate-400">
                                    {voteCount} votes ({percent}%)
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleVote(q.id, oIdx, true)}
                              disabled={submittingVoteId !== null}
                              className="w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 hover:border-cyan-500/50 hover:bg-slate-900/40 text-slate-300 transition-all text-sm outline-none cursor-pointer flex justify-between items-center"
                            >
                              <span>{opt}</span>
                              <span className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Select 🗳️</span>
                            </button>
                          );
                        })}
                      </div>

                      {isVoted && (
                        <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5 justify-end">
                          📊 Total votes cast: <span className="text-slate-300 font-bold tabular-nums">{total}</span>
                        </p>
                      )}
                    </div>
                  );
                })}

                {pollQuestions.length === 0 && (
                  <p className="text-slate-500 text-center py-12 text-sm">No community polls available. Be the first to create one!</p>
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION 1: AI CREATOR ================= */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl relative border-l-4 border-l-purple-500">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  🔮 AI Question Improver & Generator
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Input a rough draft or topic. Gemini will rewrite the question to be precise, clear, and scientifically correct, formulating 4 options and a detailed explanation.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">
                      Draft Question / Topic
                    </label>
                    <textarea
                      value={aiDraft}
                      onChange={(e) => setAiDraft(e.target.value)}
                      placeholder="e.g. 'is squat good for glute' or 'why does coffee help before workout?'"
                      className="cyber-input w-full p-4 rounded-xl text-sm text-slate-200 h-28 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">
                        Style / Tone
                      </label>
                      <select
                        value={aiStyle}
                        onChange={(e) => setAiStyle(e.target.value)}
                        className="cyber-input w-full p-3 rounded-xl text-sm text-slate-200 cursor-pointer"
                      >
                        <option value="standard">Standard (Clear & Educational)</option>
                        <option value="expert">Expert (Challenging & Advanced Science)</option>
                        <option value="funny">Funny (Witty & Gym Humor)</option>
                        <option value="scientific">Scientific (Evidence-backed & Biological)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 font-black mb-1.5">
                        Suggested Category
                      </label>
                      <input
                        type="text"
                        value={aiCategory}
                        onChange={(e) => setAiCategory(e.target.value)}
                        placeholder="e.g. Nutrition, Cardio, Recovery (Optional)"
                        className="cyber-input w-full p-3 rounded-xl text-sm text-slate-200 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-white">Create as Opinion Poll?</span>
                      <span className="block text-[11px] text-slate-500">If active, there is no single correct answer.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiIsPoll}
                        onChange={(e) => setAiIsPoll(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <button
                    onClick={() => handleImproveWithAI()}
                    disabled={aiGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black p-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 text-sm shadow-lg shadow-purple-900/20"
                  >
                    {aiGenerating ? "Gemini is writing the science..." : "Optimize with Gemini 3.5 🔮"}
                  </button>
                </div>
              </div>

              {/* AI Generation Result Card */}
              {aiResult && (
                <div className="glass-panel p-6 rounded-2xl border border-purple-500/50 shadow-purple-950/20 relative animate-fade-in glass-panel-glow-purple">
                  <div className="absolute -top-3 right-6 bg-purple-600 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                    Refined by AI
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-slate-950/70 border border-slate-800 text-[10px] uppercase tracking-wider text-purple-400 px-3 py-1 rounded-full font-black">
                      Category: {aiResult.category}
                    </span>
                    <span className="text-xs text-amber-500 font-bold">
                      🪙 {aiResult.correct_option === -1 ? "5 (Poll)" : "10 (Quiz)"} Coins Value
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white mb-4 leading-relaxed">
                    {aiResult.body}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {aiResult.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-3.5 rounded-xl border text-sm flex justify-between items-center ${
                          aiResult.correct_option === oIdx
                            ? "border-emerald-500/50 bg-emerald-950/10 text-emerald-400 font-bold"
                            : "border-slate-800 bg-slate-950/10 text-slate-400"
                        }`}
                      >
                        <span>{opt}</span>
                        {aiResult.correct_option === oIdx && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Correct Option</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 mb-5">
                    <p className="text-xs text-purple-400 font-black mb-1 uppercase tracking-wide">
                      📖 AI Science Insight:
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {aiResult.explanation}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveAiResult}
                      disabled={aiSaving}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-slate-950 font-black p-3.5 rounded-xl transition-all cursor-pointer text-sm"
                    >
                      {aiSaving ? "Saving..." : aiResult.correct_option === -1 ? "Post as Community Poll 📊" : "Save as Quiz Question ⚔️"}
                    </button>
                    <button
                      onClick={() => setAiResult(null)}
                      className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-5 py-3.5 rounded-xl transition-all cursor-pointer text-sm"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= EXTRA FEATURE: FITNESS PULSE NEWS ================= */}
          {activeTab === "news" && (
            <div className="space-y-6">
              
              {/* Generate AI news insight card */}
              <div className="glass-panel p-6 rounded-2xl relative border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      📰 Fitness Pulse & AI Insights
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Read scientific health briefs. Refreshed dynamically using Google AI.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNewsTopicInput(!showNewsTopicInput)}
                      className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      {showNewsTopicInput ? "Cancel" : "Set Custom Topic"}
                    </button>
                    <button
                      onClick={handleGenerateNewsInsight}
                      disabled={newsGenerating}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer hover:opacity-95 shadow-md shadow-emerald-900/10"
                    >
                      {newsGenerating ? "Writing..." : "💡 Generate AI Insight"}
                    </button>
                  </div>
                </div>

                {showNewsTopicInput && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 animate-fade-in">
                    <label className="block text-xs text-slate-500 font-bold">What topic should the AI write about?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customNewsTopic}
                        onChange={(e) => setCustomNewsTopic(e.target.value)}
                        placeholder="e.g. 'benefits of sauna', 'omega 3 fish oil for joints'"
                        className="cyber-input flex-1 px-3.5 py-2 rounded-xl text-sm text-slate-200 placeholder:text-slate-600"
                      />
                      <button
                        onClick={handleGenerateNewsInsight}
                        disabled={newsGenerating || !customNewsTopic.trim()}
                        className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-cyan-400 disabled:opacity-50"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* News Articles Feed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newsArticles.map((art) => (
                  <div
                    key={art.id}
                    className="glass-panel p-5 rounded-2xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                    onClick={() => setSelectedArticle(art)}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="bg-slate-950/70 border border-slate-800 text-[9px] uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                          {art.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{art.readTime}</span>
                      </div>
                      
                      <h4 className="text-base font-black text-white line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500">
                      <span>{art.date}</span>
                      <span className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                        Read Article ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* News Detail Modal */}
              {selectedArticle && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="glass-panel max-w-2xl w-full rounded-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 relative border-emerald-500/30">
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                    >
                      ✕
                    </button>

                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md">
                        {selectedArticle.category}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">{selectedArticle.readTime}</span>
                    </div>

                    <h3 className="text-2xl font-black text-white leading-tight mb-4 pr-6">
                      {selectedArticle.title}
                    </h3>
                    
                    <p className="text-slate-500 text-xs font-semibold mb-6">
                      Published: {selectedArticle.date} • Verified Science
                    </p>

                    <div className="text-slate-300 text-sm leading-relaxed space-y-4 pt-4 border-t border-slate-850">
                      {selectedArticle.content.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-850 flex justify-end">
                      <button
                        onClick={() => setSelectedArticle(null)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl cursor-pointer text-xs transition-colors"
                      >
                        Done Reading
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: LEADERBOARD & TRIVIA (Takes 1 col on wide screens) */}
        <div className="space-y-6">
          
          {/* Live Arena Leaderboard */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            {/* Background absolute accent */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
            
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 border-b border-slate-800/80 pb-3">
              🏆 Arena Leaderboard
            </h3>
            
            <ul className="space-y-3.5">
              {leaderboard.map((u, i) => {
                let rankBadge = "▪️";
                let rankStyle = "text-slate-400";
                let cardGlow = "border-transparent bg-slate-900/10";

                if (i === 0) {
                  rankBadge = "🥇";
                  rankStyle = "text-amber-400 font-black";
                  cardGlow = "bg-amber-500/5 border-amber-500/20";
                } else if (i === 1) {
                  rankBadge = "🥈";
                  rankStyle = "text-slate-300 font-black";
                  cardGlow = "bg-slate-300/5 border-slate-300/10";
                } else if (i === 2) {
                  rankBadge = "🥉";
                  rankStyle = "text-amber-600 font-black";
                }

                const isCurrentUser = voter && u.voter_id === voter.voter_id;

                return (
                  <li
                    key={u.voter_id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${cardGlow} ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-cyan-950/20 to-emerald-950/20 border-cyan-500/30 text-cyan-400"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-sm">{rankBadge}</span>
                      <span className={`text-sm truncate max-w-[130px] font-bold ${
                        isCurrentUser ? "text-cyan-400" : "text-slate-200"
                      }`}>
                        {u.username}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[8px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                    <span className={`text-sm tabular-nums font-black ${rankStyle}`}>
                      {u.coins} Pts
                    </span>
                  </li>
                );
              })}

              {leaderboard.length === 0 && (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No contestants registered yet.
                </p>
              )}
            </ul>
          </div>

          {/* Educational Trivia Panel */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 border-b border-slate-800/80 pb-3">
              📚 Fitness Nuggets
            </h3>
            
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/15">
                <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">Recovery Science</span>
                <h4 className="text-sm font-bold text-slate-200 mt-1">Active vs. Passive Recovery</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Lying on the couch (passive recovery) clears lactic acid slower than going for a light walk (active recovery). Increasing blood circulation sends key nutrients to repair micro-tears in muscles.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/15">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-500">Diet & Metabolism</span>
                <h4 className="text-sm font-bold text-slate-200 mt-1">The Thermic Effect of Food (TEF)</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Protein has the highest thermic effect—about 20-30% of its calories are burned just during digestion. In contrast, fats have a TEF of only 0-3%.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/15">
                <span className="text-[10px] uppercase font-black tracking-wider text-purple-400">Biomechanics</span>
                <h4 className="text-sm font-bold text-slate-200 mt-1">Dynamic Stretching Pre-Workout</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Static stretching before lifting can temporarily reduce muscle power output by up to 10%. Instead, use dynamic movements to raise tissue temperature and prepare joints.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

