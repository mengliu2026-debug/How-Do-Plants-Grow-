import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, RefreshCw, Trophy, Sparkles, CheckCircle, BrainCircuit } from 'lucide-react';
import { VocabularyWord, UserProgress } from '../types';

interface WordLandProps {
  progress: UserProgress;
  onGrantDrops: (amount: number) => void;
  onGrantTool: (tool: 'spade' | 'soil' | 'sun') => void;
  onCompleteMilestone: (milestone: 'textRead' | 'flashcardsDone' | 'wordMatchDone' | 'quizDone') => void;
  addNotification: (msg: string, type: 'success' | 'info') => void;
  setBuddyMsg: (en: string, zh: string, mood?: 'happy' | 'excited' | 'studying' | 'cheering') => void;
}

const VOCAB_DATA: VocabularyWord[] = [
  { id: 'v1', english: "seed", chinese: "种子", example: "Put the seeds in the holes.", exampleZh: "把种子放进洞里。", phonetic: "/siːd/" },
  { id: 'v2', english: "stem", chinese: "茎 / 支干", example: "Our stems go up and up.", exampleZh: "我们的草茎长得越来越高。", phonetic: "/stem/" },
  { id: 'v3', english: "root", chinese: "根部", example: "Roots help plants absorb water.", exampleZh: "根部能帮助植物吸收水分。", phonetic: "/ruːt/" },
  { id: 'v4', english: "leaf / leaves", chinese: "叶子", example: "Green leaves absorb sunlight.", exampleZh: "绿叶吸取明亮的阳光。", phonetic: "/liːf/" },
  { id: 'v5', english: "flower", chinese: "花朵", example: "The flowers make fruit.", exampleZh: "花儿凋谢并结出果实。", phonetic: "/ˈflaʊ.ər/" },
  { id: 'v6', english: "fruit", chinese: "果实", example: "Inside the fruit, there are seeds.", exampleZh: "果实里面包裹着新种子。", phonetic: "/fruːt/" },
  { id: 'v7', english: "dig a hole", chinese: "挖洞", example: "First, dig holes of soil.", exampleZh: "首先，在泥土上挖好小洞。", phonetic: "/dɪɡ ə hoʊl/" },
  { id: 'v8', english: "cover with soil", chinese: "用土盖住", example: "Then, cover the holes with soil.", exampleZh: "然后，用泥土把小洞盖住。", phonetic: "/ˈkʌv.ər wɪð sɔɪl/" },
  { id: 'v9', english: "water (v.)", chinese: "浇水", example: "Water the seeds every day.", exampleZh: "每一天都要给小种子浇水。", phonetic: "/ˈwɔː.tər/" },
  { id: 'v10', english: "grow up", chinese: "长大，长高", example: "Seeds will become big plants.", exampleZh: "种子会快快长大变高成新植物。", phonetic: "/ɡroʊ ʌp/" },
  { id: 'v11', english: "make fruit", chinese: "结果实", example: "The flowers finally make fruit.", exampleZh: "花朵最后成长结出香甜的果实。", phonetic: "/meɪk fruːt/" },
];

interface DisplayCard {
  id: string; // original word id + '-en' or '-zh'
  wordId: string;
  text: string;
  lang: 'en' | 'zh';
  isMatched: boolean;
}

