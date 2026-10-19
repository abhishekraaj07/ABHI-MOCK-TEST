/**
 * QuestionFactory.ts
 * Factory Pattern implementation for constructing domain question entities.
 * Automatically validates options and instantiates the correct polymorphic subclass.
 */

import { Option } from './Option';
import {
  BaseQuestion,
  MathematicsQuestion,
  ReasoningQuestion,
  GeneralAwarenessQuestion,
} from './Question';

export interface RawOptionInput {
  id?: string;
  optionKey: string;
  optionText: string;
  isCorrect?: boolean;
}

export interface RawQuestionInput {
  id: string;
  examId?: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName: string;
  questionText: string;
  options: RawOptionInput[];
  marks?: number;
  negativeMarks?: number;
  explanation: string;
  difficulty?: 'Easy' | 'Moderate' | 'Hard';
  formula?: string;
  logicPattern?: string;
  domainArea?: 'General Science' | 'Indian Railways GK' | 'Polity & Economy' | 'History & Geography' | 'Current Affairs';
}

export class QuestionFactory {
  /**
   * Factory method: takes a raw data record and returns an instantiated, validated BaseQuestion subclass.
   */
  public static createQuestion(input: RawQuestionInput): BaseQuestion {
    // 1. Instantiate domain Option objects
    const options = input.options.map((opt) =>
      Option.create(opt.optionKey, opt.optionText, Boolean(opt.isCorrect), opt.id)
    );

    const baseProps = {
      id: input.id,
      examId: input.examId || 'rrb-ntpc-ug-2026',
      subjectId: input.subjectId,
      subjectName: input.subjectName,
      topicId: input.topicId,
      topicName: input.topicName,
      questionText: input.questionText,
      options,
      marks: input.marks ?? 1.0,
      negativeMarks: input.negativeMarks ?? (1.0 / 3.0),
      explanation: input.explanation,
      difficulty: input.difficulty ?? 'Moderate',
    };

    const subjectLower = input.subjectName.toLowerCase();

    // 2. Polymorphic dispatch based on subject domain
    if (subjectLower.includes('math') || subjectLower.includes('quant')) {
      return new MathematicsQuestion({
        ...baseProps,
        formula: input.formula,
      });
    }

    if (
      subjectLower.includes('reasoning') ||
      subjectLower.includes('intelligence') ||
      subjectLower.includes('logic')
    ) {
      return new ReasoningQuestion({
        ...baseProps,
        logicPattern: input.logicPattern,
      });
    }

    // Default to General Awareness (General Science, Railways GK, Polity, History, etc.)
    return new GeneralAwarenessQuestion({
      ...baseProps,
      domainArea: input.domainArea ?? 'General Science',
    });
  }

  /**
   * Batch factory method to instantiate multiple questions safely
   */
  public static createQuestions(inputs: RawQuestionInput[]): BaseQuestion[] {
    return inputs.map((input) => QuestionFactory.createQuestion(input));
  }
}
