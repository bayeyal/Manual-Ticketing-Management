export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface BaseUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface BaseProject {
  name: string;
  description: string;
  url: string;
}

export interface BaseTask {
  title: string;
  description: string;
} 