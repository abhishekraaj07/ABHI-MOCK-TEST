/**
 * tests/rrb_oop.test.ts
 * Rigorous Unit Test Suite for RRB NTPC Object-Oriented Domain Models.
 * Tests:
 *  - Encapsulation & Validation (Option & BaseQuestion)
 *  - Inheritance & Polymorphism (MathematicsQuestion, ReasoningQuestion, GeneralAwarenessQuestion)
 *  - Strategy Pattern (RrbNtpcScoringStrategy with 1/3rd penalty and CEN 07/2026 cutoffs)
 *  - Factory Pattern (QuestionFactory)
 *  - Builder Pattern (ExamPaperBuilder)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  Option,
  BaseQuestion,
  MathematicsQuestion,
  ReasoningQuestion,
  GeneralAwarenessQuestion,
  RrbNtpcScoringStrategy,
  QuestionFactory,
  ExamPaperBuilder,
} from '../src/models/rrb';

describe('RRB NTPC OOP Architecture & Design Patterns (§CEN 07/2026)', () => {
  describe('1. Encapsulation & Option Domain Model', () => {
    it('Creates a valid immutable Option and exposes correct encapsulated properties', () => {
      const opt = Option.create('B', 'Secunderabad', true, 'opt-test-1');
      assert.strictEqual(opt.optionKey, 'B');
      assert.strictEqual(opt.optionText, 'Secunderabad');
      assert.strictEqual(opt.isCorrect, true);
      assert.strictEqual(opt.id, 'opt-test-1');

      const json = opt.toJSON();
      assert.strictEqual(json.optionKey, 'B');
      assert.strictEqual(json.isCorrect, true);
    });

    it('Enforces defensive invariant: rejects invalid option key and empty text', () => {
      assert.throws(() => Option.create('E', 'Invalid Key', false), /Invalid option key/);
      assert.throws(() => Option.create('A', '   ', false), /Option text cannot be empty/);
    });
  });

  describe('2. Inheritance & Polymorphism (BaseQuestion Subclasses)', () => {
    const validOptions = [
      Option.create('A', 'Option 1', false),
      Option.create('B', 'Option 2', true),
      Option.create('C', 'Option 3', false),
      Option.create('D', 'Option 4', false),
    ];

    it('MathematicsQuestion polymorphically overrides section name and pacing', () => {
      const mathQ = new MathematicsQuestion({
        id: 'math-01',
        subjectId: 'sub-rrb-math',
        subjectName: 'Mathematics',
        topicName: 'LCM and HCF',
        questionText: 'What is the LCM of 12 and 18?',
        options: validOptions,
        explanation: 'Prime factorization of 12 is 2^2 * 3, and 18 is 2 * 3^2. LCM = 36.',
        formula: 'LCM(a, b) = (a * b) / HCF(a, b)',
      });

      assert.strictEqual(mathQ.getSectionName(), 'Mathematics');
      assert.strictEqual(mathQ.getRecommendedTimeSeconds(), 65);
      assert.strictEqual(mathQ.formula, 'LCM(a, b) = (a * b) / HCF(a, b)');
      assert.strictEqual(mathQ.isAnswerCorrect('B'), true);
      assert.strictEqual(mathQ.isAnswerCorrect('A'), false);
      assert.strictEqual(mathQ.calculateScore('B'), 1.0);
      assert.ok(mathQ.calculateScore('A') < 0); // Negative marking applied
    });

    it('ReasoningQuestion polymorphically overrides logic pattern and pacing', () => {
      const reasoningQ = new ReasoningQuestion({
        id: 'reas-01',
        subjectId: 'sub-rrb-reasoning',
        subjectName: 'General Intelligence and Reasoning',
        topicName: 'Analogies',
        questionText: 'Barometer : Pressure :: Thermometer : ?',
        options: validOptions,
        explanation: 'Thermometer measures temperature.',
        logicPattern: 'Instrument : Measurement',
      });

      assert.strictEqual(reasoningQ.getSectionName(), 'General Intelligence and Reasoning');
      assert.strictEqual(reasoningQ.getRecommendedTimeSeconds(), 48);
      assert.strictEqual(reasoningQ.logicPattern, 'Instrument : Measurement');
    });

    it('GeneralAwarenessQuestion polymorphically encapsulates domain area and rapid pacing', () => {
      const gaQ = new GeneralAwarenessQuestion({
        id: 'ga-01',
        subjectId: 'sub-rrb-ga',
        subjectName: 'General Awareness',
        topicName: 'Indian Railways GK',
        questionText: 'In which year did India run its first passenger train?',
        options: validOptions,
        explanation: '16 April 1853 from Bori Bunder to Thane.',
        domainArea: 'Indian Railways GK',
      });

      assert.strictEqual(gaQ.getSectionName(), 'General Awareness');
      assert.strictEqual(gaQ.getRecommendedTimeSeconds(), 25);
      assert.strictEqual(gaQ.domainArea, 'Indian Railways GK');
    });

    it('BaseQuestion enforces invariants: exactly 4 options and exactly 1 correct option', () => {
      // 3 options only (invalid)
      assert.throws(
        () =>
          new MathematicsQuestion({
            id: 'err-01',
            subjectId: 'sub-math',
            subjectName: 'Math',
            topicName: 'Numbers',
            questionText: 'Test question text',
            options: validOptions.slice(0, 3),
            explanation: 'Solution test',
          }),
        /must contain exactly 4 options/
      );

      // 2 correct options (invalid)
      const twoCorrect = [
        Option.create('A', 'Opt 1', true),
        Option.create('B', 'Opt 2', true),
        Option.create('C', 'Opt 3', false),
        Option.create('D', 'Opt 4', false),
      ];
      assert.throws(
        () =>
          new MathematicsQuestion({
            id: 'err-02',
            subjectId: 'sub-math',
            subjectName: 'Math',
            topicName: 'Numbers',
            questionText: 'Test question text',
            options: twoCorrect,
            explanation: 'Solution test',
          }),
        /must contain exactly 1 correct option/
      );
    });
  });

  describe('3. Strategy Pattern: RrbNtpcScoringStrategy', () => {
    const strategy = new RrbNtpcScoringStrategy();

    it('Evaluates 1/3rd negative marking penalty with high decimal precision', () => {
      // 60 correct (+60.0), 30 wrong (-10.0), 10 unattempted (0) out of 100 Qs
      const result = strategy.calculateScore(100, 60, 30, 100);

      assert.strictEqual(result.totalQuestions, 100);
      assert.strictEqual(result.attempted, 90);
      assert.strictEqual(result.correct, 60);
      assert.strictEqual(result.wrong, 30);
      assert.strictEqual(result.unattempted, 10);
      assert.strictEqual(result.grossMarks, 60);
      assert.strictEqual(result.negativeMarksDeducted, 10); // 30 * 1/3 = 10
      assert.strictEqual(result.netScore, 50); // 60 - 10 = 50
      assert.strictEqual(result.percentage, 50);
      assert.strictEqual(result.accuracy, 66.67);
    });

    it('Evaluates official CEN 07/2026 minimum qualifying category cutoffs', () => {
      // Score = 35%
      const result35 = strategy.calculateScore(100, 35, 0, 100);
      assert.strictEqual(result35.isQualified('UR'), false); // UR needs 40%
      assert.strictEqual(result35.isQualified('EWS'), false); // EWS needs 40%
      assert.strictEqual(result35.isQualified('OBC'), true); // OBC needs 30%
      assert.strictEqual(result35.isQualified('SC'), true); // SC needs 30%
      assert.strictEqual(result35.isQualified('ST'), true); // ST needs 25%

      // Score = 42%
      const result42 = strategy.calculateScore(100, 42, 0, 100);
      assert.strictEqual(result42.isQualified('UR'), true);
      assert.strictEqual(result42.isQualified('EWS'), true);
    });
  });

  describe('4. Factory Pattern: QuestionFactory', () => {
    it('Instantiates correct subclass based on subject taxonomy', () => {
      const q1 = QuestionFactory.createQuestion({
        id: 'f-01',
        subjectId: 'sub-math',
        subjectName: 'Mathematics',
        topicName: 'Decimals',
        questionText: 'What is 0.5 + 0.25?',
        options: [
          { optionKey: 'A', optionText: '0.75', isCorrect: true },
          { optionKey: 'B', optionText: '0.80', isCorrect: false },
          { optionKey: 'C', optionText: '0.90', isCorrect: false },
          { optionKey: 'D', optionText: '1.00', isCorrect: false },
        ],
        explanation: '0.5 + 0.25 = 0.75',
      });

      assert.ok(q1 instanceof MathematicsQuestion);
      assert.strictEqual(q1.getSectionName(), 'Mathematics');

      const q2 = QuestionFactory.createQuestion({
        id: 'f-02',
        subjectId: 'sub-reasoning',
        subjectName: 'General Intelligence and Reasoning',
        topicName: 'Number Series',
        questionText: '2, 4, 8, 16, ?',
        options: [
          { optionKey: 'A', optionText: '30', isCorrect: false },
          { optionKey: 'B', optionText: '32', isCorrect: true },
          { optionKey: 'C', optionText: '36', isCorrect: false },
          { optionKey: 'D', optionText: '40', isCorrect: false },
        ],
        explanation: 'Doubling series: 16 * 2 = 32',
      });

      assert.ok(q2 instanceof ReasoningQuestion);
      assert.strictEqual(q2.getSectionName(), 'General Intelligence and Reasoning');
    });
  });

  describe('5. Builder Pattern: ExamPaperBuilder', () => {
    it('Constructs a validated CBT-1 ExamPaper with section distribution', () => {
      const sampleMath = QuestionFactory.createQuestion({
        id: 'b-m-01',
        subjectId: 'sub-math',
        subjectName: 'Mathematics',
        topicName: 'Number System',
        questionText: 'Find 5 squared.',
        options: [
          { optionKey: 'A', optionText: '25', isCorrect: true },
          { optionKey: 'B', optionText: '20', isCorrect: false },
          { optionKey: 'C', optionText: '15', isCorrect: false },
          { optionKey: 'D', optionText: '10', isCorrect: false },
        ],
        explanation: '5 * 5 = 25',
      });

      const sampleGA = QuestionFactory.createQuestion({
        id: 'b-ga-01',
        subjectId: 'sub-ga',
        subjectName: 'General Awareness',
        topicName: 'Railways GK',
        questionText: 'What is Broad Gauge width?',
        options: [
          { optionKey: 'A', optionText: '1676 mm', isCorrect: true },
          { optionKey: 'B', optionText: '1000 mm', isCorrect: false },
          { optionKey: 'C', optionText: '1435 mm', isCorrect: false },
          { optionKey: 'D', optionText: '762 mm', isCorrect: false },
        ],
        explanation: 'Broad gauge is 1,676 mm.',
      });

      const paper = new ExamPaperBuilder()
        .setId('paper-cbt1-mock-01')
        .setTitle('RRB NTPC (UG) 2026 - CBT-1 Master Mock 1')
        .setDescription('Official simulation test adhering to CEN 07/2026.')
        .setDuration(90)
        .setTotalMarks(100)
        .setNegativeMarks(0.3333)
        .setDifficulty('Moderate')
        .addQuestion(sampleMath)
        .addQuestion(sampleGA)
        .build();

      assert.strictEqual(paper.id, 'paper-cbt1-mock-01');
      assert.strictEqual(paper.durationMinutes, 90);
      assert.strictEqual(paper.totalMarks, 100);
      assert.strictEqual(paper.questionCount, 2);

      const dist = paper.getSectionDistribution();
      assert.strictEqual(dist['Mathematics'], 1);
      assert.strictEqual(dist['General Awareness'], 1);

      const json = paper.toJSON();
      assert.strictEqual(json.questions.length, 2);
      assert.strictEqual(json.questions[0].order, 1);
      assert.strictEqual(json.questions[1].order, 2);
    });
  });
});
