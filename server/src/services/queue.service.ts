import { prisma } from '../lib/prisma.js';
import { SLAService } from './sla.service.js';
import { MetaProtocolService } from './meta.service.js';
import { CostTrackerService } from './cost.service.js';
import { SocketService } from './socket.service.js';

export class BackgroundQueueEngine {
  private static dripInterval: NodeJS.Timeout | null = null;
  private static slaInterval: NodeJS.Timeout | null = null;

  /**
   * Start background task workers
   */
  static startWorkers() {
    console.log('⚡ Starting Anchor background workers (Drip engine, SLA monitor, Cron)...');

    // 1. SLA monitoring check every 30 seconds
    this.slaInterval = setInterval(async () => {
      try {
        await SLAService.checkAndEscalateBreaches();
      } catch (err) {
        console.error('Error in SLA worker interval:', err);
      }
    }, 30 * 1000);

    // 2. Drip Sequence step executor check every 60 seconds
    this.dripInterval = setInterval(async () => {
      try {
        await this.processDripSequences();
      } catch (err) {
        console.error('Error in Drip worker interval:', err);
      }
    }, 60 * 1000);
  }

  /**
   * Stop background workers cleanly
   */
  static stopWorkers() {
    if (this.slaInterval) clearInterval(this.slaInterval);
    if (this.dripInterval) clearInterval(this.dripInterval);
  }

  /**
   * Adaptive Drip Execution: Checks scheduled enrollments and triggers next step
   */
  private static async processDripSequences() {
    const now = new Date();

    const dueEnrollments = await prisma.dripEnrollment.findMany({
      where: {
        status: 'ACTIVE',
        nextRunAt: { lte: now },
      },
      include: {
        lead: true,
        sequence: {
          include: {
            steps: {
              orderBy: { stepNumber: 'asc' },
            },
          },
        },
      },
      take: 20,
    });

    for (const enrollment of dueEnrollments) {
      const { lead, sequence } = enrollment;

      // ADAPTIVE CHECK: If lead has already replied recently or won, stop sequence!
      if (lead.status === 'WON' || lead.status === 'LOST') {
        await prisma.dripEnrollment.update({
          where: { id: enrollment.id },
          data: { status: 'COMPLETED' },
        });
        continue;
      }

      const currentStepObj = sequence.steps.find((s) => s.stepNumber === enrollment.currentStep);
      if (!currentStepObj) {
        await prisma.dripEnrollment.update({
          where: { id: enrollment.id },
          data: { status: 'COMPLETED' },
        });
        continue;
      }

      // Check session status to select message category
      const session = MetaProtocolService.getSessionWindow(lead.lastInboundAt);
      const isWithinSession = session.isOpen;

      let msgText = currentStepObj.customText || `Follow-up from ${sequence.name}`;
      msgText = msgText.replace(/{{name}}/g, lead.name.split(' ')[0]);

      const costInfo = CostTrackerService.calculateCost(isWithinSession ? 'SERVICE' : 'UTILITY');

      // Dispatch simulated or real message
      const dispatchResult = await MetaProtocolService.sendMessage({
        toPhone: lead.phone,
        text: msgText,
        templateId: currentStepObj.templateId || undefined,
      });

      // Record message in database
      const savedMsg = await prisma.message.create({
        data: {
          organizationId: lead.organizationId,
          leadId: lead.id,
          senderType: 'SYSTEM',
          text: msgText,
          messageType: currentStepObj.templateId ? 'TEMPLATE' : 'TEXT',
          templateId: currentStepObj.templateId,
          metaMessageId: dispatchResult.metaMessageId,
          status: 'SENT',
          category: isWithinSession ? 'SERVICE' : 'UTILITY',
          messageCostINR: costInfo.costINR,
          isCtwaFree: costInfo.isCtwaFree,
        },
      });

      // Broadcast to live inbox
      SocketService.broadcastToLead(lead.id, 'message:new', savedMsg);

      // Advance to next step or complete
      const nextStepObj = sequence.steps.find((s) => s.stepNumber === enrollment.currentStep + 1);
      if (nextStepObj) {
        const nextRunAt = new Date(Date.now() + nextStepObj.delayMinutes * 60 * 1000);
        await prisma.dripEnrollment.update({
          where: { id: enrollment.id },
          data: {
            currentStep: nextStepObj.stepNumber,
            nextRunAt,
          },
        });
      } else {
        await prisma.dripEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: 'COMPLETED',
          },
        });
      }
    }
  }
}
