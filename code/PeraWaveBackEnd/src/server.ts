import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import modRoutes from './routes/modRoutes';
import forumRoutes from './routes/forumRoutes';
import reportRoutes from './routes/reportRoutes';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mod', modRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'PeraWave Backend is running!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
