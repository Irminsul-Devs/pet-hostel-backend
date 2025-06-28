import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (_req, res) => {
  res.send('Backend is working!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
