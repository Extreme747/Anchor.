import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'anchor_jwt_secret_dev_2026_super_secure_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  metaVerifyToken: process.env.META_VERIFY_TOKEN || 'anchor_meta_verify_token_2026',
  metaAppSecret: process.env.META_APP_SECRET || 'mock_meta_app_secret_anchor_2026',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8443',

  // Meta Official Rate Card (India - INR)
  metaRates: {
    MARKETING: 0.86,
    UTILITY: 0.115,
    AUTHENTICATION: 0.115,
    SERVICE: 0.00, // Free service window (up to Oct 1, 2026)
  },

  // Competitor average markups for savings calculation
  competitorMarkups: {
    wati: 0.20,      // 20% markup
    interakt: 0.39,  // 39% utility markup
    aisensy: 0.18,   // 18% markup
  },

  // Deterministic Intent thresholds
  intent: {
    HOT_THRESHOLD: 80,
    WARM_THRESHOLD: 50,
    DECAY_POINTS_PER_12H: 5,
  },

  // SLA Defaults
  sla: {
    DEFAULT_FIRST_RESPONSE_MINS: 7,
    CRITICAL_RESPONSE_MINS: 2,
  },
};
