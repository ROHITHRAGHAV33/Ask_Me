import { NextRequest, NextResponse } from "next/server";
import {
  getQuestions,
  getVoterVotes,
  getLeaderboard,
  getOrCreateVoter,
  updateUsername,
  Vote,
} from "@/lib/questions";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const voterId = searchParams.get("voterId");

  try {
    const questions = await getQuestions();
    const leaderboard = await getLeaderboard();

    let voter = null;
    let votes: Vote[] = [];

    if (voterId) {
      voter = await getOrCreateVoter(voterId);
      votes = await getVoterVotes(voterId);
    }

    // Aggregate statistics for polls (where correct_option === -1)
    const pollStats: Record<string, { counts: number[]; total: number }> = {};
    const pollQuestions = questions.filter(q => q.correct_option === -1);
    
    // Initialize stats
    pollQuestions.forEach(q => {
      pollStats[q.id] = {
        counts: new Array(q.options.length).fill(0),
        total: 0
      };
    });

    if (pollQuestions.length > 0) {
      // Fetch all votes cast on poll questions
      const pollIds = pollQuestions.map(q => q.id);
      const { data: pollVotes, error: votesError } = await supabase
        .from("votes")
        .select("question_id, selected_option")
        .in("question_id", pollIds);

      if (!votesError && pollVotes) {
        pollVotes.forEach(v => {
          const stats = pollStats[v.question_id];
          if (stats) {
            const optIdx = v.selected_option;
            if (optIdx >= 0 && optIdx < stats.counts.length) {
              stats.counts[optIdx]++;
              stats.total++;
            }
          }
        });
      }
    }

    return NextResponse.json({
      questions,
      votes,
      voter,
      leaderboard,
      pollStats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    // 1. Check if it's a username update
    if (json.voterId && json.username && !json.body) {
      const updated = await updateUsername(json.voterId, json.username.trim());
      if (!updated) {
        return NextResponse.json({ error: "Failed to update username" }, { status: 500 });
      }
      return NextResponse.json(updated);
    }

    // 2. Check if it's creating a new question or poll
    if (json.body && json.options && json.correct_option !== undefined && json.category) {
      const { body, options, correct_option, explanation, category, points } = json;

      const { data, error } = await supabase
        .from("questions")
        .insert({
          body: body.trim(),
          options: options.map((o: string) => o.trim()),
          correct_option,
          explanation: (explanation ?? "").trim(),
          category: category.trim(),
          points: points ?? 10,
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting question:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

