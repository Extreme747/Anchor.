import { AutoReplyResult } from '../types/index.js';

interface AutoReplyRuleModel {
  name: string;
  triggerType: string; // KEYWORD, EXACT, REGEX, WORKING_HOURS, DEFAULT
  keywords: string[];
  responseText: string;
  templateId?: string | null;
  isEnabled: boolean;
  dedupSeconds: number;
}

export class AutoReplyEngine {
  private static lastTriggeredTimestamps: Map<string, number> = new Map();

  /**
   * Evaluate inbound message against rules and return auto-reply if matched
   */
  static evaluate(
    text: string,
    lead: { id: string; name: string; phone: string; organizationName?: string },
    rules: AutoReplyRuleModel[],
    workingHours?: { start: string; end: string; days: string }
  ): AutoReplyResult {
    const now = Date.now();
    const lastTrigger = this.lastTriggeredTimestamps.get(lead.id) || 0;

    // Default dedup check (30 seconds)
    if (now - lastTrigger < 30 * 1000) {
      return { triggered: false, reason: 'Deduplication lock active (<30s)' };
    }

    const normalized = text.toLowerCase().trim();

    // Check Working Hours first if configured
    if (workingHours && !this.isWithinWorkingHours(workingHours)) {
      const offHoursRule = rules.find((r) => r.triggerType === 'WORKING_HOURS' && r.isEnabled);
      if (offHoursRule) {
        this.lastTriggeredTimestamps.set(lead.id, now);
        return {
          triggered: true,
          ruleName: offHoursRule.name,
          replyText: this.interpolate(offHoursRule.responseText, lead),
          templateId: offHoursRule.templateId || undefined,
        };
      }
    }

    // Sort rules: EXACT first, REGEX second, KEYWORD third, DEFAULT last
    const enabledRules = rules.filter((r) => r.isEnabled);

    for (const rule of enabledRules) {
      if (rule.triggerType === 'EXACT') {
        const match = rule.keywords.some((kw) => kw.toLowerCase().trim() === normalized);
        if (match) {
          this.lastTriggeredTimestamps.set(lead.id, now);
          return {
            triggered: true,
            ruleName: rule.name,
            replyText: this.interpolate(rule.responseText, lead),
            templateId: rule.templateId || undefined,
          };
        }
      } else if (rule.triggerType === 'KEYWORD') {
        const match = rule.keywords.some((kw) => normalized.includes(kw.toLowerCase().trim()));
        if (match) {
          this.lastTriggeredTimestamps.set(lead.id, now);
          return {
            triggered: true,
            ruleName: rule.name,
            replyText: this.interpolate(rule.responseText, lead),
            templateId: rule.templateId || undefined,
          };
        }
      } else if (rule.triggerType === 'REGEX') {
        for (const kw of rule.keywords) {
          try {
            const re = new RegExp(kw, 'i');
            if (re.test(normalized)) {
              this.lastTriggeredTimestamps.set(lead.id, now);
              return {
                triggered: true,
                ruleName: rule.name,
                replyText: this.interpolate(rule.responseText, lead),
                templateId: rule.templateId || undefined,
              };
            }
          } catch {
            // ignore invalid regex
          }
        }
      }
    }

    // Fallback to DEFAULT rule if present
    const defaultRule = enabledRules.find((r) => r.triggerType === 'DEFAULT');
    if (defaultRule) {
      this.lastTriggeredTimestamps.set(lead.id, now);
      return {
        triggered: true,
        ruleName: defaultRule.name,
        replyText: this.interpolate(defaultRule.responseText, lead),
        templateId: defaultRule.templateId || undefined,
      };
    }

    return { triggered: false, reason: 'No matching rule found' };
  }

  /**
   * Check if current time is within Indian business hours
   */
  private static isWithinWorkingHours(config: { start: string; end: string; days: string }): boolean {
    const now = new Date();
    // Indian Standard Time calculation (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);

    const day = istDate.getUTCDay(); // 0 is Sunday, 1 is Monday...
    const activeDays = config.days.split(',').map((d) => parseInt(d.trim(), 10));
    if (!activeDays.includes(day)) {
      return false;
    }

    const currentMinutes = istDate.getUTCHours() * 60 + istDate.getUTCMinutes();
    const [startH, startM] = config.start.split(':').map((v) => parseInt(v, 10));
    const [endH, endM] = config.end.split(':').map((v) => parseInt(v, 10));

    const startMinutes = (startH || 9) * 60 + (startM || 0);
    const endMinutes = (endH || 19) * 60 + (endM || 0);

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  /**
   * Interpolate {{name}}, {{business}}, {{phone}}, {{time}}
   */
  private static interpolate(
    template: string,
    lead: { name: string; phone: string; organizationName?: string }
  ): string {
    const firstName = lead.name.split(' ')[0] || 'there';
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return template
      .replace(/{{name}}/g, firstName)
      .replace(/{{fullName}}/g, lead.name)
      .replace(/{{phone}}/g, lead.phone)
      .replace(/{{business}}/g, lead.organizationName || 'Anchor Partner')
      .replace(/{{time}}/g, nowStr);
  }
}
