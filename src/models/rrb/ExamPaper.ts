/**
 * ExamPaper.ts
 * Object-Oriented Builder Pattern Implementation for Mock Test Papers.
 * Encapsulates exam paper validation, time budgets, and section distributions.
 */

import { BaseQuestion } from './Question';
import { IScoringStrategy, RrbNtpcScoringStrategy } from './ScoringStrategy';

export interface ExamPaperProps {
  id: string;
  title: string;
  description: string;
  examId: string;
  examName: string;
  examSlug: string;
  subjectName: string;
  testType: 'Full Length' | 'Sectional' | 'Practice' | 'Previous Year';
  durationMinutes: number;
  totalMarks: number;
  negativeMarks: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  questions: BaseQuestion[];
  scoringStrategy?: IScoringStrategy;
}

export class ExamPaper {
  private readonly _id: string;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _examId: string;
  private readonly _examName: string;
  private readonly _examSlug: string;
  private readonly _subjectName: string;
  private readonly _testType: 'Full Length' | 'Sectional' | 'Practice' | 'Previous Year';
  private readonly _durationMinutes: number;
  private readonly _totalMarks: number;
  private readonly _negativeMarks: number;
  private readonly _difficulty: 'Easy' | 'Moderate' | 'Hard';
  private readonly _questions: BaseQuestion[];
  private readonly _scoringStrategy: IScoringStrategy;

  constructor(props: ExamPaperProps) {
    if (!props.id || !props.title) {
      throw new Error('Exam paper must have a valid ID and title.');
    }
    if (!props.questions || props.questions.length === 0) {
      throw new Error(`Exam paper [${props.title}] must have at least one question.`);
    }

    this._id = props.id;
    this._title = props.title;
    this._description = props.description;
    this._examId = props.examId;
    this._examName = props.examName;
    this._examSlug = props.examSlug;
    this._subjectName = props.subjectName;
    this._testType = props.testType;
    this._durationMinutes = props.durationMinutes;
    this._totalMarks = props.totalMarks;
    this._negativeMarks = props.negativeMarks;
    this._difficulty = props.difficulty;
    this._questions = props.questions;
    this._scoringStrategy = props.scoringStrategy || new RrbNtpcScoringStrategy();
  }

  // --- Encapsulated Getters ---
  public get id(): string { return this._id; }
  public get title(): string { return this._title; }
  public get description(): string { return this._description; }
  public get examId(): string { return this._examId; }
  public get examName(): string { return this._examName; }
  public get examSlug(): string { return this._examSlug; }
  public get subjectName(): string { return this._subjectName; }
  public get testType(): string { return this._testType; }
  public get durationMinutes(): number { return this._durationMinutes; }
  public get totalMarks(): number { return this._totalMarks; }
  public get negativeMarks(): number { return this._negativeMarks; }
  public get difficulty(): string { return this._difficulty; }
  public get questions(): BaseQuestion[] { return [...this._questions]; }
  public get questionCount(): number { return this._questions.length; }

  // --- Domain Logic Methods ---
  public getQuestionsBySection(sectionName: string): BaseQuestion[] {
    return this._questions.filter(
      (q) => q.getSectionName().toLowerCase() === sectionName.trim().toLowerCase()
    );
  }

  public getSectionDistribution(): Record<string, number> {
    const dist: Record<string, number> = {};
    for (const q of this._questions) {
      const section = q.getSectionName();
      dist[section] = (dist[section] || 0) + 1;
    }
    return dist;
  }

  public toJSON() {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      examId: this._examId,
      examName: this._examName,
      examSlug: this._examSlug,
      subjectName: this._subjectName,
      testType: this._testType,
      duration: this._durationMinutes,
      totalMarks: this._totalMarks,
      negativeMarks: this._negativeMarks,
      difficulty: this._difficulty,
      isPremium: false,
      questionCount: this._questions.length,
      sectionDistribution: this.getSectionDistribution(),
      questions: this._questions.map((q, index) => ({
        ...q.toJSON(),
        order: index + 1,
      })),
    };
  }
}

/**
 * Fluent Builder Pattern for assembling Exam Papers.
 */
export class ExamPaperBuilder {
  private _id = '';
  private _title = '';
  private _description = '';
  private _examId = 'rrb-ntpc-ug-2026';
  private _examName = 'RRB NTPC (UG) 2026';
  private _examSlug = 'rrb-ntpc-ug';
  private _subjectName = 'Full Syllabus (GA, Math, Reasoning)';
  private _testType: 'Full Length' | 'Sectional' | 'Practice' | 'Previous Year' = 'Full Length';
  private _durationMinutes = 90;
  private _totalMarks = 100;
  private _negativeMarks = 0.3333;
  private _difficulty: 'Easy' | 'Moderate' | 'Hard' = 'Moderate';
  private _questions: BaseQuestion[] = [];
  private _scoringStrategy: IScoringStrategy = new RrbNtpcScoringStrategy();

  public setId(id: string): this {
    this._id = id;
    return this;
  }

  public setTitle(title: string): this {
    this._title = title;
    return this;
  }

  public setDescription(description: string): this {
    this._description = description;
    return this;
  }

  public setExamMeta(examId: string, examName: string, examSlug: string): this {
    this._examId = examId;
    this._examName = examName;
    this._examSlug = examSlug;
    return this;
  }

  public setSubjectName(subjectName: string): this {
    this._subjectName = subjectName;
    return this;
  }

  public setTestType(type: 'Full Length' | 'Sectional' | 'Practice' | 'Previous Year'): this {
    this._testType = type;
    return this;
  }

  public setDuration(minutes: number): this {
    this._durationMinutes = minutes;
    return this;
  }

  public setTotalMarks(marks: number): this {
    this._totalMarks = marks;
    return this;
  }

  public setNegativeMarks(penalty: number): this {
    this._negativeMarks = penalty;
    return this;
  }

  public setDifficulty(difficulty: 'Easy' | 'Moderate' | 'Hard'): this {
    this._difficulty = difficulty;
    return this;
  }

  public setScoringStrategy(strategy: IScoringStrategy): this {
    this._scoringStrategy = strategy;
    return this;
  }

  public addQuestion(question: BaseQuestion): this {
    this._questions.push(question);
    return this;
  }

  public addQuestions(questions: BaseQuestion[]): this {
    this._questions.push(...questions);
    return this;
  }

  public build(): ExamPaper {
    if (!this._id) {
      throw new Error('ExamPaperBuilder: ID is required to build ExamPaper.');
    }
    if (!this._title) {
      throw new Error('ExamPaperBuilder: Title is required to build ExamPaper.');
    }

    return new ExamPaper({
      id: this._id,
      title: this._title,
      description: this._description,
      examId: this._examId,
      examName: this._examName,
      examSlug: this._examSlug,
      subjectName: this._subjectName,
      testType: this._testType,
      durationMinutes: this._durationMinutes,
      totalMarks: this._totalMarks,
      negativeMarks: this._negativeMarks,
      difficulty: this._difficulty,
      questions: this._questions,
      scoringStrategy: this._scoringStrategy,
    });
  }
}
