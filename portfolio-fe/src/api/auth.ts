import type { LoginRequest, LoginResponse } from '../types';
import { post } from './client';

export const login = (data: LoginRequest) => post<LoginResponse>('/api/auth/login', data);
