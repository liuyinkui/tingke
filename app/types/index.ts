/**
 * 听刻 · TypeScript 类型定义
 *
 * 素材、学习记录、导航等核心类型
 */

// —— 素材 (Material) ——

export interface Sentence {
  id: string;
  index: number;
  text: string;
  startTime: number; // 秒
  endTime: number;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Material {
  id: string;
  title: string;
  titleEn: string;
  difficulty: Difficulty;
  duration: number; // 总时长（秒）
  sentences: Sentence[];
  audioUrl: string;
  source: string;  // 来源：CET-4, CET-6, VOA 等
  tags: string[];
}

// —— 学习流 (Learning Flow) ——

export type StepType = 'listen' | 'dictation' | 'shadowing';

export interface DictationResult {
  sentenceIndex: number;
  sentence: string;
  userInput: string;
  status: 'correct' | 'wrong' | 'empty';
}

export interface ShadowingResult {
  sentenceIndex: number;
  recordingUrl?: string;
  score: number;
}

// —— 学习记录 ——

export interface LearningRecord {
  id: string;
  date: string; // ISO date
  materialId: string;
  dictationResults: DictationResult[];
  shadowingResults: ShadowingResult[];
  accuracy: number;       // 辨音准确率 0-100
  duration: number;        // 学习总秒数
  completedSentences: number;
  blindSpots: string[];    // 写错的词
  streak: number;
}

// —— 用户 ——

export interface UserStats {
  streak: number;
  totalDays: number;
  totalDuration: number;
  weeklyAccuracy: number;
  accuracyTrend: number; // 比上周提升%
  blindSpotWords: string[];
}

// —— 导航 ——

export type RootTabParamList = {
  Home: undefined;
  Library: undefined;
  Profile: undefined;
};

export type ListenStackParamList = {
  Listen: { materialId: string };
  Dictation: { materialId: string };
  Shadowing: { materialId: string };
  Complete: { materialId: string; accuracy: number; streak: number };
};
