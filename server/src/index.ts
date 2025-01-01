// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
// import { loadMasterData } from './utils/masterDataLoader';

// Initialize Express app
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(helmet());
// app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Server initialization
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Load master data on startup
    // await loadMasterData();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();