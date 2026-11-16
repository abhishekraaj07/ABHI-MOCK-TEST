import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAnswerFeedback } from '../server/routes/attempts';

describe('Real-Time Right/Wrong Answer Feedback & Explanation Engine', () => {
  const mockOptions = [
    { id: 'opt-1', optionKey: 'A', optionText: 'Linear Search O(n)', isCorrect: false },
    { id: 'opt-2', optionKey: 'B', optionText: 'Binary Search O(log n)', isCorrect: true },
    { id: 'opt-3', optionKey: 'C', optionText: 'Bubble Sort O(n^2)', isCorrect: false },
    { id: 'opt-4', optionKey: 'D', optionText: 'Hash Table Lookup O(1)', isCorrect: false },
  ];

  const explanation = 'Binary search continuously divides the search interval in half.';
  const shortcut = 'Divide and conquer always produces O(log n) time complexity.';

  it('correct option selected: returns isCorrect = true, correct key, and full explanation', () => {
    const feedback = evaluateAnswerFeedback('B', mockOptions, explanation, shortcut);
    assert.ok(feedback !== null);
    assert.strictEqual(feedback.isCorrect, true);
    assert.strictEqual(feedback.correctOptionKey, 'B');
    assert.strictEqual(feedback.correctOptionText, 'Binary Search O(log n)');
    assert.strictEqual(feedback.explanation, explanation);
    assert.strictEqual(feedback.shortcut, shortcut);
  });

  it('wrong option selected: returns isCorrect = false and reveals correct option key', () => {
    const feedback = evaluateAnswerFeedback('A', mockOptions, explanation, shortcut);
    assert.ok(feedback !== null);
    assert.strictEqual(feedback.isCorrect, false);
    assert.strictEqual(feedback.correctOptionKey, 'B');
    assert.strictEqual(feedback.correctOptionText, 'Binary Search O(log n)');
    assert.strictEqual(feedback.explanation, explanation);
  });

  it('no option selected: returns null', () => {
    const feedback = evaluateAnswerFeedback(null, mockOptions, explanation, shortcut);
    assert.strictEqual(feedback, null);
  });

  it('gracefully handles missing optional explanation and shortcut', () => {
    const feedback = evaluateAnswerFeedback('B', mockOptions, null, null);
    assert.ok(feedback !== null);
    assert.strictEqual(feedback.isCorrect, true);
    assert.strictEqual(feedback.explanation, null);
    assert.strictEqual(feedback.shortcut, null);
  });
});
