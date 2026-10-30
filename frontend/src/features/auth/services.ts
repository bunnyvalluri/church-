import { api, ApiResponse } from '../../services/apiClient';
import { UserSession, LoginFormData, RegisterFormData } from './schemas';

export class AuthService {
  static async login(data: LoginFormData): Promise<ApiResponse<{ user: UserSession; token?: string }>> {
    return api.post('/api/auth/login', data);
  }

  static async verifyGoogle(credential: string): Promise<ApiResponse<{ user: UserSession; token?: string }>> {
    return api.post('/api/auth/google', { credential });
  }

  static async register(data: RegisterFormData): Promise<ApiResponse<{ user: UserSession }>> {
    return api.post('/api/auth/register', data);
  }

  static async getSession(): Promise<ApiResponse<{ user: UserSession }>> {
    return api.get('/api/auth/session');
  }

  static async logout(): Promise<ApiResponse<{ success: boolean }>> {
    return api.post('/api/auth/logout');
  }
}

