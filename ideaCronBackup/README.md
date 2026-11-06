# IDEA Cron Backup

Proceso independiente para validar, generar, verificar y restaurar respaldos del sistema IDEA 2026.

## Diagnóstico

La configuración privada se carga desde `config/.env`.

```bash
npm install
npm run diagnose
```

El backup incluye MongoDB, `ideabackend/uploads` y un snapshot de los proyectos
`ideabackend`, `ideacms` e `ideafront`. Se excluyen `.env`, `node_modules`, logs,
backups y archivos temporales.
