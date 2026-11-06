import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { EJSON } from 'bson';
import { MongoClient } from 'mongodb';

dotenv.config({ path: path.resolve(process.cwd(), 'config', '.env') });

const backupDir = path.resolve(process.argv[2] || '');
const uri = process.env.RESTORE_MONGODB_URI?.trim();
const databaseName = process.env.RESTORE_MONGODB_DATABASE?.trim();
const restoreUploadDir = process.env.RESTORE_UPLOAD_DIR?.trim();

if (!process.argv[2]) throw new Error('Indica la carpeta del respaldo: npm run restore -- "C:\\ruta\\backup"');
if (!uri || !databaseName || !restoreUploadDir) throw new Error('Configura RESTORE_MONGODB_URI, RESTORE_MONGODB_DATABASE y RESTORE_UPLOAD_DIR');
if (!fs.existsSync(backupDir)) throw new Error(`No existe el respaldo: ${backupDir}`);

const databaseDir = path.join(backupDir, 'database');
const uploadsDir = path.join(backupDir, 'uploads');
if (!fs.existsSync(databaseDir)) throw new Error('El respaldo no contiene la carpeta database');
if (!fs.existsSync(uploadsDir)) throw new Error('El respaldo no contiene la carpeta uploads');

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const db = client.db(databaseName);
    const collectionFiles = fs.readdirSync(databaseDir).filter((file) => file.endsWith('.ejson'));
    if (!collectionFiles.length) throw new Error('No hay colecciones EJSON en el respaldo');

    for (const file of collectionFiles) {
      const name = path.basename(file, '.ejson');
      const documents = EJSON.parse(await fs.promises.readFile(path.join(databaseDir, file), 'utf8'));
      const collection = db.collection(name);
      const exists = (await db.listCollections({ name }).toArray()).length > 0;
      if (exists) {
        if (process.env.RESTORE_ALLOW_DROP !== 'true') {
          throw new Error(`La colección ${name} ya existe. Usa una base vacía o RESTORE_ALLOW_DROP=true en pruebas.`);
        }
        await collection.drop();
      }
      if (documents.length) await db.createCollection(name).then((created) => created.insertMany(documents));
      else await db.createCollection(name);
      console.log(`Restaurada: ${name} (${documents.length} documentos)`);
    }

    await fs.promises.mkdir(restoreUploadDir, { recursive: true });
    await fs.promises.cp(uploadsDir, restoreUploadDir, { recursive: true, force: true });
    console.log(`Uploads restaurados en: ${restoreUploadDir}`);
    console.log(`Restauración completada en: ${databaseName}`);
  } finally {
    await client.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error(`Restauración fallida: ${error.message}`);
  process.exitCode = 1;
});
