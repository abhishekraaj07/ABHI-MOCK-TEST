import { z } from 'zod';

// --- Authentication Schemas ---
export const RegisterSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const LoginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long').max(128),
});

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
});

// --- Test Attempt Schemas ---
export const SaveAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  selectedOption: z.enum(['A', 'B', 'C', 'D']).nullable().optional(),
  isMarked: z.boolean().optional().default(false),
  timeSpent: z.number().int().nonnegative().optional().default(0),
});

// --- Question Reporting Schema ---
export const ReportQuestionSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  testId: z.string().optional(),
  reason: z.enum([
    'wrong_question',
    'wrong_answer',
    'typo',
    'unclear_question',
    'technical_issue',
  ]),
  description: z.string().trim().min(5, 'Please provide a detailed description (at least 5 characters)').max(1000),
});

// --- Admin Exam & Test Schemas ---
export const AdminExamSchema = z.object({
  name: z.string().trim().min(2, 'Exam name is required').max(150),
  slug: z.string().trim().min(2, 'Slug is required').max(150),
  description: z.string().optional().default(''),
  category: z.enum(['Banking', 'SSC', 'Railways', 'Regulatory', 'State Exams', 'General']).default('Banking'),
  difficulty: z.enum(['Easy', 'Moderate', 'Hard']).default('Moderate'),
  isActive: z.boolean().optional().default(true),
});

export const AdminTestSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  subjectId: z.string().nullable().optional(),
  title: z.string().trim().min(3, 'Test title is required').max(200),
  description: z.string().optional(),
  testType: z.enum(['Full Length', 'Sectional', 'Practice', 'Previous Year', 'Custom']).default('Full Length'),
  duration: z.number().int().positive('Duration must be positive in minutes'),
  totalMarks: z.number().positive('Total marks must be positive'),
  negativeMarks: z.number().nonnegative().default(0.25),
  difficulty: z.enum(['Easy', 'Moderate', 'Hard']).default('Moderate'),
  isPremium: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true),
  questionIds: z.array(z.string()).optional(),
});

export const AdminQuestionSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  topicId: z.string().nullable().optional(),
  questionText: z.string().trim().min(5, 'Question text is required'),
  questionType: z.string().default('MCQ'),
  difficulty: z.enum(['Easy', 'Moderate', 'Hard']).default('Moderate'),
  marks: z.number().positive().default(1.0),
  negativeMarks: z.number().nonnegative().default(0.25),
  explanation: z.string().optional(),
  shortcut: z.string().optional(),
  options: z.array(z.object({
    optionKey: z.enum(['A', 'B', 'C', 'D']),
    optionText: z.string().trim().min(1, 'Option text is required'),
    isCorrect: z.boolean().default(false),
  })).min(2, 'At least 2 options required').max(6),
});
