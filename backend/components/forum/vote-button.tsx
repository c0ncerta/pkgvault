"use client";

import { useState, useTransition } from "react";

interface VoteButtonProps {
  targetType: "post" | "thread";
  targetId: string;
  initialScore: number;
  initialVote?: 1 | -1 | null;
}

export function VoteButton({
  targetType,
  targetId,
  initialScore,
  initialVote = null,
}: VoteButtonProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialVote);
  const [isPending, startTransition] = useTransition();

  const handleVote = (value: 1 | -1) => {
    // Optimistic update
    const newVote = userVote === value ? null : value;
    const delta = newVote === null ? -value : userVote === null ? value : value * 2; // Switching from -1 to +1 or vice versa

    setUserVote(newVote);
    setScore((prev) => prev + delta);

    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetType, targetId, value: newVote ?? 0 }),
        });
        if (!res.ok) {
          // Rollback on error
          setUserVote(userVote);
          setScore(initialScore);
        }
      } catch {
        setUserVote(userVote);
        setScore(initialScore);
      }
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <button
        type="button"
        className={`vote-btn ${userVote === 1 ? "active-up" : ""}`}
        onClick={() => handleVote(1)}
        disabled={isPending}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span
        style={{
          fontWeight: 700,
          fontSize: "0.95rem",
          color:
            userVote === 1
              ? "var(--color-accent)"
              : userVote === -1
                ? "var(--color-danger)"
                : "#e8e8ed",
        }}
      >
        {score}
      </span>
      <button
        type="button"
        className={`vote-btn ${userVote === -1 ? "active-down" : ""}`}
        onClick={() => handleVote(-1)}
        disabled={isPending}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
