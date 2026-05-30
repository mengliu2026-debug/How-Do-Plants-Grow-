import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplet,
  Star,
  Award,
  Sparkles,
  Shovel,
  Sun,
  X,
  Volume2,
  BookOpen,
  Sprout,
  Heart
} from 'lucide-react';

import { SeedType, PlantState, QuizState, UserProgress } from './types';
import HelpfulBuddy from './components/HelpfulBuddy';
import GardenPot from './components/GardenPot';
import StoryLounge from './components/StoryLounge';
import WordLand from './components/WordLand';
import QuizSect from './components/QuizSect';

interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'info';
}

export default function App() {
  // Core Progress State
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('plant_reading_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return {
      waterDrops: 15, // start with 15 drops so child can water or snoop immediately
      stars: 1, // start with 1 level-1 star
      unlockedSeeds: ['sunflower', 'bean', 'pepper'],
      inventory: {
        spadeCount: 1, // starts with 1 spade so they can dig immediately to learn
        soilCount: 1,  // starts with 1 soil so they don't get stuck early
        sunCount: 0,
      },
      completedMilestones: {
        textRead: false,
        flashcardsDone: false,
        wordMatchDone: false,
        quizDone: false,
      }
    };
  });

  // Core Plant State
  const [plantState, setPlantState] = useState<PlantState>(() => {
    const saved = localStorage.getItem('plant_reading_plant_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      type: null,
      stage: 0,
      wateredCount: 0,
      neededWaterToNext: 0,
      lastWatered: null,
      isHarvested: false,
    };
  });

  // Core Quiz State
  const [quizState, setQuizState] = useState<QuizState>(() => {
    const saved = localStorage.getItem('plant_reading_quiz_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      q1Selected: null,
      q1Correct: null,
      q2Input: "",
      q2Correct: null,
      q3Input: "",
      q3Submitted: false,
      q3Feedback: "",
      hasEarnedReward: {
        q1: false,
        q2: false,
        q3: false,
      }
    };
  });

  // Active Lesson Card Tabs on left pane
  const [lessonTab, setLessonTab] = useState<'lounge' | 'vocab' | 'quiz'>('lounge');

  // Mascot communication bubble state
  const [buddy, setBuddy] = useState({
    message: "Hi, young helper! Let's read the stories and match cute words to get water drops!",
    messageZh: "你好呀，小园丁！大声朗读课文和挑战好词对对碰，就能赢取金水滴和铁铲，让小花盆长出神奇向日葵哦！🌻",
    mood: "happy" as 'happy' | 'excited' | 'studying' | 'cheering'
  });

  // Slide-out notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Sound Synth alert fallback for stars
  const playAchievementSound = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        // ascending beautiful kid scales
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {}
    }
  };

  // Local persistence synchronization
  useEffect(() => {
    localStorage.setItem('plant_reading_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('plant_reading_plant_state', JSON.stringify(plantState));
  }, [plantState]);

  useEffect(() => {
    localStorage.setItem('plant_reading_quiz_state', JSON.stringify(quizState));
  }, [quizState]);

  // Utility to push slide notifications
  const addNotification = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    if (type === 'success') {
      playAchievementSound();
    }

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updatePlantState = (updated: Partial<PlantState>) => {
    setPlantState(prev => ({ ...prev, ...updated }));
  };

  const updateQuizState = (updated: Partial<QuizState>) => {
    setQuizState(prev => ({ ...prev, ...updated }));
  };

  // State actions handlers passed to child widgets
  const handleGrantDrops = (amount: number) => {
    setProgress(prev => ({
      ...prev,
      waterDrops: prev.waterDrops + amount,
    }));
  };

  const handleGrantTool = (tool: 'spade' | 'soil' | 'sun') => {
    setProgress(prev => {
      const inventory = { ...prev.inventory };
      if (tool === 'spade') inventory.spadeCount += 1;
      if (tool === 'soil') inventory.soilCount += 1;
      if (tool === 'sun') inventory.sunCount += 1;
      return { ...prev, inventory };
    });
  };

  const handleCompleteMilestone = (milestone: 'textRead' | 'flashcardsDone' | 'wordMatchDone' | 'quizDone') => {
    setProgress(prev => {
      if (prev.completedMilestones[milestone]) return prev;
      const completedMilestones = { ...prev.completedMilestones, [milestone]: true };
      
      // Every milestone completed gains 1 Gold Medal Star
      return {
        ...prev,
        stars: prev.stars + 1,
        completedMilestones,
      };
    });
  };

  const handleSpendDrops = (amount: number): boolean => {
    if (progress.waterDrops < amount) return false;
    setProgress(prev => ({
      ...prev,
      waterDrops: prev.waterDrops - amount,
    }));
    return true;
  };

  const handleSpendTool = (tool: 'spade' | 'soil' | 'sun'): boolean => {
    let success = false;
    setProgress(prev => {
      const inventory = { ...prev.inventory };
      if (tool === 'spade' && inventory.spadeCount > 0) {
        inventory.spadeCount -= 1;
        success = true;
      }
      if (tool === 'soil' && inventory.soilCount > 0) {
        inventory.soilCount -= 1;
        success = true;
      }
      if (tool === 'sun' && inventory.sunCount > 0) {
        inventory.sunCount -= 1;
        success = true;
      }
      if (!success) return prev;
      return { ...prev, inventory };
    });
    return success;
  };

  const handleHarvestPlant = (earnedDrops: number, earnedStars: number) => {
    setProgress(prev => ({
      ...prev,
      waterDrops: prev.waterDrops + earnedDrops,
      stars: prev.stars + earnedStars,
    }));
    setBuddy({
      message: "Splendid harvest! You have obtained brand new seeds inside! Plant again!",
      messageZh: "哇！大丰收太喜悦了。你把第一颗植物养熟了，果实里果然带着新种子，这真是大自然的魔法呢！换一颗种子重新种吧！🌻",
      mood: "cheering"
    });
  };

  const handleResetProgress = () => {
    if (window.confirm("确定要重新开始学习和种植吗？你的星星和水滴进度将会复位哦。")) {
      localStorage.clear();
      setProgress({
        waterDrops: 15,
        stars: 1,
        unlockedSeeds: ['sunflower', 'bean', 'pepper'],
        inventory: {
          spadeCount: 1,
          soilCount: 1,
          sunCount: 0,
        },
        completedMilestones: {
          textRead: false,
          flashcardsDone: false,
          wordMatchDone: false,
          quizDone: false,
        }
      });
      setPlantState({
        type: null,
        stage: 0,
        wateredCount: 0,
        neededWaterToNext: 0,
        lastWatered: null,
        isHarvested: false,
      });
      setQuizState({
        q1Selected: null,
        q1Correct: null,
        q2Input: "",
        q2Correct: null,
        q3Input: "",
        q3Submitted: false,
        q3Feedback: "",
        hasEarnedReward: {
          q1: false,
          q2: false,
          q3: false,
        }
      });
      addNotification("数据重置成功！开始重新冒险！✨", "info");
      setBuddy({
        message: "New start, let's explore plants together!",
        messageZh: "新学期新起点！今天我们继续在大自然精读花园中吸取力量吧！🌱",
        mood: "happy"
      });
    }
  };

  // Helper text change on buddy mascot click or updates
  const setBuddyMsg = (en: string, zh: string, mood: 'happy' | 'excited' | 'studying' | 'cheering' = 'happy') => {
    setBuddy({ message: en, messageZh: zh, mood });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-lime-50 to-emerald-100 flex flex-col relative font-sans">
      
      {/* Dynamic Slide-out Notifications Area */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-3.5 rounded-2xl shadow-xl border-2 font-extrabold text-xs  flex items-center justify-between gap-3 pointer-events-auto leading-relaxed ${
                n.type === 'success'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-emerald-200/50'
                  : 'bg-amber-50 border-amber-300 text-amber-950 shadow-amber-100/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{n.type === 'success' ? '🎉' : '💡'}</span>
                <p>{n.message}</p>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="text-slate-400 hover:text-slate-700 font-bold transition-all p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Header bar */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b-4 border-lime-300/60 py-3.5 px-4 md:px-8 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="bg-lime-400 text-white p-2.5 rounded-2xl shadow-md border-2 border-white animate-bounce-gentle">
              <Sprout size={28} className="fill-emerald-100 stroke-emerald-950" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-emerald-950 flex items-center gap-1.5 font-sans tracking-wide">
                <span>How Do Plants Grow?</span>
                <span className="text-xs bg-lime-500 text-white px-2.5 py-0.5 rounded-full font-extrabold">
                  互动精读魔法袋
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-bold font-mono tracking-wide mt-0.5">
                二年级英文精品阅读 · 趣味种植积分乐园
              </p>
            </div>
          </div>

          {/* Central Progress Status Cards Dashboard */}
          <div className="flex items-center flex-wrap justify-center gap-2.5 bg-slate-50/80 border-2 border-slate-200/60 p-2 rounded-2xl">
            {/* Water Drops */}
            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
              <div className="bg-blue-100 p-1 rounded-lg">
                <Droplet className="text-blue-500 fill-blue-300" size={17} />
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-extrabold leading-none">金水滴 Balance</p>
                <span className="font-extrabold text-blue-900 text-base font-mono">
                  {progress.waterDrops}
                </span>
              </div>
            </div>

            {/* Achievement Stars */}
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
              <div className="bg-amber-100 p-1 rounded-lg glow-star">
                <Star className="text-amber-500 fill-amber-300" size={17} />
              </div>
              <div>
                <p className="text-[10px] text-amber-500 font-extrabold leading-none">荣誉金星 Medals</p>
                <span className="font-extrabold text-amber-900 text-base font-mono">
                  {progress.stars}
                </span>
              </div>
            </div>

            {/* Inventory Tools counters */}
            <div className="flex items-center gap-1 border-l pl-2 border-slate-300/50">
              <div
                className="bg-amber-100/60 p-1 rounded-lg flex items-center gap-1 text-[11px] font-bold text-amber-900 border"
                title="挖土手推铲"
              >
                <Shovel size={13} className="text-amber-700" />
                <span>{progress.inventory.spadeCount}</span>
              </div>

              <div
                className="bg-amber-150/60 p-1 rounded-lg flex items-center gap-1 text-[11px] font-bold text-amber-950 border"
                title="高钙营养土"
              >
                <span className="text-[10px]">🤎</span>
                <span>{progress.inventory.soilCount}</span>
              </div>

              <div
                className="bg-yellow-100/60 p-1 rounded-lg flex items-center gap-1 text-[11px] font-bold text-yellow-900 border"
                title="太阳能粒子"
              >
                <Sun size={13} className="text-orange-500 fill-orange-200" />
                <span>{progress.inventory.sunCount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetProgress}
              className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100/60 px-2 py-1 rounded-lg cursor-pointer"
            >
              重来一遍 Reset
            </button>
          </div>

        </div>
      </header>

      {/* Main Body Grid wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Study Lounge & Quizzes (7 Cols) */}
        <div id="study-panel" className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Animated Mascot Guidance Buddy Banner */}
          <HelpfulBuddy
            message={buddy.message}
            messageZh={buddy.messageZh}
            mood={buddy.mood}
          />

          {/* Sub category Navigation cards */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setLessonTab('lounge');
                setBuddyMsg(
                  "Read the golden sentences to get familiar with planting words!",
                  "点击［双语精读课］卡片！每天大声读课文不仅可以赚水滴，小花盆还很喜欢听我们的读书声哦！📖"
                );
              }}
              className={`py-3 px-1.5 rounded-2xl flex flex-col items-center gap-1 border-3 font-black text-xs transition-all cursor-pointer ${
                lessonTab === 'lounge'
                  ? 'bg-lime-50 border-lime-400 text-lime-950 scale-102 shadow-sm'
                  : 'bg-white border-slate-150 hover:border-lime-200 text-slate-600'
              }`}
            >
              <BookOpen size={18} className="text-lime-600" />
              <span>1. 双语精读课文</span>
            </button>

            <button
              onClick={() => {
                setLessonTab('vocab');
                setBuddyMsg(
                  "Flip words and match memory blocks!",
                  "点开［好词连连看］！认识核心植物部分，像 root 根、stem 茎... 配对成功有丰富奖励！🌟"
                );
              }}
              className={`py-3 px-1.5 rounded-2xl flex flex-col items-center gap-1 border-3 font-black text-xs transition-all cursor-pointer ${
                lessonTab === 'vocab'
                  ? 'bg-amber-50 border-amber-400 text-amber-950 scale-102 shadow-sm'
                  : 'bg-white border-slate-150 hover:border-amber-200 text-slate-600'
              }`}
            >
              <Heart size={18} className="text-amber-500 fill-amber-200" />
              <span>2. 好词闪卡配对</span>
            </button>

            <button
              onClick={() => {
                setLessonTab('quiz');
                setBuddyMsg(
                  "Challenge textbook exercises to test yourself!",
                  "进入［小挑战答题大王］！这里一共有3道填空选择和思考大题。完成后可以拿到高级肥料和温暖阳光哦！🎯"
                );
              }}
              className={`py-3 px-1.5 rounded-2xl flex flex-col items-center gap-1 border-3 font-black text-xs transition-all cursor-pointer ${
                lessonTab === 'quiz'
                  ? 'bg-sky-50 border-sky-400 text-sky-950 scale-102 shadow-sm'
                  : 'bg-white border-slate-150 hover:border-sky-200 text-slate-600'
              }`}
            >
              <Award size={18} className="text-sky-600" />
              <span>3. 答题思辨冲锋</span>
            </button>
          </div>

          {/* Tab contents load */}
          <div className="relative">
            {lessonTab === 'lounge' && (
              <StoryLounge
                progress={progress}
                onGrantDrops={handleGrantDrops}
                onGrantTool={handleGrantTool}
                onCompleteMilestone={handleCompleteMilestone}
                addNotification={addNotification}
                setBuddyMsg={setBuddyMsg}
              />
            )}

            {lessonTab === 'vocab' && (
              <WordLand
                progress={progress}
                onGrantDrops={handleGrantDrops}
                onGrantTool={handleGrantTool}
                onCompleteMilestone={handleCompleteMilestone}
                addNotification={addNotification}
                setBuddyMsg={setBuddyMsg}
              />
            )}

            {lessonTab === 'quiz' && (
              <QuizSect
                progress={progress}
                quizState={quizState}
                onUpdateQuiz={updateQuizState}
                onGrantDrops={handleGrantDrops}
                onGrantTool={handleGrantTool}
                onCompleteMilestone={handleCompleteMilestone}
                addNotification={addNotification}
                setBuddyMsg={setBuddyMsg}
              />
            )}
          </div>
        </div>

        {/* Right Side: Virtual Garden Pot & Planting Operations (5 Cols) */}
        <div id="garden-panel" className="lg:col-span-5 flex flex-col gap-4">
          <GardenPot
            plantState={plantState}
            waterDrops={progress.waterDrops}
            inventory={progress.inventory}
            onUpdatePlant={updatePlantState}
            onSpendDrops={handleSpendDrops}
            onSpendTool={handleSpendTool}
            onHarvest={handleHarvestPlant}
            addNotification={addNotification}
          />
        </div>

      </main>

      {/* Footer bar */}
      <footer className="bg-slate-900 border-t-4 border-slate-800 text-slate-400 py-6 text-center text-xs font-medium z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1">
            <span>🌿 英语精炼研究学习型教案应用</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Unit 5 How Do Plants Grow?</span>
          </p>
          <p className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors">
            双语精读课文 · 拼字配对互动 · 科学种子种植模拟大王
          </p>
        </div>
      </footer>
    </div>
  );
}
