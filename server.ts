import express from 'express';
import path from 'path';
import { apiRouter } from './server/api.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use('/api', apiRouter);

// Serve static frontend build
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SISARPRAS SMKN 1 Tegalsari server running on port ${PORT}`);
});
