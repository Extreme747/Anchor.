import { Request } from 'express';

export type UserRole = 'OWNER' | 'MANAGER' | 'AGENT';

export interface AuthUser {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface IntentScoreResult {
  score: number;
  matchedCategories: string[];
  matchedTriggers: Array<{ phrase: string; points: number; category: string }>;
  suggestedAction?: string;
  estimatedValue?: number;
}

export interface AutoReplyResult {
  triggered: boolean;
  ruleName?: string;
  replyText?: string;
  templateId?: string;
  reason?: string;
}

export interface CTWAReferral {
  adId?: string;
  campaignId?: string;
  sourceType?: string;
  sourceUrl?: string;
  headline?: string;
  body?: string;
}
