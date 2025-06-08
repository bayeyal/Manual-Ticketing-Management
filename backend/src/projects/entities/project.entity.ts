import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

export enum ProjectStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

export enum AuditType {
  WCAG_2_0 = 'WCAG_2_0',
  WCAG_2_1 = 'WCAG_2_1',
  WCAG_2_2 = 'WCAG_2_2'
}

export enum AuditLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: AuditType,
    default: AuditType.WCAG_2_1
  })
  auditType: AuditType;

  @Column({
    type: 'enum',
    enum: AuditLevel,
    default: AuditLevel.AA
  })
  auditLevel: AuditLevel;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NEW
  })
  status: ProjectStatus;

  @Column({ default: 0 })
  progress: number;

  @ManyToOne(() => User, user => user.managedProjects)
  projectAdmin: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'project_auditors',
    joinColumn: { name: 'projectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  auditors: User[];

  @OneToMany(() => Task, task => task.project, {
    cascade: true,
    onDelete: 'SET NULL'
  })
  tasks: Task[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'project_assigned_users',
    joinColumn: { name: 'projectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  assignedUsers: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 