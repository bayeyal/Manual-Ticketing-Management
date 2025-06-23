import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Page } from '../../pages/entities/page.entity';

export enum TaskStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

export enum TaskSeverity {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  wcagCriteria: string;

  @Column()
  wcagVersion: string;

  @Column()
  conformanceLevel: string;

  @Column('text', { nullable: true })
  defectSummary?: string;

  @Column('text', { nullable: true })
  recommendation?: string;

  @Column('text', { nullable: true })
  userImpact?: string;

  @Column('text', { nullable: true })
  comments?: string;

  @Column({ nullable: true })
  disabilityType?: string;

  @Column({ nullable: true })
  screenshot?: string;

  @Column({
    type: 'enum',
    enum: TaskSeverity,
    default: TaskSeverity.MODERATE,
  })
  severity: TaskSeverity;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.NEW,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assignedTo?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  auditor?: User;

  @ManyToOne(() => Project, project => project.tasks, {
    onDelete: 'SET NULL',
    nullable: true
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => Page, page => page.tasks, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'pageId' })
  page: Page;

  @OneToMany(() => TaskMessage, message => message.task)
  messages: TaskMessage[];

  @Column()
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class TaskMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => Task)
  @JoinColumn()
  task: Task;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  mentionedUser?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 