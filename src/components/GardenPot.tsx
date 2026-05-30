import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shovel, Droplet, Sun, RotateCcw, Award, Sparkles } from 'lucide-react';
import { SeedType, PlantState } from '../types';

interface GardenPotProps {
  plantState: PlantState;
  waterDrops: number;
  inventory: {
    spadeCount: number;
    soilCount: number;
    sunCount: number;
  };
  onUpdatePlant: (updated: Partial<PlantState>) => void;
  onSpendDrops: (amount: number) => boolean;
  onSpendTool: (tool: 'spade' | 'soil' | 'sun') => boolean;
  onHarvest: (earnedDrops: number, earnedStars: number) => void;
  addNotification: (msg: string, type: 'success' | 'info') => void;
}

export default function GardenPot({
  plantState,
  waterDrops,
  inventory,
  onUpdatePlant,
  onSpendDrops,
  onSpendTool,
  onHarvest,
  addNotification,
}: GardenPotProps) {
  const [isWateringAnim, setIsWateringAnim] = useState(false);
  const [isDiggingAnim, setIsDiggingAnim] = useState(false);

  const selectSeed = (type: SeedType) => {
    if (plantState.stage > 0) return;
    onUpdatePlant({
      type,
      stage: 1, // move to dug stage pending
      wateredCount: 0,
      neededWaterToNext: 1,
      isHarvested: false,
    });
    addNotification(`你选择播种了 ${type === 'sunflower' ? '向日葵 🌻' : type === 'bean' ? '四季豆 🫘' : '大甜椒 🫑'}！`, 'success');
  };

  const handleDig = () => {
    if (plantState.stage !== 1) return;
    if (inventory.spadeCount <= 0) {
      addNotification("你需要一把小产子！请先去左边[读书挑战]和[好词闪卡]赚取工具吧！", "info");
      return;
    }
    setIsDiggingAnim(true);
    setTimeout(() => {
      onSpendTool('spade');
      onUpdatePlant({ stage: 2 });
      setIsDiggingAnim(false);
      addNotification("坑挖好了！开始播种吧。 First, dig holes! ⛏️", "success");
    }, 1200);
  };

  const handleSow = () => {
    if (plantState.stage !== 2) return;
    onUpdatePlant({ stage: 3 });
    addNotification("种子放进泥土坑里啦！ Put the seeds in the holes. 🌱", "success");
  };

  const handleCover = () => {
    if (plantState.stage !== 3) return;
    if (inventory.soilCount <= 0) {
      addNotification("泥土不够了！请先在左侧完成[第2题填空游戏]获取泥土肥料！", "info");
      return;
    }
    onSpendTool('soil');
    onUpdatePlant({ stage: 4, neededWaterToNext: 1 });
    addNotification("用营养丰富的泥土盖好啦！Then, cover the holes with soil. 🤎", "success");
  };

  const handleWater = () => {
    if (plantState.stage < 4 || plantState.stage === 7) return;
    if (waterDrops < 10) {
      addNotification("金水滴不够啦！快去左边读课文或通过答题赢取水滴吧！💧", "info");
      return;
    }

    setIsWateringAnim(true);
    setTimeout(() => {
      onSpendDrops(10);
      const currentStage = plantState.stage;
      const currentWatered = plantState.wateredCount + 1;
      let nextStage = currentStage;
      let nextNeeded = plantState.neededWaterToNext;

      if (currentStage === 4) {
        // covered to sprout
        nextStage = 5; // sprout
        nextNeeded = 2; // need 2 watering to flower
      } else if (currentStage === 5) {
        if (currentWatered >= 2) {
          nextStage = 6; // growing into leaves & flowers
          nextNeeded = 2; // need 2 watering to fruit
        }
      } else if (currentStage === 6) {
        if (currentWatered >= 2) {
          nextStage = 7; // fruited!
          nextNeeded = 0;
        }
      }

      onUpdatePlant({
        stage: nextStage,
        wateredCount: nextStage !== currentStage ? 0 : currentWatered,
        neededWaterToNext: nextNeeded,
      });

      setIsWateringAnim(false);

      // Trigger fun messages matching lesson sentences
      if (nextStage === 5 && currentStage === 4) {
        addNotification("哇！茎长高了：Our stems go up and up! 🌱", "success");
      } else if (nextStage === 6 && currentStage === 5) {
        addNotification("太美了！开花了：The flowers grow! 🌸", "success");
      } else if (nextStage === 7 && currentStage === 6) {
        addNotification("果实结出来啦！瞧：The flowers make fruit. 🥳", "success");
      } else {
        addNotification("滋润浇水了！每天都要好好喝水哦：Water the seeds every day. 💧", "success");
      }
    }, 1500);
  };

  const handleSunLight = () => {
    if (plantState.stage !== 6 && plantState.stage !== 5) {
      addNotification("现在还不需要强烈的阳光，先多浇点水吧！🌞", "info");
      return;
    }
    if (inventory.sunCount <= 0) {
      addNotification("太阳能量不足！完成右边第3题[探究思辨]即可召唤金太阳！☀️", "info");
      return;
    }
    onSpendTool('sun');
    // speed up stage by 1
    const nextSg = plantState.stage + 1;
    onUpdatePlant({
      stage: nextSg,
      wateredCount: 0,
    });
    addNotification("温暖的阳光普照！植物瞬间长大了一级！Our plants grow up and up! ☀️🌿", "success");
  };

  const handleHarvestClick = () => {
    if (plantState.stage !== 7) return;
    // Harvest gives massive stars and drops
    onHarvest(40, 5); // 40 drops, 5 stars
    onUpdatePlant({
      type: null,
      stage: 0,
      wateredCount: 0,
      neededWaterToNext: 0,
      isHarvested: true,
    });
    addNotification("大丰收！获得 40 金水滴 💧 + 5 荣誉金星 ⭐！果实里藏着宝贵的种子！", "success");
  };

  const handleReset = () => {
    onUpdatePlant({
      type: null,
      stage: 0,
      wateredCount: 0,
      neededWaterToNext: 0,
      isHarvested: false,
    });
  };

  // Plant Custom SVG Drawer
  const renderPlantSVG = () => {
    const { stage, type } = plantState;

    return (
      <svg viewBox="0 0 200 240" className="w-full h-64 md:h-76 drop-shadow-lg bg-emerald-50/40 rounded-3xl border border-emerald-100 p-2">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f0fdf4" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="flowerSun" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="bellPepper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect x="5" y="5" width="190" height="230" rx="20" fill="url(#skyGrad)" />

        {/* Dynamic Sun rays */}
        {stage >= 5 && (
          <motion.circle
            cx="170"
            cy="35"
            r="12"
            fill="#f59e0b"
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
        )}

        {/* Pot Glass Jar Outline */}
        <path d="M 50 170 C 50 150, 48 140, 52 140 L 148 140 C 152 140, 150 150, 150 170 C 150 205, 135 220, 100 220 C 65 220, 50 205, 50 170 Z" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        <path d="M 45 140 L 155 140" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />

        {/* Mud / Soil block depending on Stage */}
        {stage >= 4 ? (
          // Covered Soil
          <path d="M 51 141 C 70 138, 130 138, 149 141 C 149 170, 135 218, 100 218 C 65 218, 51 170, 51 141 Z" fill="url(#soilGrad)" opacity="0.9" />
        ) : stage === 3 ? (
          // Half-filled soil, seed showing
          <>
            <path d="M 51 165 C 70 162, 130 162, 149 165 C 149 185, 135 218, 100 218 C 65 218, 51 185, 51 165 Z" fill="url(#soilGrad)" opacity="0.85" />
            {/* Seed visible */}
            <ellipse cx="100" cy="155" rx="6" ry="4" fill="#fbbf24" stroke="#78350f" strokeWidth="2.5" />
          </>
        ) : stage === 2 ? (
          // Dug hole
          <>
            <path d="M 51 165 C 70 162, 130 162, 149 165 C 149 185, 135 218, 100 218 C 65 218, 51 185, 51 165 Z" fill="url(#soilGrad)" opacity="0.85" />
            {/* The Hole */}
            <path d="M 85 164 M 85 164 Q 100 180 115 164 Z" fill="#451a03" stroke="#270e01" strokeWidth="2" />
          </>
        ) : stage === 1 ? (
          // Initial solid level before shovel
          <path d="M 51 165 C 70 163, 130 163, 149 165 C 149 185, 135 218, 100 218 C 65 218, 51 185, 51 165 Z" fill="#a16207" opacity="0.8" />
        ) : (
          // Raw empty glass pot with small support base
          <ellipse cx="100" cy="205" rx="20" ry="6" fill="#cbd5e1" opacity="0.5" />
        )}

        {/* Shovel / Digging Anim Helper */}
        {isDiggingAnim && (
          <motion.g
            animate={{ x: [0, -10, 15, -15, 0], y: [0, 10, -5, 10, 0], rotate: [0, -20, 10, -10, 0] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ originX: '110px', originY: '140px' }}
          >
            <path d="M 120 120 L 105 145 C 103 148, 105 152, 110 150 L 125 135 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2.5" />
            <line x1="122" y1="122" x2="145" y2="100" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
            <path d="M 143 102 C 145 100, 150 102, 148 105" stroke="#78350f" strokeWidth="4" />
          </motion.g>
        )}

        {/* Root growth showing inside soil (Stage >= 5) */}
        {stage >= 5 && (
          <g stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75">
            {/* Primary Root */}
            <path d="M 100 148 Q 103 170, 98 190 Q 105 205, 102 214" />
            {/* Second Root */}
            <path d="M 100 160 Q 85 175, 80 192" />
            <path d="M 100 172 Q 118 185, 122 205" />
            {/* Root whiskers */}
            <path d="M 98 190 Q 90 197, 92 204" />
            <path d="M 82 180 Q 75 185, 76 191" />
            <path d="M 110 180 Q 115 188, 113 195" />
          </g>
        )}

        {/* WATERING DROPS falling down */}
        <AnimatePresence>
          {isWateringAnim && (
            <motion.g
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <line x1="85" y1="50" x2="115" y2="50" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="40" x2="100" y2="50" stroke="#38bdf8" strokeWidth="3" />
              {/* Splatters */}
              {[...Array(6)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={80 + i * 8}
                  cy={60}
                  r="3.5"
                  fill="#38bdf8"
                  animate={{ y: [0, 80], x: [0, (i - 2.5) * 6], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* VEGETATIVE GROWTH STAGES (Stems, Leaves) */}
        {stage === 4 && (
          /* Seed buried under soil */
          <motion.circle
            cx="100"
            cy="143"
            r="3.5"
            fill="#a16207"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}

        {stage === 5 && (
          /* SPROUT */
          <g>
            {/* Stem */}
            <path d="M 100 142 Q 95 125, 102 110" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
            {/* Tiny leaf left */}
            <path d="M 98 122 Q 85 118, 90 112 Q 97 114, 98 122 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
            {/* Tiny leaf right */}
            <path d="M 101 116 Q 112 110, 110 102 Q 102 108, 101 116 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
          </g>
        )}

        {stage === 6 && (
          /* GROWING & FLOWERING */
          <g>
            {/* Tall Stem */}
            <path d="M 100 142 Q 90 100, 100 70 Q 105 55, 100 45" fill="none" stroke="#22c55e" strokeWidth="6.5" strokeLinecap="round" />
            {/* Side branch left */}
            <path d="M 95 105 Q 75 95, 70 85 Q 85 85, 93 100" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
            {/* Side branch right */}
            <path d="M 98 90 Q 120 85, 125 72 Q 115 75, 100 85" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />

            {/* Sunflower Bud / Flower */}
            {type === 'sunflower' && (
              <g transform="translate(100, 42)">
                {/* Yellow petals */}
                {[...Array(8)].map((_, idx) => {
                  const angle = (idx * 360) / 8;
                  return (
                    <ellipse
                      key={idx}
                      cx="0"
                      cy="-15"
                      rx="6"
                      ry="12"
                      fill="url(#flowerSun)"
                      stroke="#d97706"
                      strokeWidth="1"
                      transform={`rotate(${angle})`}
                    />
                  );
                })}
                {/* Sunflower Center */}
                <circle cx="0" cy="0" r="10" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="6" fill="#451a03" />
              </g>
            )}

            {/* Bean snap purple blossoms */}
            {type === 'bean' && (
              <g transform="translate(100, 42)">
                {/* Branch vines twisting */}
                <path d="M 0 0 C 15 -10, 10 -25, 0 -22 C -10 -25, -15 -10, 0 0" fill="none" stroke="#15803d" strokeWidth="2" />
                {/* Flower 1 */}
                <circle cx="-10" cy="-10" r="6" fill="#c084fc" />
                <circle cx="-8" cy="-12" r="4.5" fill="#e9d5ff" />
                {/* Flower 2 */}
                <circle cx="11" cy="-14" r="5.5" fill="#c084fc" />
                <circle cx="9" cy="-15" r="4" fill="#f3e8ff" />
                <circle cx="0" cy="-20" r="5" fill="#a855f7" />
              </g>
            )}

            {/* Pepper delicate white flower */}
            {type === 'pepper' && (
              <g transform="translate(100, 42)">
                {[...Array(6)].map((_, idx) => {
                  const r = (idx * 360) / 6;
                  return (
                    <path
                      key={idx}
                      d="M 0 0 L -4 -12 L 0 -16 L 4 -12 Z"
                      fill="#f8fafc"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      transform={`rotate(${r})`}
                    />
                  );
                })}
                <circle cx="0" cy="0" r="5" fill="#facc15" />
              </g>
            )}
          </g>
        )}

        {stage === 7 && (
          /* COMPLETELY FRUITED & MATURED! */
          <g>
            {/* Main robust stem */}
            <path d="M 100 142 Q 90 95, 100 65 Q 105 50, 95 38" fill="none" stroke="#15803d" strokeWidth="8" strokeLinecap="round" />
            {/* Big healthy leaves */}
            <path d="M 94 100 Q 60 90, 52 72 Q 78 72, 92 92" fill="#15803d" stroke="#14532d" strokeWidth="2" />
            <path d="M 98 85 Q 135 78, 142 62 Q 125 64, 102 78" fill="#166534" stroke="#14532d" strokeWidth="2" />

            {/* Dynamic Matured Fruits with Seeds visible inside or highlighted */}
            {type === 'sunflower' && (
              <g transform="translate(95, 34)">
                {/* Big full seed disc */}
                {[...Array(12)].map((_, idx) => {
                  const angle = (idx * 360) / 12;
                  return (
                    <ellipse
                      key={idx}
                      cx="0"
                      cy="-20"
                      rx="8"
                      ry="18"
                      fill="#fbbf24"
                      stroke="#d97706"
                      strokeWidth="1.5"
                      transform={`rotate(${angle})`}
                    />
                  );
                })}
                <circle cx="0" cy="0" r="18" fill="#451a03" stroke="#d97706" strokeWidth="2" />
                {/* Seed check pattern representation */}
                <ellipse cx="0" cy="0" rx="14" ry="14" fill="#270e01" />
                {/* Golden sparklings for harvesting seeds inside! */}
                {[...Array(8)].map((_, i) => (
                  <circle
                    key={i}
                    cx={(i % 3 - 1) * 7 + (i > 4 ? 2 : -2)}
                    cy={Math.floor(i / 3 - 1) * 7}
                    r="2"
                    fill="#fbbf24"
                    className="animate-pulse"
                  />
                ))}
              </g>
            )}

            {type === 'bean' && (
              <g transform="translate(95, 38)">
                {/* Hanging bean pods snaps */}
                <motion.path
                  d="M 5 -5 Q 15 25, 8 45 Q 11 50, 10 52"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                />
                <motion.path
                  d="M -10 -8 Q -28 15, -25 35 Q -22 38, -25 40"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  animate={{ rotate: [2, -2, 2] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }}
                />
                
                {/* Snap snap circles represent seeds packed inside the bean pod! */}
                <circle cx="9" cy="12" r="3" fill="#15803d" />
                <circle cx="11" cy="24" r="3" fill="#15803d" />
                <circle cx="10" cy="35" r="3" fill="#15803d" />
                <circle cx="-18" cy="10" r="2.5" fill="#14532d" />
                <circle cx="-22" cy="22" r="2.5" fill="#14532d" />
              </g>
            )}

            {type === 'pepper' && (
              <g transform="translate(95, 36)">
                {/* Heavy fat shining Red Bell Pepper capsicum */}
                <g
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <path d="M -15 -10 C -18 -18, 18 -18, 15 -10 C 22 15, 10 32, 0 35 C -10 32, -22 15, -15 -10 Z" fill="url(#bellPepper)" stroke="#7f1d1d" strokeWidth="2.5" />
                  {/* Stem of the capsicum */}
                  <path d="M 0 -13 Q 5 -25, 12 -22" fill="none" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
                  {/* Highlighting shine */}
                  <ellipse cx="-7" cy="-2" rx="4" ry="8" fill="#fca5a5" opacity="0.6" transform="rotate(-15)" />
                </g>
              </g>
            )}

            {/* Glowing sparkle badge of maturity */}
            <motion.g
              className="glow-star text-amber-400"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            >
              <line x1="140" y1="40" x2="140" y2="20" stroke="currentColor" strokeWidth="2" />
              <line x1="130" y1="30" x2="150" y2="30" stroke="currentColor" strokeWidth="2" />
              <circle cx="140" cy="30" r="3.5" fill="currentColor" />
            </motion.g>
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="bg-white border-4 border-emerald-400 rounded-3xl p-4 shadow-xl flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-emerald-800 flex items-center gap-1">
          <span>🌿 我的精读花园</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            My Garden
          </span>
        </h3>
        
        {/* Rewards counters */}
        <div className="flex items-center gap-2">
          <div className="bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Droplet className="text-sky-500 fill-sky-200" size={16} />
            <span className="font-extrabold text-sky-800 text-sm">
              {waterDrops} 滴
            </span>
          </div>
        </div>
      </div>

      {/* The Core Live Drawing Frame */}
      <div className="relative">
        {renderPlantSVG()}

        {/* Floating Banner notifications of stage */}
        <div className="absolute top-4 left-4 bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-2xl shadow-md border border-emerald-500">
          {plantState.stage === 0 && '等待播种 Waiting'}
          {plantState.stage === 1 && '第1步: 挖土坑 Dig a hole'}
          {plantState.stage === 2 && '第2步: 放种子 Put in seed'}
          {plantState.stage === 3 && '第3步: 撒覆土 Cover with soil'}
          {plantState.stage === 4 && '第4步: 初次浇水 Cover & Water'}
          {plantState.stage === 5 && '幼芽破土 Our stems go up 🌱'}
          {plantState.stage === 6 && '枝叶开花 Flowers blow 🌸'}
          {plantState.stage === 7 && '果实累累 Inside has seeds! 🎉'}
        </div>

        {/* Harvest Overlay for stage 7 */}
        {plantState.stage === 7 && (
          <motion.div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bg-yellow-400 border-4 border-yellow-200 p-4 rounded-full text-white shadow-xl glow-star cursor-pointer mb-2"
              onClick={handleHarvestClick}
            >
              <Award size={48} className="stroke-amber-900 fill-amber-300" />
            </motion.div>
            <p className="text-white font-black text-lg drop-shadow-md">
              哇！大丰收啦！
            </p>
            <p className="text-yellow-200 text-sm font-bold max-w-xs leading-snug">
              Inside the fruit, there are seeds! <br />
              果实里结出了新种子。快点击收获奖励吧！🌻🫘🫑
            </p>
            <button
              onClick={handleHarvestClick}
              className="mt-3 bg-gradient-to-r from-amber-500 to-yellow-400 font-extrabold text-sm text-slate-900 px-6 py-2 rounded-2xl shadow-lg border border-yellow-300 hover:from-amber-600 hover:scale-105 transition-all cursor-pointer"
            >
              【点击收获】 +40 滴金水滴 +5 勋章
            </button>
          </motion.div>
        )}
      </div>

      {/* Control Actions Panel */}
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 flex flex-col gap-2">
        {plantState.stage === 0 ? (
          <div>
            <p className="text-emerald-900 text-sm font-black text-center mb-2">
              👉 选择一颗神奇种子来播种吧：
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => selectSeed('sunflower')}
                className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 rounded-xl p-2 flex flex-col items-center gap-1 text-center transition-all hover:scale-105 cursor-pointer"
              >
                <span className="text-2xl">🌻</span>
                <span className="text-xs font-black text-amber-950">向日葵</span>
                <span className="text-[10px] text-amber-700 font-mono">Sunflower</span>
              </button>
              <button
                onClick={() => selectSeed('bean')}
                className="bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-xl p-2 flex flex-col items-center gap-1 text-center transition-all hover:scale-105 cursor-pointer"
              >
                <span className="text-2xl">🫘</span>
                <span className="text-xs font-black text-purple-950">四季豆</span>
                <span className="text-[10px] text-purple-700 font-mono">Snap Bean</span>
              </button>
              <button
                onClick={() => selectSeed('pepper')}
                className="bg-red-100 hover:bg-red-200 border-2 border-red-300 rounded-xl p-2 flex flex-col items-center gap-1 text-center transition-all hover:scale-105 cursor-pointer"
              >
                <span className="text-2xl">🫑</span>
                <span className="text-xs font-black text-red-950">大甜椒</span>
                <span className="text-[10px] text-red-700 font-mono">Pepper</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-emerald-200/60 pb-1.5">
              <span>当前种植：{plantState.type === 'sunflower' ? '向日葵 🌻' : plantState.type === 'bean' ? '四季豆 🫘' : '大甜椒 🫑'}</span>
              <button
                onClick={handleReset}
                className="flex items-center gap-0.5 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                title="重新种植"
              >
                <RotateCcw size={12} />
                <span>重种</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {/* Step 1: Dig Hole */}
              {plantState.stage === 1 && (
                <div className="flex items-center justify-between p-1 bg-amber-100/60 rounded-xl border border-amber-200/50">
                  <span className="text-xs font-bold text-amber-950 px-2">第一步: 挖出土坑 (1. Dig a hole)</span>
                  <button
                    onClick={handleDig}
                    disabled={isDiggingAnim}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1 shadow-sm transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                  >
                    <Shovel size={13} strokeWidth={2.5} />
                    <span>挖土 ⛏️</span>
                    <span className="bg-amber-200 text-amber-900 px-1 py-0.5 rounded-md font-mono text-[9px] scale-90">
                      拥有:{inventory.spadeCount}
                    </span>
                  </button>
                </div>
              )}

              {/* Step 2: Sow Seeds */}
              {plantState.stage === 2 && (
                <button
                  onClick={handleSow}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <span>🌱 投放种子 (2. Put the seed in)</span>
                </button>
              )}

              {/* Step 3: Cover soil */}
              {plantState.stage === 3 && (
                <div className="flex items-center justify-between p-1 bg-amber-100/60 rounded-xl border border-amber-200/50">
                  <span className="text-xs font-bold text-amber-950 px-2">第三步: 盖上泥土 (3. Cover soil)</span>
                  <button
                    onClick={handleCover}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 shadow-sm transition-all hover:scale-105 cursor-pointer"
                  >
                    <span>撒覆土 🤎</span>
                    <span className="bg-amber-900 text-amber-100 px-1 py-0.5 rounded-md font-mono text-[9px] scale-90">
                      泥土:{inventory.soilCount}
                    </span>
                  </button>
                </div>
              )}

              {/* Watering & Light (Stage >= 4, and not stage 7) */}
              {plantState.stage >= 4 && plantState.stage < 7 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span className="flex items-center gap-1">
                      {plantState.stage === 4 && '泥土已覆，快来给它浇第一口水吧！'}
                      {plantState.stage === 5 && '需要浇水让小幼芽健康长大开花！'}
                      {plantState.stage === 6 && '开花了！多给水，催出饱满果实！'}
                    </span>
                    {plantState.stage >= 5 && (
                      <span className="bg-emerald-100 text-emerald-700 font-mono px-1.5 py-0.5 rounded">
                        本阶段浇水: {plantState.wateredCount}/{plantState.neededWaterToNext} 次
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleWater}
                      disabled={isWateringAnim}
                      className="bg-sky-500 hover:bg-sky-600 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1 hover:scale-[1.02] hover:shadow-md transition-all cursor-pointer disabled:opacity-50 text-sm"
                    >
                      <Droplet size={15} className="animate-bounce" />
                      <span>浇灌水滴 (-10💧)</span>
                    </button>

                    <button
                      onClick={handleSunLight}
                      disabled={inventory.sunCount === 0}
                      className="bg-amber-400 hover:bg-amber-500 hover:scale-[1.02] hover:shadow-md text-slate-900 font-black py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer text-sm disabled:opacity-40"
                    >
                      <Sun size={15} />
                      <span>阳光普照 (sun:{inventory.sunCount})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mini Tips overlay for learners */}
      <div className="bg-slate-50 border border-slate-200/75 rounded-2xl p-2.5 text-[11px] text-slate-500 font-medium leading-relaxed flex items-start gap-1">
        <Sparkles size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 block mb-0.5">💡 小小种植秘籍:</span>
          1. 读左边的精读句获得【金水滴 💧】和【铲子 ⛏️】工具。<br />
          2. 做填空题获得【营养土 🤎】。3. 思考探究大挑战获得【金太阳 ☀️】。积累的能量越多，果实长得越壮大！
        </div>
      </div>
    </div>
  );
}
