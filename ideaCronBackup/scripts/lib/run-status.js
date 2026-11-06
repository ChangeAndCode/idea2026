import { MongoClient } from 'mongodb';

export async function recordBackupRun(data) {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DATABASE) return;
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    await client.db(process.env.MONGODB_DATABASE).collection('backup_runs').insertOne({
      system: process.env.BACKUP_SYSTEM_NAME || 'idea2026',
      environment: process.env.BACKUP_ENVIRONMENT || 'local',
      ...data,
      createdAt: new Date(),
    });
  } finally {
    await client.close().catch(() => {});
  }
}
