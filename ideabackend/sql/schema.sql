-- Base de datos: la que uses en SQL_DATABASE (ej. IDEA2026)
-- Ejecutar una vez para crear tablas del CMS mínimo.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cms_pages')
BEGIN
  CREATE TABLE cms_pages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    title NVARCHAR(500) NOT NULL,
    body NVARCHAR(MAX) NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
  );
END
