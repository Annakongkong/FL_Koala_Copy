'use client';

import { getCurrentUser, login } from '@/services/common';
import { parseUser } from '@/services/parse';

import type { User } from '@/types/user';
import { paths } from '@/paths';

type ApiStatusResponse = User | { error: string };

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  username: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<ApiStatusResponse> {
    try {
      const response = await login(params);

      if (!response.success) {
        return { error: response.message || 'Login failed' };
      }

      if (!response.data.user) {
        return { error: 'User data is missing' };
      }
      const user = parseUser(response.data);
      localStorage.setItem('custom-auth-token', response.data.access_token);
      return user;
    } catch (error) {
      console.error('Error during signInWithPassword:', error);
      return { error: 'Email or password is incorrect.' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      // return {error: "No user logged now."};
      return { data: null };
    }

    try {
      const response = await getCurrentUser();

      if (!response.success) {
        return { error: response.message || 'Login failed' };
      }

      // console.log('get current user successfully:', response.data);
      const user = parseUser(response.data);
      return { data: user };
    } catch (error) {
      console.error('Error during signInWithPassword:', error);
      document.location.href = paths.auth.signIn;
      return { error: 'API connection error' };
    }
    // return
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    return {};
  }
}

export const authClient = new AuthClient();
