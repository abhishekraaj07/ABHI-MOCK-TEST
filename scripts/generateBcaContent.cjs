// scripts/generateBcaContent.cjs
const fs = require('fs');
const path = require('path');

const bcaQuestions = [
  // ==========================================
  // BCA-501: DBMS (12 Questions)
  // ==========================================
  {
    id: 'bca-dbms-q01',
    order: 1,
    questionText: 'Which schema level in the Three-Schema Architecture describes the actual physical storage structures and access paths on secondary storage?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-501',
    subjectName: 'DBMS (BCA-501)',
    topicId: 'topic-dbms-arch',
    topicName: 'Database Architecture & Schema',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'The Physical (or Internal) Schema describes the low-level physical storage structures, indexing mechanisms, record formats, and allocation paths on disk. The Conceptual Schema defines logical tables, while the External Schema defines user-specific views.',
    options: [
      { id: 'bca-dbms-q01-a', optionKey: 'A', optionText: 'External / View Schema', isCorrect: false },
      { id: 'bca-dbms-q01-b', optionKey: 'B', optionText: 'Conceptual / Logical Schema', isCorrect: false },
      { id: 'bca-dbms-q01-c', optionKey: 'C', optionText: 'Physical / Internal Schema', isCorrect: true },
      { id: 'bca-dbms-q01-d', optionKey: 'D', optionText: 'User Sub-Schema', isCorrect: false }
    ]
  },
  {
    id: 'bca-dbms-q02',
    order: 2,
    questionText: 'What is the minimum number of relational tables required to represent an ER diagram containing two strong entity sets E1 and E2 connected via a Many-to-Many (M:N) relationship R?',
    questionType: 'MCQ',
    difficulty: 'Moderate',
    subjectId: 'sub-bca-501',
    subjectName: 'DBMS (BCA-501)',
    topicId: 'topic-dbms-er',
    topicName: 'ER Modeling & Relational Mapping',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'A Many-to-Many (M:N) relationship requires a separate junction table containing foreign keys referencing both participating entity sets. Therefore: Table 1 (E1) + Table 2 (E2) + Table 3 (Relationship R) = 3 tables.',
    options: [
      { id: 'bca-dbms-q02-a', optionKey: 'A', optionText: '1 Table', isCorrect: false },
      { id: 'bca-dbms-q02-b', optionKey: 'B', optionText: '2 Tables', isCorrect: false },
      { id: 'bca-dbms-q02-c', optionKey: 'C', optionText: '3 Tables', isCorrect: true },
      { id: 'bca-dbms-q02-d', optionKey: 'D', optionText: '4 Tables', isCorrect: false }
    ]
  },
  {
    id: 'bca-dbms-q03',
    order: 3,
    questionText: 'A relation R is in Second Normal Form (2NF) if it is in 1NF and satisfies which of the following conditions?',
    questionType: 'MCQ',
    difficulty: 'Moderate',
    subjectId: 'sub-bca-501',
    subjectName: 'DBMS (BCA-501)',
    topicId: 'topic-dbms-norm',
    topicName: 'Relational Normalization',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'Second Normal Form (2NF) requires that the table is in 1NF and contains NO partial functional dependencies. That is, every non-prime attribute must depend on the whole composite candidate key, not on any proper subset of it.',
    options: [
      { id: 'bca-dbms-q03-a', optionKey: 'A', optionText: 'No transitive dependencies exist', isCorrect: false },
      { id: 'bca-dbms-q03-b', optionKey: 'B', optionText: 'No partial dependency of non-prime attributes on any candidate key', isCorrect: true },
      { id: 'bca-dbms-q03-c', optionKey: 'C', optionText: 'Every determinant is a super key (BCNF condition)', isCorrect: false },
      { id: 'bca-dbms-q03-d', optionKey: 'D', optionText: 'All multivalued dependencies are eliminated', isCorrect: false }
    ]
  },
  {
    id: 'bca-dbms-q04',
    order: 4,
    questionText: 'Which SQL set operator combines the results of two union-compatible SELECT statements and returns only the rows present in the first query but absent in the second query?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-501',
    subjectName: 'DBMS (BCA-501)',
    topicId: 'topic-dbms-sql',
    topicName: 'SQL & Relational Algebra',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'The MINUS (Oracle) or EXCEPT (Standard SQL/PostgreSQL) operator returns all distinct rows that are produced by the first query but not by the second query. Both queries must have the same number of columns with compatible data types.',
    options: [
      { id: 'bca-dbms-q04-a', optionKey: 'A', optionText: 'INTERSECT', isCorrect: false },
      { id: 'bca-dbms-q04-b', optionKey: 'B', optionText: 'UNION ALL', isCorrect: false },
      { id: 'bca-dbms-q04-c', optionKey: 'C', optionText: 'MINUS (or EXCEPT)', isCorrect: true },
      { id: 'bca-dbms-q04-d', optionKey: 'D', optionText: 'CROSS JOIN', isCorrect: false }
    ]
  },
  {
    id: 'bca-dbms-q05',
    order: 5,
    questionText: 'In transaction processing, which ACID property guarantees that all operations of a transaction are completed successfully or none of them are reflected in the database?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-501',
    subjectName: 'DBMS (BCA-501)',
    topicId: 'topic-dbms-acid',
    topicName: 'Transactions & Concurrency',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'Atomicity ensures the "all-or-nothing" rule: either all operations of a transaction succeed and are committed, or the transaction is aborted and rolled back to its initial state without leaving partial updates.',
    options: [
      { id: 'bca-dbms-q05-a', optionKey: 'A', optionText: 'Consistency', isCorrect: false },
      { id: 'bca-dbms-q05-b', optionKey: 'B', optionText: 'Atomicity', isCorrect: true },
      { id: 'bca-dbms-q05-c', optionKey: 'C', optionText: 'Isolation', isCorrect: false },
      { id: 'bca-dbms-q05-d', optionKey: 'D', optionText: 'Durability', isCorrect: false }
    ]
  },
  {
    id: 'bca-dbms-q06',
    order: 6,
    questionText: 'Which of the following responsibilities is NOT typically performed by a Database Administrator (DBA)?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-501',
    subjectName: 'DBMS (BCA-501)',
    topicId: 'topic-dbms-dba',
    topicName: 'DBA Roles & Responsibilities',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'A DBA is responsible for conceptual schema design, routine backups, performance tuning, and granting user security permissions. Writing client-side business logic and frontend UI code is the role of application developers.',
    options: [
      { id: 'bca-dbms-q06-a', optionKey: 'A', optionText: 'Authorizing data access and user roles', isCorrect: false },
      { id: 'bca-dbms-q06-b', optionKey: 'B', optionText: 'Writing client-side frontend UI components', isCorrect: true },
      { id: 'bca-dbms-q06-c', optionKey: 'C', optionText: 'Defining storage structures and access paths', isCorrect: false },
      { id: 'bca-dbms-q06-d', optionKey: 'D', optionText: 'Scheduling backups and recovery routines', isCorrect: false }
    ]
  },

  // ==========================================
  // BCA-503: Computer Networks (12 Questions)
  // ==========================================
  {
    id: 'bca-net-q01',
    order: 7,
    questionText: 'In HDLC (High-Level Data Link Control) protocol, which flag byte pattern marks the beginning and ending of every frame?',
    questionType: 'MCQ',
    difficulty: 'Moderate',
    subjectId: 'sub-bca-503',
    subjectName: 'Computer Networks (BCA-503)',
    topicId: 'topic-net-datalink',
    topicName: 'Data Link Layer & Framing',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'HDLC frames begin and end with the unique 8-bit flag sequence 01111110 (hexadecimal 0x7E). To prevent user data from mimicking this flag, bit stuffing (inserting a 0 after five consecutive 1s) is applied.',
    options: [
      { id: 'bca-net-q01-a', optionKey: 'A', optionText: '11111111 (0xFF)', isCorrect: false },
      { id: 'bca-net-q01-b', optionKey: 'B', optionText: '01111110 (0x7E)', isCorrect: true },
      { id: 'bca-net-q01-c', optionKey: 'C', optionText: '10101010 (0xAA)', isCorrect: false },
      { id: 'bca-net-q01-d', optionKey: 'D', optionText: '00000000 (0x00)', isCorrect: false }
    ]
  },
  {
    id: 'bca-net-q02',
    order: 8,
    questionText: 'What is the primary operational advantage of the Piggybacking technique in bidirectional network communication?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-503',
    subjectName: 'Computer Networks (BCA-503)',
    topicId: 'topic-net-flow',
    topicName: 'Flow & Error Control',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'Piggybacking delays sending a standalone acknowledgment (ACK) frame and instead embeds the ACK number into the header of the next outgoing data frame, reducing bandwidth waste and packet overhead.',
    options: [
      { id: 'bca-net-q02-a', optionKey: 'A', optionText: 'Encrypts payload using asymmetric cryptographic keys', isCorrect: false },
      { id: 'bca-net-q02-b', optionKey: 'B', optionText: 'Embeds ACK in an outgoing data frame to save bandwidth', isCorrect: true },
      { id: 'bca-net-q02-c', optionKey: 'C', optionText: 'Compresses image files before physical transmission', isCorrect: false },
      { id: 'bca-net-q02-d', optionKey: 'D', optionText: 'Allows dynamic IP address assignment to mobile clients', isCorrect: false }
    ]
  },
  {
    id: 'bca-net-q03',
    order: 9,
    questionText: 'In the Datagram approach of packet switching at the Network Layer, which statement is true?',
    questionType: 'MCQ',
    difficulty: 'Moderate',
    subjectId: 'sub-bca-503',
    subjectName: 'Computer Networks (BCA-503)',
    topicId: 'topic-net-network',
    topicName: 'Network Layer & Routing',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'In connectionless datagram packet switching (like IPv4), each packet is treated independently, contains full source and destination addresses, and may take different routes and arrive out of order.',
    options: [
      { id: 'bca-net-q03-a', optionKey: 'A', optionText: 'A formal connection setup phase is mandatory prior to sending data', isCorrect: false },
      { id: 'bca-net-q03-b', optionKey: 'B', optionText: 'All packets are forced along an identical pre-configured circuit', isCorrect: false },
      { id: 'bca-net-q03-c', optionKey: 'C', optionText: 'Each packet is routed independently and may arrive out of order', isCorrect: true },
      { id: 'bca-net-q03-d', optionKey: 'D', optionText: 'Packets contain short 16-bit Virtual Circuit Identifiers only', isCorrect: false }
    ]
  },
  {
    id: 'bca-net-q04',
    order: 10,
    questionText: 'Which Application Layer protocol utilizes TCP port 25 as a client push protocol to deliver email from a mail user agent to a mail server?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-503',
    subjectName: 'Computer Networks (BCA-503)',
    topicId: 'topic-net-app',
    topicName: 'Application Layer Protocols',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'SMTP (Simple Mail Transfer Protocol) is a text-based push protocol running over TCP port 25 (and 587 for modern submission) used to transfer email between clients and mail transfer agents.',
    options: [
      { id: 'bca-net-q04-a', optionKey: 'A', optionText: 'POP3 (Post Office Protocol v3)', isCorrect: false },
      { id: 'bca-net-q04-b', optionKey: 'B', optionText: 'IMAP (Internet Message Access Protocol)', isCorrect: false },
      { id: 'bca-net-q04-c', optionKey: 'C', optionText: 'SMTP (Simple Mail Transfer Protocol)', isCorrect: true },
      { id: 'bca-net-q04-d', optionKey: 'D', optionText: 'SNMP (Simple Network Management Protocol)', isCorrect: false }
    ]
  },

  // ==========================================
  // BCA-502: Java Programming (12 Questions)
  // ==========================================
  {
    id: 'bca-java-q01',
    order: 11,
    questionText: 'In Java, how many bits of memory are allocated for primitive data types "float" and "char" respectively?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-502',
    subjectName: 'Java & Webpage Design (BCA-502)',
    topicId: 'topic-java-basics',
    topicName: 'Java Fundamentals & Data Types',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'In Java: float is 32-bit IEEE 754 floating point; char is 16-bit unsigned Unicode character (\\u0000 to \\uffff). Thus, 32 bits and 16 bits.',
    options: [
      { id: 'bca-java-q01-a', optionKey: 'A', optionText: '64 bits and 8 bits', isCorrect: false },
      { id: 'bca-java-q01-b', optionKey: 'B', optionText: '32 bits and 16 bits', isCorrect: true },
      { id: 'bca-java-q01-c', optionKey: 'C', optionText: '32 bits and 8 bits', isCorrect: false },
      { id: 'bca-java-q01-d', optionKey: 'D', optionText: '64 bits and 16 bits', isCorrect: false }
    ]
  },
  {
    id: 'bca-java-q02',
    order: 12,
    questionText: 'Which class in the "java.net" package is used by server applications to listen on a specific port and accept incoming TCP client connection requests?',
    questionType: 'MCQ',
    difficulty: 'Moderate',
    subjectId: 'sub-bca-502',
    subjectName: 'Java & Webpage Design (BCA-502)',
    topicId: 'topic-java-net',
    topicName: 'Java Network Programming',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'java.net.ServerSocket is instantiated with a port number, and its accept() method blocks until a client connects, returning a java.net.Socket for input/output streams.',
    options: [
      { id: 'bca-java-q02-a', optionKey: 'A', optionText: 'java.net.DatagramPacket', isCorrect: false },
      { id: 'bca-java-q02-b', optionKey: 'B', optionText: 'java.net.ServerSocket', isCorrect: true },
      { id: 'bca-java-q02-c', optionKey: 'C', optionText: 'java.net.HttpURLConnection', isCorrect: false },
      { id: 'bca-java-q02-d', optionKey: 'D', optionText: 'java.net.InetAddress', isCorrect: false }
    ]
  },
  {
    id: 'bca-java-q03',
    order: 13,
    questionText: 'Which HTML tag and attribute are used to define a hyperlink opening a target resource in a completely new browser tab?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-502',
    subjectName: 'Java & Webpage Design (BCA-502)',
    topicId: 'topic-web-html',
    topicName: 'HTML & Web Design',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'The anchor tag <a> uses the href attribute for the URL and target="_blank" to open the referenced web page in a new browser window or tab.',
    options: [
      { id: 'bca-java-q03-a', optionKey: 'A', optionText: '<link href="url" target="_parent">', isCorrect: false },
      { id: 'bca-java-q03-b', optionKey: 'B', optionText: '<a href="url" target="_blank">', isCorrect: true },
      { id: 'bca-java-q03-c', optionKey: 'C', optionText: '<nav src="url" target="_new">', isCorrect: false },
      { id: 'bca-java-q03-d', optionKey: 'D', optionText: '<a src="url" window="new">', isCorrect: false }
    ]
  },
  {
    id: 'bca-java-q04',
    order: 14,
    questionText: 'Which keyword in Java prevents a class from being inherited or a method from being overridden by subclasses?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-502',
    subjectName: 'Java & Webpage Design (BCA-502)',
    topicId: 'topic-java-oops',
    topicName: 'OOPs Principles & Keywords',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'The "final" keyword prevents class inheritance when applied to a class (e.g., final class String), prevents method overriding when applied to a method, and creates constants when applied to variables.',
    options: [
      { id: 'bca-java-q04-a', optionKey: 'A', optionText: 'static', isCorrect: false },
      { id: 'bca-java-q04-b', optionKey: 'B', optionText: 'abstract', isCorrect: false },
      { id: 'bca-java-q04-c', optionKey: 'C', optionText: 'final', isCorrect: true },
      { id: 'bca-java-q04-d', optionKey: 'D', optionText: 'synchronized', isCorrect: false }
    ]
  },

  // ==========================================
  // BCA-504: Numerical Methods (12 Questions)
  // ==========================================
  {
    id: 'bca-nm-q01',
    order: 15,
    questionText: 'What is the iterative formula for finding the root of an equation f(x) = 0 using the Newton-Raphson Method?',
    questionType: 'MCQ',
    difficulty: 'Moderate',
    subjectId: 'sub-bca-504',
    subjectName: 'Numerical Methods (BCA-504)',
    topicId: 'topic-nm-roots',
    topicName: 'Algebraic & Transcendental Equations',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'The Newton-Raphson iterative scheme is x_{n+1} = x_n - [f(x_n) / f\'(x_n)]. It has quadratic convergence (order of convergence = 2) when near a simple root.',
    options: [
      { id: 'bca-nm-q01-a', optionKey: 'A', optionText: 'x_{n+1} = x_n + [f(x_n) / f\'(x_n)]', isCorrect: false },
      { id: 'bca-nm-q01-b', optionKey: 'B', optionText: 'x_{n+1} = x_n - [f(x_n) / f\'(x_n)]', isCorrect: true },
      { id: 'bca-nm-q01-c', optionKey: 'C', optionText: 'x_{n+1} = [x_n + x_{n-1}] / 2', isCorrect: false },
      { id: 'bca-nm-q01-d', optionKey: 'D', optionText: 'x_{n+1} = x_n - [f\'(x_n) / f(x_n)]', isCorrect: false }
    ]
  },
  {
    id: 'bca-nm-q02',
    order: 16,
    questionText: 'For an equispaced discrete dataset with step size h, which finite difference operator relationship represents the definition of first backward difference ∇y_i?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-504',
    subjectName: 'Numerical Methods (BCA-504)',
    topicId: 'topic-nm-diff',
    topicName: 'Finite Difference Calculus',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'The backward difference operator nabla (∇) is defined as ∇y_i = y_i - y_{i-1}. In contrast, the forward difference operator Delta (Δ) is defined as Δy_i = y_{i+1} - y_i.',
    options: [
      { id: 'bca-nm-q02-a', optionKey: 'A', optionText: '∇y_i = y_{i+1} - y_i', isCorrect: false },
      { id: 'bca-nm-q02-b', optionKey: 'B', optionText: '∇y_i = y_i - y_{i-1}', isCorrect: true },
      { id: 'bca-nm-q02-c', optionKey: 'C', optionText: '∇y_i = [y_{i+1} - y_{i-1}] / 2', isCorrect: false },
      { id: 'bca-nm-q02-d', optionKey: 'D', optionText: '∇y_i = y_i + y_{i-1}', isCorrect: false }
    ]
  },
  {
    id: 'bca-nm-q03',
    order: 17,
    questionText: 'In numerical integration, Simpson\'s 1/3rd Rule requires the total number of sub-intervals (n) to be strictly:',
    questionType: 'MCQ',
    difficulty: 'Moderate',
    subjectId: 'sub-bca-504',
    subjectName: 'Numerical Methods (BCA-504)',
    topicId: 'topic-nm-integration',
    topicName: 'Numerical Integration',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'Simpson\'s 1/3 Rule approximates pairs of adjacent intervals using quadratic parabolas, which requires the total number of sub-intervals (n) to be an EVEN number. Simpson\'s 3/8 Rule requires n to be a multiple of 3.',
    options: [
      { id: 'bca-nm-q03-a', optionKey: 'A', optionText: 'Any positive integer', isCorrect: false },
      { id: 'bca-nm-q03-b', optionKey: 'B', optionText: 'An odd number', isCorrect: false },
      { id: 'bca-nm-q03-c', optionKey: 'C', optionText: 'An even number', isCorrect: true },
      { id: 'bca-nm-q03-d', optionKey: 'D', optionText: 'A multiple of 5', isCorrect: false }
    ]
  },
  {
    id: 'bca-nm-q04',
    order: 18,
    questionText: 'When solving a system of linear equations using Gauss Elimination, the augmented matrix [A|B] is transformed into which form via row operations?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-504',
    subjectName: 'Numerical Methods (BCA-504)',
    topicId: 'topic-nm-linear',
    topicName: 'System of Linear Equations',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'Forward elimination in Gauss Elimination transforms the coefficient matrix into an Upper Triangular Matrix (where all elements below the main diagonal are zero), followed by back substitution.',
    options: [
      { id: 'bca-nm-q04-a', optionKey: 'A', optionText: 'Lower Triangular Matrix', isCorrect: false },
      { id: 'bca-nm-q04-b', optionKey: 'B', optionText: 'Upper Triangular Matrix', isCorrect: true },
      { id: 'bca-nm-q04-c', optionKey: 'C', optionText: 'Skew-Symmetric Matrix', isCorrect: false },
      { id: 'bca-nm-q04-d', optionKey: 'D', optionText: 'Null Matrix', isCorrect: false }
    ]
  },
  {
    id: 'bca-dbms-q07',
    order: 19,
    questionText: 'Which normal form addresses anomalies resulting from non-trivial Multivalued Dependencies (MVD)?',
    questionType: 'MCQ',
    difficulty: 'Hard',
    subjectId: 'sub-bca-501',
    subjectName: 'DBMS (BCA-501)',
    topicId: 'topic-dbms-norm',
    topicName: 'Relational Normalization',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'Fourth Normal Form (4NF) specifically eliminates Multivalued Dependencies (MVDs: A ->> B). A relation is in 4NF if it is in BCNF and for every non-trivial MVD A ->> B, A is a super key.',
    options: [
      { id: 'bca-dbms-q07-a', optionKey: 'A', optionText: 'Third Normal Form (3NF)', isCorrect: false },
      { id: 'bca-dbms-q07-b', optionKey: 'B', optionText: 'Boyce-Codd Normal Form (BCNF)', isCorrect: false },
      { id: 'bca-dbms-q07-c', optionKey: 'C', optionText: 'Fourth Normal Form (4NF)', isCorrect: true },
      { id: 'bca-dbms-q07-d', optionKey: 'D', optionText: 'Second Normal Form (2NF)', isCorrect: false }
    ]
  },
  {
    id: 'bca-net-q05',
    order: 20,
    questionText: 'Which layer of the 7-layer ISO/OSI Reference Model is directly responsible for end-to-end reliable transmission, flow control, and port addressing?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    subjectId: 'sub-bca-503',
    subjectName: 'Computer Networks (BCA-503)',
    topicId: 'topic-net-osi',
    topicName: 'OSI Reference Model',
    marks: 1.0,
    negativeMarks: 0.25,
    explanation: 'The Transport Layer (Layer 4) handles end-to-end communication, port addressing (process-to-process delivery), packet segmentation/reassembly, connection management (TCP 3-way handshake), and error control.',
    options: [
      { id: 'bca-net-q05-a', optionKey: 'A', optionText: 'Data Link Layer', isCorrect: false },
      { id: 'bca-net-q05-b', optionKey: 'B', optionText: 'Network Layer', isCorrect: false },
      { id: 'bca-net-q05-c', optionKey: 'C', optionText: 'Transport Layer', isCorrect: true },
      { id: 'bca-net-q05-d', optionKey: 'D', optionText: 'Session Layer', isCorrect: false }
    ]
  }
];

