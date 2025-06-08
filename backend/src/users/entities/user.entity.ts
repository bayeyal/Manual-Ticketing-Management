import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Project } from '../../projects/entities/project.entity';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ACCOUNT_ADMIN = 'ACCOUNT_ADMIN',
  PROJECT_ADMIN = 'PROJECT_ADMIN',
  USER = 'USER'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @OneToMany(() => Task, task => task.assignedTo)
  assignedTasks: Task[];

  @OneToMany(() => Project, project => project.projectAdmin)
  managedProjects: Project[];
} 