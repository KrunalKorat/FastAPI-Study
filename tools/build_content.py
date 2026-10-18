import os, sys, re, json, html

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

def inline_format(text):
    text = html.escape(text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return text

def markdown_to_html(md_text, chapter_num):
    lines = md_text.split('\n')
    html_out = []
    in_code = False
    code_lang = ''
    code_lines = []
    in_list = False
    list_type = None
    in_table = False
    table_lines = []

    def flush_table():
        nonlocal in_table, table_lines
        if not in_table or not table_lines:
            return
        t_html = ['<div class="table-wrapper"><table class="textbook-table">']
        header_done = False
        for l in table_lines:
            l = l.strip()
            if not l.startswith('|'):
                continue
            cells = [c.strip() for c in l.split('|')[1:-1]]
            if all(set(c).issubset({'-', ':', ' '}) for c in cells):
                header_done = True
                continue
            if not header_done:
                t_html.append('<thead><tr>')
                for c in cells:
                    t_html.append(f'<th>{inline_format(c)}</th>')
                t_html.append('</tr></thead><tbody>')
                header_done = True
            else:
                t_html.append('<tr>')
                for c in cells:
                    t_html.append(f'<td>{inline_format(c)}</td>')
                t_html.append('</tr>')
        t_html.append('</tbody></table></div>')
        html_out.append(''.join(t_html))
        in_table = False
        table_lines = []

    def flush_list():
        nonlocal in_list, list_type
        if in_list:
            html_out.append(f'</{list_type}>')
            in_list = False
            list_type = None

    for line in lines:
        stripped = line.strip()

        # Fenced code block check
        if stripped.startswith('```'):
            if in_code:
                full_code = '\n'.join(code_lines)
                escaped_code = html.escape(full_code)
                display_lang = code_lang if code_lang else 'text'
                if display_lang in ('python', 'py'):
                    badge_lang = 'Python'
                elif display_lang in ('dockerfile', 'docker'):
                    badge_lang = 'Dockerfile'
                elif display_lang in ('bash', 'sh'):
                    badge_lang = 'Bash'
                elif display_lang in ('javascript', 'js'):
                    badge_lang = 'JavaScript'
                elif display_lang in ('html', 'jinja', 'jinja2'):
                    badge_lang = 'HTML / Template'
                elif display_lang == 'json':
                    badge_lang = 'JSON'
                else:
                    badge_lang = display_lang.capitalize() if display_lang else 'Architecture Diagram'

                is_diagram = any(sym in full_code for sym in ['──►', '┌──', '└──', '│', '───', '◄──', '├──']) or (display_lang in ('', 'text') and len(full_code.splitlines()) > 1 and not any(kw in full_code for kw in ['def ', 'import ', 'from ', 'class ', '=', 'return ']))

                code_block_class = "ascii-diagram-block" if is_diagram else "code-block"
                
                block_html = f'''<div class="code-block-wrapper {code_block_class}">
  <div class="code-header">
    <span class="code-lang-badge">{badge_lang}</span>
    <button class="code-copy-btn" aria-label="Copy code to clipboard" data-code="{html.escape(full_code, quote=True)}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      <span>Copy Code</span>
    </button>
  </div>
  <pre class="code-pre"><code class="language-{display_lang}">{escaped_code}</code></pre>
</div>'''
                html_out.append(block_html)
                in_code = False
                code_lang = ''
                code_lines = []
            else:
                flush_list()
                flush_table()
                in_code = True
                code_lang = stripped[3:].strip().lower()
                code_lines = []
            continue

        if in_code:
            code_lines.append(line)
            continue

        # Table row check
        if stripped.startswith('|') and stripped.endswith('|'):
            flush_list()
            in_table = True
            table_lines.append(stripped)
            continue
        elif in_table:
            flush_table()

        # Headings check
        h_match = re.match(r'^(#{1,6})\s+(.*)', stripped)
        if h_match:
            flush_list()
            flush_table()
            level = len(h_match.group(1))
            heading_text = h_match.group(2).strip()
            # If line is main chapter heading (# CHAPTER X: ...) we skip inside body because reader renders custom chapter hero
            if level == 1 and re.match(r'CHAPTER\s+\d+', heading_text, re.IGNORECASE):
                continue
            slug = slugify(f"ch{chapter_num}-{heading_text}")
            formatted_title = inline_format(heading_text)
            
            tag = f'h{min(level + 1, 5)}' if level > 1 else 'h2'
            html_out.append(f'<{tag} id="{slug}" class="textbook-heading textbook-{tag}"><a href="#{slug}" class="heading-anchor" aria-hidden="true">#</a>{formatted_title}</{tag}>')
            continue

        # Horizontal rule
        if stripped in ('---', '***', '___'):
            flush_list()
            flush_table()
            html_out.append('<hr class="textbook-divider" />')
            continue

        # Unordered list
        ul_match = re.match(r'^[\*\-]\s+(.*)', stripped)
        if ul_match:
            flush_table()
            if not in_list or list_type != 'ul':
                flush_list()
                in_list = True
                list_type = 'ul'
                html_out.append('<ul class="textbook-list">')
            html_out.append(f'<li>{inline_format(ul_match.group(1))}</li>')
            continue

        # Ordered list
        ol_match = re.match(r'^(\d+)\.\s+(.*)', stripped)
        if ol_match:
            flush_table()
            if not in_list or list_type != 'ol':
                flush_list()
                in_list = True
                list_type = 'ol'
                html_out.append('<ol class="textbook-list textbook-ordered-list">')
            html_out.append(f'<li>{inline_format(ol_match.group(1))}</li>')
            continue

        # Blockquote / Callout
        if stripped.startswith('>'):
            flush_list()
            flush_table()
            bq_text = stripped.lstrip('>').strip()
            html_out.append(f'<blockquote class="textbook-callout"><p>{inline_format(bq_text)}</p></blockquote>')
            continue

        # Empty line
        if not stripped:
            flush_list()
            flush_table()
            continue

        # Normal paragraph
        flush_list()
        flush_table()
        if stripped.startswith('*(') and stripped.endswith(')*'):
            html_out.append(f'<p class="textbook-subtitle-note">{inline_format(stripped[2:-2])}</p>')
        else:
            html_out.append(f'<p class="textbook-paragraph">{inline_format(stripped)}</p>')

    flush_list()
    flush_table()
    return '\n'.join(html_out)

def extract_sections(md_text, chapter_num):
    sections = []
    lines = md_text.split('\n')
    for line in lines:
        stripped = line.strip()
        h_match = re.match(r'^(#{2,4})\s+(.*)', stripped)
        if h_match:
            level = len(h_match.group(1))
            title = h_match.group(2).strip()
            # Clean markdown code markers from title
            clean_title = re.sub(r'[`*]', '', title)
            slug = slugify(f"ch{chapter_num}-{title}")
            sections.append({
                'id': slug,
                'title': clean_title,
                'level': level
            })
    return sections

def parse_mcqs(quiz_text, ans_text):
    mcq_sec_m = re.search(r'####? Multiple-Choice Questions[^\n]*\n(.*?)(?=\n####? |\n### |\Z)', quiz_text, re.DOTALL)
    if not mcq_sec_m:
        return []
    mcq_text = mcq_sec_m.group(1)
    q_blocks = re.split(r'\n(?=\d+\.\s)', '\n' + mcq_text)
    mcqs = []
    for qb in q_blocks:
        qb = qb.strip()
        if not qb:
            continue
        lines = qb.split('\n')
        q_line = lines[0].strip()
        num_m = re.match(r'^(\d+)\.\s*(.*)', q_line)
        if not num_m:
            continue
        q_num = int(num_m.group(1))
        q_text_lines = [num_m.group(2)]
        options = []
        in_options = False
        for l in lines[1:]:
            l_str = l.strip()
            opt_m = re.match(r'^\*?\s*([A-D])\)\s*(.*)', l_str)
            if opt_m:
                in_options = True
                options.append({'key': opt_m.group(1), 'text': opt_m.group(2).strip()})
            elif in_options:
                if options:
                    options[-1]['text'] += ' ' + l_str
            else:
                q_text_lines.append(l_str)
        
        q_title = ' '.join(q_text_lines).strip()
        
        # Match in answer key
        ans_pat = re.compile(rf'^{q_num}\.\s*\*\*([A-D])\*\*(?:\s*—\s*(.*))?', re.MULTILINE)
        ans_match = ans_pat.search(ans_text)
        corr_key = ans_match.group(1) if ans_match else ''
        expl = ans_match.group(2).strip() if ans_match and ans_match.group(2) else ''
        mcqs.append({
            'id': q_num,
            'question': q_title,
            'options': options,
            'correctAnswer': corr_key,
            'explanation': expl
        })
    return mcqs

def parse_tf(quiz_text, ans_text, ch_num):
    tf_m = re.search(r'####? True or False Questions[^\n]*\n(.*?)(?=\n####? |\n### |\Z)', quiz_text, re.DOTALL)
    if not tf_m:
        return []
    tf_text = tf_m.group(1).strip()
    q_blocks = re.split(r'\n(?=\d+\.\s)', '\n' + tf_text)
    tfs = []
    
    tf_ans_m = re.search(r'####? True/?False Answers[^\n]*\n(.*?)(?=\n####? |\n### |\Z)', ans_text, re.DOTALL)
    tf_ans_block = tf_ans_m.group(1) if tf_ans_m else ''
    
    ch11_tf_m = re.search(r'\(True/False:\s*(.*?)\)', ans_text)
    ch11_tf_dict = {}
    if ch11_tf_m:
        items = re.findall(r'(\d+)\.\s*(True|False)(?:\s*\[(.*?)\])?', ch11_tf_m.group(1))
        for num_s, val_s, expl_s in items:
            ch11_tf_dict[int(num_s)] = {
                'correct': val_s == 'True',
                'explanation': expl_s.strip() if expl_s else ''
            }

    for qb in q_blocks:
        qb = qb.strip()
        if not qb:
            continue
        m = re.match(r'^(\d+)\.\s*(.*)', qb, re.DOTALL)
        if not m:
            continue
        q_num = int(m.group(1))
        q_text = m.group(2).strip()
        
        corr_val = None
        expl = ''
        if ch_num == 11 and q_num in ch11_tf_dict:
            corr_val = ch11_tf_dict[q_num]['correct']
            expl = ch11_tf_dict[q_num]['explanation']
        elif tf_ans_block:
            a_pat = re.compile(rf'^{q_num}\.\s*\*\*(True|False)\*\*(?:\s*—\s*(.*))?', re.MULTILINE)
            am = a_pat.search(tf_ans_block)
            if am:
                corr_val = (am.group(1) == 'True')
                expl = am.group(2).strip() if am.group(2) else ''
        
        tfs.append({
            'id': q_num,
            'question': q_text,
            'correctAnswer': corr_val,
            'explanation': expl
        })
    return tfs

def parse_short_answer(quiz_text, ans_text):
    sa_m = re.search(r'####? Short-Answer Questions[^\n]*\n(.*?)(?=\n####? |\n### |\Z)', quiz_text, re.DOTALL)
    if not sa_m:
        return []
    sa_text = sa_m.group(1).strip()
    q_blocks = re.split(r'\n(?=\d+\.\s)', '\n' + sa_text)
    
    sa_ans_m = re.search(r'####? Short-Answer Solutions[^\n]*\n(.*?)(?=\n####? |\n### |\Z)', ans_text, re.DOTALL)
    sa_ans_block = sa_ans_m.group(1) if sa_ans_m else ''
    
    items = []
    for qb in q_blocks:
        qb = qb.strip()
        if not qb:
            continue
        m = re.match(r'^(\d+)\.\s*(.*)', qb, re.DOTALL)
        if not m:
            continue
        q_num = int(m.group(1))
        q_text = m.group(2).strip()
        
        a_pat = re.compile(rf'^{q_num}\.\s*(.*?)(?=\n\d+\.\s|\Z)', re.DOTALL | re.MULTILINE)
        am = a_pat.search(sa_ans_block)
        model_ans = am.group(1).strip() if am else ''
        items.append({
            'id': q_num,
            'question': q_text,
            'modelAnswer': model_ans
        })
    return items

def parse_debugging(quiz_text, ans_text):
    dbg_m = re.search(r'####? Code Reading & Debugging Questions[^\n]*\n(.*?)(?=\n####? |\n### |\Z)', quiz_text, re.DOTALL)
    if not dbg_m:
        return []
    dbg_text = dbg_m.group(1).strip()
    q_blocks = re.split(r'\n(?=\d+\.\s)', '\n' + dbg_text)
    
    dbg_ans_m = re.search(r'####? Debugging Solutions[^\n]*\n(.*?)(?=\n####? |\n### |\Z)', ans_text, re.DOTALL)
    dbg_ans_block = dbg_ans_m.group(1) if dbg_ans_m else ''
    
    items = []
    for qb in q_blocks:
        qb = qb.strip()
        if not qb:
            continue
        m = re.match(r'^(\d+)\.\s*(.*)', qb, re.DOTALL)
        if not m:
            continue
        q_num = int(m.group(1))
        content = m.group(2).strip()
        
        a_pat = re.compile(rf'^{q_num}\.\s*(.*?)(?=\n\d+\.\s|\Z)', re.DOTALL | re.MULTILINE)
        am = a_pat.search(dbg_ans_block)
        sol = am.group(1).strip() if am else ''
        items.append({
            'id': q_num,
            'prompt': content,
            'modelSolution': sol
        })
    return items

def parse_challenges(quiz_text):
    ch_m = re.search(r'####? Practical Coding Challenges[^\n]*\n(.*?)(?=\n####? |\n### |\Z)', quiz_text, re.DOTALL)
    if not ch_m:
        return []
    ch_text = ch_m.group(1).strip()
    q_blocks = re.split(r'\n(?=\d+\.\s)', '\n' + ch_text)
    items = []
    for qb in q_blocks:
        qb = qb.strip()
        if not qb:
            continue
        m = re.match(r'^(\d+)\.\s*(.*)', qb, re.DOTALL)
        if not m:
            continue
        items.append({
            'id': int(m.group(1)),
            'prompt': m.group(2).strip()
        })
    return items

def main():
    with open('fastapi-study-content-pack.md', 'r', encoding='utf-8') as f:
        raw_text = f.read()

    parts_def = [
        {
            "id": 1,
            "title": "Part 1 — FastAPI Fundamentals",
            "description": "Core web concepts, templating, type validation, and Pydantic v2 schemas.",
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
        (1, 1, "Getting Started — Web App & REST API Basics", False, "Video Part 1"),
        (1, 2, "Static Files & Jinja2 Templates — Server-Side Rendering", False, "Video Part 2"),
        (1, 3, "Path Parameters — Type Validation & Custom Error Handlers", False, "Video Part 3"),
        (1, 4, "Data Validation & Schemas with Pydantic v2", False, "Video Part 4"),
        (2, 5, "Relational Databases — SQLAlchemy Engine, Sessions & ORM Models", True, "Video Part 5"),
        (2, 6, "Completing CRUD Operations — PUT, PATCH, and DELETE Mechanics", True, "Video Part 6"),
        (3, 7, "Asynchronous Python — `async`, `await`, and Event Loop Concurrency", True, "Video Part 7"),
        (3, 8, "Enterprise Architecture — Modularization with `APIRouter`", True, "Video Part 8"),
        (3, 9, "Connecting Interactive Frontends — Fetch API, DOM Manipulation & CORS", True, "Video Part 9"),
        (4, 10, "Authentication & Security — Password Hashing & OAuth2 JWT Tokens", True, "Video Part 10"),
        (4, 11, "Authorization & Permissions — Current User Injection & RBAC", True, "Video Part 11"),
        (5, 12, "File Uploads & Media Handling — Pillow Image Resizing & Disk Storage", True, "Video Part 12"),
        (5, 13, "Query Pagination, Filtering & Search", True, "Video Part 13"),
        (5, 14, "Asynchronous Email & Background Tasks — Non-Blocking Password Resets", True, "Video Part 14"),
        (6, 15, "Production Databases — PostgreSQL & Alembic Migration Management", True, "Video Part 15"),
        (6, 16, "Cloud Object Storage — AWS S3 Integration with Boto3", True, "Video Part 16"),
        (7, 17, "Enterprise API Testing — Pytest, HTTPX AsyncClient & Moto Mocking", True, "Video Part 17"),
        (7, 18, "Linux Production VPS Deployment — Nginx, Systemd, Gunicorn & SSL", True, "Video Part 18"),
        (7, 19, "Containerization — Docker, Docker Compose & Cloud Serverless Deployment", True, "Video Part 19"),
    ]

    all_chapters = []

    for part_id, ch_num, title, available, video_ref in chapters_catalog:
        part_info = next(p for p in parts_def if p['id'] == part_id)
        
        if not available:
            all_chapters.append({
                "id": ch_num,
                "partId": part_id,
                "partTitle": part_info["title"],
                "number": ch_num,
                "title": title,
                "cleanTitle": re.sub(r'[`*]', '', title),
                "available": False,
                "videoRef": video_ref,
                "readTime": "Pending",
                "missingNotice": "This chapter title appears in the master curriculum, but its source text was not present in the four uploaded source text files. This chapter is visibly marked as unavailable until the original text content is supplied.",
                "sections": [],
                "htmlContent": "",
                "rawMarkdown": "",
                "quiz": None
            })
            continue

        # Locate chapter start
        start_pat = re.compile(rf'# CHAPTER {ch_num}:[^\n]*', re.IGNORECASE)
        m_start = start_pat.search(raw_text)
        if not m_start:
            print(f"Error: Could not find start for Chapter {ch_num}")
            continue

        if ch_num < 19:
            next_pat = re.compile(rf'# CHAPTER {ch_num+1}:[^\n]*', re.IGNORECASE)
            m_next = next_pat.search(raw_text)
            raw_ch = raw_text[m_start.start():m_next.start()] if m_next else raw_text[m_start.start():]
        else:
            raw_ch = raw_text[m_start.start():]

        # Extract quiz and answer key
        quiz_pat = re.compile(r'(\n#+ (?:CHAPTER\s+\d+\s+)?QUIZ[^\n]*|\n###+ \d+\.\d+ Chapter \d+ Quiz[^\n]*)', re.IGNORECASE)
        m_quiz = quiz_pat.search(raw_ch)

        if m_quiz:
            body_md = raw_ch[:m_quiz.start()].strip()
            quiz_and_ans = raw_ch[m_quiz.start():].strip()
            ans_pat = re.compile(r'(\n#+ (?:CHAPTER\s+\d+\s+)?ANSWER KEY[^\n]*|\n###+ \d+\.\d+ Chapter \d+ Answer Key[^\n]*|\n###+ Chapter \d+ Answer Key[^\n]*|\n###+ Answer Key[^\n]*)', re.IGNORECASE)
            m_ans = ans_pat.search(quiz_and_ans)
            quiz_text = quiz_and_ans[:m_ans.start()].strip() if m_ans else quiz_and_ans
            ans_text = quiz_and_ans[m_ans.start():].strip() if m_ans else ''

            mcqs = parse_mcqs(quiz_text, ans_text)
            tfs = parse_tf(quiz_text, ans_text, ch_num)
            sas = parse_short_answer(quiz_text, ans_text)
            dbgs = parse_debugging(quiz_text, ans_text)
            chals = parse_challenges(quiz_text)

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

        # Calculate word count & reading time
        words = len(re.findall(r'\b\w+\b', body_md))
        read_time_mins = max(2, round(words / 180))

        # Extract section headings
        sections = extract_sections(body_md, ch_num)
        
        # Render markdown to semantic HTML
        body_html = markdown_to_html(body_md, ch_num)

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

    # Build master data object
    output_data = {
        "metadata": {
            "siteName": "FastAPI Study",
            "bookTitle": "Modern Python FastAPI & REST API Engineering",
            "bookSubtitle": "The Complete Textbook & Quiz Book",
            "seriesBasis": "Based on Corey Schafer's Python FastAPI Tutorial Series (19 Videos)",
            "creatorEmail": "krunalkorat2004@gmail.com",
            "totalChapters": 19,
            "availableChapters": 15,
            "pendingChapters": 4,
            "lastUpdated": "2026-10-18"
        },
        "parts": parts_def,
        "chapters": all_chapters
    }

    os.makedirs("assets/content", exist_ok=True)
    out_file = "assets/content/textbook-content.js"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("/* FastAPI Study — Master Content Pack */\n")
        f.write("/* Authoritative textbook data generated from fastapi-study-content-pack.md */\n\n")
        f.write("window.FASTAPI_STUDY_DATA = ")
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Successfully generated {out_file} ({os.path.getsize(out_file):,} bytes)")
    print(f"Total chapters: {len(all_chapters)}")
    for ch in all_chapters:
        q_count = len(ch['quiz']['mcqs']) if ch['quiz'] else 0
        status = f"Available ({ch['readTime']}, {len(ch['sections'])} sections, {q_count} MCQs)" if ch['available'] else "[Pending Content]"
        print(f"  Ch {ch['id']:2d}: {ch['cleanTitle'][:45]:<45} -> {status}")

if __name__ == '__main__':
    main()
