import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { SocketService } from './services/socket.service.js';
import { BackgroundQueueEngine } from './services/queue.service.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import simulatorRoutes from './routes/simulator.routes.js';
import leadsRoutes from './routes/leads.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import autoReplyRoutes from './routes/autoreply.routes.js';
import templateRoutes from './routes/templates.routes.js';
import dripRoutes from './routes/drip.routes.js';
import commerceRoutes from './routes/commerce.routes.js';
import routingRoutes from './routes/routing.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
SocketService.init(server);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Anchor WhatsApp Revenue Recovery Engine',
    version: '1.0.0',
    metaGateway: 'ONLINE',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/auto-replies', autoReplyRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/drip', dripRoutes);
app.use('/api/commerce', commerceRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integrations', integrationsRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start Background Workers
BackgroundQueueEngine.startWorkers();

// Listen
server.listen(config.port, () => {
  console.log(`⚓ Anchor Backend Server running on http://localhost:${config.port}`);
  console.log(`📡 WebSocket Engine ready on port ${config.port}`);
  console.log(`🟢 Meta Webhook Gateway: http://localhost:${config.port}/api/webhook/meta`);
  console.log(`🎯 Meta Inbound Simulator: http://localhost:${config.port}/api/simulator/send-inbound`);
});

process.on('SIGTERM', () => {
  BackgroundQueueEngine.stopWorkers();
  process.exit(0);
});
