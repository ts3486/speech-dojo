import { ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { fetchAiFeedback, generateAiFeedback, AiFeedback } from "../services/api";

// ── Icon components ──────────────────────────────────────────────────────────

function IconSparkle() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M7.5 1 L9.2 5.8 L14 7.5 L9.2 9.2 L7.5 14 L5.8 9.2 L1 7.5 L5.8 5.8 Z"
        fill="currentColor"
        fillOpacity="0.92"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" fill="#22C55E" fillOpacity="0.12" stroke="#22C55E" strokeWidth="1" />
      <path d="M5 8.5l2 2 4-4" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" fill="#F59E0B" fillOpacity="0.12" stroke="#F59E0B" strokeWidth="1" />
      <path d="M8 11V5M5.5 7.5L8 5l2.5 2.5" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" fill="#5C4EE0" fillOpacity="0.10" stroke="#5C4EE0" strokeWidth="1" />
      <path d="M5.5 11l5-5M5.5 11l-1 1M10 6.5l1 1" stroke="#5C4EE0" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 10) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-text">{label}</span>
        <span className="text-sm font-bold text-primary tabular-nums">{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #5C4EE0, #7B6CF0)",
          }}
        />
      </div>
    </div>
  );
}

function FeedbackSection({
  icon,
  title,
  content,
}: {
  icon: ReactNode;
  title: string;
  content: string;
}) {
  return (
    <div className="feedback-section">
      <div className="feedback-section__header">
        {icon}
        <span>{title}</span>
      </div>
      <p className="feedback-section__text">{content}</p>
    </div>
  );
}

function SkeletonBar({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-2.5 rounded-full skeleton"
      style={{ width }}
    />
  );
}

// ── Main component ───────────────────────────────────────────────────────────

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

  // Loading initial fetch
  if (feedbackLoading) {
    return (
      <Card title="AI Feedback">
        <div className="flex flex-col gap-3 mt-2">
          <SkeletonBar />
          <SkeletonBar width="75%" />
          <SkeletonBar width="55%" />
        </div>
      </Card>
    );
  }

  // Generating
  if (generating) {
    return (
      <Card title="AI Feedback">
        <div className="ai-feedback-generating">
          <div className="ai-feedback-generating__dots">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="ai-feedback-generating__dot"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
          <p className="ai-feedback-generating__label">Analyzing your speech…</p>
        </div>
      </Card>
    );
  }

  // No feedback yet — CTA state
  if (!feedback) {
    return (
      <Card title="AI Feedback">
        <div className="ai-feedback-cta">
          <p className="ai-feedback-cta__desc">
            Get personalized coaching on your clarity, fluency, structure, and vocabulary — powered by AI.
          </p>
          {genError && (
            <p className="text-sm text-danger" style={{ margin: 0 }}>
              {(genError as Error).message}
            </p>
          )}
          <div className="ai-feedback-cta__actions">
            <Button
              onClick={() => generate()}
              disabled={!canGenerate}
              size="lg"
              className={canGenerate ? "" : "opacity-50"}
            >
              <IconSparkle />
              {canGenerate ? "Get AI Feedback" : "Complete a session first"}
            </Button>
            {!canGenerate && (
              <p className="ai-feedback-cta__hint">
                {status !== "ended"
                  ? "Finish the session to unlock feedback."
                  : "A transcript is needed for analysis."}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Feedback loaded
  return (
    <Card title="AI Feedback">
      <div className="flex flex-col gap-6">
        {/* Overall score */}
        <div className="ai-feedback-score">
          <div className="ai-feedback-score__ring">
            <span className="ai-feedback-score__number">
              {feedback.overall_score.toFixed(1)}
            </span>
            <span className="ai-feedback-score__denom">/10</span>
          </div>
          <div className="ai-feedback-score__meta">
            <span className="ai-feedback-score__label">Overall Score</span>
            <span className="ai-feedback-score__sublabel">
              {feedback.overall_score >= 8
                ? "Excellent performance"
                : feedback.overall_score >= 6
                ? "Good progress"
                : "Keep practicing"}
            </span>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider m-0">
            Score Breakdown
          </h4>
          <ScoreBar label="Clarity" score={feedback.clarity_score} />
          <ScoreBar label="Fluency" score={feedback.fluency_score} />
          <ScoreBar label="Structure" score={feedback.structure_score} />
          <ScoreBar label="Vocabulary" score={feedback.vocabulary_score} />
        </div>

        {/* Written feedback */}
        <div className="flex flex-col gap-5 pt-2 border-t border-border">
          <FeedbackSection
            icon={<IconCheck />}
            title="Strengths"
            content={feedback.strengths}
          />
          <FeedbackSection
            icon={<IconArrowUp />}
            title="Areas to Improve"
            content={feedback.improvements}
          />
          <FeedbackSection
            icon={<IconPencil />}
            title="Suggestions"
            content={feedback.suggestions}
          />
        </div>
      </div>
    </Card>
  );
}
