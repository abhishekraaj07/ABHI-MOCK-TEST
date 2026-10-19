/**
 * Question.ts
 * Object-Oriented Domain Models for Exam Questions.
 * Demonstrates:
 *  - Abstraction (Abstract class BaseQuestion)
 *  - Inheritance (MathematicsQuestion, ReasoningQuestion, GeneralAwarenessQuestion)
 *  - Polymorphism (Overriding abstract methods getSectionName, getRecommendedTimeSeconds)
 *  - Encapsulation (Defensive invariants, private fields, controlled getters)
 */

import { Option } from './Option';

export interface BaseQuestionProps {
  id: string;
  examId?: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName: string;
  questionText: string;
  options: Option[];
  marks?: number;
  negativeMarks?: number;
  explanation: string;
  difficulty?: 'Easy' | 'Moderate' | 'Hard';
}

/**
 * Abstract Base Class defining the contract and universal behavior of a question.
 */
export abstract class BaseQuestion {
  protected readonly _id: string;
  protected readonly _examId: string;
  protected readonly _subjectId: string;
  protected readonly _subjectName: string;
  protected readonly _topicId: string;
  protected readonly _topicName: string;
  protected readonly _questionText: string;
  protected readonly _options: Option[];
  protected readonly _marks: number;
  protected readonly _negativeMarks: number;
  protected readonly _explanation: string;
  protected readonly _difficulty: 'Easy' | 'Moderate' | 'Hard';

  constructor(props: BaseQuestionProps) {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Question ID must be specified.');
    }
    if (!props.questionText || props.questionText.trim().length < 5) {
      throw new Error(`Question [${props.id}] text must be at least 5 characters.`);
    }
    if (!props.options || props.options.length !== 4) {
      throw new Error(`Question [${props.id}] must contain exactly 4 options.`);
    }

    const correctOptions = props.options.filter((opt) => opt.isCorrect);
    if (correctOptions.length !== 1) {
      throw new Error(
        `Question [${props.id}] must contain exactly 1 correct option. Found ${correctOptions.length}.`
      );
    }

    this._id = props.id.trim();
    this._examId = props.examId || 'rrb-ntpc-ug-2026';
    this._subjectId = props.subjectId.trim();
    this._subjectName = props.subjectName.trim();
    this._topicId = props.topicId ? props.topicId.trim() : 'top-general';
    this._topicName = props.topicName.trim();
    this._questionText = props.questionText.trim();
    this._options = props.options;
    this._marks = props.marks !== undefined ? props.marks : 1.0;
    this._negativeMarks = props.negativeMarks !== undefined ? props.negativeMarks : 0.3333;
    this._explanation = props.explanation ? props.explanation.trim() : 'Detailed solution provided.';
    this._difficulty = props.difficulty || 'Moderate';
  }

  // --- Encapsulated Getters ---
  public get id(): string {
    return this._id;
  }
  public get examId(): string {
    return this._examId;
  }
  public get subjectId(): string {
    return this._subjectId;
  }
  public get subjectName(): string {
    return this._subjectName;
  }
  public get topicId(): string {
    return this._topicId;
  }
  public get topicName(): string {
    return this._topicName;
  }
  public get questionText(): string {
    return this._questionText;
  }
  public get options(): Option[] {
    return [...this._options];
  }
  public get marks(): number {
    return this._marks;
  }
  public get negativeMarks(): number {
    return this._negativeMarks;
  }
  public get explanation(): string {
    return this._explanation;
  }
  public get difficulty(): 'Easy' | 'Moderate' | 'Hard' {
    return this._difficulty;
  }

  // --- Abstract Methods (Polymorphic Contract) ---
  public abstract getSectionName(): string;
  public abstract getRecommendedTimeSeconds(): number;

  // --- Domain Logic Methods ---
  public isAnswerCorrect(selectedKey: string | null | undefined): boolean {
    if (!selectedKey) return false;
    const correctOpt = this._options.find((opt) => opt.isCorrect);
    return correctOpt ? correctOpt.optionKey.toUpperCase() === selectedKey.trim().toUpperCase() : false;
  }

  public calculateScore(selectedKey: string | null | undefined): number {
    if (!selectedKey) return 0.0;
    return this.isAnswerCorrect(selectedKey) ? this._marks : -this._negativeMarks;
  }

  public toJSON() {
    return {
      id: this._id,
      examId: this._examId,
      subjectId: this._subjectId,
      subjectName: this.getSectionName(),
      topicId: this._topicId,
      topicName: this._topicName,
      questionText: this._questionText,
      questionType: 'MCQ',
      difficulty: this._difficulty,
      marks: this._marks,
      negativeMarks: this._negativeMarks,
      recommendedTimeSeconds: this.getRecommendedTimeSeconds(),
      explanation: this._explanation,
      options: this._options.map((opt) => opt.toJSON()),
    };
  }
}

/**
 * Concrete Subclass 1: Mathematics Question
 * Specialized for arithmetic, mensuration, algebra, geometry, statistics.
 */
export class MathematicsQuestion extends BaseQuestion {
  private readonly _formula?: string;

  constructor(props: BaseQuestionProps & { formula?: string }) {
    super(props);
    this._formula = props.formula;
  }

  public get formula(): string | undefined {
    return this._formula;
  }

  public override getSectionName(): string {
    return 'Mathematics';
  }

  public override getRecommendedTimeSeconds(): number {
    // Math questions in RRB typically require 60-70 seconds
    return 65;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      formula: this._formula,
      categoryBadge: '🔢 Quantitative Drill',
    };
  }
}

/**
 * Concrete Subclass 2: General Intelligence and Reasoning Question
 * Specialized for analogies, coding-decoding, series, syllogisms, blood relations.
 */
export class ReasoningQuestion extends BaseQuestion {
  private readonly _logicPattern?: string;

  constructor(props: BaseQuestionProps & { logicPattern?: string }) {
    super(props);
    this._logicPattern = props.logicPattern;
  }

  public get logicPattern(): string | undefined {
    return this._logicPattern;
  }

  public override getSectionName(): string {
    return 'General Intelligence and Reasoning';
  }

  public override getRecommendedTimeSeconds(): number {
    // Reasoning questions in RRB typically require 45-50 seconds
    return 48;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      logicPattern: this._logicPattern,
      categoryBadge: '🧠 Logical Aptitude',
    };
  }
}

/**
 * Concrete Subclass 3: General Awareness Question
 * Specialized for General Science, Indian Railways, Polity, History, Current Affairs.
 */
export class GeneralAwarenessQuestion extends BaseQuestion {
  private readonly _domainArea: 'General Science' | 'Indian Railways GK' | 'Polity & Economy' | 'History & Geography' | 'Current Affairs';

  constructor(
    props: BaseQuestionProps & {
      domainArea?: 'General Science' | 'Indian Railways GK' | 'Polity & Economy' | 'History & Geography' | 'Current Affairs';
    }
  ) {
    super(props);
    this._domainArea = props.domainArea || 'General Science';
  }

  public get domainArea(): string {
    return this._domainArea;
  }

  public override getSectionName(): string {
    return 'General Awareness';
  }

  public override getRecommendedTimeSeconds(): number {
    // Fact-based General Awareness questions take ~25 seconds in CBT-1
    return 25;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      domainArea: this._domainArea,
      categoryBadge: `🌍 ${this._domainArea}`,
    };
  }
}
