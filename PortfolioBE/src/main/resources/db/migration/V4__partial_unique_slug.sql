ALTER TABLE projects DROP CONSTRAINT projects_slug_key;
CREATE UNIQUE INDEX idx_projects_slug_active ON projects (slug)
WHERE deleted = false;