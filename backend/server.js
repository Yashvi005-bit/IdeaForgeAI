import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
//   credentials: true
// }));
app.use(cors());

app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'IdeaForge AI Backend Running ✅', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 IdeaForge AI backend running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});
