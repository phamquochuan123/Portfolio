CREATE TABLE media_assets (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE
    SET NULL,
        public_id VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        format VARCHAR(20),
        width INTEGER,
        height INTEGER,
        bytes BIGINT,
        original_filename VARCHAR(255),
        alt_text VARCHAR(255),
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        deleted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX idx_media_public_id ON media_assets (public_id)
WHERE deleted = false;
CREATE INDEX idx_media_project ON media_assets (project_id, sort_order)
WHERE deleted = false;