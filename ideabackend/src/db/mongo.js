import { MongoClient } from 'mongodb';
import { config } from '../config.js';

let client = null;

export async function getClient() {
  if (client) return client;
  if (!config.mongodb.uri) throw new Error('MONGODB_URI no configurada');
  client = new MongoClient(config.mongodb.uri);
  await client.connect();
  return client;
}

export function getDb(dbName = 'idea') {
  return getClient().then((c) => c.db(dbName));
}

export async function closeMongo() {
  if (client) {
    await client.close();
    client = null;
  }
}
