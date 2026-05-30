export type SeedType = 'sunflower' | 'bean' | 'pepper';

export interface PlantState {
  type: SeedType | null;
  stage: number; // 0: empty, 1: dug, 2: seeded, 3: covered, 4: sprout, 5: growing, 6: flowering, 7: fruited
  wateredCount: number;
  neededWaterToNext: number;
  lastWatered: string | null;
  isHarvested: boolean;
}

export interface VocabularyWord {
  id: string;
  english: string;
  chinese: string;
  example: string;
  exampleZh: string;
  phonetic?: string;
}

export interface SentenceItem {
  id: string;
  english: string;
  chinese: string;
}

export interface QuizState {
  q1Selected: string | null;
  q1Correct: boolean | null;
  q2Input: string;
  q2Correct: boolean | null;
  q3Input: string;
  q3Submitted: boolean;
  q3Feedback: string;
  hasEarnedReward: {
    q1: boolean;
    q2: boolean;
    q3: boolean;
  };
}

export interface UserProgress {
  waterDrops: number;
  stars: number;
  unlockedSeeds: SeedType[];
  inventory: {
    spadeCount: number;
    soilCount: number;
    sunCount: number;
  };
  completedMilestones: {
    textRead: boolean;
    flashcardsDone: boolean;
    wordMatchDone: boolean;
    quizDone: boolean;
  };
}
