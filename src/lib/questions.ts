import { supabase } from "@/lib/supabase";

export type Question = {
  id: string;
  body: string;
  options: string[];
  correct_option: number;
  explanation: string;
  category: string;
  points: number;
};

export type Voter = {
  voter_id: string;
  username: string;
  coins: number;
};

export type Vote = {
  question_id: string;
  selected_option: number;
  is_correct: boolean;
};

// Fetch all questions from the database
export async function getQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, body, options, correct_option, explanation, category, points")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching questions:", error.message);
    return [];
  }
  return (data ?? []) as Question[];
}

// Fetch all votes cast by a specific voter
export async function getVoterVotes(voterId: string): Promise<Vote[]> {
  const { data, error } = await supabase
    .from("votes")
    .select("question_id, selected_option, is_correct")
    .eq("voter_id", voterId);

  if (error) {
    console.error("Error fetching voter votes:", error.message);
    return [];
  }
  return (data ?? []) as Vote[];
}

// Fetch top 10 voters ranked by coin balance
export async function getLeaderboard(): Promise<Voter[]> {
  const { data, error } = await supabase
    .from("voters")
    .select("voter_id, username, coins")
    .order("coins", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching leaderboard:", error.message);
    return [];
  }
  return (data ?? []) as Voter[];
}

// Fetch a voter's profile, or create it if it doesn't exist
export async function getOrCreateVoter(voterId: string): Promise<Voter | null> {
  // Try to select the voter
  const { data, error } = await supabase
    .from("voters")
    .select("voter_id, username, coins")
    .eq("voter_id", voterId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching voter:", error.message);
    return null;
  }

  if (data) {
    return data as Voter;
  }

  // Create new profile with a default name
  const randomId = Math.floor(100 + Math.random() * 900);
  const defaultUsername = `Fitness Warrior #${randomId}`;

  const { data: inserted, error: insertError } = await supabase
    .from("voters")
    .insert({ voter_id: voterId, username: defaultUsername, coins: 0 })
    .select("voter_id, username, coins")
    .single();

  if (insertError) {
    console.error("Error creating voter:", insertError.message);
    return null;
  }

  return inserted as Voter;
}

// Update a voter's username
export async function updateUsername(voterId: string, username: string): Promise<Voter | null> {
  const { data, error } = await supabase
    .from("voters")
    .update({ username })
    .eq("voter_id", voterId)
    .select("voter_id, username, coins")
    .single();

  if (error) {
    console.error("Error updating username:", error.message);
    return null;
  }

  return data as Voter;
}
