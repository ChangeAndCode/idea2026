import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

dotenv.config({ path: path.resolve(process.cwd(), 'config', '.env') });

const results = [];

function check(name, ok, detail) {
  results.push({ name, ok, detail });
}

function required(name) {
  const value = process.env[name]?.trim();
  check(name, Boolean(value), value ? 'Configurada' : 'Falta configurar esta variable');
  return value;
}

function directory(name, value, { create = false } = {}) {
  if (!value) return;
  try {
    if (!fs.existsSync(value)) {
      if (create) {
        fs.mkdirSync(value, { recursive: true });
        check(name, true, 'No existía; se creó correctamente');
      } else {
        check(name, false, 'La carpeta no existe');
      }
      return;
    }
    check(name, fs.statSync(value).isDirectory(), fs.statSync(value).isDirectory() ? 'Carpeta disponible' : 'La ruta no es una carpeta');
  } catch (error) {
    check(name, false, `No se pudo acceder: ${error.message}`);
  }
}

const uri = required('MONGODB_URI');
const database = required('MONGODB_DATABASE');
const uploadDir = required('UPLOAD_DIR');
const localDir = required('BACKUP_LOCAL_DIR');
const externalDir = required('BACKUP_EXTERNAL_DIR');

directory('UPLOAD_DIR', uploadDir);
directory('BACKUP_LOCAL_DIR', localDir, { create: true });
directory('BACKUP_EXTERNAL_DIR', externalDir);

for (const name of ['BACKUP_RETENTION_LOCAL_DAYS', 'BACKUP_RETENTION_EXTERNAL_DAYS']) {
  const value = Number(process.env[name]);
  check(name, Number.isInteger(value) && value > 0, Number.isInteger(value) && value > 0 ? `${value} días` : 'Debe ser un entero mayor que cero');
}

if (uri && database) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    await client.db(database).command({ ping: 1 });
    check('MongoDB', true, 'Conexión y ping exitosos');
  } catch (error) {
    check('MongoDB', false, `No se pudo conectar: ${error.message}`);
  } finally {
    await client.close().catch(() => {});
  }
}

console.log('\nDiagnóstico de infraestructura - IDEA 2026\n');
for (const result of results) {
  console.log(`${result.ok ? 'OK ' : 'ERR'} ${result.name}: ${result.detail}`);
}

const failed = results.filter((result) => !result.ok).length;
console.log(`\nResultado: ${failed === 0 ? 'APTO PARA CONTINUAR' : `${failed} validación(es) pendiente(s)`}`);
process.exitCode = failed === 0 ? 0 : 1;
