import { ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { fetchAiFeedback, generateAiFeedback, AiFeedback } from "../services/api";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconSparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5L9.6 6L14.5 8L9.6 10L8 14.5L6.4 10L1.5 8L6.4 6Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrendUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 10l4-4 2.5 2.5L12 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 4h3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPen() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 10) * 100);
  return (
    <div className="aifb-bar">
      <div className="aifb-bar__row">
        <span className="aifb-bar__label">{label}</span>
        <span className="aifb-bar__value">{score.toFixed(1)}</span>
      </div>
      <div className="aifb-bar__track">
        <div className="aifb-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FeedbackBlock({
  icon,
  title,
  content,
  color,
}: {
  icon: ReactNode;
  title: string;
  content: string;
  color: "green" | "amber" | "violet";
}) {
  return (
    <div className={`aifb-block aifb-block--${color}`}>
      <div className="aifb-block__header">
        <span className={`aifb-block__icon aifb-block__icon--${color}`}>{icon}</span>
        <span className="aifb-block__title">{title}</span>
      </div>
      <p className="aifb-block__text">{content}</p>
    </div>
  );
}

function SkeletonLine({ width = "100%" }: { width?: string }) {
  return <div className="aifb-skeleton" style={{ width }} />;
}

// ── Panel wrapper ─────────────────────────────────────────────────────────────

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="aifb-panel">
      <div className="aifb-panel__accent" />
      <div className="aifb-inner">
        <div className="aifb-header">
          <div className="aifb-header__icon">
            <IconSparkle />
          </div>
          <span className="aifb-header__title">AI Feedback</span>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  sessionId: string;
  hasTranscript: boolean;
  status: string;
}

export function AiFeedbackPanel({ sessionId, hasTranscript, status }: Props) {
  const queryClient = useQueryClient();
  const canGenerate = hasTranscript && status === "ended";

  const { data: feedback, isLoading: feedbackLoading } = useQuery<AiFeedback | null>({
    queryKey: ["feedback", sessionId],
    queryFn: () => fetchAiFeedback(sessionId),
    staleTime: Infinity,
    retry: false,
  });

  const { mutate: generate, isPending: generating, error: genError } = useMutation({
    mutationFn: () => generateAiFeedback(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(["feedback", sessionId], data);
    },
  });

  // Loading
  if (feedbackLoading) {
    return (
      <Panel>
        <div className="aifb-skeleton-group">
          <SkeletonLine />
          <SkeletonLine width="78%" />
          <SkeletonLine width="55%" />
          <SkeletonLine />
          <SkeletonLine width="65%" />
        </div>
      </Panel>
    );
  }

  // Generating
  if (generating) {
    return (
      <Panel>
        <div className="aifb-generating">
          <div className="aifb-generating__dots">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aifb-generating__dot" style={{ animationDelay: `${i * 0.18}s` }} />
            ))}
          </div>
          <p className="aifb-generating__label">Analyzing your speech…</p>
        </div>
      </Panel>
    );
  }

  // CTA — no feedback yet
  if (!feedback) {
    return (
      <Panel>
        <div className="aifb-cta">
          <p className="aifb-cta__desc">
            Get personalized coaching on your clarity, fluency, structure, and vocabulary — powered by AI.
          </p>
          {genError && (
            <p className="aifb-cta__error">{(genError as Error).message}</p>
          )}
          <Button
            onClick={() => generate()}
            disabled={!canGenerate}
          >
            <IconSparkle />
            {canGenerate ? "Get AI Feedback" : "Complete a session first"}
          </Button>
          {!canGenerate && (
            <p className="aifb-cta__hint">
              {status !== "ended"
                ? "Finish the session to unlock feedback."
                : "A transcript is needed for analysis."}
            </p>
          )}
        </div>
      </Panel>
    );
  }

  // Feedback loaded
  const scoreLabel =
    feedback.overall_score >= 8
      ? "Excellent"
      : feedback.overall_score >= 6
      ? "Good progress"
      : "Keep practicing";

  return (
    <Panel>
      {/* Overall score */}
      <div className="aifb-score">
        <div className="aifb-score__number-group">
          <span className="aifb-score__number">{feedback.overall_score.toFixed(1)}</span>
          <span className="aifb-score__denom">/10</span>
        </div>
        <div className="aifb-score__meta">
          <span className="aifb-score__eyebrow">Overall Score</span>
          <span className="aifb-score__label">{scoreLabel}</span>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="aifb-breakdown">
        <p className="aifb-section-heading">Score Breakdown</p>
        <ScoreBar label="Clarity" score={feedback.clarity_score} />
        <ScoreBar label="Fluency" score={feedback.fluency_score} />
        <ScoreBar label="Structure" score={feedback.structure_score} />
        <ScoreBar label="Vocabulary" score={feedback.vocabulary_score} />
      </div>

      {/* Written feedback */}
      <div className="aifb-blocks">
        <FeedbackBlock
          icon={<IconCheck />}
          title="Strengths"
          content={feedback.strengths}
          color="green"
        />
        <FeedbackBlock
          icon={<IconTrendUp />}
          title="Areas to Improve"
          content={feedback.improvements}
          color="amber"
        />
        <FeedbackBlock
          icon={<IconPen />}
          title="Suggestions"
          content={feedback.suggestions}
          color="violet"
        />
      </div>
    </Panel>
  );
}
