import test from 'node:test';
import assert from 'node:assert/strict';
import { score } from '../server/scoring';

test('Scoring Engine Unit Tests', async (t) => {
  await t.test('All correct answers yields maximum score and 100% accuracy', () => {
    const result = score(10, 0, 2.0, 0.5, 20, 10);
    assert.equal(result.score, 20);
    assert.equal(result.percentage, 100);
    assert.equal(result.accuracy, 100);
  });

  await t.test('Calculates standard competitive exam penalty accurately (+1.0 / -0.25)', () => {
    // 8 correct (+8.0), 2 wrong (-0.50) = 7.50
    const result = score(8, 2, 1.0, 0.25, 10, 10);
    assert.equal(result.score, 7.5);
    assert.equal(result.accuracy, 80);
    assert.equal(result.percentage, 75);
  });

  await t.test('Zero negative marking setting preserves full marks without deduction', () => {
    // 5 correct (+5.0), 5 wrong (-0.00 penalty) = 5.00
    const result = score(5, 5, 1.0, 0, 10, 10);
    assert.equal(result.score, 5);
    assert.equal(result.accuracy, 50);
    assert.equal(result.percentage, 50);
  });

  await t.test('Correctly handles negative final score when wrong answers outweigh correct', () => {
    // 1 correct (+1.0), 8 wrong (-2.00) = -1.00
    const result = score(1, 8, 1.0, 0.25, 10, 10);
    assert.equal(result.score, -1.0);
    assert.equal(result.accuracy, 11.11);
    assert.equal(result.percentage, -10.0);
  });

  await t.test('Safeguards against zero attempts (prevents NaN or Division by Zero)', () => {
    const result = score(0, 0, 1.0, 0.25, 10, 10);
    assert.equal(result.score, 0);
    assert.equal(result.accuracy, 0);
    assert.equal(result.percentage, 0);
    assert.equal(isNaN(result.accuracy), false);
    assert.equal(isNaN(result.percentage), false);
  });

  await t.test('Sanitizes invalid, negative or null inputs gracefully', () => {
    const result = score(-5, -2, NaN, NaN, 0, 0);
    assert.equal(result.score, 0);
    assert.equal(result.accuracy, 0);
    assert.equal(result.percentage, 0);
  });
});
