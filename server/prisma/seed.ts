import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Anchor multi-tenant database...');

  // 1. Create Demo Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'anchor-realty' },
    update: {},
    create: {
      name: 'Anchor Capital & Realty (DLF Partner)',
      slug: 'anchor-realty',
      industry: 'Real Estate',
      teamSize: 5,
      phone: '+91 98100 12345',
      wabaId: 'WABA_1092837465',
      phoneNumberId: 'PHONE_9988776655',
      metaAccessToken: 'EAAG_MOCK_META_TOKEN_ANCHOR_2026',
      metaAppSecret: 'mock_meta_app_secret_anchor_2026',
      numberMaskingEnabled: false,
      workingHoursStart: '09:00',
      workingHoursEnd: '19:00',
      workingDays: '1,2,3,4,5,6',
    },
  });

  const passwordHash = await bcrypt.hash('anchor123', 10);

  // 2. Create Users
  const owner = await prisma.user.upsert({
    where: { email: 'arjun@anchor.io' },
    update: {},
    create: {
      organizationId: org.id,
      email: 'arjun@anchor.io',
      name: 'Arjun Verma (Owner)',
      passwordHash,
      role: 'OWNER',
      phone: '+91 98111 22334',
      isActive: true,
      isOnline: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@anchor.io' },
    update: {},
    create: {
      organizationId: org.id,
      email: 'manager@anchor.io',
      name: 'Rohan Mehra (Sales Lead)',
      passwordHash,
      role: 'MANAGER',
      phone: '+91 98222 33445',
      isActive: true,
      isOnline: true,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'sales@anchor.io' },
    update: {},
    create: {
      organizationId: org.id,
      email: 'sales@anchor.io',
      name: 'Simran Kaur (Closing Agent)',
      passwordHash,
      role: 'AGENT',
      phone: '+91 98333 44556',
      isActive: true,
      isOnline: true,
      activeChatsCount: 3,
    },
  });

  // 3. Create SLA Configuration
  const existingSla = await prisma.sLAConfig.findFirst({ where: { organizationId: org.id } });
  if (!existingSla) {
    await prisma.sLAConfig.create({
      data: {
        organizationId: org.id,
        firstResponseMinutes: 7,
        autoRevokeOnBreach: true,
        escalationTarget: 'MANAGER',
      },
    });
  }

  // 4. Create Auto-Reply Rules
  const existingRules = await prisma.autoReplyRule.findMany({ where: { organizationId: org.id } });
  if (existingRules.length === 0) {
    await prisma.autoReplyRule.createMany({
      data: [
        {
          organizationId: org.id,
          name: 'Instant Welcome Greeting',
          triggerType: 'DEFAULT',
          keywords: JSON.stringify([]),
          responseText:
            'Hi {{name}}! Thanks for reaching out to {{business}}. Our advisor is reviewing your inquiry right now.\n\nMeanwhile, here is our Sector 62 brochure & floor plan: anchor.io/brochure/sec62\n\nWould you like a private site visit this weekend?',
          isEnabled: true,
          dedupSeconds: 30,
          priority: 0,
        },
        {
          organizationId: org.id,
          name: 'Site Visit Booking Trigger',
          triggerType: 'KEYWORD',
          keywords: JSON.stringify(['site visit', 'visit kab', 'ghar dekhna', 'dekhna hai', 'appointment']),
          responseText:
            'Hi {{name}}! We would be delighted to host you for a private site visit. We have slots open tomorrow at 11:30 AM and 3:30 PM. Which time suits you best?',
          isEnabled: true,
          dedupSeconds: 30,
          priority: 10,
        },
        {
          organizationId: org.id,
          name: 'Price & Payment Plan Trigger',
          triggerType: 'KEYWORD',
          keywords: JSON.stringify(['price', 'rate kitna', 'cost batao', 'budget', 'kitna lagega']),
          responseText:
            'Hi {{name}}! Our 2BHK luxury apartments start from ₹1.2 Cr, and 3BHK from ₹1.6 Cr. Flexible 20:80 bank subvention scheme is available. Would you like us to share the cost breakdown sheet?',
          isEnabled: true,
          dedupSeconds: 30,
          priority: 10,
        },
        {
          organizationId: org.id,
          name: 'After-Hours Auto Responder',
          triggerType: 'WORKING_HOURS',
          keywords: JSON.stringify([]),
          responseText:
            'Hi {{name}}! Our sales office is currently closed for the night. Your property inquiry has been tagged as High Priority and our senior advisor will call you first thing at 9:15 AM tomorrow.',
          isEnabled: true,
          dedupSeconds: 30,
          priority: 20,
        },
      ],
    });
  }

  // 5. Create Templates
  const existingTemplates = await prisma.template.findMany({ where: { organizationId: org.id } });
  if (existingTemplates.length === 0) {
    await prisma.template.createMany({
      data: [
        {
          organizationId: org.id,
          name: 'site_visit_reminder_v1',
          category: 'UTILITY',
          language: 'en_US',
          headerType: 'TEXT',
          headerContent: 'Anchor Realty | Site Visit Confirmation',
          bodyText:
            'Hello {{1}}, this is a confirmation for your scheduled site visit tomorrow at {{2}}. Our executive {{3}} will welcome you at the site experience center.',
          footerText: 'Reply CANCEL to reschedule',
          buttons: JSON.stringify([
            { type: 'QUICK_REPLY', text: 'Confirm Slot' },
            { type: 'QUICK_REPLY', text: 'Get Location Pin' },
          ]),
          metaStatus: 'APPROVED',
        },
        {
          organizationId: org.id,
          name: 'session_warning_23h_nudge',
          category: 'UTILITY',
          language: 'en_US',
          headerType: 'NONE',
          bodyText:
            'Hi {{1}}, our direct WhatsApp chat window closes in 1 hour due to Meta protocol. Can I confirm your slot for tomorrow or share the final pricing sheet?',
          footerText: 'Anchor Instant Support',
          buttons: JSON.stringify([
            { type: 'QUICK_REPLY', text: 'Yes, Confirm Slot' },
            { type: 'QUICK_REPLY', text: 'Send Price Sheet' },
          ]),
          metaStatus: 'APPROVED',
        },
        {
          organizationId: org.id,
          name: 'exclusive_penthouse_launch',
          category: 'MARKETING',
          language: 'en_US',
          headerType: 'IMAGE',
          bodyText:
            'Hi {{1}}, 2 ultra-luxury penthouses have just been released on the 40th floor at Sector 62. Starting at ₹3.2 Cr with private sky deck. Would you like an exclusive preview?',
          footerText: 'Limited inventory release',
          buttons: JSON.stringify([
            { type: 'QUICK_REPLY', text: 'Book Private Tour' },
            { type: 'QUICK_REPLY', text: 'View 3D Walkthrough' },
          ]),
          metaStatus: 'APPROVED',
        },
      ],
    });
  }

  // 6. Create Drip Sequences
  const existingDrip = await prisma.dripSequence.findFirst({ where: { organizationId: org.id } });
  if (!existingDrip) {
    const seq = await prisma.dripSequence.create({
      data: {
        organizationId: org.id,
        name: 'High-Ticket Real Estate 72h Recovery Cadence',
        status: 'ACTIVE',
        triggerEvent: 'LEAD_CREATED',
      },
    });

    await prisma.dripStep.createMany({
      data: [
        {
          sequenceId: seq.id,
          stepNumber: 1,
          delayMinutes: 60, // 1 hour
          customText:
            'Hey {{name}}, saw you inquired about our Sector 62 property. Did you get a chance to review the floor plans?',
          branchRule: 'STOP_IF_REPLIED',
        },
        {
          sequenceId: seq.id,
          stepNumber: 2,
          delayMinutes: 1380, // 23 hours
          customText:
            '{{name}}, our direct WhatsApp window closes in 1 hour. Can I lock your preferred slot for a site visit this weekend?',
          branchRule: 'STOP_IF_REPLIED',
        },
        {
          sequenceId: seq.id,
          stepNumber: 3,
          delayMinutes: 4320, // 72 hours (Meta template re-engagement)
          customText:
            'Hi {{name}}, we have 2 ready-to-move units remaining in this phase. Would you like to reserve one before price revision?',
          branchRule: 'STOP_IF_REPLIED',
        },
      ],
    });
  }

  // 7. Seed Leads & Live Chat Messages
  const existingLeads = await prisma.lead.findMany({ where: { organizationId: org.id } });
  if (existingLeads.length === 0) {
    const now = new Date();

    // Lead 1: Arjun Sharma (Hot CTWA lead)
    const lead1 = await prisma.lead.create({
      data: {
        organizationId: org.id,
        assignedAgentId: agent.id,
        name: 'Arjun Sharma',
        phone: '+91 98110 22210',
        email: 'arjun.sharma@gmail.com',
        source: 'Meta Ad (Instagram)',
        city: 'Gurugram',
        tags: JSON.stringify(['Hot 🔥', 'Penthouse', 'CTWA']),
        status: 'NEW',
        intentScore: 91,
        estimatedValueINR: 14000000, // ₹1.4 Cr
        unreadCount: 2,
        isCtwa: true,
        ctwaReferral: JSON.stringify({
          adId: 'ad_772635418',
          campaignId: 'cmp_gurugram_luxury',
          headline: 'Luxury 3BHK starting ₹1.2 Cr',
          sourceUrl: 'https://instagram.com/ad/772635418',
        }),
        ctwaWindowExpiresAt: new Date(now.getTime() + 68 * 3600 * 1000), // ~68 hours remaining
        lastInboundAt: new Date(now.getTime() - 2 * 60 * 1000),
        lastOutboundAt: new Date(now.getTime() - 2 * 60 * 1000),
        sessionExpiresAt: new Date(now.getTime() + 23.9 * 3600 * 1000),
        isSessionOpen: true,
        slaBreached: false,
        slaDeadlineAt: new Date(now.getTime() + 5 * 60 * 1000),
      },
    });

    await prisma.message.createMany({
      data: [
        {
          organizationId: org.id,
          leadId: lead1.id,
          senderType: 'LEAD',
          text: 'Hi, saw your ad on Instagram. Interested in 3BHK at Sector 62.',
          status: 'READ',
          category: 'SERVICE',
          messageCostINR: 0.0,
          isCtwaFree: true,
          createdAt: new Date(now.getTime() - 5 * 60 * 1000),
        },
        {
          organizationId: org.id,
          leadId: lead1.id,
          senderType: 'AUTO_REPLY',
          text: 'Hi Arjun! Thanks for reaching out to Anchor Capital & Realty. Connecting you with our team right now. Meanwhile here is our latest brochure: anchor.io/brochure/sec62\n\nWe have 3BHK units from ₹1.2–1.6 Cr. Would you like a site visit this weekend?',
          status: 'READ',
          category: 'SERVICE',
          messageCostINR: 0.0,
          isCtwaFree: true,
          createdAt: new Date(now.getTime() - 4.9 * 60 * 1000),
        },
        {
          organizationId: org.id,
          leadId: lead1.id,
          senderType: 'LEAD',
          text: "What's the price range? Aur possession kab tak?",
          status: 'READ',
          category: 'SERVICE',
          messageCostINR: 0.0,
          isCtwaFree: true,
          createdAt: new Date(now.getTime() - 3 * 60 * 1000),
        },
        {
          organizationId: org.id,
          leadId: lead1.id,
          senderType: 'LEAD',
          text: 'Site visit kab kar sakte hain?',
          status: 'DELIVERED',
          category: 'SERVICE',
          messageCostINR: 0.0,
          isCtwaFree: true,
          createdAt: new Date(now.getTime() - 2 * 60 * 1000),
        },
      ],
    });

    // Lead 2: Priya Mehta
    const lead2 = await prisma.lead.create({
      data: {
        organizationId: org.id,
        assignedAgentId: agent.id,
        name: 'Priya Mehta',
        phone: '+91 87000 33345',
        email: 'priya.mehta@outlook.com',
        source: 'Organic WhatsApp',
        city: 'Delhi',
        tags: JSON.stringify(['Qualified', '3BHK']),
        status: 'CONTACTED',
        intentScore: 72,
        estimatedValueINR: 12000000,
        unreadCount: 0,
        isCtwa: false,
        lastInboundAt: new Date(now.getTime() - 30 * 60 * 1000),
        lastOutboundAt: new Date(now.getTime() - 15 * 60 * 1000),
        sessionExpiresAt: new Date(now.getTime() + 23.5 * 3600 * 1000),
        isSessionOpen: true,
      },
    });

    await prisma.message.createMany({
      data: [
        {
          organizationId: org.id,
          leadId: lead2.id,
          senderType: 'LEAD',
          text: 'Interested in 3BHK, budget 1.2Cr.',
          status: 'READ',
          category: 'SERVICE',
          messageCostINR: 0.0,
          createdAt: new Date(now.getTime() - 30 * 60 * 1000),
        },
        {
          organizationId: org.id,
          leadId: lead2.id,
          senderType: 'AGENT',
          senderId: agent.id,
          text: 'Hi Priya! We have 2 units available matching your exact ₹1.2 Cr budget in Tower B. Can I share floor layouts?',
          status: 'READ',
          category: 'SERVICE',
          messageCostINR: 0.0,
          createdAt: new Date(now.getTime() - 15 * 60 * 1000),
        },
      ],
    });

    // Lead 3: Sunita Bose (Urgent inquiry)
    await prisma.lead.create({
      data: {
        organizationId: org.id,
        assignedAgentId: agent.id,
        name: 'Sunita Bose',
        phone: '+91 98777 00034',
        email: 'sunita.bose@yahoo.com',
        source: 'Meta Ad (Facebook)',
        city: 'Gurugram',
        tags: JSON.stringify(['Hot 🔥', 'Ready-to-move']),
        status: 'QUALIFIED',
        intentScore: 88,
        estimatedValueINR: 9500000,
        unreadCount: 0,
        isCtwa: true,
        lastInboundAt: new Date(now.getTime() - 60 * 60 * 1000),
        sessionExpiresAt: new Date(now.getTime() + 23 * 3600 * 1000),
        isSessionOpen: true,
      },
    });

    // Lead 4: Kavita Reddy (High ticket ₹3.2 Cr)
    await prisma.lead.create({
      data: {
        organizationId: org.id,
        assignedAgentId: manager.id,
        name: 'Kavita Reddy',
        phone: '+91 88999 22221',
        email: 'kavita.reddy@techcorp.in',
        source: 'Meta Ad (Instagram)',
        city: 'Gurugram',
        tags: JSON.stringify(['Hot 🔥', 'Penthouse', 'HNI']),
        status: 'QUALIFIED',
        intentScore: 95,
        estimatedValueINR: 32000000,
        unreadCount: 1,
        isCtwa: true,
        lastInboundAt: new Date(now.getTime() - 180 * 60 * 1000),
        sessionExpiresAt: new Date(now.getTime() + 21 * 3600 * 1000),
        isSessionOpen: true,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('Demo Credentials:');
  console.log('  Owner: arjun@anchor.io / anchor123');
  console.log('  Manager: manager@anchor.io / anchor123');
  console.log('  Agent: sales@anchor.io / anchor123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
