import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { closeMongo } from './db/mongo.js';
import { config } from './config.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? 'Error interno' });
});

const server = app.listen(config.port, () => {
  console.log(`ideabackend escuchando en http://localhost:${config.port}`);
});

const shutdown = async () => {
  server.close();
  await closeMongo().catch(() => {});
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
