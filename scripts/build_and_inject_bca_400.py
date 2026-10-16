# scripts/build_and_inject_bca_400.py
import json
import os
import sys

from bca_data_dbms import get_dbms_questions
from bca_data_java import get_java_questions
from bca_data_networks import get_networks_questions
from bca_data_numerical import get_numerical_questions

def validate_questions(qs, expected_sub_id, name):
    assert len(qs) == 100, f"{name} count mismatch: expected 100, got {len(qs)}"
    for q in qs:
        assert q["subjectId"] == expected_sub_id, f"Wrong subjectId {q['subjectId']} in {q['id']}"
        assert len(q["options"]) == 4, f"Options count != 4 in {q['id']}"
        correct_count = sum(1 for o in q["options"] if o["isCorrect"])
        assert correct_count == 1, f"Expected 1 correct option in {q['id']}, got {correct_count}"
        assert len(q["explanation"]) > 10, f"Explanation too short in {q['id']}"
        assert len(q["questionText"]) > 5, f"Question text too short in {q['id']}"

def main():
    print("--- 1. Generating & Validating Questions ---")
    dbms_qs = get_dbms_questions()
    java_qs = get_java_questions()
    cn_qs = get_networks_questions()
    nm_qs = get_numerical_questions()

    validate_questions(dbms_qs, "sub-bca-501", "DBMS")
    validate_questions(java_qs, "sub-bca-502", "Java")
    validate_questions(cn_qs, "sub-bca-503", "Networks")
    validate_questions(nm_qs, "sub-bca-504", "Numerical Methods")

    all_bca_qs = dbms_qs + java_qs + cn_qs + nm_qs
    print(f"Total BCA Questions Validated: {len(all_bca_qs)} (100 per subject)")

    db_path = os.path.join("src", "lib", "dbData.json")
    with open(db_path, "r", encoding="utf-8") as f:
        db = json.load(f)

    # Retain non-BCA questions
    non_bca_qs = [q for q in db.get("questions", []) if not (q.get("id", "").startswith("bca-") or "bca" in str(q.get("subjectId", "")))]
    print(f"Retained {len(non_bca_qs)} existing non-BCA questions.")

    combined_questions = non_bca_qs + all_bca_qs
    db["questions"] = combined_questions

    q_map = {q["id"]: q for q in combined_questions}

    print("--- 2. Building Rich Practice Categories with 5 Topics per Subject ---")
    practice_cats = [
        {
            "id": "cat-bca-dbms",
            "name": "DBMS (BCA-501)",
            "questionCount": 100,
            "topics": [
                {"id": "top-dbms-1", "name": "Database Architecture, ANSI-SPARC & ER Modeling", "questionCount": 20},
                {"id": "top-dbms-2", "name": "Relational Model, Constraints & Relational Algebra", "questionCount": 20},
                {"id": "top-dbms-3", "name": "Functional Dependencies & Normalization (1NF - 5NF)", "questionCount": 20},
                {"id": "top-dbms-4", "name": "SQL Commands, Views & Indexing Structures", "questionCount": 20},
                {"id": "top-dbms-5", "name": "Transactions, ACID, Concurrency Control & Recovery", "questionCount": 20},
            ]
        },
        {
            "id": "cat-bca-java",
            "name": "Java & Webpage Design (BCA-502)",
            "questionCount": 100,
            "topics": [
                {"id": "top-java-1", "name": "JVM Architecture, Bytecode & Java Fundamentals", "questionCount": 20},
                {"id": "top-java-2", "name": "Syntax, Operators, Strings & Array Manipulations", "questionCount": 20},
                {"id": "top-java-3", "name": "OOP Principles, Inheritance & Interface Contracts", "questionCount": 20},
                {"id": "top-java-4", "name": "Packages, Exception Handling & Wrapper Classes", "questionCount": 20},
                {"id": "top-java-5", "name": "Multithreading, Sockets, JDBC & Web Basics", "questionCount": 20},
            ]
        },
        {
            "id": "cat-bca-networks",
            "name": "Computer Networks (BCA-503)",
            "questionCount": 100,
            "topics": [
                {"id": "top-cn-1", "name": "Network Topologies, Physical Media & OSI Reference Model", "questionCount": 20},
                {"id": "top-cn-2", "name": "Data Link Layer, HDLC Framing & Error Control", "questionCount": 20},
                {"id": "top-cn-3", "name": "MAC Protocols, CSMA/CD, CSMA/CA & Ethernet", "questionCount": 20},
                {"id": "top-cn-4", "name": "Network Layer, IPv4/IPv6 Addressing & Routing Algorithms", "questionCount": 20},
                {"id": "top-cn-5", "name": "Transport Layer (TCP/UDP), Security & Application Protocols", "questionCount": 20},
            ]
        },
        {
            "id": "cat-bca-numerical",
            "name": "Numerical Methods (BCA-504)",
            "questionCount": 100,
            "topics": [
                {"id": "top-nm-1", "name": "Errors, Approximations & Non-Linear Root Finding", "questionCount": 20},
                {"id": "top-nm-2", "name": "Linear Systems, Gauss Elimination & Iterative Methods", "questionCount": 20},
                {"id": "top-nm-3", "name": "Finite Differences Operators & Interpolation Formulas", "questionCount": 20},
                {"id": "top-nm-4", "name": "Numerical Differentiation & Quadrature Rules", "questionCount": 20},
                {"id": "top-nm-5", "name": "Ordinary Differential Equations (Euler, RK4 & Milne)", "questionCount": 20},
            ]
        },
        {
            "id": "cat-quant",
            "name": "Quantitative Aptitude",
            "questionCount": 35,
            "topics": [
                {"id": "top-quant-1", "name": "Data Interpretation & Graphs", "questionCount": 10},
                {"id": "top-quant-2", "name": "Percentages & Profit Loss", "questionCount": 10},
                {"id": "top-quant-3", "name": "Time, Speed, Distance & Work", "questionCount": 15},
            ]
        },
        {
            "id": "cat-reasoning",
            "name": "Reasoning Ability",
            "questionCount": 35,
            "topics": [
                {"id": "top-reas-1", "name": "Syllogism & Deductive Logic", "questionCount": 15},
                {"id": "top-reas-2", "name": "Puzzles & Seating Arrangement", "questionCount": 20},
            ]
        },
        {
            "id": "cat-english",
            "name": "English Language",
            "questionCount": 25,
            "topics": [
                {"id": "top-eng-1", "name": "Reading Comprehension", "questionCount": 10},
                {"id": "top-eng-2", "name": "Error Detection & Grammar", "questionCount": 15},
            ]
        },
        {
            "id": "cat-ga",
            "name": "General Awareness",
            "questionCount": 25,
            "topics": [
                {"id": "top-ga-1", "name": "Banking & Financial Awareness", "questionCount": 15},
                {"id": "top-ga-2", "name": "Current Affairs & Static GK", "questionCount": 10},
            ]
        }
    ]
    db["practiceCategories"] = practice_cats

    print("--- 3. Defining BCA Tests with Clean Schema ---")
    non_bca_tests = [t for t in db.get("tests", []) if not ("bca" in t.get("id", "") or "bca" in str(t.get("examId", "")))]
    
    bca_test_defs = [
        # 1. 100-Question Mastery Sectional Exams
        {
            "id": "test-bca-dbms-100",
            "title": "BCA-501 DBMS: 100 Questions Complete Subject Exam",
            "description": "Comprehensive 100-question master test covering ANSI-SPARC 3-tier architecture, ER modeling, relational algebra, 1NF-5NF normalization, transaction ACID, concurrency control, B+ trees, and ARIES recovery.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-501",
            "subjectName": "DBMS (BCA-501)",
            "testType": "Sectional",
            "duration": 120,
            "totalMarks": 100,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 100,
            "attemptCount": 42,
            "_rawQIds": [q["id"] for q in dbms_qs]
        },
        {
            "id": "test-bca-java-100",
            "title": "BCA-502 Java: 100 Questions Complete Subject Exam",
            "description": "Full 100-question exam covering JVM internals, bytecode, OOP principles, interfaces, package scoping, checked/unchecked exceptions, multithreading, synchronization, applet lifecycle, JDBC, and dynamic web design.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-502",
            "subjectName": "Java & Webpage Design (BCA-502)",
            "testType": "Sectional",
            "duration": 120,
            "totalMarks": 100,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 100,
            "attemptCount": 38,
            "_rawQIds": [q["id"] for q in java_qs]
        },
        {
            "id": "test-bca-cn-100",
            "title": "BCA-503 Networks: 100 Questions Complete Subject Exam",
            "description": "Complete 100-question exam covering OSI & TCP/IP models, physical media, HDLC framing, bit stuffing, sliding window ARQ, CRC & Hamming codes, CSMA/CD, IPv4/IPv6, routing protocols (Dijkstra/Bellman-Ford), and TCP/UDP.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-503",
            "subjectName": "Computer Networks (BCA-503)",
            "testType": "Sectional",
            "duration": 120,
            "totalMarks": 100,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 100,
            "attemptCount": 35,
            "_rawQIds": [q["id"] for q in cn_qs]
        },
        {
            "id": "test-bca-nm-100",
            "title": "BCA-504 Numerical: 100 Questions Complete Subject Exam",
            "description": "Comprehensive 100-question exam covering absolute/relative errors, Bisection, Regula Falsi, Newton-Raphson, Gauss Elimination & Seidel, finite difference operators, Newton/Lagrange interpolation, Simpson's rules, and RK4.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-504",
            "subjectName": "Numerical Methods (BCA-504)",
            "testType": "Sectional",
            "duration": 120,
            "totalMarks": 100,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 100,
            "attemptCount": 29,
            "_rawQIds": [q["id"] for q in nm_qs]
        },

        # 2. Grand Semester Full-Length Mock (100 Questions: 25 from each subject)
        {
            "id": "test-bca-full-grand",
            "title": "BCA 5th Sem: 100-Question All Subjects Grand Semester Final",
            "description": "The ultimate 120-minute semester simulation featuring 25 balanced questions from each of the 4 core subjects (DBMS, Java, Networks, Numerical Methods) drawn directly from solved university PYQs.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": None,
            "subjectName": "Full Syllabus",
            "testType": "Full Length",
            "duration": 120,
            "totalMarks": 100,
            "negativeMarks": 0.25,
            "difficulty": "Hard",
            "isPremium": False,
            "questionCount": 100,
            "attemptCount": 56,
            "_rawQIds": [q["id"] for q in dbms_qs[:25]] + [q["id"] for q in java_qs[:25]] + [q["id"] for q in cn_qs[:25]] + [q["id"] for q in nm_qs[:25]]
        },

        # 3. Practice Mock (40 Questions)
        {
            "id": "test-bca-full-01",
            "title": "BCA 5th Sem: All Subjects Semester Practice Mock",
            "description": "Balanced 60-minute practice mock test covering DBMS, Java, Networks, and Numerical Methods.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": None,
            "subjectName": "Full Syllabus",
            "testType": "Practice",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 40,
            "attemptCount": 18,
            "_rawQIds": [q["id"] for q in dbms_qs[25:35]] + [q["id"] for q in java_qs[25:35]] + [q["id"] for q in cn_qs[25:35]] + [q["id"] for q in nm_qs[25:35]]
        },

        # 4. 50-Question Sectional Practice Papers
        {
            "id": "test-bca-dbms-01",
            "title": "DBMS (BCA-501) Semester Mock Paper",
            "description": "50-question mock test focused on core DBMS topics, relational algebra, SQL, and normalization.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-501",
            "subjectName": "DBMS (BCA-501)",
            "testType": "Sectional",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 50,
            "attemptCount": 24,
            "_rawQIds": [q["id"] for q in dbms_qs[:50]]
        },
        {
            "id": "test-bca-java-01",
            "title": "Java & Webpage Design (BCA-502) Semester Mock Paper",
            "description": "50-question mock test covering Java OOP, Exception Handling, Multithreading, and Web design.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-502",
            "subjectName": "Java & Webpage Design (BCA-502)",
            "testType": "Sectional",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 50,
            "attemptCount": 21,
            "_rawQIds": [q["id"] for q in java_qs[:50]]
        },
        {
            "id": "test-bca-networks-01",
            "title": "Computer Networks (BCA-503) Semester Mock Paper",
            "description": "50-question mock test covering OSI/TCP-IP models, sliding window, routing, and IP addressing.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-503",
            "subjectName": "Computer Networks (BCA-503)",
            "testType": "Sectional",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 50,
            "attemptCount": 19,
            "_rawQIds": [q["id"] for q in cn_qs[:50]]
        },
        {
            "id": "test-bca-nm-01",
            "title": "Numerical Methods (BCA-504) Semester Mock Paper",
            "description": "50-question mock test covering Newton-Raphson, Gauss Elimination, finite differences, and RK4.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-504",
            "subjectName": "Numerical Methods (BCA-504)",
            "testType": "Sectional",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 50,
            "attemptCount": 17,
            "_rawQIds": [q["id"] for q in nm_qs[:50]]
        }
    ]

    clean_tests = []
    clean_twq = []
    old_twq_map = {t["id"]: t for t in db.get("testsWithQuestions", [])}

    # Clean existing non-bca tests
    for t in non_bca_tests:
        tid = t["id"]
        t_clean = {k: v for k, v in t.items() if k != "questionIds" and k != "questions"}
        clean_tests.append(t_clean)

        twq_item = dict(t_clean)
        if tid in old_twq_map:
            twq_item["questions"] = old_twq_map[tid].get("questions", [])
        else:
            twq_item["questions"] = []
        twq_item["questionCount"] = len(twq_item["questions"])
        clean_twq.append(twq_item)

    # Clean and attach BCA tests
    for t in bca_test_defs:
        raw_ids = t.pop("_rawQIds", [])
        t_clean = {k: v for k, v in t.items() if k != "questionIds" and k != "questions"}
        clean_tests.append(t_clean)

        twq_item = dict(t_clean)
        t_qs = [q_map[qid] for qid in raw_ids if qid in q_map]
        twq_item["questions"] = t_qs
        twq_item["questionCount"] = len(t_qs)
        clean_twq.append(twq_item)

    db["tests"] = clean_tests
    db["testsWithQuestions"] = clean_twq

    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved {len(db['questions'])} total questions into {db_path}!")
    print(f"Successfully configured {len(db['tests'])} tests ({len(bca_test_defs)} BCA tests) with 0 leaked questionIds!")

if __name__ == "__main__":
    main()
