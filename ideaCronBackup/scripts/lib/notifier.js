export async function notifyFailure(stage, error) {
  if (process.env.BACKUP_ALERTS_ENABLED !== 'true') return;
  const url = process.env.BACKUP_ALERT_WEBHOOK_URL?.trim();
  if (!url) return;

  const payload = {
    system: process.env.BACKUP_SYSTEM_NAME || 'idea2026',
    environment: process.env.BACKUP_ENVIRONMENT || 'local',
    stage,
    result: 'failure',
    error: error?.message || String(error),
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) console.error(`No se pudo enviar la alerta: HTTP ${response.status}`);
  } catch (notificationError) {
    console.error(`No se pudo enviar la alerta: ${notificationError.message}`);
  }
}
