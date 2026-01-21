export interface MCQ {
  question: string;
  options: string[];
  correctIndex: number; // 0-3
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface FillGap {
  textWithPlaceholders: string; // Use [GAP] as placeholder
  answers: string[]; // In order
  distractors?: string[]; // Optional extra words
}

export interface OpenQuestion {
  question: string;
  modelAnswer: string;
}

export interface EscapeRoomData {
  title: string;
  introText: string;
  mcqSet1: MCQ[]; // 10 items
  mcqSet2: MCQ[]; // 10 items
  matchingSet1: MatchingPair[]; // 7 items
  matchingSet2: MatchingPair[]; // 7 items
  fillGap: FillGap; // 8 gaps
  openQuestions: OpenQuestion[]; // 2 items
}

export enum GenerationStatus {
  IDLE,
  GENERATING,
  SUCCESS,
  ERROR
}