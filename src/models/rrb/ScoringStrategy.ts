/**
 * ScoringStrategy.ts
 * Object-Oriented Strategy Pattern Implementation for Railway & Competitive Scoring.
 * Strictly adheres to CEN No. 07/2026 rules:
 *  - Correct: +1.0 mark
 *  - Incorrect: -1/3 (0.3333) mark deduction
 *  - Unattempted: 0 penalty
 *  - Minimum qualifying percentages: UR (40%), EWS (40%), OBC (30%), SC (30%), ST (25%)
 */

export interface ScoreBreakdown {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  unattempted: number;
  grossMarks: number;
  negativeMarksDeducted: number;
  netScore: number;
  accuracy: number;
  percentage: number;
  isQualified: (category: 'UR' | 'EWS' | 'OBC' | 'SC' | 'ST') => boolean;
}

export interface IScoringStrategy {
  readonly name: string;
  readonly positiveMark: number;
  readonly penaltyPerWrong: number;
  calculateScore(
    totalQuestions: number,
    correctCount: number,
    wrongCount: number,
    totalMaximumMarks?: number
  ): ScoreBreakdown;
}

export class RrbNtpcScoringStrategy implements IScoringStrategy {
  public readonly name = 'RRB NTPC CEN 07/2026 Strategy (1/3rd Negative Marking)';
  public readonly positiveMark = 1.0;
  public readonly penaltyPerWrong = 1.0 / 3.0; // 0.3333333333333333

  public calculateScore(
    totalQuestions: number,
    correctCount: number,
    wrongCount: number,
    totalMaximumMarks = 100
  ): ScoreBreakdown {
    const safeCorrect = Math.max(0, correctCount);
    const safeWrong = Math.max(0, wrongCount);
    const attempted = safeCorrect + safeWrong;
    const unattempted = Math.max(0, totalQuestions - attempted);

    const grossMarks = safeCorrect * this.positiveMark;
    const negativeMarksDeducted = safeWrong * this.penaltyPerWrong;
    const rawNet = grossMarks - negativeMarksDeducted;
    const netScore = Math.round(rawNet * 100) / 100;

    const accuracy = attempted > 0 ? Math.round((safeCorrect / attempted) * 10000) / 100 : 0;
    const percentage = totalMaximumMarks > 0 ? Math.round((netScore / totalMaximumMarks) * 10000) / 100 : 0;

    return {
      totalQuestions,
      attempted,
      correct: safeCorrect,
      wrong: safeWrong,
      unattempted,
      grossMarks: Math.round(grossMarks * 100) / 100,
      negativeMarksDeducted: Math.round(negativeMarksDeducted * 100) / 100,
      netScore,
      accuracy,
      percentage,
      isQualified: (category: 'UR' | 'EWS' | 'OBC' | 'SC' | 'ST') => {
        const cutoffs: Record<string, number> = {
          UR: 40.0,
          EWS: 40.0,
          OBC: 30.0,
          SC: 30.0,
          ST: 25.0,
        };
        const requiredPercent = cutoffs[category] ?? 40.0;
        return percentage >= requiredPercent;
      },
    };
  }
}
