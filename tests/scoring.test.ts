import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { score, scoreItemizedQuestions, calculatePercentile } from '../server/scoring';

describe('Scoring Engine Unit Tests (§9)', () => {
  it('Correct answers get positive marks (+1.0 default and custom marks)', () => {
    // 10 correct, 0 wrong, default 1.0 mark per question
    const defaultResult = score(10, 0, 1.0, 0.25, 10, 10);
    assert.strictEqual(defaultResult.score, 10);
    assert.strictEqual(defaultResult.percentage, 100);
    assert.strictEqual(defaultResult.accuracy, 100);

    // Custom 2.0 marks per question for 5 correct answers
    const customResult = score(5, 0, 2.0, 0.5, 10, 5);
    assert.strictEqual(customResult.score, 10);
    assert.strictEqual(customResult.percentage, 100);
    assert.strictEqual(customResult.accuracy, 100);
  });

  it('Wrong answers get negative marking (0.25 deduction per wrong)', () => {
    // 4 wrong answers with standard 0.25 penalty = -1.0 mark deduction
    const wrongResult = score(0, 4, 1.0, 0.25, 10, 10);
    assert.strictEqual(wrongResult.score, -1.0);
    assert.strictEqual(wrongResult.accuracy, 0);
    assert.strictEqual(wrongResult.percentage, -10.0);

    // 4 correct (+4.0) and 4 wrong (-1.00) = 3.00 net score
    const mixedDeduction = score(4, 4, 1.0, 0.25, 10, 10);
    assert.strictEqual(mixedDeduction.score, 3.0);
    assert.strictEqual(mixedDeduction.accuracy, 50);
    assert.strictEqual(mixedDeduction.percentage, 30);

    // Zero negative marking setting preserves marks without deduction
    const zeroPenalty = score(5, 5, 1.0, 0, 10, 10);
    assert.strictEqual(zeroPenalty.score, 5.0);
  });

  it('Unanswered questions get 0 marks with no penalty', () => {
    // 5 correct, 0 wrong, 5 unanswered out of 10 questions
    const result = score(5, 0, 1.0, 0.25, 10, 10);
    assert.strictEqual(result.score, 5.0);
    assert.strictEqual(result.accuracy, 100);
    assert.strictEqual(result.percentage, 50);

    // Itemized test with explicit unanswered questions (isCorrect = null)
    const items = [
      { questionId: 'q1', isCorrect: true, marks: 2.0, negativeMarks: 0.5 },
      { questionId: 'q2', isCorrect: null, marks: 2.0, negativeMarks: 0.5 },
      { questionId: 'q3', isCorrect: null, marks: 2.0, negativeMarks: 0.5 },
    ];
    const itemized = scoreItemizedQuestions(items, 6.0);
    assert.strictEqual(itemized.score, 2.0);
    assert.strictEqual(itemized.correctCount, 1);
    assert.strictEqual(itemized.wrongCount, 0);
    assert.strictEqual(itemized.unansweredCount, 2);
    assert.strictEqual(itemized.accuracy, 100);
    assert.strictEqual(itemized.percentage, 33.33);
  });

  it('Perfect score calculation gives 100% score, accuracy, and percentage', () => {
    const totalQuestions = 25;
    const result = score(totalQuestions, 0, 1.0, 0.25, totalQuestions, totalQuestions);
    assert.strictEqual(result.score, 25);
    assert.strictEqual(result.accuracy, 100);
    assert.strictEqual(result.percentage, 100);

    // Itemized perfect score with varying marks
    const items = [
      { questionId: 'q1', isCorrect: true, marks: 1.5, negativeMarks: 0.25 },
      { questionId: 'q2', isCorrect: true, marks: 2.5, negativeMarks: 0.5 },
      { questionId: 'q3', isCorrect: true, marks: 1.0, negativeMarks: 0.25 },
    ];
    const itemized = scoreItemizedQuestions(items, 5.0);
    assert.strictEqual(itemized.score, 5.0);
    assert.strictEqual(itemized.percentage, 100);
    assert.strictEqual(itemized.accuracy, 100);
    assert.strictEqual(itemized.correctCount, 3);
    assert.strictEqual(itemized.wrongCount, 0);
    assert.strictEqual(itemized.unansweredCount, 0);
  });

  it('All-wrong score calculation yields negative score and 0% accuracy', () => {
    // 20 wrong answers out of 20: 20 * -0.25 = -5.0
    const result = score(0, 20, 1.0, 0.25, 20, 20);
    assert.strictEqual(result.score, -5.0);
    assert.strictEqual(result.accuracy, 0);
    assert.strictEqual(result.percentage, -25.0);

    // Itemized all-wrong
    const items = [
      { questionId: 'q1', isCorrect: false, marks: 1.0, negativeMarks: 0.25 },
      { questionId: 'q2', isCorrect: false, marks: 1.0, negativeMarks: 0.25 },
    ];
    const itemized = scoreItemizedQuestions(items, 2.0);
    assert.strictEqual(itemized.score, -0.5);
    assert.strictEqual(itemized.accuracy, 0);
    assert.strictEqual(itemized.correctCount, 0);
    assert.strictEqual(itemized.wrongCount, 2);
  });

  it('Mixed answers score correctly combines positive, negative, and zero marks', () => {
    // 12 correct (+12.0), 4 wrong (-1.00), 4 unanswered (0) = 11.0 net score
    const result = score(12, 4, 1.0, 0.25, 20, 20);
    assert.strictEqual(result.score, 11.0);
    assert.strictEqual(result.accuracy, 75.0); // 12/16 = 75%
    assert.strictEqual(result.percentage, 55.0); // 11/20 = 55%

    // Itemized scoring with mixed weights
    const items = [
      { questionId: 'q1', isCorrect: true, marks: 2.0, negativeMarks: 0.5 },
      { questionId: 'q2', isCorrect: true, marks: 1.0, negativeMarks: 0.25 },
      { questionId: 'q3', isCorrect: false, marks: 2.0, negativeMarks: 0.5 },
      { questionId: 'q4', isCorrect: null, marks: 1.0, negativeMarks: 0.25 },
    ];
    // Score: +2.0 + 1.0 - 0.5 = 2.5
    // Total marks: 6.0, Percentage: 2.5 / 6.0 * 100 = 41.67%
    // Attempted: 3 (2 correct, 1 wrong), Accuracy: 2/3 * 100 = 66.67%
    const itemized = scoreItemizedQuestions(items, 6.0);
    assert.strictEqual(itemized.score, 2.5);
    assert.strictEqual(itemized.accuracy, 66.67);
    assert.strictEqual(itemized.percentage, 41.67);
    assert.strictEqual(itemized.correctCount, 2);
    assert.strictEqual(itemized.wrongCount, 1);
    assert.strictEqual(itemized.unansweredCount, 1);
  });

  it('Edge case with 0 questions safeguards against division by zero and NaN', () => {
    const result = score(0, 0, 1.0, 0.25, 0, 0);
    assert.strictEqual(result.score, 0);
    assert.strictEqual(result.accuracy, 0);
    assert.strictEqual(result.percentage, 0);
    assert.strictEqual(Number.isNaN(result.score), false);
    assert.strictEqual(Number.isNaN(result.accuracy), false);
    assert.strictEqual(Number.isNaN(result.percentage), false);

    const itemized = scoreItemizedQuestions([], 0);
    assert.strictEqual(itemized.score, 0);
    assert.strictEqual(itemized.accuracy, 0);
    assert.strictEqual(itemized.percentage, 0);
    assert.strictEqual(itemized.totalQuestions, 0);
  });

  it('Accuracy percentage calculation evaluates ratio of correct to attempted questions', () => {
    // 1 correct, 3 wrong (4 attempted out of 10) -> 25% accuracy
    const res1 = score(1, 3, 1.0, 0.25, 10, 10);
    assert.strictEqual(res1.accuracy, 25);

    // 7 correct, 1 wrong (8 attempted out of 10) -> 87.5% accuracy
    const res2 = score(7, 1, 1.0, 0.25, 10, 10);
    assert.strictEqual(res2.accuracy, 87.5);

    // 0 attempted -> 0% accuracy
    const res3 = score(0, 0, 1.0, 0.25, 10, 10);
    assert.strictEqual(res3.accuracy, 0);
  });

  it('Sanitizes invalid, negative, or NaN inputs gracefully', () => {
    const result = score(-5, -2, NaN, NaN, 0, 0);
    assert.strictEqual(result.score, 0);
    assert.strictEqual(result.accuracy, 0);
    assert.strictEqual(result.percentage, 0);
  });

  it('Percentile calculation evaluates cohort distribution accurately', () => {
    const cohort = [50, 60, 70, 80, 90];

    // Top scorer in cohort: 4 below out of 4 others = 100.0%
    assert.strictEqual(calculatePercentile(90, cohort), 100.0);

    // Lowest scorer in cohort: 0 below out of 4 others = 0.0%
    assert.strictEqual(calculatePercentile(50, cohort), 0.0);

    // Median scorer: 3 below out of 4 others = 75.0%
    assert.strictEqual(calculatePercentile(75, cohort), 75.0);

    // Single candidate cohort defaults to 100.0%
    assert.strictEqual(calculatePercentile(85, [85]), 100.0);

    // Empty cohort defaults to 100.0%
    assert.strictEqual(calculatePercentile(85, []), 100.0);

    // Tied scores in cohort
    const tiedCohort = [60, 80, 80, 90];
    // For candidate scoring 80: strictly below is [60] (1 candidate) out of 3 others = 33.3%
    assert.strictEqual(calculatePercentile(80, tiedCohort), 33.3);
  });
});
