import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, HelpCircle, Trophy, Sparkles, Wand2 } from 'lucide-react';
import { QuizState, UserProgress } from '../types';

interface QuizSectProps {
  progress: UserProgress;
  quizState: QuizState;
  onUpdateQuiz: (updated: Partial<QuizState>) => void;
  onGrantDrops: (amount: number) => void;
  onGrantTool: (tool: 'spade' | 'soil' | 'sun') => void;
  onCompleteMilestone: (milestone: 'textRead' | 'flashcardsDone' | 'wordMatchDone' | 'quizDone') => void;
  addNotification: (msg: string, type: 'success' | 'info') => void;
  setBuddyMsg: (en: string, zh: string, mood?: 'happy' | 'excited' | 'studying' | 'cheering') => void;
}

export default function QuizSect({
  progress,
  quizState,
  onUpdateQuiz,
  onGrantDrops,
  onGrantTool,
  onCompleteMilestone,
  addNotification,
  setBuddyMsg,
}: QuizSectProps) {
  const [activeQ, setActiveQ] = useState<number>(1);
  const [q2LetterBank, setQ2LetterBank] = useState<string[]>(['e', 's', 'd', 's', 'e']); // scrambled seeds letters
  const [q2Assembled, setQ2Assembled] = useState<string[]>([]);

  // Q3 Keyword help triggers
  const q3Keywords = [
    { text: "need water", label: "需要水分" },
    { text: "grow", label: "生长" },
    { text: "dry up", label: "干枯" },
    { text: "plants", label: "成为绿植" }
  ];

  const handleQ1Select = (option: string) => {
    const isCorrect = option === 'B';
    onUpdateQuiz({
      q1Selected: option,
      q1Correct: isCorrect,
    });

    if (isCorrect) {
      if (!quizState.hasEarnedReward.q1) {
        onGrantDrops(20);
        onGrantTool('spade');
        onUpdateQuiz({
          hasEarnedReward: { ...quizState.hasEarnedReward, q1: true }
        });
        addNotification("答对啦！获得 20 金水滴 💧 + 挖沙铲 ⛏️ 1把！挖坑成功！", "success");
        setBuddyMsg(
          "Exactly! Digging a hole is FIRST! Good job! ⛏️",
          "太聪明啦！种花第一步当然要先挖个泥土洞洞。看你拿到了一把亮晶晶的手推铲，快去连线挖土吧！",
          "excited"
        );
      } else {
        addNotification("回答正确！真是明察秋毫 🌟", "success");
      }
    } else {
      addNotification("哎呀，答错啦，再仔细看一遍课文步骤！挖坑才是第一步哦。", "info");
      setBuddyMsg(
        "Oops, look closer at sentence 1 in the stories!",
        "小花苞扭了扭头。再仔细想想看，第一句写的是：First, dig holes. 所以首先是要干嘛呢？"
      );
    }
  };

  // Letters tap to build "seeds"
  const handleQ2LetterTap = (letter: string, index: number, isAssembled: boolean) => {
    if (quizState.q2Correct) return;

    if (isAssembled) {
      // remove from assembled, put back to bank
      const newAssembled = [...q2Assembled];
      newAssembled.splice(index, 1);
      setQ2Assembled(newAssembled);
      setQ2LetterBank([...q2LetterBank, letter]);
    } else {
      // put to assembled, remove from bank
      const newBank = [...q2LetterBank];
      newBank.splice(index, 1);
      setQ2LetterBank(newBank);
      const updatedAssembled = [...q2Assembled, letter];
      setQ2Assembled(updatedAssembled);

      // check if word is complete (5 letters: s-e-e-d-s)
      const spelled = updatedAssembled.join("");
      if (spelled === 'seeds') {
        onUpdateQuiz({
          q2Input: 'seeds',
          q2Correct: true,
        });
        if (!quizState.hasEarnedReward.q2) {
          onGrantDrops(20);
          onGrantTool('soil');
          onUpdateQuiz({
            q2Input: 'seeds',
            q2Correct: true,
            hasEarnedReward: { ...quizState.hasEarnedReward, q2: true }
          });
          addNotification("恭喜拼装正确！ seeds (种子) 💧 +20 金水滴 + 泥土 🤎！", "success");
          setBuddyMsg(
            "Splendid! 'seeds' is inside the fruit!",
            "好棒！果实里确实藏着种子 'seeds'。你拼装成功，获得了［高钙有机营养土 🤎］一袋！可以给小花盆覆土啦！",
            "cheering"
          );
        }
      } else if (updatedAssembled.length === 5) {
        addNotification(`拼成了 ${spelled}，拼写不太对哦。重新组词一下吧！`, "info");
      }
    }
  };

  const handleQ2Typing = (value: string) => {
    const clean = value.trim().toLowerCase();
    onUpdateQuiz({ q2Input: value });
    if (clean === 'seeds' || clean === 'seed') {
      onUpdateQuiz({ q2Correct: true });
      if (!quizState.hasEarnedReward.q2) {
        onGrantDrops(20);
        onGrantTool('soil');
        onUpdateQuiz({
          q2Correct: true,
          hasEarnedReward: { ...quizState.hasEarnedReward, q2: true }
        });
        addNotification("恭喜拼写正确：seeds (种子)！ 💧 +20 水滴 + 泥土 🤎！", "success");
        setBuddyMsg("You are correct! Seeds are inside the fruit! 🍇", "恭喜拼写正确 seeds！你真有科学家的天赋，泥土养分到手，赶紧塞给小花盆盖土吧！");
      }
    }
  };

  const handleQ2Reset = () => {
    setQ2LetterBank(['e', 's', 'd', 's', 'e']);
    setQ2Assembled([]);
    onUpdateQuiz({ q2Input: '', q2Correct: null });
  };

  // Q3 Keyword Insertion click
  const insertKeywordToQ3 = (kw: string) => {
    if (quizState.q3Submitted) return;
    const currentText = quizState.q3Input;
    const spacing = currentText ? (currentText.endsWith(' ') ? '' : ' ') : '';
    onUpdateQuiz({ q3Input: currentText + spacing + kw + " " });
  };

  const handleQ3Submit = () => {
    const text = quizState.q3Input.trim().toLowerCase();
    if (!text) {
      addNotification("写一句话说明水分对种子发芽的重要性吧！💡", "info");
      return;
    }

    // Check scientific essence: needs terms like water or grow or dry
    const hasWater = text.includes("water") || text.includes("need") || text.includes("浇") || text.includes("干");
    const hasGrow = text.includes("grow") || text.includes("dry") || text.includes("成长") || text.includes("活");

    let feedback = "";
    if (hasWater && hasGrow) {
      feedback = "你的答案非常优秀：抓住了'种子需要水分才能生长，否则会干枯'的科学关键！";
    } else {
      feedback = "你已经迈出了一大步！我们更推荐写出：种子每天需要喝水成长，不喝水会干瘪干枯。";
    }

    onUpdateQuiz({
      q3Submitted: true,
      q3Feedback: feedback
    });

    if (!quizState.hasEarnedReward.q3) {
      onGrantDrops(30);
      onGrantTool('sun'); // Grant Sun Energy tool!
      onUpdateQuiz({
        q3Submitted: true,
        q3Feedback: feedback,
        hasEarnedReward: { ...quizState.hasEarnedReward, q3: true }
      });
      onCompleteMilestone('quizDone'); // Complete all quiz milestone
      addNotification("太伟大了！思辨小科学家。 💧 +30 金水滴 + 太阳能量 ☀️ 1个！", "success");
      setBuddyMsg(
        "Scientific thinker! You unlocked ultimate Gold Sun Energy!",
        "思维非常开阔！水真是生命的源泉。你赢取了最后的［金太阳 ☀️］，可以瞬间用阳光滋养你的植物，让他极速成长啦！",
        "cheering"
      );
    }
  };

  return (
    <div className="bg-white border-4 border-sky-400 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
      {/* Quiz Title */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-2">
        <h3 className="text-xl font-black text-sky-800 flex items-center gap-1.5">
          <Trophy className="text-yellow-500 animate-bounce-gentle" size={22} fill="currentColor" />
          <span>🎯 二年级精读小测验</span>
        </h3>
        
        {/* Question selectors tabs */}
        <div className="flex gap-1 bg-sky-50 p-1 rounded-xl">
          {[1, 2, 3].map(num => {
            const isCompleted =
              (num === 1 && quizState.hasEarnedReward.q1) ||
              (num === 2 && quizState.hasEarnedReward.q2) ||
              (num === 3 && quizState.hasEarnedReward.q3);

            return (
              <button
                key={num}
                onClick={() => {
                  setActiveQ(num);
                  if (num === 1) setBuddyMsg("What do you do FIRST when you plant a seed?", "挖土坑到底是不是第一步呢？快在选择题里挑战一下吧！");
                  if (num === 2) setBuddyMsg("What is inside the fruit? Spell the word!", "果实里究竟藏着什么，点击可爱的拼音字母解开谜底吧！");
                  if (num === 3) setBuddyMsg("Why do we need water? Think like a scientist!", "为什么每天要给种子喝水呢？把你的想法写在大挑战里，或者点击下方的提示关键词！");
                }}
                className={`w-8 h-8 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center justify-center relative ${
                  activeQ === num
                    ? 'bg-sky-500 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                }`}
              >
                <span>{num}</span>
                {isCompleted && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUIZ PANEL CARDS */}
      <div className="min-h-56 flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {activeQ === 1 && (
            /* QUESTION 1 CARD (Multiple Choices) */
            <motion.div
              key="q1-box"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-3"
            >
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl">
                <span className="text-[10px] bg-sky-200 text-sky-800 font-extrabold px-2 py-0.5 rounded-full">
                  QUESTION 1 (选择题)
                </span>
                <p className="text-slate-900 font-extrabold text-sm md:text-base mt-2 leading-relaxed">
                  ❓ **What do you do FIRST when you plant a seed?** <br />
                  <span className="text-slate-600 font-bold block text-xs mt-1">
                    （种种子的时候，你【首先】要做什么？）
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  { key: 'A', text: "Water the seeds.", zh: "给种子灌水浇灌" },
                  { key: 'B', text: "Dig a hole.", zh: "挖出一个泥土坑 holes" },
                  { key: 'C', text: "Cover with soil.", zh: "铺上一层厚厚的泥土" }
                ].map(opt => {
                  const isSelected = quizState.q1Selected === opt.key;
                  const isCorrect = opt.key === 'B';

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleQ1Select(opt.key)}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            : 'bg-rose-50 border-rose-400 text-rose-950'
                          : 'bg-slate-50 border-slate-100 hover:border-sky-300'
                      }`}
                    >
                      <div>
                        <span className="font-mono font-black mr-2 bg-sky-100 border text-sky-700 w-5 h-5 inline-flex items-center justify-center rounded-lg text-xs leading-none">
                          {opt.key}
                        </span>
                        <span className="text-slate-900 font-extrabold text-xs sm:text-sm">
                          {opt.text}
                        </span>
                        <span className="text-[10px] md:text-xs text-slate-500 font-medium block pl-7 mt-0.5">
                          {opt.zh}
                        </span>
                      </div>

                      {isSelected && (
                        <span>
                          {isCorrect ? (
                            <span className="bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full">
                              正确 +1 ⛏️
                            </span>
                          ) : (
                            <span className="bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full">
                              不对哦
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeQ === 2 && (
            /* QUESTION 2 CARD (Fill in blanks with letter bubbles spelling) */
            <motion.div
              key="q2-box"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-3"
            >
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl">
                <span className="text-[10px] bg-sky-200 text-sky-800 font-extrabold px-2 py-0.5 rounded-full">
                  QUESTION 2 (拼写填空题)
                </span>
                <p className="text-slate-900 font-extrabold text-sm md:text-base mt-2 leading-relaxed">
                  ❓ **A plant has a stem, leaves, roots, flowers, and ______ inside the fruit.** <br />
                  <span className="text-slate-600 font-bold block text-xs mt-1">
                    （植物有茎、叶子、根、花朵，还有果实里面的【______】。）
                  </span>
                </p>
              </div>

              {/* Letter Bubbles Assembler Box */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-3 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-700 mb-1">
                  <span>✨ 组合拼音气泡 (Spelling Seeds):</span>
                  {quizState.q2Correct && (
                    <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                      拼装正确 +泥土袋🤎
                    </span>
                  )}
                </div>

                <div className="flex select-none gap-2 min-h-12 items-center justify-center bg-white/70 border border-dashed border-indigo-200 rounded-xl p-2 mb-3">
                  {q2Assembled.length === 0 ? (
                    <span className="text-indigo-400 font-semibold text-xs text-center">
                      点击下边的英文字母拼成 "seeds" 吧
                    </span>
                  ) : (
                    q2Assembled.map((char, i) => (
                      <motion.button
                        key={`${char}-${i}`}
                        layoutId={`${char}-${i}`}
                        onClick={() => handleQ2LetterTap(char, i, true)}
                        className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-500 text-white font-black text-sm flex items-center justify-center shadow-xs cursor-pointer"
                      >
                        {char}
                      </motion.button>
                    ))
                  )}
                </div>

                <div className="flex justify-center gap-3">
                  {/* Scrambled source bank letters */}
                  {q2LetterBank.map((char, i) => (
                    <motion.button
                      key={`${char}-bank-${i}`}
                      layoutId={`${char}-bank-${i}`}
                      onClick={() => handleQ2LetterTap(char, i, false)}
                      whileHover={{ y: -3 }}
                      className="w-9 h-9 rounded-full bg-white border-2 border-indigo-300 text-indigo-900 hover:border-indigo-500 font-black text-sm flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      {char}
                    </motion.button>
                  ))}
                </div>

                <div className="flex justify-between mt-3">
                  <button
                    onClick={handleQ2Reset}
                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    重选重拼 (Reset letters)
                  </button>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    (支持英文: seeds 种子复数)
                  </span>
                </div>
              </div>

              {/* Text Input Option as Fallback */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 flex-shrink-0">
                  键盘打字输入:
                </span>
                <input
                  type="text"
                  placeholder="或者这里打字 seeds..."
                  value={quizState.q2Input}
                  onChange={(e) => handleQ2Typing(e.target.value)}
                  disabled={quizState.q2Correct === true}
                  className="bg-slate-50 border border-slate-200 focus:border-sky-400 font-bold focus:outline-hidden rounded-xl px-3 py-1.5 text-xs flex-1 text-slate-800 disabled:bg-emerald-100 disabled:border-emerald-300 disabled:text-emerald-950 font-mono"
                />
              </div>
            </motion.div>
          )}

          {activeQ === 3 && (
            /* QUESTION 3 CARD (Science open thinker dialog with keyword block injection) */
            <motion.div
              key="q3-box"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-3"
            >
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl">
                <span className="text-[10px] bg-sky-200 text-sky-800 font-extrabold px-2 py-0.5 rounded-full">
                  QUESTION 3 (探究与思辨题)
                </span>
                <p className="text-slate-900 font-extrabold text-sm md:text-base mt-2 leading-relaxed">
                  ❓ **Why do we need to water the seeds every day? What happens if we don’t?** <br />
                  <span className="text-slate-600 font-bold block text-xs mt-1">
                    （为什么我们要每天给种子浇水？如果不浇水会怎么样？）
                  </span>
                </p>
              </div>

              {/* Drag tags Helper widgets */}
              {!quizState.q3Submitted && (
                <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 mb-1">
                    <Wand2 size={12} className="text-yellow-500" />
                    <span>点击魔杖添加科学关键词 (Tap keywords to add):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {q3Keywords.map(kw => (
                      <button
                        key={kw.text}
                        onClick={() => insertKeywordToQ3(kw.text)}
                        className="bg-white hover:bg-amber-100 border border-amber-300 rounded-lg p-1 px-2 text-[10px] sm:text-xs font-black text-amber-900 cursor-pointer shadow-2xs hover:scale-102 transition-transform"
                      >
                        <span>{kw.text}</span>
                        <span className="text-[9px] font-medium text-amber-600 ml-1">
                          ({kw.label})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Writing Area */}
              <div className="flex flex-col gap-1.5">
                <textarea
                  rows={3}
                  value={quizState.q3Input}
                  onChange={(e) => onUpdateQuiz({ q3Input: e.target.value })}
                  placeholder="写下你的答案哦 (比如: Seeds need water to grow. If no water, they dry up...)"
                  disabled={quizState.q3Submitted}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-sky-400 focus:outline-hidden font-bold font-mono text-xs text-slate-800 disabled:bg-emerald-55/40 disabled:border-emerald-300 disabled:text-emerald-950 leading-relaxed"
                />

                {!quizState.q3Submitted ? (
                  <button
                    onClick={handleQ3Submit}
                    className="self-end bg-sky-500 hover:bg-sky-600 font-black text-xs text-white py-2 px-6 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    提交回答 (Submit check)
                  </button>
                ) : (
                  /* Answer submitted showing standard answer references */
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3 text-xs"
                  >
                    <div className="flex items-center gap-1 text-emerald-800 font-extrabold">
                      <Sparkles size={13} className="text-yellow-500" />
                      <span>芽芽小老师批改意见:</span>
                    </div>
                    <p className="text-slate-800 font-semibold leading-relaxed mt-1">
                      {quizState.q3Feedback}
                    </p>

                    <div className="border-t border-emerald-200 pt-2 mt-2">
                      <span className="font-extrabold text-teal-800 text-[10px] bg-teal-100 px-1.5 py-0.2 rounded">
                        📚 教科书标准答案对照
                      </span>
                      <p className="text-slate-700 font-bold leading-normal mt-1.5">
                        <b>English:</b> We water seeds every day because they need water to grow. If we don’t water them, they will dry up and cannot grow into plants.
                      </p>
                      <p className="text-slate-500 font-bold leading-normal mt-1 bg-white/60 p-1.5 rounded border border-emerald-100/50">
                        <b>中文:</b> 我们每天浇水是因为种子需要水才能生长。如果不浇水，它们会干枯，不能长成植物。
                      </p>
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => onUpdateQuiz({ q3Submitted: false, q3Input: '' })}
                        className="text-[9px] text-sky-700 hover:underline font-bold"
                      >
                        重新回答此问题 (Try spelling of Question 3 again)
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