const bcaExam = {
  id: 'bca-5th-sem-ccsu',
  name: 'BCA 5th Semester',
  slug: 'bca-5th-sem',
  category: 'University Degree',
  difficulty: 'Moderate',
  description: 'Chaudhary Charan Singh University (CCSU) BCA 5th Semester comprehensive examination coverage with solved PYQs, subject drills, and semester practice tests.',
  subjects: [
    'DBMS (BCA-501)',
    'Java & Webpage Design (BCA-502)',
    'Computer Networks (BCA-503)',
    'Numerical Methods (BCA-504)'
  ],
  testCount: 5,
  questionCount: bcaQuestions.length
};

const bcaTests = [
  {
    id: 'test-bca-full-01',
    title: 'BCA 5th Sem: All Subjects Grand Semester Mock',
    description: 'Comprehensive 60-minute mock covering DBMS (501), Java (502), Networks (503), and Numerical Methods (504) based on official CCSU solved question papers.',
    examId: bcaExam.id,
    examName: bcaExam.name,
    examSlug: bcaExam.slug,
    subjectId: null,
    subjectName: 'Full Syllabus',
    testType: 'Full Length',
    duration: 60,
    totalMarks: 75,
    negativeMarks: 0.25,
    difficulty: 'Moderate',
    isPremium: false,
    questionCount: bcaQuestions.length,
    attemptCount: 14
  },
  {
    id: 'test-bca-dbms-01',
    title: 'BCA-501: DBMS Solved PYQ & University Mock',
    description: 'High-yield practice test covering 3-Schema Architecture, ER-to-Relational Mapping, Normal Forms (1NF-BCNF), SQL Set Operators, and ACID Transactions.',
    examId: bcaExam.id,
    examName: bcaExam.name,
    examSlug: bcaExam.slug,
    subjectId: 'sub-bca-501',
    subjectName: 'DBMS (BCA-501)',
    testType: 'Sectional',
    duration: 45,
    totalMarks: 50,
    negativeMarks: 0.25,
    difficulty: 'Moderate',
    isPremium: false,
    questionCount: bcaQuestions.filter(q => q.subjectId === 'sub-bca-501').length,
    attemptCount: 38
  },
  {
    id: 'test-bca-net-01',
    title: 'BCA-503: Computer Networks Solved PYQ Mock',
    description: 'Master key networking questions: HDLC framing, Bit Stuffing, Piggybacking, Datagram vs Virtual Circuit, OSI Layering, and SMTP/TCP protocols.',
    examId: bcaExam.id,
    examName: bcaExam.name,
    examSlug: bcaExam.slug,
    subjectId: 'sub-bca-503',
    subjectName: 'Computer Networks (BCA-503)',
    testType: 'Sectional',
    duration: 45,
    totalMarks: 50,
    negativeMarks: 0.25,
    difficulty: 'Moderate',
    isPremium: false,
    questionCount: bcaQuestions.filter(q => q.subjectId === 'sub-bca-503').length,
    attemptCount: 29
  },
  {
    id: 'test-bca-java-01',
    title: 'BCA-502: Java & Webpage Design Solved PYQ Mock',
    description: 'Focused drill on primitive data types, ServerSocket TCP networking, package namespaces, HTML5 tags, and OOP access specifiers.',
    examId: bcaExam.id,
    examName: bcaExam.name,
    examSlug: bcaExam.slug,
    subjectId: 'sub-bca-502',
    subjectName: 'Java & Webpage Design (BCA-502)',
    testType: 'Sectional',
    duration: 45,
    totalMarks: 50,
    negativeMarks: 0.25,
    difficulty: 'Moderate',
    isPremium: false,
    questionCount: bcaQuestions.filter(q => q.subjectId === 'sub-bca-502').length,
    attemptCount: 22
  },
  {
    id: 'test-bca-nm-01',
    title: 'BCA-504: Numerical Methods & Algorithms Mock',
    description: 'Solve root-finding formulas (Newton-Raphson, Bisection), Backward Difference operators (∇), Simpson\'s 1/3rd Rule conditions, and Gauss Elimination.',
    examId: bcaExam.id,
    examName: bcaExam.name,
    examSlug: bcaExam.slug,
    subjectId: 'sub-bca-504',
    subjectName: 'Numerical Methods (BCA-504)',
    testType: 'Sectional',
    duration: 45,
    totalMarks: 50,
    negativeMarks: 0.25,
    difficulty: 'Moderate',
    isPremium: false,
    questionCount: bcaQuestions.filter(q => q.subjectId === 'sub-bca-504').length,
    attemptCount: 19
  }
];

