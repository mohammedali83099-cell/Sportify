/**
 * API Contracts & Authentication Types
 */

import { Athlete } from './athlete';

export interface Token {
  access_token: string;
  token_type: string;
}

export interface AuthResponse extends Token {
  athlete?: Athlete;
}

export interface SendOTPRequest {
  email: string;
  purpose?: 'registration' | 'login';
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  purpose?: 'registration' | 'login';
  full_name?: string;
  password?: string;
}

export interface OTPResponse {
  message: string;
  cooldown_seconds: number;
  dev_code?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  full_name?: string;
  recovery_pin?: string;
}

export interface ResetPasswordPinRequest {
  email: string;
  recovery_pin: string;
  new_password: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface ApiErrorDetailItem {
  msg?: string;
  message?: string;
  loc?: (string | number)[];
  type?: string;
}

export type ApiErrorDetail = string | ApiErrorDetailItem[] | ApiErrorDetailItem;

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}
