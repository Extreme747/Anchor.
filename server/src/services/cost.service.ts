import { config } from '../config/index.js';

export class CostTrackerService {
  /**
   * Calculate message cost in INR based on category and CTWA status
   */
  static calculateCost(category: string, isCtwa = false, isCtwaActive = false): {
    costINR: number;
    anchorMarkupINR: number;
    competitorWatiINR: number;
    competitorInteraktINR: number;
    isCtwaFree: boolean;
  } {
    // If sent within the 72-hour CTWA free messaging window, it's 100% FREE!
    if (isCtwa && isCtwaActive) {
      return {
        costINR: 0.0,
        anchorMarkupINR: 0.0,
        competitorWatiINR: 0.86 * (1 + config.competitorMarkups.wati),
        competitorInteraktINR: 0.86 * (1 + config.competitorMarkups.interakt),
        isCtwaFree: true,
      };
    }

    let metaBaseCost = 0.0;
    switch (category.toUpperCase()) {
      case 'MARKETING':
        metaBaseCost = config.metaRates.MARKETING; // ₹0.86
        break;
      case 'UTILITY':
        metaBaseCost = config.metaRates.UTILITY; // ₹0.115
        break;
      case 'AUTHENTICATION':
        metaBaseCost = config.metaRates.AUTHENTICATION; // ₹0.115
        break;
      case 'SERVICE':
      default:
        metaBaseCost = config.metaRates.SERVICE; // ₹0.00
        break;
    }

    // Anchor has 0% markup
    const anchorCost = metaBaseCost;
    const anchorMarkup = 0.0;

    // Competitors charge 15-39% hidden markup
    const watiCost = metaBaseCost * (1 + config.competitorMarkups.wati);
    const interaktCost = metaBaseCost * (1 + config.competitorMarkups.interakt);

    return {
      costINR: Number(anchorCost.toFixed(4)),
      anchorMarkupINR: Number(anchorMarkup.toFixed(4)),
      competitorWatiINR: Number(watiCost.toFixed(4)),
      competitorInteraktINR: Number(interaktCost.toFixed(4)),
      isCtwaFree: false,
    };
  }
}
