export enum QueryType {
  TEXT = "text",
  IMAGE = "image",
  VOICE = "voice",
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  xp: number;
  streak: number;
  badges: string[];
  lastActive: string;
  createdAt: string;
}

export interface Slide {
  title: string;
  content: string[];
  image?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Solution {
  id?: string;
  userId: string;
  query: string;
  queryType: QueryType;
  explanation: string;
  slides: Slide[];
  quiz: QuizQuestion[];
  audioUrl?: string;
  topic: string;
  createdAt: string;
}

export interface ChatMessage {
  id?: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  tutorId: string;
  createdAt: string;
}

export interface Tutor {
  id: string;
  name: string;
  role: string;
  personality: string;
  avatar: string;
}
