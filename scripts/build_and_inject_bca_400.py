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

    # Filter out non-BCA questions to retain existing IBPS/SSC/SBI questions
    non_bca_qs = [q for q in db.get("questions", []) if not (q.get("id", "").startswith("bca-") or "bca" in str(q.get("subjectId", "")))]
    print(f"Retained {len(non_bca_qs)} existing non-BCA questions.")

    combined_questions = non_bca_qs + all_bca_qs
    db["questions"] = combined_questions

    # Map question IDs for quick lookup
    q_map = {q["id"]: q for q in combined_questions}

    # Update practice categories
    for pc in db.get("practiceCategories", []):
        cid = pc.get("id")
        if cid == "cat-bca-dbms":
            pc["questionCount"] = 100
        elif cid == "cat-bca-java":
            pc["questionCount"] = 100
        elif cid == "cat-bca-networks":
            pc["questionCount"] = 100
        elif cid == "cat-bca-numerical":
            pc["questionCount"] = 100

    print("--- 2. Building BCA Tests & Test Suites ---")
    # Retain non-BCA tests
    non_bca_tests = [t for t in db.get("tests", []) if not ("bca" in t.get("id", "") or "bca" in str(t.get("examId", "")))]
    
    # Define BCA Tests
    bca_tests = [
        # 1. Subject 100-Question Mastery Exams
        {
            "id": "test-bca-dbms-100",
            "title": "BCA-501 DBMS: 100 Questions Complete Subject Exam",
            "description": "Comprehensive 100-question master test covering ANSI-SPARC 3-tier architecture, ER modeling, relational algebra, 1NF-5NF normalization, transaction ACID, concurrency control, B+ trees, and ARIES recovery.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-501",
            "subjectName": "DBMS (BCA-501)",
            "testType": "Subject Test",
            "duration": 120,
            "totalMarks": 100,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 100,
            "attemptCount": 42,
            "questionIds": [q["id"] for q in dbms_qs]
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
            "testType": "Subject Test",
            "duration": 120,
            "totalMarks": 100,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 100,
            "attemptCount": 38,
            "questionIds": [q["id"] for q in java_qs]
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
            "testType": "Subject Test",
            "duration": 120,
            "totalMarks": 100,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 100,
            "attemptCount": 35,
            "questionIds": [q["id"] for q in cn_qs]
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
            "testType": "Subject Test",
            "duration": 120,
            "totalMarks": 100,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 100,
            "attemptCount": 29,
            "questionIds": [q["id"] for q in nm_qs]
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
            "questionIds": [q["id"] for q in dbms_qs[:25]] + [q["id"] for q in java_qs[:25]] + [q["id"] for q in cn_qs[:25]] + [q["id"] for q in nm_qs[:25]]
        },

        # 3. Backward Compatible Existing Test IDs (Updated with 25-50 fresh questions)
        {
            "id": "test-bca-full-01",
            "title": "BCA 5th Sem: All Subjects Semester Mock",
            "description": "Balanced 60-minute mock test covering DBMS, Java, Networks, and Numerical Methods.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": None,
            "subjectName": "Full Syllabus",
            "testType": "Full Length",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 40,
            "attemptCount": 18,
            "questionIds": [q["id"] for q in dbms_qs[25:35]] + [q["id"] for q in java_qs[25:35]] + [q["id"] for q in cn_qs[25:35]] + [q["id"] for q in nm_qs[25:35]]
        },
        {
            "id": "test-bca-dbms-01",
            "title": "DBMS (BCA-501) Semester Mock Paper",
            "description": "50-question mock test focused on core DBMS topics, relational algebra, SQL, and normalization.",
            "examId": "bca-5th-sem-ccsu",
            "examName": "BCA 5th Semester",
            "examSlug": "bca-5th-sem",
            "subjectId": "sub-bca-501",
            "subjectName": "DBMS (BCA-501)",
            "testType": "Subject Test",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 50,
            "attemptCount": 24,
            "questionIds": [q["id"] for q in dbms_qs[:50]]
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
            "testType": "Subject Test",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 50,
            "attemptCount": 21,
            "questionIds": [q["id"] for q in java_qs[:50]]
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
            "testType": "Subject Test",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 50,
            "attemptCount": 19,
            "questionIds": [q["id"] for q in cn_qs[:50]]
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
            "testType": "Subject Test",
            "duration": 60,
            "totalMarks": 50,
            "negativeMarks": 0.25,
            "difficulty": "Moderate",
            "isPremium": False,
            "questionCount": 50,
            "attemptCount": 17,
            "questionIds": [q["id"] for q in nm_qs[:50]]
        }
    ]

    all_tests = non_bca_tests + bca_tests
    db["tests"] = all_tests

    # Build testsWithQuestions
    tests_with_questions = []
    # Build dictionary of non-BCA tests with questions
    old_twq_map = {t["id"]: t for t in db.get("testsWithQuestions", [])}

    for t in all_tests:
        tid = t["id"]
        t_copy = dict(t)
        if "questionIds" in t:
            t_qs = [q_map[qid] for qid in t["questionIds"] if qid in q_map]
            t_copy["questions"] = t_qs
            t_copy["questionCount"] = len(t_qs)
            # Remove questionIds from top-level metadata if desired, or keep it
        elif tid in old_twq_map:
            t_copy["questions"] = old_twq_map[tid].get("questions", [])
            t_copy["questionCount"] = len(t_copy["questions"])
        else:
            t_copy["questions"] = []
            t_copy["questionCount"] = 0
        tests_with_questions.append(t_copy)

    db["testsWithQuestions"] = tests_with_questions

    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved {len(db['questions'])} total questions ({len(all_bca_qs)} BCA) into {db_path}!")
    print(f"Successfully configured {len(db['tests'])} tests ({len(bca_tests)} BCA tests)!")

if __name__ == "__main__":
    main()
