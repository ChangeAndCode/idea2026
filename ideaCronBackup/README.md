# IDEA Cron Backup

Proceso independiente para respaldar, verificar, restaurar y monitorear el sistema IDEA 2026.

## Qué respalda

Cada ejecución incluye:

- Todas las colecciones de la base MongoDB configurada.
- `ideabackend/uploads`.
- Snapshot de `ideabackend`, `ideacms` e `ideafront`.
- `metadata.json`.
- `checksums.json` con SHA-256.

Se excluyen secretos (`.env`), `node_modules`, `.git`, logs, backups y temporales.

## Instalación local

La configuración privada se carga desde `config/.env`. Copia la plantilla y completa las rutas:

```bash
npm install
npm run diagnose
```

La variable `MONGODB_URI` debe apuntar a la base real del sistema. Las variables `RESTORE_*`
deben apuntar únicamente a una base y carpeta de pruebas.

## Comandos

```bash
npm run diagnose                 # valida MongoDB y rutas
npm run backup                   # crea backup local y externo
npm run verify                   # valida checksums de ambas copias
npm run cleanup                  # simula retención sin borrar
npm run cleanup -- --apply      # aplica eliminación de respaldos antiguos
npm run run:all                  # backup + verify + cleanup
npm run restore -- "RUTA_BACKUP" # restaura en el destino RESTORE_*
npm run notify:test              # prueba webhook si está habilitado
```

## Automatización en Windows

El Programador de tareas ejecuta:

```text
ideaCronBackup/run-backup-task.cmd
```

Ese lanzador usa la ruta absoluta de Node, ejecuta `scripts/run-all.js` y guarda la salida técnica en:

```text
logs/task-scheduler.log
```

Configuración recomendada:

- Frecuencia diaria a las 03:00.
- Ejecutar con el usuario que tiene acceso a MongoDB, OneDrive y las carpetas de backup.
- Usar `0x0` como resultado esperado.
- Revisar el historial de la tarea y la pestaña **Respaldos** del CMS.

## Monitoreo en el CMS

El proceso registra ejecuciones en la colección MongoDB `backup_runs`. El backend expone:

```http
GET /api/backups/status
GET /api/backups/history
```

La pestaña **Respaldos** del CMS muestra backups, verificaciones, limpiezas, cantidades y errores.

## Restauración

La restauración debe hacerse primero en una base de pruebas:

```bash
npm run restore -- "C:\\ruta\\backup\\idea2026-..."
```

Después se valida MongoDB, `RESTORE_UPLOAD_DIR`, el backend y las rutas del CMS mediante Postman.

## Render

Render ejecutará este proyecto como Cron Job, pero sus Cron Jobs no deben depender de carpetas del
escritorio ni de almacenamiento local persistente. Para Render se requiere un destino externo accesible
por red (por ejemplo S3, R2, B2 o SFTP). Las rutas de Windows se mantienen únicamente para la instalación local.
