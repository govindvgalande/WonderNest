export const GAME_IDS = ['cards','objects','pattern','missing','treasure','sounds','detective','story','shapes','order','maze','explorer'] as const;
export type GameId = typeof GAME_IDS[number];
export type AgeGroup = '3-5'|'6-8'|'9-12';
export type Locale = 'en'|'hi'|'mr';
export type Variant = 'cards'|'multi'|'sequence'|'reconstruct'|'single'|'route'|'maze';
export type TokenId = string;
export type PromptId = 'match'|'recall'|'repeat'|'missing'|'route'|'sound'|'observe'|'story'|'shapes'|'order'|'maze'|'explore';
export interface Challenge {
  id: string;
  gameId: GameId;
  seed: number;
  level: number;
  ageGroup: AgeGroup;
  mode: Variant;
  prompt: PromptId;
  preview: string[];
  options: string[];
  answer: string[];
  board?: string[];
  gridSize?: number;
  cue?: string;
  storyFrames?: {actor: string; object: string; place: string}[];
}
export interface Attempt { profileId: string; gameId: GameId; seed: number; level: number; correct: boolean; mistakes: number; hints: number; durationSec: number; }
export interface DifficultyState { level: number; recent: {success: boolean; hints: number; mistakes: number}[]; }
export interface Profile { id: string; nickname: string; ageGroup: AgeGroup; avatar: string; dailyLimitMin: number; sessionLimitMin: number; createdAt: number; disabledGames: GameId[]; }
export interface Settings { locale: Locale; sound: boolean; music: boolean; narration: boolean; volume: number; reducedMotion: boolean; householdLimitMin: number; paused: boolean; allowedFrom: string; allowedUntil: string; breakReminderMin: number; }
export interface Progress { gameId: GameId; plays: number; wins: number; accuracy: number; level: number; }
