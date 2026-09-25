import { prisma } from '../lib/prisma.js';

export class RoutingService {
  /**
   * Determine best agent to assign a lead based on round-robin or rules
   */
  static async assignLead(
    organizationId: string,
    lead: { id: string; tags: string[]; city?: string | null; estimatedValue?: number }
  ): Promise<string | null> {
    try {
      // 1. Check if any custom RoutingRule matches
      const rules = await prisma.routingRule.findMany({
        where: { organizationId, isEnabled: true },
        orderBy: { priority: 'desc' },
      });

      for (const rule of rules) {
        try {
          const conditions = JSON.parse(rule.conditions || '{}');
          let matched = true;

          if (conditions.tag && !lead.tags.includes(conditions.tag)) {
            matched = false;
          }
          if (conditions.city && lead.city && !lead.city.toLowerCase().includes(conditions.city.toLowerCase())) {
            matched = false;
          }
          if (conditions.minValue && (lead.estimatedValue || 0) < conditions.minValue) {
            matched = false;
          }

          if (matched && rule.targetAgentId) {
            const targetAgent = await prisma.user.findFirst({
              where: { id: rule.targetAgentId, isActive: true },
            });
            if (targetAgent) {
              return targetAgent.id;
            }
          }
        } catch {
          // ignore rule condition parsing errors
        }
      }

      // 2. Fallback: Round-Robin among active Agents / Managers
      const availableAgents = await prisma.user.findMany({
        where: {
          organizationId,
          isActive: true,
          role: { in: ['AGENT', 'MANAGER'] },
        },
        orderBy: { activeChatsCount: 'asc' }, // Assign to least loaded agent
      });

      if (availableAgents.length > 0) {
        const selectedAgent = availableAgents[0];
        // Increment agent's active chat count
        await prisma.user.update({
          where: { id: selectedAgent.id },
          data: { activeChatsCount: { increment: 1 } },
        });
        return selectedAgent.id;
      }

      // 3. Fallback to Owner if no agent found
      const owner = await prisma.user.findFirst({
        where: { organizationId, role: 'OWNER' },
      });
      return owner?.id || null;
    } catch (err) {
      console.error('Error in RoutingService.assignLead:', err);
      return null;
    }
  }
}
