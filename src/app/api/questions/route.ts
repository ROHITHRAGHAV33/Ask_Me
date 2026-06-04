import { NextRequest, NextResponse } from "next/server";
import {
  getQuestions,
  getVoterVotes,
  getLeaderboard,
  getOrCreateVoter,
  updateUsername,
  Vote,
} from "@/lib/questions";

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

    return NextResponse.json({
      questions,
      votes,
      voter,
      leaderboard,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { voterId, username } = await req.json();

    if (!voterId || !username?.trim()) {
      return NextResponse.json({ error: "Missing voterId or username" }, { status: 400 });
    }

    const updated = await updateUsername(voterId, username.trim());
    if (!updated) {
      return NextResponse.json({ error: "Failed to update username" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
