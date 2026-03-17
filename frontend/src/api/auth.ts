import axios from 'axios';
import { AuthUser } from '../types';

const BASE = 'http://localhost:8000/api';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface RegisterData {
  username: string;
  password: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export const login = (username: string, password: string) =>
  axios.post<LoginResponse>(`${BASE}/auth/login/`, { username, password });

export const register = (data: RegisterData) =>
  axios.post<LoginResponse>(`${BASE}/auth/register/`, data);

export const getMe = () =>
  import('./books').then(m => m.default.get<AuthUser>('/auth/me/'));
