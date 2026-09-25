import crypto from 'crypto';
import { CTWAReferral } from '../types/index.js';
import { config } from '../config/index.js';

export interface ParsedInboundMessage {
  fromPhone: string;
  senderName: string;
  metaMessageId: string;
  timestamp: Date;
  messageType: 'text' | 'interactive' | 'button' | 'flow' | 'media' | 'location' | 'unknown';
  text?: string;
  mediaUrl?: string;
  mediaType?: string;
  interactiveData?: {
    type: string;
    buttonId?: string;
    title?: string;
  };
  ctwaReferral?: CTWAReferral;
  rawPayload: any;
}

export class MetaProtocolService {
  /**
   * Verify HMAC-SHA256 signature from Meta webhook request
   */
  static verifySignature(rawBody: string, signatureHeader?: string, appSecret?: string): boolean {
    const secret = appSecret || config.metaAppSecret;
    if (!signatureHeader || !secret) {
      // In development mode, allow if no signature provided
      return config.nodeEnv === 'development';
    }

    const parts = signatureHeader.split('=');
    if (parts.length !== 2 || parts[0] !== 'sha256') {
      return false;
    }

    const expectedSignature = parts[1];
    const computedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(computedSignature, 'hex')
      );
    } catch {
      return false;
    }
  }

  /**
   * Parse inbound Meta WhatsApp Cloud API webhook JSON payload
   */
  static parseWebhookPayload(payload: any): ParsedInboundMessage[] {
    const results: ParsedInboundMessage[] = [];

    try {
      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      if (!value || !value.messages || value.messages.length === 0) {
        return results;
      }

      const contact = value.contacts?.[0];
      const senderName = contact?.profile?.name || 'WhatsApp User';
      const fromPhone = contact?.wa_id || value.messages[0]?.from;

      for (const msg of value.messages) {
        let messageType: ParsedInboundMessage['messageType'] = 'unknown';
        let text = '';
        let mediaUrl: string | undefined;
        let mediaType: string | undefined;
        let interactiveData: ParsedInboundMessage['interactiveData'];

        if (msg.type === 'text') {
          messageType = 'text';
          text = msg.text?.body || '';
        } else if (msg.type === 'interactive') {
          messageType = 'interactive';
          if (msg.interactive?.type === 'button_reply') {
            text = msg.interactive.button_reply?.title || '';
            interactiveData = {
              type: 'button_reply',
              buttonId: msg.interactive.button_reply?.id,
              title: msg.interactive.button_reply?.title,
            };
          } else if (msg.interactive?.type === 'list_reply') {
            text = msg.interactive.list_reply?.title || '';
            interactiveData = {
              type: 'list_reply',
              buttonId: msg.interactive.list_reply?.id,
              title: msg.interactive.list_reply?.title,
            };
          } else if (msg.interactive?.type === 'nfm_reply') {
            // WhatsApp Native Flow Form Submission!
            messageType = 'flow';
            text = 'Flow Response: ' + (msg.interactive.nfm_reply?.response_json || '');
          }
        } else if (msg.type === 'button') {
          messageType = 'button';
          text = msg.button?.text || '';
        } else if (['image', 'document', 'audio', 'video'].includes(msg.type)) {
          messageType = 'media';
          mediaType = msg.type;
          mediaUrl = msg[msg.type]?.id || '';
          text = msg[msg.type]?.caption || `[Sent a ${msg.type}]`;
        }

        // Parse Click-to-WhatsApp referral object
        let ctwaReferral: CTWAReferral | undefined;
        if (msg.referral) {
          ctwaReferral = {
            adId: msg.referral.ad_id,
            campaignId: msg.referral.campaign_id,
            sourceType: msg.referral.source_type,
            sourceUrl: msg.referral.source_url,
            headline: msg.referral.headline,
            body: msg.referral.body,
          };
        }

        results.push({
          fromPhone,
          senderName,
          metaMessageId: msg.id,
          timestamp: new Date(parseInt(msg.timestamp, 10) * 1000 || Date.now()),
          messageType,
          text,
          mediaUrl,
          mediaType,
          interactiveData,
          ctwaReferral,
          rawPayload: msg,
        });
      }
    } catch (err) {
      console.error('Error parsing Meta webhook payload:', err);
    }

    return results;
  }

  /**
   * Calculate 24h Meta Conversation window remaining time
   */
  static getSessionWindow(lastInboundAt?: Date | null): {
    isOpen: boolean;
    hoursRemaining: number;
    minutesRemaining: number;
    status: 'OPEN' | 'WARNING' | 'CRITICAL' | 'EXPIRED';
    requiresTemplate: boolean;
  } {
    if (!lastInboundAt) {
      return {
        isOpen: false,
        hoursRemaining: 0,
        minutesRemaining: 0,
        status: 'EXPIRED',
        requiresTemplate: true,
      };
    }

    const now = Date.now();
    const inboundTime = new Date(lastInboundAt).getTime();
    const elapsedMs = now - inboundTime;
    const windowMs = 24 * 60 * 60 * 1000;
    const remainingMs = windowMs - elapsedMs;

    if (remainingMs <= 0) {
      return {
        isOpen: false,
        hoursRemaining: 0,
        minutesRemaining: 0,
        status: 'EXPIRED',
        requiresTemplate: true,
      };
    }

    const totalMinutes = Math.floor(remainingMs / (60 * 1000));
    const hoursRemaining = Math.floor(totalMinutes / 60);
    const minutesRemaining = totalMinutes % 60;

    let status: 'OPEN' | 'WARNING' | 'CRITICAL' | 'EXPIRED' = 'OPEN';
    if (hoursRemaining < 1) {
      status = 'CRITICAL';
    } else if (hoursRemaining < 3) {
      status = 'WARNING';
    }

    return {
      isOpen: true,
      hoursRemaining,
      minutesRemaining,
      status,
      requiresTemplate: false,
    };
  }

  /**
   * Dispatch message via Meta Graph API or simulate in development
   */
  static async sendMessage(params: {
    toPhone: string;
    text?: string;
    templateId?: string;
    phoneNumberId?: string | null;
    metaAccessToken?: string | null;
  }): Promise<{ metaMessageId: string; status: 'SENT' | 'SIMULATED' }> {
    // If real credentials are provided, call Meta Cloud API Graph v21.0
    if (params.phoneNumberId && params.metaAccessToken) {
      try {
        const url = `https://graph.facebook.com/v21.0/${params.phoneNumberId}/messages`;
        const body: any = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: params.toPhone.replace(/\D/g, ''),
          type: 'text',
          text: { preview_url: false, body: params.text || '' },
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${params.metaAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data: any = await res.json();
        if (data.messages?.[0]?.id) {
          return { metaMessageId: data.messages[0].id, status: 'SENT' };
        }
      } catch (err) {
        console.warn('Real Meta API call failed, falling back to simulated dispatch:', err);
      }
    }

    // Development / Simulator fallback
    return {
      metaMessageId: `wamid.HBgL${Date.now()}${Math.random().toString(36).substring(7)}`,
      status: 'SIMULATED',
    };
  }
}
