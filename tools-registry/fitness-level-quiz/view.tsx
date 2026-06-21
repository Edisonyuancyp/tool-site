"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const QUESTIONS = [
  {
    text: "How often do you exercise per week?",
    options: [
      { label: "Rarely / never",        score: 0 },
      { label: "1–2 days",               score: 2 },
      { label: "3–4 days",               score: 4 },
      { label: "5+ days",                score: 5 },
    ],
  },
  {
    text: "How many push-ups can you do in one set?",
    options: [
      { label: "0–5",    score: 0 },
      { label: "6–15",   score: 2 },
      { label: "16–30",  score: 4 },
      { label: "30+",    score: 5 },
    ],
  },
  {
    text: "Can you run / jog continuously for 20 minutes?",
    options: [
      { label: "No, I struggle with 5 min",   score: 0 },
      { label: "I can do about 10–15 min",     score: 2 },
      { label: "Yes, comfortably",             score: 4 },
      { label: "Yes, and much longer",         score: 5 },
    ],
  },
  {
    text: "How is your flexibility? Can you touch your toes standing?",
    options: [
      { label: "Can't reach past knees",   score: 0 },
      { label: "Reach mid-shin",           score: 2 },
      { label: "Just touch toes",          score: 3 },
      { label: "Palms flat on floor",      score: 5 },
    ],
  },
  {
    text: "How would you rate your overall energy levels daily?",
    options: [
      { label: "Often exhausted",          score: 0 },
      { label: "Moderate, some fatigue",   score: 2 },
      { label: "Good most of the day",     score: 4 },
      { label: "High energy all day",      score: 5 },
    ],
  },
  {
    text: "How is your diet quality on average?",
    options: [
      { label: "Mostly processed/fast food",    score: 0 },
      { label: "Mix of healthy and unhealthy",  score: 2 },
      { label: "Mostly whole foods",            score: 4 },
      { label: "Very clean, high protein",      score: 5 },
    ],
  },
];

const MAX_SCORE = QUESTIONS.reduce((s, q) => s + Math.max(...q.options.map(o => o.score)), 0);

const TIERS = [
  { min: 0.8,  label: "Elite",        desc: "Top fitness level — you're performing at an advanced athlete level.", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  { min: 0.6,  label: "Advanced",     desc: "Strong base of fitness — you outperform most of the general population.", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200"     },
  { min: 0.4,  label: "Intermediate", desc: "Solid foundation — with consistency you can push to advanced level.", color: "text-green-700",  bg: "bg-green-50 border-green-200"   },
  { min: 0.2,  label: "Beginner",     desc: "You're getting started — small consistent steps make a big difference.", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200"   },
  { min: 0,    label: "Sedentary",    desc: "Time to begin your fitness journey — even 15 min walks help.", color: "text-red-700",    bg: "bg-red-50 border-red-200"       },
];

export default function FitnessLevelQuizView({ variant }: ToolProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  function answer(qi: number, score: number) {
    setAnswers(prev => prev.map((v, i) => i === qi ? score : v));
  }

  const totalScore = answers.reduce<number>((s, v) => s + (v ?? 0), 0);
  const ratio = totalScore / MAX_SCORE;
  const allAnswered = answers.every(a => a !== null);
  const tier = TIERS.find(t => ratio >= t.min) || TIERS[TIERS.length - 1];

  function reset() { setAnswers(QUESTIONS.map(() => null)); setSubmitted(false); }

  return (
    <div className="space-y-6">
      {!submitted ? (
        <>
          {QUESTIONS.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <p className="text-sm font-medium text-gray-800">
                <span className="text-gray-400 mr-1">{qi + 1}.</span>{q.text}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map(opt => (
                  <button key={opt.label} onClick={() => answer(qi, opt.score)}
                    className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                      answers[qi] === opt.score
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setSubmitted(true)} disabled={!allAnswered}
            className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            See My Fitness Level →
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className={`p-6 rounded-xl border text-center ${tier.bg}`}>
            <p className="text-sm text-gray-500 mb-2">Your Fitness Level</p>
            <p className={`text-4xl font-bold mb-2 ${tier.color}`}>{tier.label}</p>
            <p className={`text-sm ${tier.color}`}>{tier.desc}</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Score</span>
              <span>{totalScore} / {MAX_SCORE}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${ratio * 100}%` }} />
            </div>
          </div>
          <div className="flex gap-3 justify-between">
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-700 underline">
              Retake quiz
            </button>
            <CopyButton text={`Fitness Level: ${tier.label} (${totalScore}/${MAX_SCORE} points)`} />
          </div>
        </div>
      )}
    </div>
  );
}
