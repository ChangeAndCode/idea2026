import dotenv from 'dotenv';
import path from 'path';
import { notifyFailure } from './lib/notifier.js';

dotenv.config({ path: path.resolve(process.cwd(), 'config', '.env') });

if (process.env.BACKUP_ALERTS_ENABLED !== 'true') {
  throw new Error('Activa BACKUP_ALERTS_ENABLED=true en config/.env');
}

if (!process.env.BACKUP_ALERT_WEBHOOK_URL?.trim()) {
  throw new Error('Configura BACKUP_ALERT_WEBHOOK_URL en config/.env');
}

await notifyFailure('manual-test', new Error('Alerta de prueba del sistema de respaldos IDEA 2026'));
console.log('Alerta de prueba enviada. Revisa tu bandeja de Webhook.site.');
