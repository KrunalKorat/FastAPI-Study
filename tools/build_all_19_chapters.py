"""
FastAPI Study — Full 19-Chapter Content Pack Builder
Compiles all 19 chapters (from tools/content/ch*.md and fastapi-study-content-pack.md)
into assets/content/textbook-content.js
"""

import os
import sys
import re
import json

# Ensure tools directory is on path
tools_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, tools_dir)
import build_content

def main():
    repo_root = os.path.abspath(os.path.join(tools_dir, ".."))
    content_pack_path = os.path.join(repo_root, "fastapi-study-content-pack.md")

    with open(content_pack_path, "r", encoding="utf-8") as f:
        raw_content_pack = f.read()

    parts_def = [
        {
            "id": 1,
            "title": "Part 1 — FastAPI Fundamentals",
            "description": "Core web concepts, server-side templating, dynamic path parameters, and Pydantic v2 data validation.",
            "chapterIds": [1, 2, 3, 4]
        },
        {
            "id": 2,
            "title": "Part 2 — Databases and Core API Development",
            "description": "SQLAlchemy 2.0 ORM architecture, session lifecycles, and complete CRUD operations.",
            "chapterIds": [5, 6]
        },
        {
            "id": 3,
            "title": "Part 3 — Asynchronous Programming and Application Architecture",
            "description": "Event loop concurrency, enterprise APIRouter modularization, and interactive frontend CORS integration.",
            "chapterIds": [7, 8, 9]
        },
        {
            "id": 4,
            "title": "Part 4 — Authentication and Authorization",
            "description": "Cryptographic password hashing, OAuth2 JWT tokens, dependency injection, and RBAC security.",
            "chapterIds": [10, 11]
        },
        {
            "id": 5,
            "title": "Part 5 — Files, Queries, and Background Tasks",
            "description": "Pillow image processing, disk storage, SQL pagination & filtering, and non-blocking background emails.",
            "chapterIds": [12, 13, 14]
        },
        {
            "id": 6,
            "title": "Part 6 — Production Database and Storage",
            "description": "Production PostgreSQL migration workflows with Alembic, and AWS S3 cloud object storage via Boto3.",
            "chapterIds": [15, 16]
        },
        {
            "id": 7,
            "title": "Part 7 — Testing, Deployment, and Containers",
            "description": "Automated Pytest testing, Linux VPS Nginx/Systemd deployment, and multi-stage Docker containerization.",
            "chapterIds": [17, 18, 19]
        }
    ]

    chapters_catalog = [
        (1, 1, "Getting Started — Web App & REST API Basics", "Video Part 1"),
        (1, 2, "Static Files & Jinja2 Templates — Server-Side Rendering", "Video Part 2"),
        (1, 3, "Path Parameters — Type Validation & Custom Error Handlers", "Video Part 3"),
        (1, 4, "Data Validation & Schemas with Pydantic v2", "Video Part 4"),
        (2, 5, "Relational Databases — SQLAlchemy Engine, Sessions & ORM Models", "Video Part 5"),
        (2, 6, "Completing CRUD Operations — PUT, PATCH, and DELETE Mechanics", "Video Part 6"),
        (3, 7, "Asynchronous Python — `async`, `await`, and Event Loop Concurrency", "Video Part 7"),
        (3, 8, "Enterprise Architecture — Modularization with `APIRouter`", "Video Part 8"),
        (3, 9, "Connecting Interactive Frontends — Fetch API, DOM Manipulation & CORS", "Video Part 9"),
        (4, 10, "Authentication & Security — Password Hashing & OAuth2 JWT Tokens", "Video Part 10"),
        (4, 11, "Authorization & Permissions — Current User Injection & RBAC", "Video Part 11"),
        (5, 12, "File Uploads & Media Handling — Pillow Image Resizing & Disk Storage", "Video Part 12"),
        (5, 13, "Query Pagination, Filtering & Search", "Video Part 13"),
        (5, 14, "Asynchronous Email & Background Tasks — Non-Blocking Password Resets", "Video Part 14"),
        (6, 15, "Production Databases — PostgreSQL & Alembic Migration Management", "Video Part 15"),
        (6, 16, "Cloud Object Storage — AWS S3 Integration with Boto3", "Video Part 16"),
        (7, 17, "Enterprise API Testing — Pytest, HTTPX AsyncClient & Moto Mocking", "Video Part 17"),
        (7, 18, "Linux Production VPS Deployment — Nginx, Systemd, Gunicorn & SSL", "Video Part 18"),
        (7, 19, "Containerization — Docker, Docker Compose & Cloud Serverless Deployment", "Video Part 19"),
    ]

    all_chapters = []

    for part_id, ch_num, title, video_ref in chapters_catalog:
        part_info = next(p for p in parts_def if p["id"] == part_id)

        # 1. Retrieve raw Markdown for chapter
        if ch_num in (1, 2, 3, 4, 19):
            ch_file = os.path.join(tools_dir, "content", f"ch{ch_num}.md")
            if not os.path.exists(ch_file):
                raise FileNotFoundError(f"Missing chapter file: {ch_file}")
            with open(ch_file, "r", encoding="utf-8") as cf:
                raw_ch = cf.read()
        else:
            # Extract from fastapi-study-content-pack.md
            start_pat = re.compile(rf'# CHAPTER {ch_num}:[^\n]*', re.IGNORECASE)
            m_start = start_pat.search(raw_content_pack)
            if not m_start:
                raise ValueError(f"Could not find start for Chapter {ch_num} in content pack")
            
            next_pat = re.compile(rf'# CHAPTER {ch_num+1}:[^\n]*', re.IGNORECASE)
            m_next = next_pat.search(raw_content_pack)
            raw_ch = raw_content_pack[m_start.start():m_next.start()] if m_next else raw_content_pack[m_start.start():]

        # 2. Extract Quiz and Answer Key
        quiz_pat = re.compile(r'(\n#+ (?:CHAPTER\s+\d+\s+)?(?:COMPREHENSIVE\s+)?QUIZ[^\n]*|\n###+ \d+\.\d+ Chapter \d+ (?:Comprehensive )?Assessment & Quiz[^\n]*|\n###+ \d+\.\d+ Chapter \d+ Quiz[^\n]*)', re.IGNORECASE)
        m_quiz = quiz_pat.search(raw_ch)

        if m_quiz:
            body_md = raw_ch[:m_quiz.start()].strip()
            quiz_and_ans = raw_ch[m_quiz.start():].strip()
            ans_pat = re.compile(r'(\n#+ (?:CHAPTER\s+\d+\s+)?ANSWER KEY[^\n]*|\n###+ \d+\.\d+ Chapter \d+ Answer Key[^\n]*|\n###+ Chapter \d+ Answer Key[^\n]*|\n###+ Answer Key[^\n]*)', re.IGNORECASE)
            m_ans = ans_pat.search(quiz_and_ans)
            quiz_text = quiz_and_ans[:m_ans.start()].strip() if m_ans else quiz_and_ans
            ans_text = quiz_and_ans[m_ans.start():].strip() if m_ans else ""

            mcqs = build_content.parse_mcqs(quiz_text, ans_text)
            tfs = build_content.parse_tf(quiz_text, ans_text, ch_num)
            sas = build_content.parse_short_answer(quiz_text, ans_text)
            dbgs = build_content.parse_debugging(quiz_text, ans_text)
            chals = build_content.parse_challenges(quiz_text)

            quiz_obj = {
                "available": True,
                "title": f"Chapter {ch_num} Assessment & Quiz",
                "mcqs": mcqs,
                "trueFalse": tfs,
                "shortAnswer": sas,
                "debugging": dbgs,
                "codingChallenges": chals,
                "rawAnswerKey": ans_text
            }
        else:
            body_md = raw_ch.strip()
            quiz_obj = None

        words = len(re.findall(r'\b\w+\b', body_md))
        read_time_mins = max(3, round(words / 180))

        # 3. Extract Section Headings for Table of Contents
        sections = build_content.extract_sections(body_md, ch_num)

        # 4. Convert Markdown to Semantic HTML
        body_html = build_content.markdown_to_html(body_md, ch_num)

        all_chapters.append({
            "id": ch_num,
            "partId": part_id,
            "partTitle": part_info["title"],
            "number": ch_num,
            "title": title,
            "cleanTitle": re.sub(r'[`*]', '', title),
            "available": True,
            "videoRef": video_ref,
            "wordCount": words,
            "readTime": f"{read_time_mins} min read",
            "missingNotice": None,
            "sections": sections,
            "htmlContent": body_html,
            "rawMarkdown": body_md,
            "quiz": quiz_obj
        })

    # Master Output Data
    master_data = {
        "metadata": {
            "siteName": "FastAPI Study",
            "bookTitle": "Modern Python FastAPI & REST API Engineering",
            "bookSubtitle": "The Complete Digital Textbook & Interactive Quiz System",
            "seriesBasis": "Based on Corey Schafer's Python FastAPI Tutorial Series (19 Modules)",
            "officialDocs": "https://fastapi.tiangolo.com/",
            "totalChapters": 19,
            "availableChapters": 19,
            "pendingChapters": 0,
            "lastUpdated": "2026-10-18"
        },
        "parts": parts_def,
        "chapters": all_chapters
    }

    out_file = os.path.join(repo_root, "assets", "content", "textbook-content.js")
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("/* FastAPI Study — Complete 19-Chapter Master Content Pack */\n")
        f.write("/* Authoritative textbook data compiled for offline, zero-auth local reading */\n\n")
        f.write("window.FASTAPI_STUDY_DATA = ")
        json.dump(master_data, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Successfully generated {out_file} ({os.path.getsize(out_file):,} bytes)")
    print(f"Total chapters: {len(all_chapters)}")
    for ch in all_chapters:
        q_count = len(ch['quiz']['mcqs']) if ch['quiz'] else 0
        tf_count = len(ch['quiz']['trueFalse']) if ch['quiz'] else 0
        sa_count = len(ch['quiz']['shortAnswer']) if ch['quiz'] else 0
        dbg_count = len(ch['quiz']['debugging']) if ch['quiz'] else 0
        status = f"Available ({ch['readTime']}, {len(ch['sections'])} sections, {q_count} MCQs, {tf_count} TF, {sa_count} SA, {dbg_count} Dbg)"
        print(f"  Ch {ch['id']:2d}: {ch['cleanTitle'][:42]:<42} -> {status}")

if __name__ == "__main__":
    main()
