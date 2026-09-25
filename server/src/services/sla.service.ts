import { prisma } from '../lib/prisma.js';
import { SocketService } from './socket.service.js';

export class SLAService {
  /**
   * Check all active leads for SLA breaches and auto-escalate
   */
  static async checkAndEscalateBreaches(): Promise<number> {
    try {
      const now = new Date();

      // Find NEW or CONTACTED leads that have missed their SLA deadline
      const breachedLeads = await prisma.lead.findMany({
        where: {
          slaBreached: false,
          slaDeadlineAt: { lte: now },
          status: 'NEW',
        },
        include: {
          organization: true,
          assignedAgent: true,
        },
      });

      let escalatedCount = 0;

      for (const lead of breachedLeads) {
        // Mark as breached
        await prisma.lead.update({
          where: { id: lead.id },
          data: { slaBreached: true },
        });

        // Find Manager or Owner for auto-escalation
        const manager = await prisma.user.findFirst({
          where: {
            organizationId: lead.organizationId,
            role: { in: ['MANAGER', 'OWNER'] },
            isActive: true,
          },
        });

        if (manager && manager.id !== lead.assignedAgentId) {
          // Reassign or alert
          await prisma.lead.update({
            where: { id: lead.id },
            data: { assignedAgentId: manager.id },
          });

          // Log audit
          await prisma.auditLog.create({
            data: {
              organizationId: lead.organizationId,
              action: 'SLA_BREACH_ESCALATED',
              resource: `Lead: ${lead.name} (${lead.phone})`,
              details: JSON.stringify({
                originalAgent: lead.assignedAgent?.name || 'Unassigned',
                escalatedTo: manager.name,
                breachedAt: now.toISOString(),
              }),
            },
          });
        }

        // Broadcast real-time SLA breach alert to org
        SocketService.broadcastToOrg(lead.organizationId, 'sla:breach', {
          leadId: lead.id,
          leadName: lead.name,
          phone: lead.phone,
          score: lead.intentScore,
          message: `⚠️ SLA Breached: Lead ${lead.name} was not contacted within response limit!`,
          timestamp: now.toISOString(),
        });

        escalatedCount++;
      }

      return escalatedCount;
    } catch (err) {
      console.error('Error running SLAService.checkAndEscalateBreaches:', err);
      return 0;
    }
  }
}
