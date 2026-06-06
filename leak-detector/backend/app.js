import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import scanRoutes from './src/routes/scanRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import mongoService from './src/services/mongoService.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many scans, try again later'
});
app.use('/api/scan*', limiter);

// JSON parsing
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// API routes
app.use('/api', scanRoutes);
app.use('/api', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;