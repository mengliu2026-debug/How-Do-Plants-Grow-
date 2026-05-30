import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageCircleCode, Volume2 } from 'lucide-react';

interface HelpfulBuddyProps {
  message: string;
  messageZh: string;
  mood?: 'happy' | 'excited' | 'studying' | 'cheering';
}

export default function HelpfulBuddy({ message, messageZh, mood = 'happy' }: HelpfulBuddyProps) {
  const speakMessage = () => {
    // Read the English message using Speech Synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // speak slightly slower for kids
      window.speechSynthesis.speak(utterance);
    }
  };

  const getMascotSvg = () => {
    switch (mood) {
      case 'excited':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md">
            {/* Body */}
            <circle cx="50" cy="55" r="32" fill="#86efac" />
            <circle cx="50" cy="55" r="28" fill="#4ade80" />
            {/* Cheeks */}
            <circle cx="34" cy="62" r="5" fill="#f87171" opacity="0.6" />
            <circle cx="66" cy="62" r="5" fill="#f87171" opacity="0.6" />
            {/* Excited Eyes */}
            <path d="M 30 50 L 36 46 L 30 42" stroke="#14532d" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 70 50 L 64 46 L 70 42" stroke="#14532d" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Huge Open Smile */}
            <path d="M 40 60 Q 50 72 60 60 Z" fill="#991b1b" stroke="#14532d" strokeWidth="2.5" />
            <path d="M 45 65 Q 50 71 55 65" fill="#f43f5e" />
            {/* Floating Sprout Leaves (waving) */}
            <motion.path
              d="M 50 25 Q 40 10 32 18 Q 42 22 50 25"
              fill="#22c55e"
              stroke="#14532d"
              strokeWidth="2"
              animate={{ rotate: [0, -15, 10, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.path
              d="M 50 25 Q 60 8 68 15 Q 58 20 50 25"
              fill="#15803d"
              stroke="#14532d"
              strokeWidth="2"
              animate={{ rotate: [0, 10, -15, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
            />
          </svg>
        );
      case 'studying':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md">
            {/* Body */}
            <circle cx="50" cy="55" r="32" fill="#bbf7d0" />
            <circle cx="50" cy="55" r="28" fill="#86efac" />
            {/* Glasses! Extra cute for studying */}
            <rect x="25" y="44" width="18" height="12" rx="4" fill="none" stroke="#166534" strokeWidth="3" />
            <rect x="57" y="44" width="18" height="12" rx="4" fill="none" stroke="#166534" strokeWidth="3" />
            <line x1="43" y1="50" x2="57" y2="50" stroke="#166534" strokeWidth="3" />
            {/* Eyes behind glasses */}
            <circle cx="34" cy="50" r="2.5" fill="#14532d" />
            <circle cx="66" cy="50" r="2.5" fill="#14532d" />
            {/* Mouth */}
            <path d="M 46 62 Q 50 65 54 62" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Crown sprout */}
            <path d="M 50 25 Q 42 12 30 16 Q 40 22 50 25" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
            <path d="M 50 25 Q 58 10 70 14 Q 58 20 50 25" fill="#15803d" stroke="#14532d" strokeWidth="2" />
          </svg>
        );
      case 'cheering':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md">
            {/* Body */}
            <circle cx="50" cy="55" r="32" fill="#fef08a" />
            <circle cx="50" cy="55" r="28" fill="#facc15" />
            {/* Sparkle cheeks */}
            <circle cx="32" cy="62" r="6" fill="#f97316" opacity="0.5" />
            <circle cx="68" cy="62" r="6" fill="#f97316" opacity="0.5" />
            {/* Eyes closed happy arch */}
            <path d="M 30 48 Q 35 42 40 48" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 60 48 Q 65 42 70 48" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            {/* Huge happy mouth */}
            <path d="M 42 58 Q 50 68 58 58 Z" fill="#991b1b" stroke="#78350f" strokeWidth="2.5" />
            {/* Left/Right hands cheering up */}
            <motion.path
              d="M 22 68 Q 12 55 18 48"
              stroke="#78350f"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            />
            <motion.path
              d="M 78 68 Q 88 55 82 48"
              stroke="#78350f"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
            />
            {/* Sprout Head Leaf */}
            <path d="M 50 25 Q 45 10 35 15" stroke="#78350f" strokeWidth="2" fill="none" />
            <circle cx="35" cy="15" r="4" fill="#22c55e" />
            <path d="M 50 25 Q 55 10 65 15" stroke="#78350f" strokeWidth="2" fill="none" />
            <circle cx="65" cy="15" r="4" fill="#15803d" />
          </svg>
        );
      case 'happy':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md">
            {/* Body */}
            <circle cx="50" cy="55" r="32" fill="#86efac" />
            <circle cx="50" cy="55" r="28" fill="#22c55e" />
            {/* Cheeks */}
            <circle cx="34" cy="62" r="4" fill="#f87171" opacity="0.6" />
            <circle cx="66" cy="62" r="4" fill="#f87171" opacity="0.6" />
            {/* Happy twinkling eyes */}
            <circle cx="36" cy="48" r="3.5" fill="#14532d" />
            <circle cx="64" cy="48" r="3.5" fill="#14532d" />
            {/* Cute Smile */}
            <path d="M 42 60 Q 50 67 58 60" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Head sprout */}
            <motion.path
              d="M 50 26 Q 42 12 30 18 Q 40 24 50 26"
              fill="#86efac"
              stroke="#14532d"
              strokeWidth="2"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            <motion.path
              d="M 50 26 Q 58 10 70 14 Q 58 20 50 26"
              fill="#16a34a"
              stroke="#14532d"
              strokeWidth="2"
              animate={{ rotate: [5, -5, 5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
            />
          </svg>
        );
    }
  };

  return (
    <div id="helpful-buddy-card" className="bg-amber-50 border-4 border-amber-300 rounded-3xl p-4 shadow-md flex items-center gap-4 relative overflow-hidden">
      {/* Sparkles background effect */}
      <div className="absolute right-2 top-2 text-amber-200">
        <Sparkles size={28} className="animate-spin" style={{ animationDuration: '10s' }} />
      </div>
      
      {/* Animated Mascot */}
      <motion.div
        className="flex-shrink-0 cursor-pointer"
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        onClick={speakMessage}
        title="点我听芽芽说话哦！"
      >
        {getMascotSvg()}
      </motion.div>

      {/* Speech Bubble text */}
      <div className="flex-1 relative">
        <div className="relative z-10">
          <p className="text-emerald-800 font-extrabold text-base md:text-lg flex items-center gap-1.5 leading-snug">
            芽芽 (Sprout):
            <button
              onClick={speakMessage}
              className="p-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors ml-1"
              title="Speak English"
            >
              <Volume2 size={16} />
            </button>
          </p>
          <p className="text-emerald-950 text-sm font-semibold mt-1 tracking-wide leading-relaxed">
            {message}
          </p>
          <p className="text-emerald-700 text-xs font-semibold mt-0.5 opacity-90">
            {messageZh}
          </p>
        </div>
      </div>
    </div>
  );
}
