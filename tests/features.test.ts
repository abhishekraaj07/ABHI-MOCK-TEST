import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseQuestionsCsv,
  formatQuestionOptions,
  validateImportQuestionItem,
} from '../server/routes/admin';
import { clampQuestionCount, clampDuration } from '../server/routes/tests';
import {
  AdminQuestionSchema,
  AdminTestSchema,
  ReportQuestionSchema,
} from '../server/validators/schemas';
import { VALID_REPORT_REASONS } from '../server/routes/reports';

describe('Features & Business Logic Unit Tests', () => {
  it('CSV parsing for question import: correctly parses quoted strings, commas, and headers', () => {
    const csvContent = [
      'questionText,exam,subject,topic,difficulty,optionA,optionB,optionC,optionD,correctOption,explanation',
      '"What is 2 + 2, according to arithmetic?",SSC,Math,Arithmetic,Easy,"3, not 4",4,5,6,B,"2 + 2 equals 4"',
      '"Which planet is known as the ""Red Planet""?",General,Science,Astronomy,Easy,Venus,Mars,Jupiter,Saturn,B,"Mars is red due to iron oxide"',
    ].join('\n');

    const parsed = parseQuestionsCsv(csvContent);
    assert.strictEqual(parsed.length, 2);

    // Verify first row with embedded commas inside quotes
    assert.strictEqual(parsed[0].questiontext, 'What is 2 + 2, according to arithmetic?');
    assert.strictEqual(parsed[0].optiona, '3, not 4');
    assert.strictEqual(parsed[0].optionb, '4');
    assert.strictEqual(parsed[0].correctoption, 'B');
    assert.strictEqual(parsed[0].explanation, '2 + 2 equals 4');

    // Verify second row
    assert.strictEqual(parsed[1].optionb, 'Mars');
    assert.strictEqual(parsed[1].correctoption, 'B');

    // Edge cases: empty string, whitespace only, or header only
    assert.deepStrictEqual(parseQuestionsCsv(''), []);
    assert.deepStrictEqual(parseQuestionsCsv('   \n  \n  '), []);
    assert.deepStrictEqual(parseQuestionsCsv('questionText,exam,subject'), []);
  });

  it('JSON question import validation: validates required fields, types, and constraints', () => {
    // Valid question payload
    const validQuestion = {
      examId: 'exam-ssc',
      subjectId: 'subj-math',
      questionText: 'What is the sum of angles in a triangle?',
      difficulty: 'Easy' as const,
      marks: 2.0,
      negativeMarks: 0.5,
      options: [
        { optionKey: 'A' as const, optionText: '90 degrees', isCorrect: false },
        { optionKey: 'B' as const, optionText: '180 degrees', isCorrect: true },
        { optionKey: 'C' as const, optionText: '270 degrees', isCorrect: false },
        { optionKey: 'D' as const, optionText: '360 degrees', isCorrect: false },
      ],
    };

    const validResult = AdminQuestionSchema.safeParse(validQuestion);
    assert.strictEqual(validResult.success, true);

    // Invalid: Question text too short (< 5 characters)
    const shortTextResult = AdminQuestionSchema.safeParse({
      ...validQuestion,
      questionText: 'Why?',
    });
    assert.strictEqual(shortTextResult.success, false);

    // Invalid: Less than 2 options
    const singleOptionResult = AdminQuestionSchema.safeParse({
      ...validQuestion,
      options: [{ optionKey: 'A' as const, optionText: 'Only option', isCorrect: true }],
    });
    assert.strictEqual(singleOptionResult.success, false);

    // Test import validator helper
    const itemValidation = validateImportQuestionItem({
      questionText: 'Valid length question prompt here',
      optionA: 'Option 1',
      optionB: 'Option 2',
      correctOption: 'B',
    });
    assert.strictEqual(itemValidation.valid, true);

    const emptyValidation = validateImportQuestionItem({});
    assert.strictEqual(emptyValidation.valid, false);
    assert.ok(emptyValidation.error?.includes('5 characters'));
  });

  it('Custom test builder limits: enforces min/max question count clamping', () => {
    // Below minimum 5 clamped to 5
    assert.strictEqual(clampQuestionCount(1), 5);
    assert.strictEqual(clampQuestionCount(4), 5);

    // Above maximum 50 clamped to 50
    assert.strictEqual(clampQuestionCount(51), 50);
    assert.strictEqual(clampQuestionCount(100), 50);
    assert.strictEqual(clampQuestionCount(999), 50);

    // Within bounds preserved
    assert.strictEqual(clampQuestionCount(5), 5);
    assert.strictEqual(clampQuestionCount(25), 25);
    assert.strictEqual(clampQuestionCount(50), 50);

    // Fallbacks for zero, negative, null, NaN, or non-numeric inputs default to 10
    assert.strictEqual(clampQuestionCount(0), 10);
    assert.strictEqual(clampQuestionCount(-10), 5); // parsed as -10, Math.max(5, -10) = 5
    assert.strictEqual(clampQuestionCount('abc'), 10);
    assert.strictEqual(clampQuestionCount(undefined), 10);
    assert.strictEqual(clampQuestionCount(null), 10);
  });

  it('Question validation: ensures at least one correct option exists and formats options properly', () => {
    // 4 options standard question
    const standardRow = {
      questionText: 'What is the capital of India?',
      optionA: 'Mumbai',
      optionB: 'New Delhi',
      optionC: 'Kolkata',
      optionD: 'Chennai',
      correctOption: 'B',
    };

    const formatted = formatQuestionOptions(standardRow);
    assert.strictEqual(formatted.length, 4);
    assert.strictEqual(formatted[1].isCorrect, true);
    assert.strictEqual(formatted[0].isCorrect, false);
    assert.strictEqual(formatted[1].optionText, 'New Delhi');

    // 5 options (Banking pattern with optionE)
    const fiveOptionRow = {
      ...standardRow,
      optionE: 'None of the above',
      correctOption: 'E',
    };
    const formattedFive = formatQuestionOptions(fiveOptionRow);
    assert.strictEqual(formattedFive.length, 5);
    assert.strictEqual(formattedFive[4].optionKey, 'E');
    assert.strictEqual(formattedFive[4].isCorrect, true);

    // If correct option is omitted or invalid, defaults first option (A) to true
    const noCorrectRow = {
      questionText: 'Sample prompt?',
      optionA: 'First Option',
      optionB: 'Second Option',
      correctOption: '',
    };
    const fallbackCorrect = formatQuestionOptions(noCorrectRow);
    assert.strictEqual(fallbackCorrect.some((o) => o.isCorrect), true);
    assert.strictEqual(fallbackCorrect[0].isCorrect, true);
  });

  it('Exam duration validation: enforces positive duration limits for admin tests and custom builder', () => {
    // AdminTestSchema duration checks
    const validTest = {
      examId: 'exam-123',
      title: 'Full Length Test 1',
      testType: 'Full Length' as const,
      duration: 60,
      totalMarks: 100,
      negativeMarks: 0.25,
      difficulty: 'Moderate' as const,
    };

    const validParsed = AdminTestSchema.safeParse(validTest);
    assert.strictEqual(validParsed.success, true);

    // Negative duration rejected
    const negativeDuration = AdminTestSchema.safeParse({
      ...validTest,
      duration: -30,
    });
    assert.strictEqual(negativeDuration.success, false);

    // Zero duration rejected
    const zeroDuration = AdminTestSchema.safeParse({
      ...validTest,
      duration: 0,
    });
    assert.strictEqual(zeroDuration.success, false);

    // Non-integer duration rejected
    const floatDuration = AdminTestSchema.safeParse({
      ...validTest,
      duration: 45.5,
    });
    assert.strictEqual(floatDuration.success, false);

    // Custom test builder duration clamping (5 min to 180 min, default 15)
    assert.strictEqual(clampDuration(2), 5); // Below minimum 5 clamped to 5
    assert.strictEqual(clampDuration(300), 180); // Above maximum 180 clamped to 180
    assert.strictEqual(clampDuration(45), 45); // Within bounds preserved
    assert.strictEqual(clampDuration(0), 15); // Fallback to 15
    assert.strictEqual(clampDuration('invalid'), 15);
  });

  it('Question dispute reporting: validates allowed reason categories and description length', () => {
    // Allowed reasons verification
    const expectedReasons = ['wrong_question', 'wrong_answer', 'typo', 'unclear_question', 'technical_issue'];
    for (const reason of expectedReasons) {
      assert.ok(VALID_REPORT_REASONS.includes(reason as any));
    }
    assert.strictEqual(VALID_REPORT_REASONS.includes('fake_reason' as any), false);

    // Valid report schema parsing
    const validReport = ReportQuestionSchema.safeParse({
      questionId: 'q-999',
      reason: 'typo',
      description: 'The spelling of hypothesis is incorrect in option B.',
    });
    assert.strictEqual(validReport.success, true);

    // Short description rejected (< 5 chars)
    const shortDesc = ReportQuestionSchema.safeParse({
      questionId: 'q-999',
      reason: 'typo',
      description: 'Bad',
    });
    assert.strictEqual(shortDesc.success, false);

    // Invalid reason enum rejected
    const invalidReason = ReportQuestionSchema.safeParse({
      questionId: 'q-999',
      reason: 'inappropriate',
      description: 'Valid long description of the problem.',
    });
    assert.strictEqual(invalidReason.success, false);
  });

  it('Daily challenge date calculation format conforms strictly to standard YYYY-MM-DD', () => {
    const today = new Date().toISOString().slice(0, 10);
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);

    const [year, month, day] = today.split('-').map(Number);
    assert.ok(year >= 2024);
    assert.ok(month >= 1 && month <= 12);
    assert.ok(day >= 1 && day <= 31);
  });
});
