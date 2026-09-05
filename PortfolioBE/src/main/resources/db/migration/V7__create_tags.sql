CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    deleted BOOLEAN NOT NULL DEFAULT false
);

-- Cùng nếp với projects: chỉ ràng buộc trùng trên các bản ghi chưa xoá mềm.
CREATE UNIQUE INDEX idx_tags_slug_active ON tags (slug)
WHERE deleted = false;

CREATE TABLE project_tags (
    project_id BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

CREATE INDEX idx_project_tags_tag ON project_tags (tag_id);
