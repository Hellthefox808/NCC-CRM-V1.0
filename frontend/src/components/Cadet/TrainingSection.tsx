import React from "react";
import confetti from "canvas-confetti";
import { Award } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface TrainingSectionProps {
  quizQuestions: QuizQuestion[];
  quizAnswer: { [key: number]: number };
  setQuizAnswer: (val: { [key: number]: number }) => void;
  quizSubmitted: boolean;
  setQuizSubmitted: (val: boolean) => void;
  showToast: (msg: string) => void;
}

export const TrainingSection: React.FC<TrainingSectionProps> = ({
  quizQuestions,
  quizAnswer,
  setQuizAnswer,
  quizSubmitted,
  setQuizSubmitted,
  showToast
}) => {
  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Classes, Syllabus & Practice Quiz</h2>
          <p className="text-xs text-slate-500">Weapon Training, Map Reading, Fieldcraft and 'B' & 'C' Certificate Exam Syllabus</p>
        </div>

        {/* Practice Quiz Card */}
        <div className="bg-slate-50 border-2 border-yellow-400/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <Award className="w-4 h-4 text-yellow-600" />
              <span>Interactive Practice Quiz ('B' Certificate Prep)</span>
            </h3>
            <span className="text-xs font-mono font-bold bg-yellow-400 text-slate-950 px-2 py-0.5 rounded">
              {quizQuestions.length} Questions
            </span>
          </div>

          <div className="space-y-4">
            {quizQuestions.map((q, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <p className="font-extrabold text-slate-900">{idx + 1}. {q.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizAnswer[idx] === optIdx;
                    const isCorrect = q.correct === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => !quizSubmitted && setQuizAnswer({ ...quizAnswer, [idx]: optIdx })}
                        className={`p-2 rounded-lg text-left font-bold transition-all border ${
                          quizSubmitted
                            ? isCorrect
                              ? "bg-emerald-100 border-emerald-500 text-emerald-900"
                              : isSelected
                              ? "bg-red-100 border-red-500 text-red-900"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                            : isSelected
                            ? "bg-[#002147] text-white border-[#002147]"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 italic">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}

            <div className="pt-2 flex justify-between items-center">
              {!quizSubmitted ? (
                <button
                  onClick={() => {
                    setQuizSubmitted(true);
                    confetti({ particleCount: 40 });
                    showToast("Quiz submitted! Review explanations below.");
                  }}
                  className="bg-[#002147] hover:bg-[#001838] text-white font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Submit Answers
                </button>
              ) : (
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswer({});
                  }}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Retry Quiz
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Common Words of Command Guide */}
        <div className="space-y-3">
          <h3 className="font-black text-slate-900 text-base">Essential Hindi Words of Command (Parade Drill)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-black text-[#002147]">सावधान (SAVDHAN)</p>
              <p className="text-[11px] text-slate-600">Attention position, heels together, feet at 30° angle.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-black text-[#002147]">विश्राम (VISHRAM)</p>
              <p className="text-[11px] text-slate-600">Stand at ease, left foot moved 12 inches to the left.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-black text-[#002147]">तेज चल (TEZ CHAL)</p>
              <p className="text-[11px] text-slate-600">Quick march at 120 paces/minute starting left foot.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-black text-[#002147]">सलामी शस्त्र (SALAMI SHASTRA)</p>
              <p className="text-[11px] text-slate-600">Present Arms salute for Dignitaries & Officers above Major.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-black text-[#002147]">दाहिने मुड़ (DAHINE VUR)</p>
              <p className="text-[11px] text-slate-600">Right turn at 90 degrees on right heel and left toe.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-black text-[#002147]">विसर्जन (VISARJAN)</p>
              <p className="text-[11px] text-slate-600">Dismissal of parade with salute to presiding officer.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
