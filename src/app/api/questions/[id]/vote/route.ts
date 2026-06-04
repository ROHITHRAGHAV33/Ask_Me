import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const { voterId, selectedOption } = await req.json();

    if (!voterId || selectedOption === undefined) {
      return NextResponse.json(
        { error: "Missing voterId or selectedOption" },
        { status: 400 }
      );
    }

    // 1. Fetch the question to get the correct answer, explanation, and point value
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("correct_option, explanation, points")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const isCorrect = question.correct_option === selectedOption;

    // 2. Insert the vote. Postgres unique constraint (question_id, voter_id)
    // prevents double voting.
    const { error: voteError } = await supabase.from("votes").insert({
      question_id: questionId,
      voter_id: voterId,
      selected_option: selectedOption,
      is_correct: isCorrect,
    });

    if (voteError) {
      if (voteError.code === "23505") {
        // Unique violation
        return NextResponse.json(
          { error: "You have already voted on this question" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: voteError.message }, { status: 500 });
    }

    // 3. If correct, award coins to the voter
    let updatedCoins = 0;
    if (isCorrect) {
      // Fallback to manual update: fetch current coins, then increment
      const { data: fetchedVoter } = await supabase
        .from("voters")
        .select("coins")
        .eq("voter_id", voterId)
        .single();

      const newCoins = (fetchedVoter?.coins ?? 0) + question.points;

      const { data: updatedVoter } = await supabase
        .from("voters")
        .update({ coins: newCoins })
        .eq("voter_id", voterId)
        .select("coins")
        .single();

      updatedCoins = updatedVoter?.coins ?? newCoins;
    } else {
      // Just fetch current coins
      const { data: voter } = await supabase
        .from("voters")
        .select("coins")
        .eq("voter_id", voterId)
        .single();
      updatedCoins = voter?.coins ?? 0;
    }

    return NextResponse.json({
      ok: true,
      isCorrect,
      correctOption: question.correct_option,
      explanation: question.explanation,
      coins: updatedCoins,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
