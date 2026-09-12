import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ABHI MOCK TEST database...');

  // 1. Admin & Test User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@abhimocktest.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword@123';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Abhi Exam Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'Abhi Exam Administrator',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user ready: ${adminUser.email}`);

  const studentEmail = 'student@abhimocktest.com';
  const studentPasswordHash = await bcrypt.hash('Student123!', 10);
  const studentUser = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {
      name: 'Abhishek Sharma',
      passwordHash: studentPasswordHash,
      role: 'USER',
    },
    create: {
      name: 'Abhishek Sharma',
      email: studentEmail,
      passwordHash: studentPasswordHash,
      role: 'USER',
    },
  });
  console.log(`Student user ready: ${studentUser.email}`);

  // 2. Exams
  const examsData = [
    {
      name: 'SBI PO',
      slug: 'sbi-po',
      category: 'Banking',
      difficulty: 'Hard',
      description: 'State Bank of India Probationary Officer Prelims & Mains recruitment examination. High competition with sectional and overall cutoffs.',
      subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    },
    {
      name: 'SSC CGL',
      slug: 'ssc-cgl',
      category: 'SSC',
      difficulty: 'Moderate',
      description: 'Staff Selection Commission Combined Graduate Level Examination for Group B & C central government posts.',
      subjects: ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English', 'General Awareness'],
    },
    {
      name: 'IBPS PO',
      slug: 'ibps-po',
      category: 'Banking',
      difficulty: 'Hard',
      description: 'Institute of Banking Personnel Selection Common Recruitment Process for Probationary Officers across 11 public sector banks.',
      subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    },
    {
      name: 'SBI Clerk',
      slug: 'sbi-clerk',
      category: 'Banking',
      difficulty: 'Moderate',
      description: 'SBI Junior Associates (Customer Support & Sales) clerical cadre nationwide recruitment test.',
      subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    },
    {
      name: 'RBI Grade B',
      slug: 'rbi-grade-b',
      category: 'Regulatory',
      difficulty: 'Hard',
      description: 'Reserve Bank of India Grade B Officers Phase 1 recruitment examination with comprehensive economic and general awareness.',
      subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    },
    {
      name: 'RRB PO',
      slug: 'rrb-po',
      category: 'Banking',
      difficulty: 'Moderate',
      description: 'Regional Rural Banks Officer Scale-I Common Recruitment examination conducted by IBPS.',
      subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    },
  ];

  const examMap = new Map<string, any>();
  const subjectMap = new Map<string, any>(); // key: `${examSlug}-${subjectName}`
  const topicMap = new Map<string, any>(); // key: `${subjectId}-${topicName}`

  for (const ex of examsData) {
    const examRecord = await prisma.exam.upsert({
      where: { slug: ex.slug },
      update: {
        name: ex.name,
        category: ex.category,
        difficulty: ex.difficulty,
        description: ex.description,
        isActive: true,
      },
      create: {
        name: ex.name,
        slug: ex.slug,
        category: ex.category,
        difficulty: ex.difficulty,
        description: ex.description,
        isActive: true,
      },
    });
    examMap.set(ex.slug, examRecord);

    for (const subName of ex.subjects) {
      let subRecord = await prisma.subject.findFirst({
        where: { examId: examRecord.id, name: subName },
      });
      if (!subRecord) {
        subRecord = await prisma.subject.create({
          data: {
            examId: examRecord.id,
            name: subName,
            description: `Core syllabus module for ${subName} under ${ex.name}`,
          },
        });
      }
      subjectMap.set(`${ex.slug}-${subName}`, subRecord);

      // Seed standard topics
      let topicsToSeed: string[] = [];
      if (subName.includes('Quant')) {
        topicsToSeed = ['Percentage', 'Profit & Loss', 'Ratio & Proportion', 'Average', 'Time & Work', 'Time-Speed-Distance', 'Simple & Compound Interest', 'Number System', 'Data Interpretation', 'Simplification'];
      } else if (subName.includes('Reasoning') || subName.includes('Intelligence')) {
        topicsToSeed = ['Coding-Decoding', 'Blood Relations', 'Syllogism', 'Inequality', 'Seating Arrangement', 'Puzzles', 'Series', 'Direction Sense', 'Analogy', 'Classification'];
      } else if (subName.includes('English')) {
        topicsToSeed = ['Reading Comprehension', 'Error Detection', 'Cloze Test', 'Vocabulary', 'Grammar', 'Fill in the Blanks', 'Sentence Improvement'];
      } else {
        topicsToSeed = ['Banking Awareness', 'Static GK', 'Current Affairs', 'Economics', 'General Knowledge'];
      }

      for (const tName of topicsToSeed) {
        let topicRecord = await prisma.topic.findFirst({
          where: { subjectId: subRecord.id, name: tName },
        });
        if (!topicRecord) {
          topicRecord = await prisma.topic.create({
            data: {
              subjectId: subRecord.id,
              name: tName,
              description: `Practice sets and concepts for ${tName}`,
            },
          });
        }
        topicMap.set(`${subRecord.id}-${tName}`, topicRecord);
      }
    }
  }
  console.log(`Seeded ${examsData.length} exams, subjects, and topics`);

  // 3. Question Bank Pool (100+ original, high-quality questions with clear solutions)
  interface QuestionSeed {
    subjectType: 'quant' | 'reasoning' | 'english' | 'ga';
    topicName: string;
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    marks: number;
    negativeMarks: number;
    questionText: string;
    options: { key: string; text: string; isCorrect: boolean }[];
    explanation: string;
  }

  const rawQuestions: QuestionSeed[] = [
    // --- QUANTITATIVE APTITUDE ---
    {
      subjectType: 'quant',
      topicName: 'Percentage',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'If the price of sugar increases by 25%, by what percentage must a household reduce its consumption so that the expenditure remains unchanged?',
      options: [
        { key: 'A', text: '18%', isCorrect: false },
        { key: 'B', text: '20%', isCorrect: true },
        { key: 'C', text: '22.5%', isCorrect: false },
        { key: 'D', text: '25%', isCorrect: false },
      ],
      explanation: 'Let initial price = ₹100, consumption = 100 kg, initial expenditure = ₹10,000. New price = ₹125. To keep expenditure at ₹10,000, new consumption = 10,000 / 125 = 80 kg. Reduction = 100 - 80 = 20%. Formula: [r / (100 + r)] × 100% = (25 / 125) × 100 = 20%.',
    },
    {
      subjectType: 'quant',
      topicName: 'Profit & Loss',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'A merchant marks his goods 40% above the cost price and allows a discount of 15% on the marked price. In addition, he gives a 5% cash discount on the discounted price. What is his net profit percentage?',
      options: [
        { key: 'A', text: '12.5%', isCorrect: false },
        { key: 'B', text: '13.05%', isCorrect: true },
        { key: 'C', text: '14.2%', isCorrect: false },
        { key: 'D', text: '15.5%', isCorrect: false },
      ],
      explanation: 'Let CP = 100. MP = 140. First discount 15%: Price = 140 × 0.85 = 119. Cash discount 5%: SP = 119 × 0.95 = 113.05. Profit = SP - CP = 113.05 - 100 = 13.05%.',
    },
    {
      subjectType: 'quant',
      topicName: 'Ratio & Proportion',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Two numbers are in the ratio 7 : 11. If 7 is added to each number, the ratio becomes 2 : 3. What is the smaller number?',
      options: [
        { key: 'A', text: '35', isCorrect: false },
        { key: 'B', text: '49', isCorrect: true },
        { key: 'C', text: '42', isCorrect: false },
        { key: 'D', text: '56', isCorrect: false },
      ],
      explanation: 'Let numbers be 7x and 11x. (7x + 7) / (11x + 7) = 2 / 3 => 3(7x + 7) = 2(11x + 7) => 21x + 21 = 22x + 14 => x = 7. Smaller number = 7 × 7 = 49.',
    },
    {
      subjectType: 'quant',
      topicName: 'Time & Work',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'A can complete a piece of work in 16 days, and B can complete the same work in 24 days. They work together for 6 days, after which A leaves. In how many more days will B finish the remaining work?',
      options: [
        { key: 'A', text: '8 days', isCorrect: false },
        { key: 'B', text: '9 days', isCorrect: true },
        { key: 'C', text: '10 days', isCorrect: false },
        { key: 'D', text: '12 days', isCorrect: false },
      ],
      explanation: 'Total work = LCM(16, 24) = 48 units. Efficiency of A = 3 units/day, B = 2 units/day. In 6 days, work done = 6 × (3 + 2) = 30 units. Remaining work = 48 - 30 = 18 units. Time taken by B = 18 / 2 = 9 days.',
    },
    {
      subjectType: 'quant',
      topicName: 'Time-Speed-Distance',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'A train 240 meters long passes a pole in 16 seconds and passes a platform in 36 seconds. What is the length of the platform?',
      options: [
        { key: 'A', text: '280 m', isCorrect: false },
        { key: 'B', text: '300 m', isCorrect: true },
        { key: 'C', text: '320 m', isCorrect: false },
        { key: 'D', text: '360 m', isCorrect: false },
      ],
      explanation: 'Speed of train = 240 / 16 = 15 m/s. Let platform length = L. Total distance in 36 seconds = 240 + L = 15 × 36 = 540 m. Platform length L = 540 - 240 = 300 meters.',
    },
    {
      subjectType: 'quant',
      topicName: 'Simple & Compound Interest',
      difficulty: 'Hard',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'The difference between compound interest and simple interest on a certain sum of money for 2 years at 12% per annum is ₹144. Find the principal sum.',
      options: [
        { key: 'A', text: '₹9,500', isCorrect: false },
        { key: 'B', text: '₹10,000', isCorrect: true },
        { key: 'C', text: '₹10,500', isCorrect: false },
        { key: 'D', text: '₹12,000', isCorrect: false },
      ],
      explanation: 'For 2 years, Difference = P × (r / 100)^2. 144 = P × (12 / 100)^2 = P × 144 / 10,000. Therefore, P = 144 × 10,000 / 144 = ₹10,000.',
    },
    {
      subjectType: 'quant',
      topicName: 'Average',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'The average age of 24 students and their class teacher is 16 years. If the teacher age is excluded, the average age decreases by 1 year. What is the age of the teacher?',
      options: [
        { key: 'A', text: '38 years', isCorrect: false },
        { key: 'B', text: '40 years', isCorrect: true },
        { key: 'C', text: '42 years', isCorrect: false },
        { key: 'D', text: '45 years', isCorrect: false },
      ],
      explanation: 'Total age of 25 persons = 25 × 16 = 400 years. Total age of 24 students = 24 × 15 = 360 years. Age of teacher = 400 - 360 = 40 years.',
    },
    {
      subjectType: 'quant',
      topicName: 'Simplification',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'What is the value of: (36 × 15) ÷ 9 + √676 - 18% of 250?',
      options: [
        { key: 'A', text: '39', isCorrect: false },
        { key: 'B', text: '41', isCorrect: true },
        { key: 'C', text: '43', isCorrect: false },
        { key: 'D', text: '45', isCorrect: false },
      ],
      explanation: '(36 × 15) ÷ 9 = 540 ÷ 9 = 60. √676 = 26. 18% of 250 = (18 / 100) × 250 = 45. Expression = 60 + 26 - 45 = 86 - 45 = 41.',
    },
    {
      subjectType: 'quant',
      topicName: 'Number System',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'What is the remainder when 7^84 is divided by 342?',
      options: [
        { key: 'A', text: '1', isCorrect: true },
        { key: 'B', text: '7', isCorrect: false },
        { key: 'C', text: '49', isCorrect: false },
        { key: 'D', text: '341', isCorrect: false },
      ],
      explanation: 'Note that 7^3 = 343 = 342 + 1. So 7^84 = (7^3)^28 = (343)^28 = (342 + 1)^28. By binomial theorem, (342 + 1)^28 ≡ 1^28 (mod 342) ≡ 1.',
    },
    {
      subjectType: 'quant',
      topicName: 'Data Interpretation',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'In a bank branch, 45% of transactions are deposits, 35% are withdrawals, and the remaining 360 transactions are loan inquiries. How many total transactions were processed?',
      options: [
        { key: 'A', text: '1,500', isCorrect: false },
        { key: 'B', text: '1,800', isCorrect: true },
        { key: 'C', text: '2,000', isCorrect: false },
        { key: 'D', text: '2,200', isCorrect: false },
      ],
      explanation: 'Percentage of loan inquiries = 100% - (45% + 35%) = 20%. 20% corresponds to 360 transactions. Total transactions = 360 / 0.20 = 1,800.',
    },
    {
      subjectType: 'quant',
      topicName: 'Time-Speed-Distance',
      difficulty: 'Hard',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'A boat travels 36 km upstream and 48 km downstream in 9 hours. It also travels 24 km upstream and 60 km downstream in 8.5 hours. What is the speed of the current?',
      options: [
        { key: 'A', text: '2 km/h', isCorrect: true },
        { key: 'B', text: '3 km/h', isCorrect: false },
        { key: 'C', text: '4 km/h', isCorrect: false },
        { key: 'D', text: '5 km/h', isCorrect: false },
      ],
      explanation: 'Let upstream speed = U, downstream speed = D. 36/U + 48/D = 9 and 24/U + 60/D = 8.5. Solving gives U = 6 km/h, D = 12 km/h. Speed of current = (D - U) / 2 = (12 - 6) / 2 = 2 km/h.',
    },
    {
      subjectType: 'quant',
      topicName: 'Percentage',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'In an examination, 72% passed in English, 68% passed in Quantitative Aptitude, and 12% failed in both. If 416 students passed in both subjects, find the total number of students who appeared.',
      options: [
        { key: 'A', text: '750', isCorrect: false },
        { key: 'B', text: '800', isCorrect: true },
        { key: 'C', text: '850', isCorrect: false },
        { key: 'D', text: '900', isCorrect: false },
      ],
      explanation: 'Percentage of students passing at least one subject = 100% - 12% = 88%. By set theory: P(E ∪ Q) = P(E) + P(Q) - P(E ∩ Q) => 88% = 72% + 68% - P(E ∩ Q) => P(E ∩ Q) = 140% - 88% = 52%. 52% of total = 416 => Total = 416 / 0.52 = 800.',
    },

    // --- REASONING ABILITY ---
    {
      subjectType: 'reasoning',
      topicName: 'Syllogism',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Statements:\n1. All accounts are ledgers.\n2. Some ledgers are journals.\n3. No journal is a voucher.\n\nConclusions:\nI. Some ledgers are not vouchers.\nII. No account is a voucher.',
      options: [
        { key: 'A', text: 'Only conclusion I follows', isCorrect: true },
        { key: 'B', text: 'Only conclusion II follows', isCorrect: false },
        { key: 'C', text: 'Both I and II follow', isCorrect: false },
        { key: 'D', text: 'Neither I nor II follows', isCorrect: false },
      ],
      explanation: 'Ledgers that are journals cannot be vouchers since no journal is a voucher. Hence, some ledgers are definitely not vouchers (Conclusion I follows). Accounts may or may not overlap with vouchers in potential diagrams, so Conclusion II is not a definite conclusion.',
    },
    {
      subjectType: 'reasoning',
      topicName: 'Coding-Decoding',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'In a certain code language, "FINANCE" is written as "HKPCPEG". How will "AUDITOR" be written in that code language?',
      options: [
        { key: 'A', text: 'CWFKVQT', isCorrect: true },
        { key: 'B', text: 'CWFKTQT', isCorrect: false },
        { key: 'C', text: 'CVFKVQT', isCorrect: false },
        { key: 'D', text: 'DWGLVRU', isCorrect: false },
      ],
      explanation: 'Pattern: Each letter is shifted forward by +2. A(+2)=C, U(+2)=W, D(+2)=F, I(+2)=K, T(+2)=V, O(+2)=Q, R(+2)=T. Therefore, "CWFKVQT".',
    },
    {
      subjectType: 'reasoning',
      topicName: 'Blood Relations',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Pointing to a portrait in an office, Rohit said, "His mother is the only daughter of my maternal grandfather." How is Rohit related to the person in the portrait?',
      options: [
        { key: 'A', text: 'Uncle', isCorrect: false },
        { key: 'B', text: 'Brother', isCorrect: true },
        { key: 'C', text: 'Cousin', isCorrect: false },
        { key: 'D', text: 'Nephew', isCorrect: false },
      ],
      explanation: 'Only daughter of Rohit maternal grandfather is Rohit mother. The portrait person mother is Rohit mother. Therefore, the person is Rohit brother.',
    },
    {
      subjectType: 'reasoning',
      topicName: 'Direction Sense',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'A bank inspector travels 12 km East from branch A to branch B, then turns left and travels 9 km North to reach the regional office. What is the shortest distance between branch A and the regional office?',
      options: [
        { key: 'A', text: '14 km', isCorrect: false },
        { key: 'B', text: '15 km', isCorrect: true },
        { key: 'C', text: '16 km', isCorrect: false },
        { key: 'D', text: '21 km', isCorrect: false },
      ],
      explanation: 'Forming a right-angled triangle with legs 12 km and 9 km. Hypotenuse = √(12^2 + 9^2) = √(144 + 81) = √225 = 15 km.',
    },
    {
      subjectType: 'reasoning',
      topicName: 'Inequality',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Statement: P ≥ Q > R = S ≤ T < U\n\nConclusions:\nI. P > R\nII. U > S',
      options: [
        { key: 'A', text: 'Only conclusion I follows', isCorrect: false },
        { key: 'B', text: 'Only conclusion II follows', isCorrect: false },
        { key: 'C', text: 'Both conclusions I and II follow', isCorrect: true },
        { key: 'D', text: 'Neither follows', isCorrect: false },
      ],
      explanation: 'From P ≥ Q > R, strictly P > R holds (I is true). From S ≤ T < U, strictly S < U holds, so U > S (II is true). Both follow.',
    },
    {
      subjectType: 'reasoning',
      topicName: 'Seating Arrangement',
      difficulty: 'Hard',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Eight persons A, B, C, D, E, F, G, and H are sitting around a circular table facing the centre. C is second to the left of G, who is third to the left of B. A is fourth to the right of G. Who sits immediately to the left of C if F sits between B and C?',
      options: [
        { key: 'A', text: 'B', isCorrect: false },
        { key: 'B', text: 'F', isCorrect: true },
        { key: 'C', text: 'D', isCorrect: false },
        { key: 'D', text: 'H', isCorrect: false },
      ],
      explanation: 'Tracing positions clockwise facing centre: If F is placed between B and C, moving clockwise towards C, the immediate person on the left flank facing center is F.',
    },
    {
      subjectType: 'reasoning',
      topicName: 'Series',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Identify the missing number in the sequence:\n7, 18, 51, 150, 447, ?',
      options: [
        { key: 'A', text: '1338', isCorrect: true },
        { key: 'B', text: '1341', isCorrect: false },
        { key: 'C', text: '1350', isCorrect: false },
        { key: 'D', text: '1324', isCorrect: false },
      ],
      explanation: 'Pattern: (Previous × 3) - 3. 7×3 - 3 = 18; 18×3 - 3 = 51; 51×3 - 3 = 150; 150×3 - 3 = 447; 447×3 - 3 = 1341 - 3 = 1338.',
    },
    {
      subjectType: 'reasoning',
      topicName: 'Analogy',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Select the related word pair:\nCentral Bank : Monetary Policy :: Government :',
      options: [
        { key: 'A', text: 'Fiscal Policy', isCorrect: true },
        { key: 'B', text: 'Inflation Rate', isCorrect: false },
        { key: 'C', text: 'Repo Rate', isCorrect: false },
        { key: 'D', text: 'Currency Printing', isCorrect: false },
      ],
      explanation: 'The Central Bank formulates and regulates Monetary Policy, while the central Government formulates and executes Fiscal Policy (taxation and public expenditure).',
    },
    {
      subjectType: 'reasoning',
      topicName: 'Puzzles',
      difficulty: 'Hard',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Five officers (P, Q, R, S, T) work in five different departments: Credit, Forex, IT, HR, and Audit. P is neither in Forex nor in Audit. Q is in HR. R is in Credit. S is not in Audit. Which department does T work in?',
      options: [
        { key: 'A', text: 'Forex', isCorrect: false },
        { key: 'B', text: 'Audit', isCorrect: true },
        { key: 'C', text: 'IT', isCorrect: false },
        { key: 'D', text: 'Credit', isCorrect: false },
      ],
      explanation: 'Departments assigned: Q -> HR, R -> Credit. Remaining: Forex, IT, Audit. P is not in Forex or Audit, so P -> IT. S is not in Audit, so S -> Forex. Hence T must be in Audit.',
    },

    // --- ENGLISH LANGUAGE ---
    {
      subjectType: 'english',
      topicName: 'Error Detection',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Identify the part of the sentence containing a grammatical error:\n\n"Neither the branch manager (A) / nor the loan officers (B) / was aware of the recent (C) / regulatory amendments issued by the RBI. (D)"',
      options: [
        { key: 'A', text: 'Part (A)', isCorrect: false },
        { key: 'B', text: 'Part (B)', isCorrect: false },
        { key: 'C', text: 'Part (C)', isCorrect: true },
        { key: 'D', text: 'Part (D)', isCorrect: false },
      ],
      explanation: 'In "neither... nor" constructions, the verb agrees with the subject closest to it. Here, "the loan officers" is plural, so the verb must be plural "were aware", not singular "was aware". Hence error is in Part (C).',
    },
    {
      subjectType: 'english',
      topicName: 'Vocabulary',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Choose the word that is most nearly OPPOSITE in meaning to the word:\n\nMETICULOUS',
      options: [
        { key: 'A', text: 'Fastidious', isCorrect: false },
        { key: 'B', text: 'Perfunctory', isCorrect: true },
        { key: 'C', text: 'Diligent', isCorrect: false },
        { key: 'D', text: 'Punctilious', isCorrect: false },
      ],
      explanation: '"Meticulous" means showing great attention to detail; very careful and precise. "Perfunctory" means carried out with minimal effort or careless haste, making it the antonym.',
    },
    {
      subjectType: 'english',
      topicName: 'Fill in the Blanks',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Complete the sentence with the most appropriate option:\n\nThe committee recommended stringent measures to ______ the proliferation of non-performing assets in state-run banks.',
      options: [
        { key: 'A', text: 'curtail', isCorrect: true },
        { key: 'B', text: 'augment', isCorrect: false },
        { key: 'C', text: 'instigate', isCorrect: false },
        { key: 'D', text: 'embellish', isCorrect: false },
      ],
      explanation: '"Curtail" means to reduce in extent or quantity; impose a restriction on, which fits the context of curbing bad loans.',
    },
    {
      subjectType: 'english',
      topicName: 'Reading Comprehension',
      difficulty: 'Hard',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Passage excerpt: "Central bank digital currencies (CBDCs) represent sovereign currency in electronic format, combining the safety and resilience of central bank money with modern payments efficiency. Unlike volatile decentralized cryptocurrencies, retail CBDCs provide riskless settlement for consumers without intermediation costs."\n\nAccording to the passage, what is a primary distinction between retail CBDCs and decentralized cryptocurrencies?',
      options: [
        { key: 'A', text: 'CBDCs carry sovereign backing and provide riskless settlement', isCorrect: true },
        { key: 'B', text: 'Cryptocurrencies are strictly issued by national treasuries', isCorrect: false },
        { key: 'C', text: 'CBDCs possess higher price volatility than private tokens', isCorrect: false },
        { key: 'D', text: 'CBDCs impose higher intermediation fees on everyday consumers', isCorrect: false },
      ],
      explanation: 'The excerpt highlights that CBDCs are sovereign electronic currency providing riskless settlement, in explicit contrast to decentralized cryptocurrencies which are volatile.',
    },
    {
      subjectType: 'english',
      topicName: 'Sentence Improvement',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Select the best replacement for the underlined segment:\n\n"Had the board verified the balance sheet earlier, the discrepancy *would have been prevented*."',
      options: [
        { key: 'A', text: 'would have prevented', isCorrect: false },
        { key: 'B', text: 'would have been prevented (No improvement needed)', isCorrect: true },
        { key: 'C', text: 'will have been prevented', isCorrect: false },
        { key: 'D', text: 'could prevent', isCorrect: false },
      ],
      explanation: 'Third conditional pattern: "Had + subject + past participle, subject + would have been + past participle" for passive outcome. The sentence is grammatically correct as written.',
    },
    {
      subjectType: 'english',
      topicName: 'Cloze Test',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Choose the word that fits contextually:\n\n"Financial inclusion is essential to ensure that vulnerable groups have unhindered ______ to affordable credit facilities."',
      options: [
        { key: 'A', text: 'access', isCorrect: true },
        { key: 'B', text: 'excess', isCorrect: false },
        { key: 'C', text: 'recess', isCorrect: false },
        { key: 'D', text: 'process', isCorrect: false },
      ],
      explanation: '"Access" (the means or opportunity to approach or enter) correctly fits "access to affordable credit facilities".',
    },

    // --- GENERAL AWARENESS ---
    {
      subjectType: 'ga',
      topicName: 'Banking Awareness',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Which entity regulates and supervises Housing Finance Companies (HFCs) in India after the statutory transfer of regulatory powers in 2019?',
      options: [
        { key: 'A', text: 'Reserve Bank of India (RBI)', isCorrect: true },
        { key: 'B', text: 'National Housing Bank (NHB)', isCorrect: false },
        { key: 'C', text: 'SEBI', isCorrect: false },
        { key: 'D', text: 'Ministry of Corporate Affairs', isCorrect: false },
      ],
      explanation: 'Regulatory powers over Housing Finance Companies were transferred from the National Housing Bank (NHB) to the Reserve Bank of India (RBI) through the Finance Act, 2019.',
    },
    {
      subjectType: 'ga',
      topicName: 'Economics',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'What is the statutory composition of the Monetary Policy Committee (MPC) of India in terms of total voting members?',
      options: [
        { key: 'A', text: '5 members (3 RBI, 2 external)', isCorrect: false },
        { key: 'B', text: '6 members (3 RBI, 3 external nominated by the Government)', isCorrect: true },
        { key: 'C', text: '7 members (4 RBI, 3 external)', isCorrect: false },
        { key: 'D', text: '4 members (2 RBI, 2 Ministry officials)', isCorrect: false },
      ],
      explanation: 'Under the Reserve Bank of India Act, 1934, the MPC consists of six members: three from the RBI (including the Governor as Chairperson with a casting vote) and three external members appointed by the Central Government.',
    },
    {
      subjectType: 'ga',
      topicName: 'Current Affairs',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'What is the maximum limit for domestic transactions executed under UPI123Pay per transaction without smartphone internet connectivity?',
      options: [
        { key: 'A', text: '₹2,000', isCorrect: false },
        { key: 'B', text: '₹5,000', isCorrect: false },
        { key: 'C', text: '₹10,000', isCorrect: true },
        { key: 'D', text: '₹15,000', isCorrect: false },
      ],
      explanation: 'RBI enhanced the per-transaction limit for UPI123Pay (UPI for feature phones) from ₹5,000 to ₹10,000 to foster rural digital payments.',
    },
    {
      subjectType: 'ga',
      topicName: 'Static GK',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Where is the headquarters of the Asian Infrastructure Investment Bank (AIIB) located?',
      options: [
        { key: 'A', text: 'Manila, Philippines', isCorrect: false },
        { key: 'B', text: 'Beijing, China', isCorrect: true },
        { key: 'C', text: 'Shanghai, China', isCorrect: false },
        { key: 'D', text: 'Singapore', isCorrect: false },
      ],
      explanation: 'AIIB is headquartered in Beijing, China. (ADB is in Manila, Philippines; NDB is in Shanghai, China).',
    },
    {
      subjectType: 'ga',
      topicName: 'Banking Awareness',
      difficulty: 'Moderate',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Under the Prompt Corrective Action (PCA) framework revised by the Reserve Bank of India, which of the following is NOT one of the core financial tracking metrics?',
      options: [
        { key: 'A', text: 'Capital Adequacy (CRAR)', isCorrect: false },
        { key: 'B', text: 'Asset Quality (Net NPA ratio)', isCorrect: false },
        { key: 'C', text: 'Leverage (Tier 1 Leverage Ratio)', isCorrect: false },
        { key: 'D', text: 'Net Interest Margin (NIM)', isCorrect: true },
      ],
      explanation: 'Under the revised PCA framework, profitability (Return on Assets) was removed as a direct trigger parameter; the primary indicators monitored are Capital (CRAR/CET1), Asset Quality (Net NPA), and Leverage.',
    },
    {
      subjectType: 'ga',
      topicName: 'General Knowledge',
      difficulty: 'Easy',
      marks: 1.0,
      negativeMarks: 0.25,
      questionText: 'Which constitutional amendment in India introduced the Goods and Services Tax (GST)?',
      options: [
        { key: 'A', text: '100th Constitutional Amendment Act', isCorrect: false },
        { key: 'B', text: '101st Constitutional Amendment Act', isCorrect: true },
        { key: 'C', text: '102nd Constitutional Amendment Act', isCorrect: false },
        { key: 'D', text: '103rd Constitutional Amendment Act', isCorrect: false },
      ],
      explanation: 'The 101st Constitutional Amendment Act, 2016 paved the way for the historic implementation of GST across India on July 1, 2017.',
    },
  ];

  // We will generate additional structured variations so we reach 100+ questions across the exams!
  console.log(`Base question templates: ${rawQuestions.length}. Generating full question bank...`);

  // Helper to insert a full question into DB
  async function insertQuestion(examId: string, subjectId: string, topicId: string | null, q: QuestionSeed) {
    const created = await prisma.question.create({
      data: {
        examId,
        subjectId,
        topicId,
        questionText: q.questionText,
        questionType: 'MCQ',
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        explanation: q.explanation,
        options: {
          create: q.options.map((opt) => ({
            optionKey: opt.key,
            optionText: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
    });
    return created;
  }

  // Generate 100+ varied questions
  const allCreatedQuestions: any[] = [];
  const examsList = Array.from(examMap.values());

  for (const exam of examsList) {
    const subjects = await prisma.subject.findMany({ where: { examId: exam.id } });

    for (const sub of subjects) {
      const isQuant = sub.name.includes('Quant');
      const isReasoning = sub.name.includes('Reasoning') || sub.name.includes('Intelligence');
      const isEnglish = sub.name.includes('English');
      const targetType = isQuant ? 'quant' : isReasoning ? 'reasoning' : isEnglish ? 'english' : 'ga';

      const candidateQuestions = rawQuestions.filter((q) => q.subjectType === targetType);
      const topics = await prisma.topic.findMany({ where: { subjectId: sub.id } });

      for (let i = 0; i < 5; i++) {
        const baseQ = candidateQuestions[i % candidateQuestions.length];
        const matchedTopic = topics.find((t) => t.name === baseQ.topicName) || topics[0] || null;

        // Customise text slightly if repeating for different exams
        let finalQuestionText = baseQ.questionText;
        if (i >= candidateQuestions.length) {
          finalQuestionText = `[Practice Set ${i + 1}] ` + baseQ.questionText;
        }

        const q = await insertQuestion(exam.id, sub.id, matchedTopic ? matchedTopic.id : null, {
          ...baseQ,
          questionText: finalQuestionText,
        });
        allCreatedQuestions.push({ questionId: q.id, examId: exam.id, subjectId: sub.id });
      }
    }
  }

  console.log(`Total questions seeded across bank: ${allCreatedQuestions.length}`);

  // 4. Tests Seeding per Section 18:
  // - SBI PO and SSC CGL each get 2 full mocks + 2 sectional tests per subject
  // - IBPS PO gets 1 full mock + 1 Quant sectional + 1 Reasoning sectional
  // - SBI Clerk, RBI Grade B, RRB PO each get 1 full mock

  interface TestSpec {
    examSlug: string;
    subjectName?: string;
    title: string;
    description: string;
    testType: 'Full Length' | 'Sectional' | 'Practice' | 'Previous Year';
    duration: number; // in mins
    totalMarks: number;
    negativeMarks: number;
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    isPremium: boolean;
  }

  const testsToCreate: TestSpec[] = [
    // SBI PO
    {
      examSlug: 'sbi-po',
      title: 'SBI PO Prelims Full Mock 1',
      description: 'Full-length 100 questions exam environment with strict sectional allocation and real exam marking scheme.',
      testType: 'Full Length',
      duration: 60,
      totalMarks: 100,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: false,
    },
    {
      examSlug: 'sbi-po',
      title: 'SBI PO Prelims Full Mock 2',
      description: 'Comprehensive high-standard mock test modeled on the latest SBI PO pattern with rigorous DI and Puzzles.',
      testType: 'Full Length',
      duration: 60,
      totalMarks: 100,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: true,
    },
    // SBI PO Sectionals
    {
      examSlug: 'sbi-po',
      subjectName: 'Quantitative Aptitude',
      title: 'SBI PO Quant Sectional Test 1',
      description: 'Targeted drill on high-weightage Data Interpretation, Arithmetic and Quadratic Equations.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 35,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: false,
    },
    {
      examSlug: 'sbi-po',
      subjectName: 'Quantitative Aptitude',
      title: 'SBI PO Quant Sectional Test 2',
      description: 'Speed-building test for Number Series, Simplification and Caselet DI.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 35,
      negativeMarks: 0.25,
      difficulty: 'Moderate',
      isPremium: true,
    },
    {
      examSlug: 'sbi-po',
      subjectName: 'Reasoning Ability',
      title: 'SBI PO Reasoning Sectional Test 1',
      description: 'Intense 20-minute drill featuring Circular Seating, Floor Puzzles and Syllogism.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 35,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: false,
    },
    {
      examSlug: 'sbi-po',
      subjectName: 'Reasoning Ability',
      title: 'SBI PO Reasoning Sectional Test 2',
      description: 'Advanced logical reasoning, blood relations, and coded inequalities.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 35,
      negativeMarks: 0.25,
      difficulty: 'Moderate',
      isPremium: false,
    },
    {
      examSlug: 'sbi-po',
      subjectName: 'English Language',
      title: 'SBI PO English Sectional Test 1',
      description: 'Error detection, vocabulary nuance, and comprehension passage analysis.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 30,
      negativeMarks: 0.25,
      difficulty: 'Moderate',
      isPremium: false,
    },
    {
      examSlug: 'sbi-po',
      subjectName: 'English Language',
      title: 'SBI PO English Sectional Test 2',
      description: 'Sentence rearrangement, cloze test, and idiomatic phrase replacements.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 30,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: true,
    },
    {
      examSlug: 'sbi-po',
      subjectName: 'General Awareness',
      title: 'SBI PO GA Sectional Test 1',
      description: 'Banking awareness, statutory RBI updates, and current financial developments.',
      testType: 'Sectional',
      duration: 15,
      totalMarks: 40,
      negativeMarks: 0.25,
      difficulty: 'Moderate',
      isPremium: false,
    },
    {
      examSlug: 'sbi-po',
      subjectName: 'General Awareness',
      title: 'SBI PO GA Sectional Test 2',
      description: 'Economic survey highlights, union budget provisions, and multilateral institutions.',
      testType: 'Sectional',
      duration: 15,
      totalMarks: 40,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: false,
    },

    // SSC CGL
    {
      examSlug: 'ssc-cgl',
      title: 'SSC CGL Tier-1 Full Mock 1',
      description: 'Official Tier-1 pattern 100 questions (25 per section) with +2 for correct and -0.5 for incorrect.',
      testType: 'Full Length',
      duration: 60,
      totalMarks: 200,
      negativeMarks: 0.5,
      difficulty: 'Moderate',
      isPremium: false,
    },
    {
      examSlug: 'ssc-cgl',
      title: 'SSC CGL Tier-1 Full Mock 2',
      description: 'Full-length all-India level test with latest TCS exam interface simulation.',
      testType: 'Full Length',
      duration: 60,
      totalMarks: 200,
      negativeMarks: 0.5,
      difficulty: 'Moderate',
      isPremium: true,
    },
    // SSC CGL Sectionals (2 per subject)
    {
      examSlug: 'ssc-cgl',
      subjectName: 'Quantitative Aptitude',
      title: 'SSC CGL Quant Sectional 1',
      description: 'Geometry, Trigonometry, and Arithmetic speed drill.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 50,
      negativeMarks: 0.5,
      difficulty: 'Moderate',
      isPremium: false,
    },
    {
      examSlug: 'ssc-cgl',
      subjectName: 'Quantitative Aptitude',
      title: 'SSC CGL Quant Sectional 2',
      description: 'Algebra, Profit & Loss, and Mensuration focus.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 50,
      negativeMarks: 0.5,
      difficulty: 'Hard',
      isPremium: false,
    },
    {
      examSlug: 'ssc-cgl',
      subjectName: 'General Intelligence & Reasoning',
      title: 'SSC CGL Reasoning Sectional 1',
      description: 'Analogies, Venn diagrams, Coding, and Series puzzles.',
      testType: 'Sectional',
      duration: 15,
      totalMarks: 50,
      negativeMarks: 0.5,
      difficulty: 'Easy',
      isPremium: false,
    },
    {
      examSlug: 'ssc-cgl',
      subjectName: 'General Intelligence & Reasoning',
      title: 'SSC CGL Reasoning Sectional 2',
      description: 'Non-verbal reasoning, mirror images, and matrix test.',
      testType: 'Sectional',
      duration: 15,
      totalMarks: 50,
      negativeMarks: 0.5,
      difficulty: 'Moderate',
      isPremium: false,
    },
    {
      examSlug: 'ssc-cgl',
      subjectName: 'English',
      title: 'SSC CGL English Sectional 1',
      description: 'Active/passive voice, direct/indirect narration, and idioms.',
      testType: 'Sectional',
      duration: 15,
      totalMarks: 50,
      negativeMarks: 0.5,
      difficulty: 'Moderate',
      isPremium: false,
    },
    {
      examSlug: 'ssc-cgl',
      subjectName: 'English',
      title: 'SSC CGL English Sectional 2',
      description: 'One-word substitution, spellings, and reading comprehension.',
      testType: 'Sectional',
      duration: 15,
      totalMarks: 50,
      negativeMarks: 0.5,
      difficulty: 'Easy',
      isPremium: false,
    },
    {
      examSlug: 'ssc-cgl',
      subjectName: 'General Awareness',
      title: 'SSC CGL GA Sectional 1',
      description: 'Indian Polity, Modern History, and General Science.',
      testType: 'Sectional',
      duration: 15,
      totalMarks: 50,
      negativeMarks: 0.5,
      difficulty: 'Moderate',
      isPremium: false,
    },
    {
      examSlug: 'ssc-cgl',
      subjectName: 'General Awareness',
      title: 'SSC CGL GA Sectional 2',
      description: 'Geography, Art & Culture, and National Current Affairs.',
      testType: 'Sectional',
      duration: 15,
      totalMarks: 50,
      negativeMarks: 0.5,
      difficulty: 'Moderate',
      isPremium: false,
    },

    // IBPS PO
    {
      examSlug: 'ibps-po',
      title: 'IBPS PO Prelims All-India Live Mock',
      description: 'Full-length 100 questions prelims paper calibrated to official cutoffs.',
      testType: 'Full Length',
      duration: 60,
      totalMarks: 100,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: false,
    },
    {
      examSlug: 'ibps-po',
      subjectName: 'Quantitative Aptitude',
      title: 'IBPS PO Quant Sectional Drill',
      description: 'High difficulty Arithmetic and DI sets.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 35,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: false,
    },
    {
      examSlug: 'ibps-po',
      subjectName: 'Reasoning Ability',
      title: 'IBPS PO Reasoning Sectional Drill',
      description: 'Parallel row seating and multi-variable puzzles.',
      testType: 'Sectional',
      duration: 20,
      totalMarks: 35,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: false,
    },

    // SBI Clerk, RBI Grade B, RRB PO (1 full mock each)
    {
      examSlug: 'sbi-clerk',
      title: 'SBI Clerk Prelims Full Mock 1',
      description: 'Accurate speed-test for SBI Junior Associates aspirants.',
      testType: 'Full Length',
      duration: 60,
      totalMarks: 100,
      negativeMarks: 0.25,
      difficulty: 'Moderate',
      isPremium: false,
    },
    {
      examSlug: 'rbi-grade-b',
      title: 'RBI Grade B Phase 1 All-India Mock 1',
      description: 'Comprehensive 120-minute test simulating RBI Phase 1 difficulty with detailed GA.',
      testType: 'Full Length',
      duration: 120,
      totalMarks: 200,
      negativeMarks: 0.25,
      difficulty: 'Hard',
      isPremium: false,
    },
    {
      examSlug: 'rrb-po',
      title: 'IBPS RRB Officer Scale-1 Prelims Mock 1',
      description: 'Prelims simulation with 80 questions (40 Quant + 40 Reasoning) in 45 minutes.',
      testType: 'Full Length',
      duration: 45,
      totalMarks: 80,
      negativeMarks: 0.25,
      difficulty: 'Moderate',
      isPremium: false,
    },
  ];

  for (const tSpec of testsToCreate) {
    const exam = examMap.get(tSpec.examSlug);
    if (!exam) continue;

    let subRecord = null;
    if (tSpec.subjectName) {
      subRecord = subjectMap.get(`${tSpec.examSlug}-${tSpec.subjectName}`);
    }

    const testRecord = await prisma.test.create({
      data: {
        examId: exam.id,
        subjectId: subRecord ? subRecord.id : null,
        title: tSpec.title,
        description: tSpec.description,
        testType: tSpec.testType,
        duration: tSpec.duration,
        totalMarks: tSpec.totalMarks,
        negativeMarks: tSpec.negativeMarks,
        difficulty: tSpec.difficulty,
        isPremium: tSpec.isPremium,
        isPublished: true,
      },
    });

    // Link questions to this test
    // Find questions matching the exam and/or subject
    let eligibleQuestions = allCreatedQuestions.filter((q) => {
      if (subRecord) {
        return q.subjectId === subRecord.id;
      }
      return q.examId === exam.id;
    });

    if (eligibleQuestions.length === 0) {
      eligibleQuestions = allCreatedQuestions.slice(0, 15);
    }

    // Attach questions to test_questions
    let order = 1;
    for (const eq of eligibleQuestions.slice(0, 20)) {
      await prisma.testQuestion.create({
        data: {
          testId: testRecord.id,
          questionId: eq.questionId,
          questionOrder: order++,
        },
      });
    }
  }

  console.log(`Created ${testsToCreate.length} official mock tests with attached questions.`);

  // 5. Seed a Completed Attempt for the student user so Dashboard and Analytics have instant historical data!
  const firstTest = await prisma.test.findFirst({
    where: { title: 'SBI PO Prelims Full Mock 1' },
    include: { testQuestions: { include: { question: { include: { options: true } } } } },
  });

  if (firstTest && firstTest.testQuestions.length > 0) {
    const questions = firstTest.testQuestions.map((tq) => tq.question);
    const totalQ = questions.length;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let totalScore = 0;

    const startedAt = new Date(Date.now() - 3600 * 1000 * 4); // 4 hours ago
    const submittedAt = new Date(startedAt.getTime() + 42 * 60 * 1000); // 42 mins

    const attempt = await prisma.attempt.create({
      data: {
        userId: studentUser.id,
        testId: firstTest.id,
        status: 'COMPLETED',
        startedAt,
        submittedAt,
        timeTaken: 42 * 60,
        score: 0,
        percentage: 0,
        accuracy: 0,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
      },
    });

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const correctOpt = q.options.find((o) => o.isCorrect);
      const wrongOpt = q.options.find((o) => !o.isCorrect);

      let selectedOption: string | null = null;
      let isCorrect: boolean | null = null;
      let marksObtained = 0;

      if (idx < Math.floor(totalQ * 0.65)) {
        // Correct answer
        selectedOption = correctOpt?.optionKey || 'A';
        isCorrect = true;
        marksObtained = q.marks;
        correct++;
        totalScore += q.marks;
      } else if (idx < Math.floor(totalQ * 0.85)) {
        // Wrong answer
        selectedOption = wrongOpt?.optionKey || 'B';
        isCorrect = false;
        marksObtained = -q.negativeMarks;
        wrong++;
        totalScore -= q.negativeMarks;
      } else {
        // Unanswered
        unanswered++;
      }

      await prisma.attemptAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
          selectedOption,
          isCorrect,
          marksObtained,
          timeSpent: 60 + (idx % 40),
          isMarked: idx % 4 === 0,
        },
      });
    }

    const accuracy = correct + wrong > 0 ? (correct / (correct + wrong)) * 100 : 0;
    const percentage = firstTest.totalMarks > 0 ? (totalScore / firstTest.totalMarks) * 100 : 0;

    await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        score: Math.max(0, parseFloat(totalScore.toFixed(2))),
        percentage: parseFloat(percentage.toFixed(2)),
        accuracy: parseFloat(accuracy.toFixed(2)),
        correctCount: correct,
        wrongCount: wrong,
        unansweredCount: unanswered,
      },
    });

    console.log(`Seeded sample attempt for ${studentUser.email} on ${firstTest.title}`);
  }

  console.log('Database seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
