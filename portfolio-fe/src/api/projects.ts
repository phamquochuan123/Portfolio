import type { ProjectDetail, ProjectSummary } from "../types";
import { get } from "./client";

export const getProjects = () => get<ProjectSummary[]>('/api/projects');


export const getProjectBySlug = (slug: string) =>
    get<ProjectDetail>(`/api/projects/${slug}`);