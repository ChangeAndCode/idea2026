import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EJSON } from 'bson';
import { MongoClient } from 'mongodb';

dotenv.config({ path: path.resolve(process.cwd(), 'config', '.env') });

const required = ['MONGODB_URI', 'MONGODB_DATABASE', 'UPLOAD_DIR', 'BACKUP_LOCAL_DIR', 'BACKUP_EXTERNAL_DIR'];
for (const name of required) {
  if (!process.env[name]?.trim()) throw new Error(`Falta configurar ${name}`);
}

const sourceRoot = path.resolve(process.env.SNAPSHOT_SOURCE_DIR?.trim() || path.resolve(process.cwd(), '..'));
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupName = `idea2026-${timestamp}`;
const stagingDir = path.join(process.cwd(), '.staging', backupName);
const localDir = path.join(process.env.BACKUP_LOCAL_DIR, backupName);
const externalDir = path.join(process.env.BACKUP_EXTERNAL_DIR, backupName);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sha256(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(file);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function listFiles(dir, base = dir) {
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await listFiles(full, base));
    else output.push(path.relative(base, full));
  }
  return output;
}

async function copyDirectory(source, target) {
  if (!fs.existsSync(source)) throw new Error(`No existe la carpeta: ${source}`);
  await fs.promises.cp(source, target, { recursive: true, force: true });
}

async function copySnapshot() {
  const snapshotDir = path.join(stagingDir, 'snapshot');
  for (const project of ['ideabackend', 'ideacms', 'ideafront']) {
    const source = path.join(sourceRoot, project);
    const target = path.join(snapshotDir, project);
    if (!fs.existsSync(source)) throw new Error(`No existe el proyecto para snapshot: ${source}`);
    await fs.promises.cp(source, target, {
      recursive: true,
      force: true,
      filter: (sourcePath) => {
        const relative = path.relative(source, sourcePath);
        const segments = relative.split(path.sep);
        if (segments.includes('node_modules') || segments.includes('.git')) return false;
        if (segments.includes('logs') || segments.includes('backups')) return false;
        if (path.basename(sourcePath) === '.env') return false;
        if (sourcePath.includes(`${path.sep}uploads${path.sep}`) || path.basename(sourcePath) === 'uploads') return false;
        return true;
      },
    });
  }
}

async function exportMongo(target) {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const collectionSummary = [];
    for (const { name } of collections) {
      const documents = await db.collection(name).find({}).toArray();
      const file = path.join(target, `${name}.ejson`);
      await fs.promises.writeFile(file, EJSON.stringify(documents, null, 2), 'utf8');
      collectionSummary.push({ name, documents: documents.length, file: path.basename(file) });
    }
    return collectionSummary;
  } finally {
    await client.close().catch(() => {});
  }
}

async function createManifest(root) {
  const files = await listFiles(root);
  const entries = [];
  for (const relative of files.sort()) {
    const file = path.join(root, relative);
    const stat = await fs.promises.stat(file);
    entries.push({ path: relative.replaceAll(path.sep, '/'), bytes: stat.size, sha256: await sha256(file) });
  }
  await fs.promises.writeFile(path.join(root, 'checksums.json'), JSON.stringify(entries, null, 2), 'utf8');
  return entries;
}

async function main() {
  const startedAt = new Date();
  ensureDir(stagingDir);
  ensureDir(path.join(stagingDir, 'database'));
  await copyDirectory(process.env.UPLOAD_DIR, path.join(stagingDir, 'uploads'));
  await copySnapshot();

  const collections = await exportMongo(path.join(stagingDir, 'database'));
  const files = await createManifest(stagingDir);
  const metadata = {
    system: process.env.BACKUP_SYSTEM_NAME || 'idea2026',
    environment: process.env.BACKUP_ENVIRONMENT || 'local',
    database: process.env.MONGODB_DATABASE,
    createdAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    collections,
    fileCount: files.length,
  };
  await fs.promises.writeFile(path.join(stagingDir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');

  ensureDir(path.dirname(localDir));
  ensureDir(path.dirname(externalDir));
  await fs.promises.cp(stagingDir, localDir, { recursive: true, force: true });
  await fs.promises.cp(stagingDir, externalDir, { recursive: true, force: true });

  fs.rmSync(path.join(process.cwd(), '.staging'), { recursive: true, force: true });
  console.log(`Backup generado: ${backupName}`);
  console.log(`Local: ${localDir}`);
  console.log(`Externo: ${externalDir}`);
  console.log(`Colecciones: ${collections.length}`);
  console.log(`Archivos: ${files.length}`);
}

main().catch((error) => {
  console.error(`Backup fallido: ${error.message}`);
  try { fs.rmSync(stagingDir, { recursive: true, force: true }); } catch {}
  process.exitCode = 1;
});
