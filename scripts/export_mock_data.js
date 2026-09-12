import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const tests = await prisma.test.findMany({
    include: {
      exam: { select: { id: true, name: true, slug: true } },
      subject: { select: { id: true, name: true } },
      _count: {
        select: {
          testQuestions: true,
          attempts: true,
        },
      },
    },
    orderBy: [{ createdAt: 'desc' }, { title: 'asc' }],
  });

  const formattedTests = tests.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    examId: t.examId,
    examName: t.exam.name,
    examSlug: t.exam.slug,
    subjectId: t.subjectId,
    subjectName: t.subject?.name || 'Full Syllabus',
    testType: t.testType,
    duration: t.duration,
    totalMarks: t.totalMarks,
    negativeMarks: t.negativeMarks,
    difficulty: t.difficulty,
    isPremium: t.isPremium,
    questionCount: t._count.testQuestions,
    attemptCount: t._count.attempts,
  }));

  const subjects = await prisma.subject.findMany({
    include: {
      exam: { select: { name: true, slug: true } },
      topics: {
        include: {
          _count: { select: { questions: true } },
        },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  const groupedSubjectsMap = new Map();
  for (const sub of subjects) {
    let key = 'General';
    if (sub.name.includes('Quant')) key = 'Quantitative Aptitude';
    else if (sub.name.includes('Reasoning') || sub.name.includes('Intelligence')) key = 'Reasoning Ability';
    else if (sub.name.includes('English')) key = 'English Language';
    else if (sub.name.includes('Awareness') || sub.name.includes('General Knowledge')) key = 'General Awareness';

    if (!groupedSubjectsMap.has(key)) {
      groupedSubjectsMap.set(key, { name: key, topics: [] });
    }

    const entry = groupedSubjectsMap.get(key);
    for (const t of sub.topics) {
      if (!entry.topics.some((existing) => existing.name === t.name)) {
        entry.topics.push({
          id: t.id,
          name: t.name,
          description: t.description,
          questionCount: t._count.questions,
        });
      }
    }
  }

  const practiceCategories = Array.from(groupedSubjectsMap.values());

  const questions = await prisma.question.findMany({
    include: {
      options: {
        select: { id: true, optionKey: true, optionText: true, isCorrect: true },
      },
      subject: { select: { id: true, name: true } },
      topic: { select: { id: true, name: true } },
    },
  });

  const testsWithQuestions = await prisma.test.findMany({
    include: {
      testQuestions: {
        include: {
          question: {
            include: {
              options: true,
              subject: true,
              topic: true,
            },
          },
        },
        orderBy: { questionOrder: 'asc' },
      },
      exam: true,
      subject: true,
    },
  });

  const exportData = {
    tests: formattedTests,
    practiceCategories,
    questions,
    testsWithQuestions: testsWithQuestions.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      examId: t.examId,
      examName: t.exam.name,
      examSlug: t.exam.slug,
      subjectName: t.subject?.name || 'Full Syllabus',
      testType: t.testType,
      duration: t.duration,
      totalMarks: t.totalMarks,
      negativeMarks: t.negativeMarks,
      difficulty: t.difficulty,
      isPremium: t.isPremium,
      questions: t.testQuestions.map((tq) => ({
        id: tq.question.id,
        order: tq.questionOrder,
        marks: tq.marks,
        negativeMarks: tq.negativeMarks,
        questionText: tq.question.questionText,
        questionType: tq.question.questionType,
        difficulty: tq.question.difficulty,
        subjectId: tq.question.subjectId,
        subjectName: tq.question.subject?.name || 'General',
        topicId: tq.question.topicId,
        topicName: tq.question.topic?.name || 'General',
        explanation: tq.question.explanation,
        options: tq.question.options.map((opt) => ({
          id: opt.id,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        })),
      })),
    })),
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'src', 'lib', 'dbData.json'),
    JSON.stringify(exportData, null, 2)
  );

  console.log('Successfully exported dbData.json:');
  console.log(`- Tests: ${formattedTests.length}`);
  console.log(`- Practice Categories: ${practiceCategories.length}`);
  console.log(`- Total Questions: ${questions.length}`);
  console.log(`- Tests with questions: ${testsWithQuestions.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
