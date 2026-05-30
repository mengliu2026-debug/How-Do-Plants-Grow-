import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Eye, EyeOff, CheckCircle2, RotateCcw, HelpCircle, Trophy, Sparkles } from 'lucide-react';
import { SentenceItem, UserProgress } from '../types';

interface StoryLoungeProps {
  progress: UserProgress;
  onGrantDrops: (amount: number) => void;
  onGrantTool: (tool: 'spade' | 'soil' | 'sun') => void;
  onCompleteMilestone: (milestone: 'textRead' | 'flashcardsDone' | 'wordMatchDone' | 'quizDone') => void;
  addNotification: (msg: string, type: 'success' | 'info') => void;
  setBuddyMsg: (en: string, zh: string, mood?: 'happy' | 'excited' | 'studying' | 'cheering') => void;
}

const LESSON_SENTENCES: SentenceItem[] = [
  { id: 's1', english: "First, dig holes. Put the seeds in the holes.", chinese: "首先，挖洞。把种子放进洞里。" },
  { id: 's2', english: "Then, cover the holes with soil. And water the seeds every day.", chinese: "然后，用土盖住洞。每天给种子浇水。" },
  { id: 's3', english: "Our stems go up and up.", chinese: "我们的茎越长越高。" },
  { id: 's4', english: "The flowers make fruit. Inside the fruit, there are seeds.", chinese: "花结出果实。果实里面有种子。" },
  { id: 's5', english: "Later, the seeds will become new plants.", chinese: "后来，这些种子会变成新的植物。" }
];

