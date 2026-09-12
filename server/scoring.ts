export interface ScoreResult {
  score: number;
  percentage: number;
  accuracy: number;
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
