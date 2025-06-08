import { BaseEntity, BaseUser } from './base';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ACCOUNT_ADMIN = 'ACCOUNT_ADMIN',
  PROJECT_ADMIN = 'PROJECT_ADMIN',
  USER = 'USER'
}

export interface User extends BaseEntity, BaseUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  assignedProjectIds?: number[];
  avatar?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  assignedProjectIds?: number[];
} 