export default function StoryLounge({
  progress,
  onGrantDrops,
  onGrantTool,
  onCompleteMilestone,
  addNotification,
  setBuddyMsg,
}: StoryLoungeProps) {
  const [activeTab, setActiveTab] = useState<'read' | 'game'>('read');
  const [showChinese, setShowChinese] = useState<Record<string, boolean>>({
    main: true,
    s1: true,
    s2: true,
    s3: true,
    s4: true,
    s5: true,
  });

  // Sentence assembler game states
  const [selectedSentIdx, setSelectedSentIdx] = useState<number>(0);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const toggleChinese = (key: string) => {
    setShowChinese(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSpeech = (text: string, lang = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85; // slightly slower for young minds
      window.speechSynthesis.speak(utterance);
      setBuddyMsg(`Listening to English is fun!`, `听英语发音可以帮我们说得更好哦！`, 'studying');
    } else {
      addNotification("您的浏览器暂不支持语音播放。", "info");
    }
  };

  const handleReadLesson = () => {
    if (!progress.completedMilestones.textRead) {
      onCompleteMilestone('textRead');
      onGrantDrops(15);
      onGrantTool('spade'); // Award shovel for reading text
      addNotification("恭喜！读完课文，奖励金水滴 15 滴 💧 + 挖沙铲 ⛏️ 1 把！快去种花吧！", "success");
      setBuddyMsg("Great job reading the story! You unlocked a Spade tool!", "你太棒了！读完课文解锁了［小铁铲 ⛏️］哦，可以给种子挖坑喽！", "excited");
    } else {
      addNotification("你正在复习课文哦，多读几遍读得更流利！🔊", "info");
    }
  };

  // Start the sentence scramble builder
  const startSentenceGame = (idx: number) => {
    const rawEnglish = LESSON_SENTENCES[idx].english;
    // Clean punctuation a bit and split words
    const words = rawEnglish.split(/\s+/).map(w => w.replace(/[.,]/g, ""));
    // Shuffle the words
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    
    setSelectedSentIdx(idx);
    setShuffledWords(shuffled);
    setAssembledWords([]);
    setGameWon(false);
    setGameStarted(true);

    setBuddyMsg(
      "Can you rebuild this sentence?",
      "你能把这些单词拼成正确的一句话吗？点击下面的单词块试一试！"
    );
  };

  const handleWordClick = (word: string, isFromShuffled: boolean) => {
    if (gameWon) return;

    if (isFromShuffled) {
      // Find index in shuffled words and move to assembled
      const idx = shuffledWords.indexOf(word);
      if (idx > -1) {
        const newShuffled = [...shuffledWords];
        newShuffled.splice(idx, 1);
        setShuffledWords(newShuffled);
        setAssembledWords([...assembledWords, word]);
      }
    } else {
      // Return from assembled back to shuffled
      const idx = assembledWords.indexOf(word);
      if (idx > -1) {
        const newAssembled = [...assembledWords];
        newAssembled.splice(idx, 1);
        setAssembledWords(newAssembled);
        setShuffledWords([...shuffledWords, word]);
      }
    }
  };

  const checkSentenceMatch = () => {
    const original = LESSON_SENTENCES[selectedSentIdx].english;
    const cleanOriginalWords = original.split(/\s+/).map(w => w.replace(/[.,]/g, "").toLowerCase());
    const cleanAssembledWords = assembledWords.map(w => w.toLowerCase());

    const isMatch = cleanOriginalWords.join(" ") === cleanAssembledWords.join(" ");

    if (isMatch) {
      setGameWon(true);
      onGrantDrops(10);
      addNotification("完全正确！你是个句型拼图小达人！ 💧 +10 水滴！", "success");
      setBuddyMsg(
        "Superb spelling! You built a beautiful sentence! 🎆",
        "太赞了！完全拼正确，句型结构掌握得太扎实了，奖励 10 金水滴 💧！",
        "cheering"
      );
    } else {
      addNotification("单词顺序好像不太对噢，再仔细看一看！", "info");
      setBuddyMsg(
        "Don't worry, reset and try again!",
        "没关系，我们可以点击橙色按钮重置，多看一遍句子再试试拼图！"
      );
    }
  };

  const handleResetGame = () => {
    startSentenceGame(selectedSentIdx);
  };

  return (
    <div className="bg-white border-4 border-lime-400 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
      {/* Tab Selectors */}
      <div className="flex border-b-2 border-lime-100 pb-1.5 gap-2">
        <button
          onClick={() => {
            setActiveTab('read');
            setBuddyMsg("Let's read the story line by line!", "我们一起来逐句精读课文英文，看看植物长大的秘密！");
          }}
          className={`flex-1 font-black text-sm md:text-base py-2.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'read'
              ? 'bg-lime-500 text-white shadow-md scale-[1.02]'
              : 'bg-lime-50 text-lime-700 hover:bg-lime-100'
          }`}
        >
          📖 双语精读课
        </button>
        <button
          onClick={() => {
            setActiveTab('game');
            startSentenceGame(0);
          }}
          className={`flex-1 font-black text-sm md:text-base py-2.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'game'
              ? 'bg-lime-500 text-white shadow-md scale-[1.02]'
              : 'bg-lime-50 text-lime-700 hover:bg-lime-100'
          }`}
        >
          🧩 句子大拼图
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'read' ? (
          /* SECTION 1: BILINGUAL READER */
          <motion.div
            key="read-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* Story Overview Intro card with Cute Speech bubbles */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 relative">
              <div className="flex items-start justify-between gap-2 border-b border-yellow-200 pb-2 mb-2">
                <div>
                  <h4 className="text-amber-800 font-extrabold text-sm md:text-base">
                    📕 本单元主题：How Do Plants Grow?
                  </h4>
                  <p className="text-amber-700 text-xs font-bold font-mono">Plants growth from seeds</p>
                </div>
                <button
                  onClick={() => handleSpeech(
                    "This unit teaches us how plants grow from seeds. We learn the names of different seeds (sunflower, bean, bell pepper) and the parts of a plant (root, stem, leaf, flower, fruit, seed)."
                  )}
                  className="bg-amber-400 hover:bg-amber-500 p-2 rounded-xl text-slate-950 font-black flex items-center gap-1 text-xs shadow-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <Play size={13} fill="currentColor" />
                  <span>朗读全文概述</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5 text-sm font-semibold text-amber-950 leading-relaxed">
                <p>
                  This unit teaches us how plants grow from seeds. We learn the names of different seeds
                  (<span className="text-amber-600 font-bold hover:underline cursor-pointer" onClick={() => handleSpeech("sunflower")}>sunflower</span>,{' '}
                  <span className="text-purple-600 font-bold hover:underline cursor-pointer" onClick={() => handleSpeech("bean")}>bean</span>,{' '}
                  <span className="text-red-600 font-bold hover:underline cursor-pointer" onClick={() => handleSpeech("bell pepper")}>bell pepper</span>)
                  and the parts of a plant (root, stem, leaf, flower, fruit, seed).
                </p>
                {showChinese.main && (
                  <p className="text-xs text-amber-700 bg-amber-100/50 p-2 rounded-lg leading-relaxed mt-0.5 border-l-4 border-amber-400">
                    本单元讲述了植物是如何从种子生长而成的。 我们认识了不同种类的种子（向日葵、豆子、甜椒）和植物的各个部分（根、茎、叶、花、果实、种子）。
                  </p>
                )}
                <button
                  onClick={() => toggleChinese('main')}
                  className="self-end text-[10px] text-amber-600 flex items-center gap-1 hover:underline mt-1 focus:none cursor-pointer"
                >
                  {showChinese.main ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span>{showChinese.main ? '隐藏中文' : '显示中文对照'}</span>
                </button>
              </div>
            </div>

            {/* Core 5 Golden sentences list inside scrollable panel */}
            <div className="flex flex-col gap-3">
              <h4 className="text-emerald-800 font-black text-sm flex items-center gap-1">
                <span>🌟 核心必背精美句子 (Golden Sentences)</span>
                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-mono text-[10px]">5 sentences</span>
              </h4>

              {LESSON_SENTENCES.map((item, idx) => (
                <div
                  key={item.id}
                  className="group bg-slate-50 hover:bg-lime-50/40 border-2 border-slate-100 hover:border-lime-200 rounded-2xl p-3 flex flex-col gap-1.5 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-2 left-2 w-5 h-5 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>

                  <div className="pl-6 pr-14 flex items-start justify-between gap-1">
                    <p className="text-slate-900 font-bold text-sm md:text-base leading-snug tracking-wide">
                      {item.english}
                    </p>
                  </div>

                  {showChinese[item.id] && (
                    <p className="pl-6 text-xs text-slate-500 font-bold leading-normal">
                      {item.chinese}
                    </p>
                  )}

                  <div className="flex items-center justify-between pl-6 mt-1.5 border-t border-slate-100 group-hover:border-lime-100 pt-1.5">
                    <button
                      onClick={() => toggleChinese(item.id)}
                      className="text-[10px] font-bold text-slate-400 hover:text-lime-600 flex items-center gap-1 cursor-pointer"
                    >
                      {showChinese[item.id] ? <EyeOff size={10} /> : <Eye size={10} />}
                      <span>{showChinese[item.id] ? '隐藏翻译' : '眼睛看翻译'}</span>
                    </button>

                    <button
                      onClick={() => handleSpeech(item.english)}
                      className="bg-sky-100 hover:bg-sky-200 text-sky-700 font-black p-1 px-3 rounded-lg flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>发音播报</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Read Complete Button */}
            <button
              onClick={handleReadLesson}
              className={`w-full font-black py-3 rounded-2xl shadow-md border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                progress.completedMilestones.textRead
                  ? 'bg-slate-100 border-slate-200 text-slate-500 opacity-90'
                  : 'bg-gradient-to-r from-lime-500 to-emerald-400 border-lime-300 text-white hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              <CheckCircle2 size={18} />
              <span>
                {progress.completedMilestones.textRead
                  ? '课文精读完成！(可继续点播复读)'
                  : '我已大声读完一遍课文啦！【领金水滴 15 💧 + 挖沙铲 ⛏️】'}
              </span>
            </button>
          </motion.div>
        ) : (
          /* SECTION 2: SENTENCE BUILDER GAME */
          <motion.div
            key="game-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 flex flex-col gap-1.5">
              <h5 className="font-black text-purple-900 text-sm flex items-center gap-1">
                <Trophy size={16} className="text-yellow-500 fill-yellow-200" />
                <span>句子重组拼图乐园</span>
              </h5>
              <p className="text-purple-700 text-xs font-bold leading-normal">
                请先在下方选择一句话。随后点击底部的单词卡，按【正确的英文书写顺序】拼装在一起并检验吧！
              </p>

              {/* Sentences selector for the game */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {LESSON_SENTENCES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => startSentenceGame(idx)}
                    className={`text-[11px] font-black py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                      selectedSentIdx === idx
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    句 {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Display correct sentence outline (as help, or translation) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                对照中文意译
              </span>
              <p className="text-slate-700 font-extrabold text-sm mt-1">
                "{LESSON_SENTENCES[selectedSentIdx].chinese}"
              </p>
            </div>

            {/* Assembled Output Box */}
            <div className="border-4 border-dashed border-purple-300 min-h-20 bg-purple-50/20 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-center relative">
              {assembledWords.length === 0 ? (
                <span className="text-slate-400 font-bold text-xs pointer-events-none">
                  点击下方卡片，拼装句子的词组...
                </span>
              ) : (
                assembledWords.map((word, i) => (
                  <motion.button
                    key={`${word}-assembled-${i}`}
                    layoutId={`${word}-assembled-${i}`}
                    onClick={() => handleWordClick(word, false)}
                    className="bg-purple-600 border border-purple-500 text-white font-extrabold text-xs md:text-sm px-3.5 py-1.5 rounded-xl shadow-sm text-center cursor-pointer hover:bg-red-500 transition-colors"
                    title="退回下方"
                  >
                    {word}
                  </motion.button>
                ))
              )}

              {gameWon && (
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-xs rounded-xl flex items-center justify-center">
                  <div className="bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-full flex items-center gap-1 shadow-md">
                    <Sparkles size={12} />
                    <span>挑战成功！+10 滴💧</span>
                  </div>
                </div>
              )}
            </div>

            {/* Shuffled Input Word Bank */}
            <div className="flex flex-wrap gap-2.5 items-center justify-center p-4 bg-slate-50/60 rounded-2xl border border-slate-200 min-h-16">
              {shuffledWords.length === 0 && assembledWords.length > 0 && !gameWon ? (
                <span className="text-emerald-700 font-bold text-xs">
                  已填满！快点击下方按钮【校验答案】吧！👇
                </span>
              ) : shuffledWords.length === 0 && assembledWords.length === 0 ? (
                <span className="text-slate-400 text-xs font-bold">无单词</span>
              ) : (
                shuffledWords.map((word, i) => (
                  <motion.button
                    key={`${word}-shuffled-${i}`}
                    layoutId={`${word}-shuffled-${i}`}
                    onClick={() => handleWordClick(word, true)}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white border-2 border-purple-300 text-purple-950 hover:bg-purple-50 font-black text-xs md:text-sm px-4 py-2 rounded-xl shadow-sm cursor-pointer transition-colors"
                  >
                    {word}
                  </motion.button>
                ))
              )}
            </div>

            {/* Check / Reset Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleResetGame}
                className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-900 font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer text-xs"
              >
                <RotateCcw size={14} />
                <span>重整单词 (Reset)</span>
              </button>

              <button
                onClick={checkSentenceMatch}
                disabled={assembledWords.length === 0 || gameWon}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1 disabled:opacity-40 shadow-sm cursor-pointer text-xs"
              >
                <CheckCircle2 size={14} />
                <span>核对答案 (Check)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
