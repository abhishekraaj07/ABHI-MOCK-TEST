# scripts/build_and_inject_rrb_ntpc.py
import json
import os
import sys

from rrb_questions_bank import (
    get_math_questions,
    get_reasoning_questions,
    get_general_awareness_questions,
)

def validate_section(questions, expected_count, section_name):
    assert len(questions) == expected_count, (
        f"{section_name} count mismatch: expected {expected_count}, got {len(questions)}"
    )
    for q in questions:
        assert len(q["options"]) == 4, f"Options != 4 in {q['id']}"
        correct_count = sum(1 for o in q["options"] if o["isCorrect"])
        assert correct_count == 1, f"Expected exactly 1 correct option in {q['id']}, got {correct_count}"
        assert len(q["explanation"]) > 10, f"Explanation too short in {q['id']}"
        assert len(q["questionText"]) > 5, f"Question text too short in {q['id']}"
        assert q["marks"] == 1.0, f"Marks != 1.0 in {q['id']}"
        assert abs(q["negativeMarks"] - 0.3333) < 0.01, f"Negative marks != 0.33 in {q['id']}"

def main():
    print("=== 1. Validating RRB NTPC (UG) 2026 Question Bank ===")
    math_qs = get_math_questions()
    reasoning_qs = get_reasoning_questions()
    ga_qs = get_general_awareness_questions()

    validate_section(math_qs, 30, "Mathematics")
    validate_section(reasoning_qs, 30, "General Intelligence and Reasoning")
    validate_section(ga_qs, 40, "General Awareness")

    all_rrb_qs = math_qs + reasoning_qs + ga_qs
    print(f"Total RRB NTPC Questions Validated: {len(all_rrb_qs)} (30 Math, 30 Reasoning, 40 GA)")

    db_path = os.path.join("src", "lib", "dbData.json")
    with open(db_path, "r", encoding="utf-8") as f:
        db = json.load(f)

    # Filter out any prior draft rrb questions
    existing_qs = [
        q for q in db.get("questions", [])
        if not (q.get("id", "").startswith("rrb-m-") or q.get("id", "").startswith("rrb-r-") or q.get("id", "").startswith("rrb-ga-"))
    ]
    print(f"Retained {len(existing_qs)} existing non-RRB-NTPC questions.")

    combined_questions = existing_qs + all_rrb_qs
    db["questions"] = combined_questions

    # Build Question lookup map
    q_map = {q["id"]: q for q in combined_questions}

    # Format question helper for test payload
    def format_tq(q, order):
        return {
            "id": q["id"],
            "order": order,
            "marks": q.get("marks", 1.0),
            "negativeMarks": q.get("negativeMarks", 0.3333),
            "questionText": q["questionText"],
            "questionType": "MCQ",
            "difficulty": q.get("difficulty", "Moderate"),
            "subjectId": q.get("subjectId", "sub-rrb-general"),
            "subjectName": q.get("subjectName", "General"),
            "topicId": q.get("topicId", "top-rrb-general"),
            "topicName": q.get("topicName", "General"),
            "explanation": q.get("explanation", ""),
            "options": q.get("options", []),
        }

    print("=== 2. Creating RRB NTPC 2026 Tests (CBT-1 Master Mocks & Sectional Sprints) ===")
    
    # CBT-1 Master Mock 1 (Full 100 Questions: 40 GA, 30 Math, 30 Reasoning)
    cbt1_q_ids = [q["id"] for q in ga_qs] + [q["id"] for q in math_qs] + [q["id"] for q in reasoning_qs]
    test_cbt1_mock1 = {
        "id": "rrb-ntpc-cbt1-mock-01",
        "title": "RRB NTPC (UG) 2026 — CBT-1 Grand Master Mock 1",
        "description": "Full-length 100-question authoritative simulation conforming to CEN 07/2026. 40 General Awareness, 30 Mathematics, and 30 Reasoning with official 1/3rd negative marking.",
        "examId": "rrb-ntpc-ug-2026",
        "examName": "RRB NTPC (UG) 2026",
        "examSlug": "rrb-ntpc-ug",
        "subjectName": "Full Syllabus (GA, Math, Reasoning)",
        "testType": "Full Length",
        "duration": 90,
        "totalMarks": 100,
        "negativeMarks": 0.3333,
        "difficulty": "Moderate",
        "isPremium": False,
        "questionCount": 100,
        "attemptCount": 420,
        "questions": [format_tq(q_map[qid], idx + 1) for idx, qid in enumerate(cbt1_q_ids)],
    }

    # CBT-1 Master Mock 2 (Alternative sequencing: Math, Reasoning, GA)
    cbt1_q_ids_2 = [q["id"] for q in math_qs] + [q["id"] for q in reasoning_qs] + [q["id"] for q in ga_qs]
    test_cbt1_mock2 = {
        "id": "rrb-ntpc-cbt1-mock-02",
        "title": "RRB NTPC (UG) 2026 — CBT-1 Grand Master Mock 2",
        "description": "Second full-length 100-question benchmark examination with balanced difficulty spread across quantitative, logical, and static/railway awareness sections.",
        "examId": "rrb-ntpc-ug-2026",
        "examName": "RRB NTPC (UG) 2026",
        "examSlug": "rrb-ntpc-ug",
        "subjectName": "Full Syllabus (GA, Math, Reasoning)",
        "testType": "Full Length",
        "duration": 90,
        "totalMarks": 100,
        "negativeMarks": 0.3333,
        "difficulty": "Moderate",
        "isPremium": False,
        "questionCount": 100,
        "attemptCount": 312,
        "questions": [format_tq(q_map[qid], idx + 1) for idx, qid in enumerate(cbt1_q_ids_2)],
    }

    # Sectional Test 1: Mathematics Speed Drill (30 Qs, 30 mins)
    math_q_ids = [q["id"] for q in math_qs]
    test_math_sectional = {
        "id": "rrb-ntpc-math-sprint",
        "title": "RRB NTPC — Mathematics Sectional Speed Drill",
        "description": "Dedicated 30-question speed and accuracy sprint covering Arithmetic, Mensuration, Algebra, Trigonometry, and Statistics.",
        "examId": "rrb-ntpc-ug-2026",
        "examName": "RRB NTPC (UG) 2026",
        "examSlug": "rrb-ntpc-ug",
        "subjectName": "Mathematics",
        "testType": "Sectional",
        "duration": 30,
        "totalMarks": 30,
        "negativeMarks": 0.3333,
        "difficulty": "Moderate",
        "isPremium": False,
        "questionCount": 30,
        "attemptCount": 185,
        "questions": [format_tq(q_map[qid], idx + 1) for idx, qid in enumerate(math_q_ids)],
    }

    # Sectional Test 2: Reasoning Sectional Drill (30 Qs, 30 mins)
    reasoning_q_ids = [q["id"] for q in reasoning_qs]
    test_reasoning_sectional = {
        "id": "rrb-ntpc-reasoning-sprint",
        "title": "RRB NTPC — General Intelligence & Reasoning Sprint",
        "description": "Focused 30-question test evaluating Series, Coding-Decoding, Syllogisms, Blood Relations, and Analytical Puzzles.",
        "examId": "rrb-ntpc-ug-2026",
        "examName": "RRB NTPC (UG) 2026",
        "examSlug": "rrb-ntpc-ug",
        "subjectName": "General Intelligence & Reasoning",
        "testType": "Sectional",
        "duration": 30,
        "totalMarks": 30,
        "negativeMarks": 0.3333,
        "difficulty": "Moderate",
        "isPremium": False,
        "questionCount": 30,
        "attemptCount": 194,
        "questions": [format_tq(q_map[qid], idx + 1) for idx, qid in enumerate(reasoning_q_ids)],
    }

    # Sectional Test 3: General Awareness & Railways GK Sprint (40 Qs, 25 mins)
    ga_q_ids = [q["id"] for q in ga_qs]
    test_ga_sectional = {
        "id": "rrb-ntpc-ga-sprint",
        "title": "RRB NTPC — General Awareness & Indian Railways GK Master Sprint",
        "description": "High-yield 40-question drill testing General Science, Indian Railways history & zones, Constitution, Economy, and Current Affairs.",
        "examId": "rrb-ntpc-ug-2026",
        "examName": "RRB NTPC (UG) 2026",
        "examSlug": "rrb-ntpc-ug",
        "subjectName": "General Awareness",
        "testType": "Sectional",
        "duration": 25,
        "totalMarks": 40,
        "negativeMarks": 0.3333,
        "difficulty": "Moderate",
        "isPremium": False,
        "questionCount": 40,
        "attemptCount": 268,
        "questions": [format_tq(q_map[qid], idx + 1) for idx, qid in enumerate(ga_q_ids)],
    }

    new_tests_with_q = [
        test_cbt1_mock1,
        test_cbt1_mock2,
        test_math_sectional,
        test_reasoning_sectional,
        test_ga_sectional,
    ]

    # Filter out existing tests with these IDs
    existing_tests_with_q = [
        t for t in db.get("testsWithQuestions", [])
        if not t.get("id", "").startswith("rrb-ntpc-")
    ]
    db["testsWithQuestions"] = existing_tests_with_q + new_tests_with_q

    # Update simple formatted tests array
    new_formatted_tests = []
    for t in new_tests_with_q:
        new_formatted_tests.append({
            "id": t["id"],
            "title": t["title"],
            "description": t["description"],
            "examId": t["examId"],
            "examName": t["examName"],
            "examSlug": t["examSlug"],
            "subjectName": t["subjectName"],
            "testType": t["testType"],
            "duration": t["duration"],
            "totalMarks": t["totalMarks"],
            "negativeMarks": t["negativeMarks"],
            "difficulty": t["difficulty"],
            "isPremium": t["isPremium"],
            "questionCount": t["questionCount"],
            "attemptCount": t["attemptCount"],
        })

    existing_formatted_tests = [
        t for t in db.get("tests", [])
        if not t.get("id", "").startswith("rrb-ntpc-")
    ]
    db["tests"] = existing_formatted_tests + new_formatted_tests

    # Build practice categories
    rrb_practice_cats = [
        {
            "id": "cat-rrb-ga",
            "name": "General Awareness (RRB NTPC)",
            "questionCount": 40,
            "topics": [
                {"id": "top-rrb-railway-gk", "name": "Indian Railways Special GK & Transport", "questionCount": 10},
                {"id": "top-rrb-science", "name": "General Science & Life Science (CBSE 10th)", "questionCount": 10},
                {"id": "top-rrb-polity-econ", "name": "Indian Polity, Constitution & Economy", "questionCount": 10},
                {"id": "top-rrb-hist-geog", "name": "History of India, Freedom Struggle & Geography", "questionCount": 10},
            ]
        },
        {
            "id": "cat-rrb-math",
            "name": "Mathematics (RRB NTPC)",
            "questionCount": 30,
            "topics": [
                {"id": "top-rrb-arith", "name": "Number System, Decimals, Fractions, LCM/HCF", "questionCount": 10},
                {"id": "top-rrb-commercial", "name": "Percentage, Profit-Loss, Ratio, SI & CI", "questionCount": 10},
                {"id": "top-rrb-pure-math", "name": "Time-Work, Distance, Mensuration, Algebra & Stats", "questionCount": 10},
            ]
        },
        {
            "id": "cat-rrb-reasoning",
            "name": "Reasoning Ability (RRB NTPC)",
            "questionCount": 30,
            "topics": [
                {"id": "top-rrb-logical-series", "name": "Analogies, Number & Letter Series, Coding-Decoding", "questionCount": 10},
                {"id": "top-rrb-verbal-deduction", "name": "Blood Relations, Direction Sense & Syllogisms", "questionCount": 10},
                {"id": "top-rrb-puzzles-ops", "name": "Venn Diagrams, Puzzles, Seating & Math Operations", "questionCount": 10},
            ]
        }
    ]

    existing_cats = [
        c for c in db.get("practiceCategories", [])
        if not c.get("id", "").startswith("cat-rrb-")
    ]
    db["practiceCategories"] = existing_cats + rrb_practice_cats

    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)

    print(f"=== Successfully updated {db_path} ===")
    print(f"- Total questions now: {len(db['questions'])}")
    print(f"- Total tests with questions: {len(db['testsWithQuestions'])}")
    print(f"- Total formatted tests: {len(db['tests'])}")
    print(f"- Total practice categories: {len(db['practiceCategories'])}")

if __name__ == "__main__":
    main()
