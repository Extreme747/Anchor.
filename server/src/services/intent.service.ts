import { IntentScoreResult } from '../types/index.js';

interface TriggerRule {
  phrase: string;
  points: number;
  category: 'BUDGET' | 'TIMELINE' | 'ACTION' | 'NEGATIVE';
}

const DEFAULT_TRIGGERS: TriggerRule[] = [
  // ── Budget Triggers (+25)
  { phrase: 'cr', points: 25, category: 'BUDGET' },
  { phrase: 'crore', points: 25, category: 'BUDGET' },
  { phrase: 'lakh', points: 25, category: 'BUDGET' },
  { phrase: 'budget', points: 20, category: 'BUDGET' },
  { phrase: 'price', points: 20, category: 'BUDGET' },
  { phrase: 'cost', points: 20, category: 'BUDGET' },
  { phrase: 'carpet area', points: 20, category: 'BUDGET' },
  { phrase: 'rate kitna', points: 25, category: 'BUDGET' },
  { phrase: 'price kya hai', points: 25, category: 'BUDGET' },
  { phrase: 'cost batao', points: 25, category: 'BUDGET' },
  { phrase: 'kitne ka padega', points: 25, category: 'BUDGET' },
  { phrase: 'kitna lagega', points: 20, category: 'BUDGET' },

  // ── Timeline Triggers (+30)
  { phrase: 'immediate', points: 30, category: 'TIMELINE' },
  { phrase: 'urgent', points: 30, category: 'TIMELINE' },
  { phrase: 'ready to move', points: 30, category: 'TIMELINE' },
  { phrase: 'this weekend', points: 25, category: 'TIMELINE' },
  { phrase: 'today', points: 25, category: 'TIMELINE' },
  { phrase: 'tomorrow', points: 25, category: 'TIMELINE' },
  { phrase: 'asap', points: 25, category: 'TIMELINE' },
  { phrase: 'jaldi chahiye', points: 30, category: 'TIMELINE' },
  { phrase: 'urgent hai', points: 30, category: 'TIMELINE' },
  { phrase: 'turant', points: 25, category: 'TIMELINE' },
  { phrase: 'abhi book', points: 30, category: 'TIMELINE' },
  { phrase: 'possession kab', points: 25, category: 'TIMELINE' },

  // ── Action Triggers (+35)
  { phrase: 'site visit', points: 35, category: 'ACTION' },
  { phrase: 'visit kab', points: 35, category: 'ACTION' },
  { phrase: 'ghar dekhna', points: 35, category: 'ACTION' },
  { phrase: 'flat dekhna', points: 35, category: 'ACTION' },
  { phrase: 'appointment', points: 30, category: 'ACTION' },
  { phrase: 'call me', points: 25, category: 'ACTION' },
  { phrase: 'location kahan', points: 25, category: 'ACTION' },
  { phrase: 'address bhejo', points: 25, category: 'ACTION' },
  { phrase: 'floor plan', points: 25, category: 'ACTION' },
  { phrase: 'brochure', points: 20, category: 'ACTION' },
  { phrase: 'token', points: 35, category: 'ACTION' },
  { phrase: 'cheque', points: 35, category: 'ACTION' },
  { phrase: 'booking', points: 30, category: 'ACTION' },

  // ── Negative Triggers (-30)
  { phrase: 'wrong number', points: -40, category: 'NEGATIVE' },
  { phrase: 'not interested', points: -30, category: 'NEGATIVE' },
  { phrase: 'stop messaging', points: -50, category: 'NEGATIVE' },
  { phrase: 'unsubscribe', points: -50, category: 'NEGATIVE' },
  { phrase: 'resume', points: -30, category: 'NEGATIVE' },
  { phrase: 'job vacancy', points: -30, category: 'NEGATIVE' },
];

export class IntentScoringEngine {
  /**
   * Calculate deterministic intent score (0-100) from text and previous score
   */
  static calculateScore(text: string, currentScore = 0): IntentScoreResult {
    const normalized = text.toLowerCase().trim();
    const matchedTriggers: Array<{ phrase: string; points: number; category: string }> = [];
    const matchedCategories = new Set<string>();

    let scoreDelta = 0;

    for (const rule of DEFAULT_TRIGGERS) {
      // Regex boundary or substring check
      const regex = new RegExp(`(^|\\b|\\s)${rule.phrase}(\\b|\\s|$)`, 'i');
      if (regex.test(normalized) || normalized.includes(rule.phrase)) {
        matchedTriggers.push({
          phrase: rule.phrase,
          points: rule.points,
          category: rule.category,
        });
        matchedCategories.add(rule.category);
        scoreDelta += rule.points;
      }
    }

    // Base score calculation with cumulative dampening
    let newScore = currentScore === 0 ? Math.max(scoreDelta, 20) : currentScore + scoreDelta;

    // Minimum 10 if positive contact, cap at 100, floor at 0
    if (matchedCategories.has('NEGATIVE')) {
      newScore = Math.max(0, newScore);
    } else {
      newScore = Math.min(100, Math.max(10, newScore));
    }

    // Try extracting estimated property value in INR
    const estimatedValue = this.extractValueINR(text);

    // Suggest next action based on triggers
    let suggestedAction = 'Follow up with regular brochure';
    if (matchedCategories.has('ACTION')) {
      suggestedAction = 'Schedule priority Site Visit / Tour';
    } else if (matchedCategories.has('TIMELINE') && matchedCategories.has('BUDGET')) {
      suggestedAction = 'Direct senior agent call within 2 minutes';
    } else if (newScore >= 80) {
      suggestedAction = 'Assign to Senior Closer — High Probability';
    }

    return {
      score: newScore,
      matchedCategories: Array.from(matchedCategories),
      matchedTriggers,
      suggestedAction,
      estimatedValue,
    };
  }

  /**
   * Deterministically extract INR value from mentions like "1.4 Cr", "80 Lakhs", "2.5 Crore"
   */
  static extractValueINR(text: string): number | undefined {
    const crMatch = text.match(/(\d+(\.\d+)?)\s*(cr|crore|crores)/i);
    if (crMatch && crMatch[1]) {
      return parseFloat(crMatch[1]) * 10000000;
    }

    const lakhMatch = text.match(/(\d+(\.\d+)?)\s*(lakh|lakhs|lac|lacs|l)/i);
    if (lakhMatch && lakhMatch[1]) {
      return parseFloat(lakhMatch[1]) * 100000;
    }

    return undefined;
  }

  /**
   * Apply time decay (e.g. 5 points lost every 12h of inactivity)
   */
  static applyDecay(score: number, hoursInactive: number): number {
    const periods = Math.floor(hoursInactive / 12);
    const decay = periods * 5;
    return Math.max(10, score - decay);
  }
}
