import type { StatsResponse } from '../types';
import { get } from './client';

export const getStats = () => get<StatsResponse>('/api/admin/stats');