export default function WordLand({
  progress,
  onGrantDrops,
  onGrantTool,
  onCompleteMilestone,
  addNotification,
  setBuddyMsg,
}: WordLandProps) {
  const [viewMode, setViewMode] = useState<'flashcard' | 'match'>('flashcard');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  
  // Match Game States
  const [matchCards, setMatchCards] = useState<DisplayCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<DisplayCard[]>([]);
  const [wrongAnimationId, setWrongAnimationId] = useState<string[]>([]);
  const [completedMatches, setCompletedMatches] = useState<number>(0);
  const [matchGameWon, setMatchGameWon] = useState<boolean>(false);

  // Read card voice
  const handlePronounce = (english: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent flipping on speaker click
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(english);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardFlip = (id: string, english: string) => {
    setFlippedCards(prev => {
      const state = !prev[id];
      if (state) {
        // speak word when flipped
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(english);
          u.lang = 'en-US';
          u.rate = 0.85;
          window.speechSynthesis.speak(u);
        }
      }
      return { ...prev, [id]: state };
    });

    // Award bonus on first interactive explore
    if (!progress.completedMilestones.flashcardsDone) {
      onCompleteMilestone('flashcardsDone');
      onGrantDrops(10);
      addNotification("你探索了精读词库！奖励 10 金水滴 💧！快去单词配对游戏挑战自己吧！", "success");
      setBuddyMsg(
        "Wonderful vocabulary study! Flip custom cards, then try the word matching game!",
        "开始探索好词卡片了，太棒了！翻转卡片学习释义，还可以挑战下面的单词连线小游戏哦！",
        "excited"
      );
    }
  };

  // Initialize matching game with 6 random pairs
  const initMatchGame = () => {
    // Pick 6 random words
    const shuffledVocab = [...VOCAB_DATA].sort(() => Math.random() - 0.5).slice(0, 6);
    
    const cardsList: DisplayCard[] = [];
    shuffledVocab.forEach(word => {
      cardsList.push({
        id: `${word.id}-en`,
        wordId: word.id,
        text: word.english,
        lang: 'en',
        isMatched: false,
      });
      cardsList.push({
        id: `${word.id}-zh`,
        wordId: word.id,
        text: word.chinese,
        lang: 'zh',
        isMatched: false,
      });
    });

    // Shuffle the final 12 cards
    const fullyShuffled = cardsList.sort(() => Math.random() - 0.5);

    setMatchCards(fullyShuffled);
    setSelectedCards([]);
    setWrongAnimationId([]);
    setCompletedMatches(0);
    setMatchGameWon(false);

    setBuddyMsg(
      "Click an English word, then click its Chinese meaning!",
      "来玩点消消配对吧！点击一个英文，再点击相对应的中文字词，把它们配对消掉吧！"
    );
  };

  useEffect(() => {
    if (viewMode === 'match') {
      initMatchGame();
    }
  }, [viewMode]);

  const handleMatchSelect = (card: DisplayCard) => {
    if (card.isMatched || matchGameWon) return;
    if (selectedCards.length === 1 && selectedCards[0].id === card.id) return; // ignore same card double click

    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    // Speak English words when clicked
    if (card.lang === 'en' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(card.text);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }

    if (newSelection.length === 2) {
      const [first, second] = newSelection;

      if (first.wordId === second.wordId && first.lang !== second.lang) {
        // Success match!
        setTimeout(() => {
          setMatchCards(prev =>
            prev.map(c => (c.wordId === first.wordId ? { ...c, isMatched: true } : c))
          );
          setSelectedCards([]);
          const nextCount = completedMatches + 1;
          setCompletedMatches(nextCount);

          if (nextCount === 6) {
            setMatchGameWon(true);
            onGrantDrops(15);
            onGrantTool('spade'); // Award shovel for matching game completion
            onCompleteMilestone('wordMatchDone');
            addNotification("太厉害了！全部完美配对，奖励 15 滴金水滴 💧 + 挖沙铲 ⛏️ 1把！", "success");
            setBuddyMsg(
              "Outstanding memory! All nouns matched perfectly!",
              "太神奇了！单词配对全部成功，词汇量真棒！你又拿到了一个［浇水铲 ⛏️］哦！",
              "cheering"
            );
          } else {
            addNotification("配对成功！加深记忆 ✨", "success");
          }
        }, 300);
      } else {
        // Failed match, trigger shake animation
        setTimeout(() => {
          setWrongAnimationId([first.id, second.id]);
          setTimeout(() => {
            setWrongAnimationId([]);
            setSelectedCards([]);
          }, 500);
        }, 200);
      }
    }
  };

  return (
    <div className="bg-white border-4 border-amber-400 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
      {/* Sub tabs selectors */}
      <div className="flex border-b-2 border-amber-100 pb-1.5 gap-2">
        <button
          onClick={() => setViewMode('flashcard')}
          className={`flex-1 font-black text-sm md:text-base py-2.5 px-3 rounded-2xl transition-all cursor-pointer ${
            viewMode === 'flashcard'
              ? 'bg-amber-400 text-slate-900 shadow-sm scale-[1.02]'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          🗂️ 核心好词闪卡
        </button>
        <button
          onClick={() => setViewMode('match')}
          className={`flex-1 font-black text-sm md:text-base py-2.5 px-3 rounded-2xl transition-all cursor-pointer ${
            viewMode === 'match'
              ? 'bg-amber-400 text-slate-900 shadow-sm scale-[1.02]'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          ⚡ 单词配对连线
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'flashcard' ? (
          /* FLASHCARD STUDY VIEW */
          <motion.div
            key="flashcard-tab"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4"
          >
            <p className="text-amber-900 text-xs font-bold leading-normal bg-orange-50 p-2.5 rounded-xl border border-orange-200">
              💡 <b>趣味小卡片：</b>点击卡片，即可揭晓【中文释义和拼音读音】，点击小喇叭聆听标准英美发音哦！
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
              {VOCAB_DATA.map((vocab) => {
                const isFlipped = flippedCards[vocab.id] || false;
                return (
                  <div
                    key={vocab.id}
                    onClick={() => handleCardFlip(vocab.id, vocab.english)}
                    className="h-28 relative cursor-pointer group"
                    style={{ perspective: '800px' }}
                  >
                    <motion.div
                      className="w-full h-full rounded-2xl transition-all duration-500 shadow-sm relative border-2 border-emerald-100 hover:border-amber-400"
                      style={{
                        transformStyle: 'preserve-3d',
                        rotateY: isFlipped ? 180 : 0
                      }}
                    >
                      {/* CARD FRONT: English */}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50/70 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-center"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <span className="text-emerald-800 text-[10px] font-bold tracking-wider font-mono bg-emerald-100/60 px-1.5 py-0.2 rounded">
                          {vocab.phonetic || '/.../'}
                        </span>
                        <h4 className="text-teal-950 font-black text-sm md:text-base tracking-wide mt-1">
                          {vocab.english}
                        </h4>
                        
                        <button
                          onClick={(e) => handlePronounce(vocab.english, e)}
                          className="p-1 rounded-full bg-teal-100/80 text-teal-700 hover:bg-teal-200 hover:scale-110 transition-all pointer-events-auto"
                          title="听发音"
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>

                      {/* CARD BACK: Chinese & Examples */}
                      <div
                        className="absolute inset-0 bg-yellow-100 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-center"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                          中文释义
                        </span>
                        <h5 className="text-amber-950 font-black text-xs md:text-sm">
                          {vocab.chinese}
                        </h5>
                        <p className="text-[9px] text-amber-700 font-semibold line-clamp-2 leading-tight">
                          {vocab.example}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* MATCHING GAME VIEW */
          <motion.div
            key="match-tab"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                已消除配对进度: <span className="font-extrabold text-amber-600">{completedMatches} / 6</span>
              </span>
              <button
                onClick={initMatchGame}
                className="text-xs font-black text-amber-700 bg-amber-100/60 hover:bg-amber-200/80 p-1 px-3.5 rounded-xl flex items-center gap-1 border border-amber-300 transition-colors cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>换一批重新玩</span>
              </button>
            </div>

            {/* Matching Grid */}
            <div className="grid grid-cols-3 gap-3">
              {matchCards.map((card) => {
                const isSelected = selectedCards.some(sc => sc.id === card.id);
                const isWrong = wrongAnimationId.includes(card.id);

                return (
                  <motion.div
                    key={card.id}
                    onClick={() => handleMatchSelect(card)}
                    style={{ wordBreak: 'break-all' }}
                    animate={
                      isWrong
                        ? { x: [-5, 5, -5, 5, 0], scale: [1, 0.95, 1.02, 1] }
                        : isSelected
                        ? { scale: 1.04 }
                        : {}
                    }
                    className={`h-22 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-3 relative overflow-hidden select-none ${
                      card.isMatched
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : isWrong
                        ? 'bg-rose-100 border-rose-400 text-rose-800'
                        : isSelected
                        ? 'bg-amber-300 border-amber-500 text-amber-950 shadow-md scale-102'
                        : card.lang === 'en'
                        ? 'bg-teal-50 border-teal-200 hover:border-amber-400 text-teal-950 font-bold'
                        : 'bg-orange-50 border-orange-200 hover:border-amber-400 text-orange-950 font-bold'
                    }`}
                  >
                    {/* Card display label */}
                    <span className="text-[9px] text-slate-400 font-mono tracking-wider absolute top-0.5 right-1.5 uppercase font-bold">
                      {card.lang}
                    </span>

                    <h5 className="font-extrabold text-xs md:text-sm tracking-wide leading-tight px-1 mt-1">
                      {card.text}
                    </h5>

                    {/* Matched Overlay */}
                    {card.isMatched && (
                      <div className="absolute inset-0 bg-emerald-50/20 flex items-center justify-center">
                        <CheckCircle size={16} className="text-emerald-600 fill-white" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Victory banner */}
            {matchGameWon && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border-3 border-emerald-400 rounded-2xl p-4 text-center mt-2"
              >
                <div className="flex justify-center mb-1 text-yellow-400 glow-star">
                  <Trophy size={36} fill="currentColor" />
                </div>
                <h4 className="text-emerald-900 font-black text-sm">
                  ✨ 完美通关！
                </h4>
                <p className="text-emerald-700 text-xs font-semibold leading-normal mt-0.5">
                  你对大自然和种植相关的核心词组掌握得非常好，拿到了 15 金水滴 💧 和 1 把挖沙铲 ⛏️！快去花园开发你的土地吧！
                </p>
                <button
                  onClick={initMatchGame}
                  className="mt-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-black px-5 py-1.5 rounded-xl cursor-pointer shadow-sm"
                >
                  再玩一轮配对 (Play Again)
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