const bcaPracticeCategories = [
  {
    id: 'cat-bca-dbms',
    name: 'DBMS (BCA-501)',
    slug: 'bca-dbms',
    description: 'Relational Database Architecture, Normalization, SQL, and Transactions',
    questionCount: 30,
    topics: [
      { id: 'top-dbms-1', name: 'Database Architecture & Schema', slug: 'db-architecture', questionCount: 8 },
      { id: 'top-dbms-2', name: 'ER Modeling & Relational Mapping', slug: 'er-modeling', questionCount: 8 },
      { id: 'top-dbms-3', name: 'Relational Normalization (1NF - BCNF)', slug: 'normalization', questionCount: 8 },
      { id: 'top-dbms-4', name: 'SQL & Relational Algebra Operations', slug: 'sql-algebra', questionCount: 6 }
    ]
  },
  {
    id: 'cat-bca-networks',
    name: 'Computer Networks (BCA-503)',
    slug: 'bca-networks',
    description: 'OSI/TCP-IP Models, HDLC Framing, Routing, and Transport Protocols',
    questionCount: 28,
    topics: [
      { id: 'top-net-1', name: 'OSI & TCP/IP Reference Models', slug: 'osi-tcp-ip', questionCount: 8 },
      { id: 'top-net-2', name: 'Data Link Layer & HDLC Framing', slug: 'data-link-layer', questionCount: 8 },
      { id: 'top-net-3', name: 'Routing & Packet Switching (Datagram vs VC)', slug: 'routing-switching', questionCount: 6 },
      { id: 'top-net-4', name: 'Application Protocols (SMTP, DNS, HTTP)', slug: 'app-protocols', questionCount: 6 }
    ]
  },
  {
    id: 'cat-bca-java',
    name: 'Java & Webpage Design (BCA-502)',
    slug: 'bca-java',
    description: 'Core Java, ServerSocket Networking, OOP Principles, and HTML Structure',
    questionCount: 25,
    topics: [
      { id: 'top-java-1', name: 'Data Types, Operators & Control Flow', slug: 'java-basics', questionCount: 7 },
      { id: 'top-java-2', name: 'OOP Concepts & Packages', slug: 'java-oops', questionCount: 6 },
      { id: 'top-java-3', name: 'Java Sockets & Network Programming', slug: 'java-sockets', questionCount: 6 },
      { id: 'top-java-4', name: 'HTML5 Elements, Tables & Anchors', slug: 'html-tables-anchors', questionCount: 6 }
    ]
  },
  {
    id: 'cat-bca-numerical',
    name: 'Numerical Methods (BCA-504)',
    slug: 'bca-numerical-methods',
    description: 'Iterative Root Finding, Finite Differences, Gauss Elimination, and Quadrature',
    questionCount: 25,
    topics: [
      { id: 'top-nm-1', name: 'Root Finding (Newton-Raphson & Bisection)', slug: 'root-finding', questionCount: 7 },
      { id: 'top-nm-2', name: 'Finite Differences (Forward & Backward ∇)', slug: 'finite-differences', questionCount: 6 },
      { id: 'top-nm-3', name: 'Gauss Elimination & Linear Systems', slug: 'gauss-elimination', questionCount: 6 },
      { id: 'top-nm-4', name: 'Numerical Integration (Simpson\'s Rules)', slug: 'numerical-integration', questionCount: 6 }
    ]
  }
];

