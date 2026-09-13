export interface ScoreResult {
  score: number;
  percentage: number;
  accuracy: number;
}

export interface QuestionScoringItem {
  questionId: string;
  isCorrect: boolean | null; // true = correct, false = wrong, null = unanswered
  marks: number;
  negativeMarks?: number;
}

export interface ItemizedScoreResult extends ScoreResult {
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
}

/**
 * Single reusable, testable scoring function per specification (§9):
 * score(correctCount, wrongCount, marksPerQuestion, negativeMarksPerQuestion)
 * -> { score, percentage, accuracy }
 */
export function score(
  correctCount: number,
  wrongCount: number,
  marksPerQuestion: number,
  negativeMarksPerQuestion: number,
  totalPossibleMarks?: number,
  totalQuestions?: number
): ScoreResult {
  const validCorrect = Math.max(0, Math.floor(correctCount || 0));
  const validWrong = Math.max(0, Math.floor(wrongCount || 0));
  const validMarks = typeof marksPerQuestion === 'number' && !isNaN(marksPerQuestion) ? marksPerQuestion : 1.0;
  const validNegMarks = typeof negativeMarksPerQuestion === 'number' && !isNaN(negativeMarksPerQuestion) ? Math.max(0, negativeMarksPerQuestion) : 0.25;

  const rawScore = validCorrect * validMarks - validWrong * validNegMarks;
  const finalScore = parseFloat(rawScore.toFixed(2));
  
  const totalAttempted = validCorrect + validWrong;
  const accuracy = totalAttempted > 0 
    ? parseFloat(((validCorrect / totalAttempted) * 100).toFixed(2)) 
    : 0;

  const denominator = totalPossibleMarks && totalPossibleMarks > 0 
    ? totalPossibleMarks 
    : (totalQuestions && totalQuestions > 0 && validMarks > 0 ? totalQuestions * validMarks : 100);

  const percentage = denominator > 0 
    ? parseFloat(((finalScore / denominator) * 100).toFixed(2)) 
    : 0;

  return {
    score: finalScore,
    percentage,
    accuracy,
  };
}

/**
 * High-precision itemized scoring function supporting tests with variable marks per question
 * and specific negative marks per question.
 */
export function scoreItemizedQuestions(
  items: QuestionScoringItem[],
  testTotalMarks?: number
): ItemizedScoreResult {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let rawScore = 0;
  let calculatedTotalPossible = 0;

  for (const item of items) {
    const qMarks = typeof item.marks === 'number' && !isNaN(item.marks) ? Math.max(0, item.marks) : 1.0;
    const qNeg = typeof item.negativeMarks === 'number' && !isNaN(item.negativeMarks) ? Math.max(0, item.negativeMarks) : 0.25;
    calculatedTotalPossible += qMarks;

    if (item.isCorrect === true) {
      correctCount++;
      rawScore += qMarks;
    } else if (item.isCorrect === false) {
      wrongCount++;
      rawScore -= qNeg;
    } else {
      unansweredCount++;
    }
  }

  const finalScore = parseFloat(rawScore.toFixed(2));
  const totalAttempted = correctCount + wrongCount;
  const accuracy = totalAttempted > 0
    ? parseFloat(((correctCount / totalAttempted) * 100).toFixed(2))
    : 0;

  const denominator = testTotalMarks && testTotalMarks > 0
    ? testTotalMarks
    : (calculatedTotalPossible > 0 ? calculatedTotalPossible : 100);

  const percentage = denominator > 0
    ? parseFloat(((finalScore / denominator) * 100).toFixed(2))
    : 0;

  return {
    score: finalScore,
    percentage,
    accuracy,
    correctCount,
    wrongCount,
    unansweredCount,
    totalQuestions: items.length,
  };
}
