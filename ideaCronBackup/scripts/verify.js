import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(process.cwd(), 'config', '.env') });

const localRoot = process.env.BACKUP_LOCAL_DIR?.trim();
const externalRoot = process.env.BACKUP_EXTERNAL_DIR?.trim();
const logDir = process.env.BACKUP_LOG_DIR?.trim() || path.resolve(process.cwd(), 'logs');

if (!localRoot || !externalRoot) throw new Error('Falta configurar BACKUP_LOCAL_DIR o BACKUP_EXTERNAL_DIR');

function latestBackup(root) {
  const folders = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('idea2026-'))
    .map((entry) => entry.name)
    .sort();
  if (!folders.length) throw new Error(`No hay respaldos en ${root}`);
  return path.join(root, folders.at(-1));
}

function hashFile(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(file);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function verifyManifest(root) {
  const manifestFile = path.join(root, 'checksums.json');
  if (!fs.existsSync(manifestFile)) throw new Error(`Falta checksums.json en ${root}`);
  const manifest = JSON.parse(await fs.promises.readFile(manifestFile, 'utf8'));
  for (const item of manifest) {
    const file = path.join(root, item.path);
    if (!fs.existsSync(file)) throw new Error(`Falta archivo: ${item.path}`);
    const actual = await hashFile(file);
    if (actual !== item.sha256) throw new Error(`Checksum inválido: ${item.path}`);
  }
  return manifest;
}

async function main() {
  const startedAt = new Date();
  const local = latestBackup(localRoot);
  const external = latestBackup(externalRoot);
  if (path.basename(local) !== path.basename(external)) {
    throw new Error(`Las copias no corresponden: ${path.basename(local)} vs ${path.basename(external)}`);
  }

  const localManifest = await verifyManifest(local);
  const externalManifest = await verifyManifest(external);
  const localMap = new Map(localManifest.map((item) => [item.path, item.sha256]));
  const externalMap = new Map(externalManifest.map((item) => [item.path, item.sha256]));
  if (localMap.size !== externalMap.size || [...localMap].some(([file, hash]) => externalMap.get(file) !== hash)) {
    throw new Error('Las copias local y externa no tienen los mismos checksums');
  }

  const result = {
    result: 'success',
    backup: path.basename(local),
    files: localManifest.length,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
  };
  console.log(`Verificación correcta: ${result.backup}`);
  console.log(`Archivos verificados: ${result.files}`);
  await writeLog(result);
}

async function writeLog(data) {
  fs.mkdirSync(logDir, { recursive: true });
  const file = path.join(logDir, `backup-${new Date().toISOString().slice(0, 10)}.log`);
  await fs.promises.appendFile(file, `${JSON.stringify(data)}\n`, 'utf8');
}

main().catch(async (error) => {
  const result = { result: 'failure', error: error.message, completedAt: new Date().toISOString() };
  console.error(`Verificación fallida: ${error.message}`);
  try { await writeLog(result); } catch {}
  process.exitCode = 1;
});
