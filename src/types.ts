export type ApiProvider = 'openai' | 'gigachat';

export interface ApiSettings {
  provider: ApiProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  backendUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  scenarioTitle?: string;
}

export interface Scenario {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  taskGoal: string;
  suggestedPrompts: string[];
  testQuestions: string[];
  systemPrompt: string;
}

export interface PromptEvaluation {
  hasRole: boolean;
  hasContext: boolean;
  hasTask: boolean;
  hasRestrictions: boolean;
  hasFormat: boolean;
  score: number;
}