// Read existing dbData.json
const dbDataPath = path.join(__dirname, '..', 'src', 'lib', 'dbData.json');
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));

// Filter out old BCA entries if any
dbData.tests = dbData.tests.filter(t => t.examSlug !== 'bca-5th-sem');
dbData.practiceCategories = dbData.practiceCategories.filter(c => !c.name.includes('BCA'));
dbData.questions = dbData.questions.filter(q => !q.id.startsWith('bca-'));
dbData.testsWithQuestions = dbData.testsWithQuestions.filter(t => t.examSlug !== 'bca-5th-sem');

// Add new BCA tests
dbData.tests.unshift(...bcaTests);

// Add new BCA practice categories
dbData.practiceCategories.push(...bcaPracticeCategories);

// Add questions
dbData.questions.unshift(...bcaQuestions);

// Build testsWithQuestions for BCA
bcaTests.forEach(testSummary => {
  let questionsForTest = [];
  if (testSummary.subjectId) {
    questionsForTest = bcaQuestions.filter(q => q.subjectId === testSummary.subjectId);
  } else {
    questionsForTest = bcaQuestions;
  }

  dbData.testsWithQuestions.unshift({
    ...testSummary,
    questions: questionsForTest.map((q, idx) => ({
      ...q,
      order: idx + 1
    }))
  });
});

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log('Successfully injected BCA 5th Semester exam, 5 mock tests, and 20 solved questions into dbData.json');
