export interface DemoQuestion {
  id: number;
  qNum: number;
  subject: string;
  topic: string;
  marks: string;
  text: string;
  options: { key: string; text: string }[];
  correctKey: string;
}

export const BCA_DEMO_25_QUESTIONS: DemoQuestion[] = [
  {
    "id": 1,
    "qNum": 1,
    "subject": "DBMS (BCA-501)",
    "topic": "Architecture & Schema",
    "marks": "+1.00 / -0.25",
    "text": "What is the primary role of the Conceptual Schema in ANSI-SPARC 3-tier architecture?",
    "options": [
      {
        "key": "A",
        "text": "Defines community user view and table structures independent of physical storage"
      },
      {
        "key": "B",
        "text": "Physical byte storage on disk"
      },
      {
        "key": "C",
        "text": "User specific form views"
      },
      {
        "key": "D",
        "text": "Network routing tables"
      }
    ],
    "correctKey": "A"
  },
  {
    "id": 2,
    "qNum": 2,
    "subject": "DBMS (BCA-501)",
    "topic": "Architecture & Schema",
    "marks": "+1.00 / -0.25",
    "text": "Total participation of an entity set in a relationship is visually represented by:",
    "options": [
      {
        "key": "A",
        "text": "Single Line"
      },
      {
        "key": "B",
        "text": "Double Line"
      },
      {
        "key": "C",
        "text": "Dashed Line"
      },
      {
        "key": "D",
        "text": "Arrow"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 3,
    "qNum": 3,
    "subject": "DBMS (BCA-501)",
    "topic": "Relational Model & Algebra",
    "marks": "+1.00 / -0.25",
    "text": "The Rename operator in relational algebra is represented by the Greek letter:",
    "options": [
      {
        "key": "A",
        "text": "Sigma"
      },
      {
        "key": "B",
        "text": "Pi"
      },
      {
        "key": "C",
        "text": "Rho"
      },
      {
        "key": "D",
        "text": "Gamma"
      }
    ],
    "correctKey": "C"
  },
  {
    "id": 4,
    "qNum": 4,
    "subject": "DBMS (BCA-501)",
    "topic": "Normalization",
    "marks": "+1.00 / -0.25",
    "text": "Can a relation with a simple (single-attribute) primary key have a 2NF violation?",
    "options": [
      {
        "key": "A",
        "text": "Yes, frequently"
      },
      {
        "key": "B",
        "text": "No, because partial dependency requires a composite key"
      },
      {
        "key": "C",
        "text": "Only if it has transitive dependencies"
      },
      {
        "key": "D",
        "text": "Depends on number of rows"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 5,
    "qNum": 5,
    "subject": "DBMS (BCA-501)",
    "topic": "SQL & Storage",
    "marks": "+1.00 / -0.25",
    "text": "In SQL, which clause is evaluated before the SELECT and HAVING clauses?",
    "options": [
      {
        "key": "A",
        "text": "ORDER BY"
      },
      {
        "key": "B",
        "text": "WHERE"
      },
      {
        "key": "C",
        "text": "DISTINCT"
      },
      {
        "key": "D",
        "text": "LIMIT"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 6,
    "qNum": 6,
    "subject": "DBMS (BCA-501)",
    "topic": "SQL & Storage",
    "marks": "+1.00 / -0.25",
    "text": "Which SQL data type is best suited for storing fixed-length alphanumeric character strings?",
    "options": [
      {
        "key": "A",
        "text": "VARCHAR"
      },
      {
        "key": "B",
        "text": "CHAR"
      },
      {
        "key": "C",
        "text": "TEXT"
      },
      {
        "key": "D",
        "text": "BLOB"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 7,
    "qNum": 7,
    "subject": "DBMS (BCA-501)",
    "topic": "Transactions & Concurrency",
    "marks": "+1.00 / -0.25",
    "text": "What concurrency anomaly occurs when a transaction reads uncommitted changes made by another concurrent transaction that later rolls back?",
    "options": [
      {
        "key": "A",
        "text": "Lost Update"
      },
      {
        "key": "B",
        "text": "Dirty Read (Uncommitted Dependency)"
      },
      {
        "key": "C",
        "text": "Non-repeatable Read"
      },
      {
        "key": "D",
        "text": "Phantom Read"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 8,
    "qNum": 8,
    "subject": "Java & Webpage Design (BCA-502)",
    "topic": "JVM & Basics",
    "marks": "+1.00 / -0.25",
    "text": "Which component of the Java platform is responsible for loading, verifying, and executing compiled bytecode?",
    "options": [
      {
        "key": "A",
        "text": "Java Virtual Machine (JVM)"
      },
      {
        "key": "B",
        "text": "Java Development Kit (JDK)"
      },
      {
        "key": "C",
        "text": "javac Compiler"
      },
      {
        "key": "D",
        "text": "Java Classpath"
      }
    ],
    "correctKey": "A"
  },
  {
    "id": 9,
    "qNum": 9,
    "subject": "Java & Webpage Design (BCA-502)",
    "topic": "Syntax, Strings & Arrays",
    "marks": "+1.00 / -0.25",
    "text": "What is the output of the expression `\"Java\" + 10 + 20` in Java?",
    "options": [
      {
        "key": "A",
        "text": "\"Java30\""
      },
      {
        "key": "B",
        "text": "\"Java1020\""
      },
      {
        "key": "C",
        "text": "\"30Java\""
      },
      {
        "key": "D",
        "text": "Compilation Error"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 10,
    "qNum": 10,
    "subject": "Java & Webpage Design (BCA-502)",
    "topic": "OOP & Inheritance",
    "marks": "+1.00 / -0.25",
    "text": "The `this` keyword in Java is a reference variable that points to:",
    "options": [
      {
        "key": "A",
        "text": "The parent superclass object"
      },
      {
        "key": "B",
        "text": "The current class instance invoking the method or constructor"
      },
      {
        "key": "C",
        "text": "The static class definition"
      },
      {
        "key": "D",
        "text": "The JVM garbage collector"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 11,
    "qNum": 11,
    "subject": "Java & Webpage Design (BCA-502)",
    "topic": "OOP & Inheritance",
    "marks": "+1.00 / -0.25",
    "text": "What are the implicit modifiers for abstract methods declared inside an interface?",
    "options": [
      {
        "key": "A",
        "text": "private abstract"
      },
      {
        "key": "B",
        "text": "public abstract"
      },
      {
        "key": "C",
        "text": "protected abstract"
      },
      {
        "key": "D",
        "text": "default void"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 12,
    "qNum": 12,
    "subject": "Java & Webpage Design (BCA-502)",
    "topic": "Packages & Wrappers",
    "marks": "+1.00 / -0.25",
    "text": "What is the result of `\"hello\" == new String(\"hello\")`?",
    "options": [
      {
        "key": "A",
        "text": "true"
      },
      {
        "key": "B",
        "text": "false"
      },
      {
        "key": "C",
        "text": "Compilation Error"
      },
      {
        "key": "D",
        "text": "NullPointerException"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 13,
    "qNum": 13,
    "subject": "Java & Webpage Design (BCA-502)",
    "topic": "Multithreading",
    "marks": "+1.00 / -0.25",
    "text": "What does the `synchronized` keyword prevent in multi-threaded Java applications?",
    "options": [
      {
        "key": "A",
        "text": "Compiler syntax errors"
      },
      {
        "key": "B",
        "text": "Data races and concurrent state corruption by restricting access to a critical section to one thread at a time"
      },
      {
        "key": "C",
        "text": "Stack overflows"
      },
      {
        "key": "D",
        "text": "Deadlocks entirely"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 14,
    "qNum": 14,
    "subject": "Computer Networks (BCA-503)",
    "topic": "Topologies & Media",
    "marks": "+1.00 / -0.25",
    "text": "Which network topology connects every computer to a central device such as a hub or switch?",
    "options": [
      {
        "key": "A",
        "text": "Ring Topology"
      },
      {
        "key": "B",
        "text": "Star Topology"
      },
      {
        "key": "C",
        "text": "Bus Topology"
      },
      {
        "key": "D",
        "text": "Mesh Topology"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 15,
    "qNum": 15,
    "subject": "Computer Networks (BCA-503)",
    "topic": "OSI & TCP/IP Model",
    "marks": "+1.00 / -0.25",
    "text": "What is the Protocol Data Unit (PDU) called at the Data Link Layer?",
    "options": [
      {
        "key": "A",
        "text": "Bit"
      },
      {
        "key": "B",
        "text": "Frame"
      },
      {
        "key": "C",
        "text": "Packet (Datagram)"
      },
      {
        "key": "D",
        "text": "Segment"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 16,
    "qNum": 16,
    "subject": "Computer Networks (BCA-503)",
    "topic": "Data Link & Framing",
    "marks": "+1.00 / -0.25",
    "text": "In Byte Stuffing (Character-Oriented Framing), which special escape character is stuffed before payload delimiter bytes?",
    "options": [
      {
        "key": "A",
        "text": "ESC"
      },
      {
        "key": "B",
        "text": "DLE (Data Link Escape)"
      },
      {
        "key": "C",
        "text": "SYN"
      },
      {
        "key": "D",
        "text": "ETX"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 17,
    "qNum": 17,
    "subject": "Computer Networks (BCA-503)",
    "topic": "Error Control",
    "marks": "+1.00 / -0.25",
    "text": "To correct up to 't' single-bit errors in any transmission, the minimum Hamming distance of the code must be:",
    "options": [
      {
        "key": "A",
        "text": "t + 1"
      },
      {
        "key": "B",
        "text": "2t"
      },
      {
        "key": "C",
        "text": "2t + 1"
      },
      {
        "key": "D",
        "text": "t^2"
      }
    ],
    "correctKey": "C"
  },
  {
    "id": 18,
    "qNum": 18,
    "subject": "Computer Networks (BCA-503)",
    "topic": "MAC & LANs",
    "marks": "+1.00 / -0.25",
    "text": "Which IEEE standard specifies Token Ring networks?",
    "options": [
      {
        "key": "A",
        "text": "IEEE 802.3"
      },
      {
        "key": "B",
        "text": "IEEE 802.5"
      },
      {
        "key": "C",
        "text": "IEEE 802.11"
      },
      {
        "key": "D",
        "text": "IEEE 802.15"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 19,
    "qNum": 19,
    "subject": "Computer Networks (BCA-503)",
    "topic": "Routing & Congestion",
    "marks": "+1.00 / -0.25",
    "text": "Which Interior Gateway Protocol (IGP) is an open-standard Link-State protocol that organizes networks into hierarchical Areas?",
    "options": [
      {
        "key": "A",
        "text": "RIP"
      },
      {
        "key": "B",
        "text": "BGP"
      },
      {
        "key": "C",
        "text": "OSPF (Open Shortest Path First)"
      },
      {
        "key": "D",
        "text": "EGP"
      }
    ],
    "correctKey": "C"
  },
  {
    "id": 20,
    "qNum": 20,
    "subject": "Numerical Methods (BCA-504)",
    "topic": "Errors & Approximations",
    "marks": "+1.00 / -0.25",
    "text": "If X is the true value and X' is the approximate value, what is the mathematical formula for Absolute Error (E_a)?",
    "options": [
      {
        "key": "A",
        "text": "|X - X'|"
      },
      {
        "key": "B",
        "text": "|X - X'| / X"
      },
      {
        "key": "C",
        "text": "|X - X'| * 100"
      },
      {
        "key": "D",
        "text": "(X - X')^2"
      }
    ],
    "correctKey": "A"
  },
  {
    "id": 21,
    "qNum": 21,
    "subject": "Numerical Methods (BCA-504)",
    "topic": "Root Finding Methods",
    "marks": "+1.00 / -0.25",
    "text": "Under which specific condition does the Newton-Raphson method fail completely (division by zero)?",
    "options": [
      {
        "key": "A",
        "text": "When f(x_n) = 0"
      },
      {
        "key": "B",
        "text": "When f'(x_n) = 0 (horizontal tangent)"
      },
      {
        "key": "C",
        "text": "When f''(x_n) > 0"
      },
      {
        "key": "D",
        "text": "When x_0 is negative"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 22,
    "qNum": 22,
    "subject": "Numerical Methods (BCA-504)",
    "topic": "Linear Systems",
    "marks": "+1.00 / -0.25",
    "text": "How does the Gauss-Seidel method differ fundamentally from the Gauss-Jacobi method?",
    "options": [
      {
        "key": "A",
        "text": "Gauss-Seidel uses the newly computed values of unknowns immediately within the same iteration cycle"
      },
      {
        "key": "B",
        "text": "Gauss-Seidel only updates at the very end of all equations"
      },
      {
        "key": "C",
        "text": "Gauss-Seidel is slower than Jacobi"
      },
      {
        "key": "D",
        "text": "Gauss-Seidel requires no initial guess"
      }
    ],
    "correctKey": "A"
  },
  {
    "id": 23,
    "qNum": 23,
    "subject": "Numerical Methods (BCA-504)",
    "topic": "Finite Differences",
    "marks": "+1.00 / -0.25",
    "text": "What is the (n + 1)-th forward difference Delta^(n + 1) of a polynomial of degree n?",
    "options": [
      {
        "key": "A",
        "text": "Constant"
      },
      {
        "key": "B",
        "text": "0"
      },
      {
        "key": "C",
        "text": "1"
      },
      {
        "key": "D",
        "text": "h^(n+1)"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 24,
    "qNum": 24,
    "subject": "Numerical Methods (BCA-504)",
    "topic": "Interpolation",
    "marks": "+1.00 / -0.25",
    "text": "What is the degree of the unique interpolating polynomial fitting (n + 1) distinct data points?",
    "options": [
      {
        "key": "A",
        "text": "n + 1"
      },
      {
        "key": "B",
        "text": "At most n"
      },
      {
        "key": "C",
        "text": "n - 1"
      },
      {
        "key": "D",
        "text": "2n"
      }
    ],
    "correctKey": "B"
  },
  {
    "id": 25,
    "qNum": 25,
    "subject": "Numerical Methods (BCA-504)",
    "topic": "Numerical Calculus",
    "marks": "+1.00 / -0.25",
    "text": "Simpson's 1/3 Rule approximates the integrand curve using which polynomial curve?",
    "options": [
      {
        "key": "A",
        "text": "Straight line"
      },
      {
        "key": "B",
        "text": "Parabola (quadratic polynomial of degree 2)"
      },
      {
        "key": "C",
        "text": "Cubic spline"
      },
      {
        "key": "D",
        "text": "Exponential"
      }
    ],
    "correctKey": "B"
  }
];
