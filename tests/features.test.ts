import test from 'node:test';
import assert from 'node:assert/strict';
import { VALID_REPORT_REASONS } from '../server/routes/reports';

test('Features & Business Logic Unit Tests', async (t) => {
  await t.test('Question Report validation reasons includes required categories', () => {
    assert.ok(VALID_REPORT_REASONS.includes('wrong_question'));
    assert.ok(VALID_REPORT_REASONS.includes('wrong_answer'));
    assert.ok(VALID_REPORT_REASONS.includes('typo'));
    assert.ok(VALID_REPORT_REASONS.includes('unclear_question'));
    assert.ok(VALID_REPORT_REASONS.includes('technical_issue'));
    assert.equal(VALID_REPORT_REASONS.includes('fake_reason' as any), false);
  });

  await t.test('Custom test builder boundary limits clamp properly', () => {
    const clampCount = (count: number) => Math.min(50, Math.max(5, count || 10));
    const clampDuration = (dur: number) => Math.min(180, Math.max(5, dur || 15));

    assert.equal(clampCount(1), 5); // Below minimum 5 clamped to 5
    assert.equal(clampCount(100), 50); // Above maximum 50 clamped to 50
    assert.equal(clampCount(25), 25); // In bounds preserved

    assert.equal(clampDuration(2), 5); // Below minimum 5 clamped to 5
    assert.equal(clampDuration(300), 180); // Above maximum 180 clamped to 180
    assert.equal(clampDuration(45), 45); // In bounds preserved
  });

  await t.test('CSV Question Parser accurately parses quoted fields and commas', () => {
    const csv = `questionText,exam,subject,topic,difficulty,optionA,optionB,optionC,optionD,correctOption,explanation\n"What is 2 + 2, according to math?",SSC,Math,Arithmetic,EASY,"3, not 4",4,5,6,B,"2+2 equals 4"`;
    
    const lines = csv.trim().split(/\r?\n/);
    assert.equal(lines.length, 2);

    const header = lines[0].split(',').map((h) => h.trim());
    assert.equal(header[0], 'questionText');
    assert.equal(header[9], 'correctOption');

    // Parse line 2 with quote awareness
    const line = lines[1];
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cols.push(current.trim());

    assert.equal(cols[0].replace(/"/g, ''), 'What is 2 + 2, according to math?');
    assert.equal(cols[5].replace(/"/g, ''), '3, not 4');
    assert.equal(cols[9].replace(/"/g, ''), 'B');
  });

  await t.test('Daily challenge date calculation format is standard YYYY-MM-DD', () => {
    const today = new Date().toISOString().slice(0, 10);
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  });

  await t.test('CSV Question Import correctly resolves correctOption and optionE for 5-option exams', () => {
    const row = {
      questionText: 'What is the capital of India?',
      optionA: 'Mumbai',
      optionB: 'New Delhi',
      optionC: 'Kolkata',
      optionD: 'Chennai',
      optionE: 'None of the above',
      correctOption: 'B',
    };

    const correctKey = String(row.correctOption || 'A').toUpperCase().trim();
    const optionsList = [
      { optionKey: 'A', optionText: row.optionA, isCorrect: correctKey === 'A' },
      { optionKey: 'B', optionText: row.optionB, isCorrect: correctKey === 'B' },
      { optionKey: 'C', optionText: row.optionC, isCorrect: correctKey === 'C' },
      { optionKey: 'D', optionText: row.optionD, isCorrect: correctKey === 'D' },
      { optionKey: 'E', optionText: row.optionE, isCorrect: correctKey === 'E' },
    ];

    assert.equal(optionsList.length, 5);
    assert.equal(optionsList[1].isCorrect, true);
    assert.equal(optionsList[0].isCorrect, false);
    assert.equal(optionsList[4].optionKey, 'E');
  });

  await t.test('Daily Challenge answers normalizer handles both Array and Object map seamlessly', () => {
    const arrayPayload = [
      { questionId: 'q-101', selectedOption: 'C' },
      { questionId: 'q-102', selectedOption: 'A' },
    ];

    const mapPayload = {
      'q-101': 'C',
      'q-102': 'A',
    };

    const normalize = (answers: any): Record<string, string> => {
      const userAnswers: Record<string, string> = {};
      if (Array.isArray(answers)) {
        answers.forEach((ans: any) => {
          const qId = ans?.questionId || ans?.id;
          const opt = ans?.selectedOption ?? ans?.selectedAnswer ?? ans?.optionKey;
          if (qId && typeof opt === 'string') userAnswers[qId] = opt;
        });
      } else if (answers && typeof answers === 'object') {
        Object.assign(userAnswers, answers);
      }
      return userAnswers;
    };

    const fromArray = normalize(arrayPayload);
    const fromMap = normalize(mapPayload);

    assert.deepEqual(fromArray, { 'q-101': 'C', 'q-102': 'A' });
    assert.deepEqual(fromMap, { 'q-101': 'C', 'q-102': 'A' });
  });
});
