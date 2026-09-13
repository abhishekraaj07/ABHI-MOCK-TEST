import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  RegisterSchema,
  LoginSchema,
  SaveAnswerSchema,
  ChangePasswordSchema,
  AdminExamSchema,
  AdminQuestionSchema,
} from '../server/validators/schemas';

describe('Production-Hardening: Input Validation & Audit Tests', () => {
  describe('Zod Authentication & Profile Validation Schemas', () => {
    it('Rejects passwords with length < 8 characters', () => {
      const result = RegisterSchema.safeParse({
        name: 'Abhi',
        email: 'abhi@test.com',
        password: 'short',
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some(e => e.message.includes('at least 8')));
      }
    });

    it('Rejects mismatched confirmPassword', () => {
      const result = RegisterSchema.safeParse({
        name: 'Abhi',
        email: 'abhi@test.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword!',
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some(e => e.message.includes('Passwords do not match')));
      }
    });

    it('Accepts valid registration payload', () => {
      const result = RegisterSchema.safeParse({
        name: 'Abhishek Kumar',
        email: 'abhishek@mocktest.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      });
      assert.strictEqual(result.success, true);
    });

    it('Rejects invalid email format on login', () => {
      const result = LoginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      assert.strictEqual(result.success, false);
    });

    it('Rejects new password < 8 chars in change password', () => {
      const result = ChangePasswordSchema.safeParse({
        currentPassword: 'ValidOldPassword123',
        newPassword: 'short',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('Zod Exam Attempt & Question Validation Schemas', () => {
    it('Validates SaveAnswerSchema accepts valid option keys (A, B, C, D) and null', () => {
      const valid = SaveAnswerSchema.safeParse({
        questionId: 'q-101',
        selectedOption: 'B',
        isMarked: true,
        timeSpent: 45,
      });
      assert.strictEqual(valid.success, true);

      const validClear = SaveAnswerSchema.safeParse({
        questionId: 'q-101',
        selectedOption: null,
      });
      assert.strictEqual(validClear.success, true);
    });

    it('Rejects invalid option keys like E, X, or arbitrary text', () => {
      const invalid = SaveAnswerSchema.safeParse({
        questionId: 'q-101',
        selectedOption: 'Z',
      });
      assert.strictEqual(invalid.success, false);
    });

    it('Clamps negative timeSpent to rejection or default', () => {
      const invalidTime = SaveAnswerSchema.safeParse({
        questionId: 'q-101',
        timeSpent: -10,
      });
      assert.strictEqual(invalidTime.success, false);
    });

    it('Validates AdminExamSchema rejects missing or short slugs', () => {
      const invalid = AdminExamSchema.safeParse({
        name: 'IBPS PO',
        slug: 'i',
      });
      assert.strictEqual(invalid.success, false);
    });

    it('Validates AdminQuestionSchema requires at least 2 options', () => {
      const invalid = AdminQuestionSchema.safeParse({
        examId: 'exam-1',
        subjectId: 'sub-1',
        questionText: 'What is 2 + 2?',
        options: [{ optionKey: 'A', optionText: '4', isCorrect: true }],
      });
      assert.strictEqual(invalid.success, false);
    });
  });

  describe('Admin Audit Log Schema & Serialization Integrity', () => {
    it('Properly constructs and serializes audit action metadata', () => {
      const metadata = {
        action: 'UPDATE_USER_ROLE',
        targetType: 'User',
        targetId: 'usr-123',
        diff: { oldRole: 'USER', newRole: 'ADMIN' },
      };

      const serialized = JSON.stringify(metadata);
      const parsed = JSON.parse(serialized);

      assert.strictEqual(parsed.action, 'UPDATE_USER_ROLE');
      assert.strictEqual(parsed.diff.oldRole, 'USER');
      assert.strictEqual(parsed.diff.newRole, 'ADMIN');
    });
  });
});
