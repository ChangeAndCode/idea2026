import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { notifyFailure } from './lib/notifier.js';
import { recordBackupRun } from './lib/run-status.js';

dotenv.config({ path: path.resolve(process.cwd(), 'config', '.env') });

const localRoot = process.env.BACKUP_LOCAL_DIR?.trim();
const externalRoot = process.env.BACKUP_EXTERNAL_DIR?.trim();
const localDays = Number(process.env.BACKUP_RETENTION_LOCAL_DAYS);
const externalDays = Number(process.env.BACKUP_RETENTION_EXTERNAL_DAYS);
const apply = process.argv.includes('--apply');
const logDir = process.env.BACKUP_LOG_DIR?.trim() || path.resolve(process.cwd(), 'logs');

if (!localRoot || !externalRoot) throw new Error('Falta configurar BACKUP_LOCAL_DIR o BACKUP_EXTERNAL_DIR');
if (!Number.isInteger(localDays) || localDays < 1) throw new Error('BACKUP_RETENTION_LOCAL_DAYS debe ser un entero mayor que cero');
if (!Number.isInteger(externalDays) || externalDays < 1) throw new Error('BACKUP_RETENTION_EXTERNAL_DAYS debe ser un entero mayor que cero');

function getBackups(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('idea2026-'))
    .map((entry) => {
      const fullPath = path.join(root, entry.name);
      return { name: entry.name, fullPath, modifiedAt: fs.statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt);
}

async function cleanRoot(root, retentionDays, label) {
  const backups = getBackups(root);
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const candidates = backups.filter((backup) => backup.modifiedAt < cutoff);
  const protectedBackup = backups[0]?.name;
  const removable = candidates.filter((backup) => backup.name !== protectedBackup);
  const skipped = candidates.filter((backup) => backup.name === protectedBackup);

  for (const backup of removable) {
    if (apply) await fs.promises.rm(backup.fullPath, { recursive: true, force: true });
    console.log(`${apply ? 'Eliminado' : 'Candidato'} (${label}): ${backup.name}`);
  }
  for (const backup of skipped) console.log(`Protegido (${label}): ${backup.name}`);
  return { label, found: backups.length, candidates: removable.length, protected: skipped.length };
}

async function writeLog(result) {
  fs.mkdirSync(logDir, { recursive: true });
  const file = path.join(logDir, `backup-${new Date().toISOString().slice(0, 10)}.log`);
  await fs.promises.appendFile(file, `${JSON.stringify(result)}\n`, 'utf8');
}

async function main() {
  const result = {
    result: 'success',
    mode: apply ? 'apply' : 'dry-run',
    completedAt: new Date().toISOString(),
    local: await cleanRoot(localRoot, localDays, 'local'),
    external: await cleanRoot(externalRoot, externalDays, 'externo'),
  };
  console.log(`\nLimpieza ${apply ? 'aplicada' : 'simulada'} correctamente.`);
  await writeLog(result);
  await recordBackupRun({ type: 'cleanup', status: 'success', mode: result.mode, local: result.local, external: result.external });
}

main().catch(async (error) => {
  const result = { result: 'failure', error: error.message, completedAt: new Date().toISOString() };
  console.error(`Limpieza fallida: ${error.message}`);
  try { await writeLog(result); } catch {}
  await recordBackupRun({ type: 'cleanup', status: 'failure', stage: 'cleanup', error: error.message }).catch(() => {});
  await notifyFailure('cleanup', error);
  process.exitCode = 1;
});
