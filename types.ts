
export enum AppView {
  CHAT = 'CHAT',
  VISION = 'VISION',
  GENERATE = 'GENERATE',
  LIVE = 'LIVE',
  POS = 'POS'
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  groundingUrls?: { title: string; uri: string }[];
}

export interface GenerationResult {
  type: 'image' | 'video';
  url: string;
  prompt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}
