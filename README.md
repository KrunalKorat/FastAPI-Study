# FastAPI Study — Modern Python FastAPI & REST API Engineering

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Static Site](https://img.shields.io/badge/Static-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)](#technology-stack)
[![Zero Tracking](https://img.shields.io/badge/Privacy-Zero%20Tracking-green.svg)](#privacy-and-cookie-behavior)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel%20Ready-black.svg)](#vercel-deployment-instructions)

**FastAPI Study** is an open-source, digital textbook and assessment website dedicated to mastering FastAPI and modern Python REST API architecture.

Built entirely with **HTML5, CSS3, and Vanilla JavaScript**, it provides a distraction-free, long-form reading experience paired with comprehensive chapter quizzes and instant automated grading—with an absolute zero-persistence privacy architecture.

- **GitHub Repository**: [https://github.com/KrunalKorat/FastAPI-Study](https://github.com/KrunalKorat/FastAPI-Study)
- **Author & Maintainer**: Krunal Korat ([krunalkorat2004@gmail.com](mailto:krunalkorat2004@gmail.com))
- **Curriculum Origin**: Based on the 19-part tutorial curriculum by Corey Schafer.

---

## 📚 Table of Contents

- [Project Overview](#project-overview)
- [Main Features](#main-features)
- [Technology Stack](#technology-stack)
- [Project Directory Structure](#project-directory-structure)
- [Local Development Instructions](#local-development-instructions)
- [How to Add or Update Textbook Content](#how-to-add-or-update-textbook-content)
- [How the Quiz System Works](#how-the-quiz-system-works)
- [Privacy and Cookie Behavior](#privacy-and-cookie-behavior)
- [Vercel Deployment Instructions](#vercel-deployment-instructions)
- [GitHub Contribution Instructions](#github-contribution-instructions)
- [Known Content Limitations](#known-content-limitations)
- [Open-Source License](#open-source-license)

---

## 🌟 Project Overview

FastAPI is one of the most powerful, high-performance web frameworks in the modern Python ecosystem. **FastAPI Study** packages a complete 19-chapter engineering curriculum into a digital textbook reader that feels like reading a physical hardback book, augmented with interactive self-assessment quizzes, real-time code copy tools, and instant client search.

The project is **100% static** and runs completely within the browser. It requires no backend server, no Python runtime in production, no databases, and no external tracking frameworks.

---

## ✨ Main Features

1. **Digital Book Reader (`textbook.html`)**:
   - **Warm Ivory Editorial Canvas** (`#F7F3EB` light mode) and deep dark reading mode (`#0D0F12`).
   - **Typography**: Playfair Display for editorial headings, Poppins for interface text and body reading, and JetBrains Mono for code.
   - **Interactive Table of Contents**: Collapsible drawer with active scroll spy, live chapter search filtering, and section jumps.
   - **Reading Preferences Toolbar**: Real-time font size scaler (Small to XL), canvas width adjuster (Standard, Wide, Full), theme toggle, and **Distraction-Free Mode** (`Esc` to exit).
   - **Copyable Code Blocks**: Monospace code blocks with syntax highlighting classes and one-click clipboard copying.
   - **ASCII Architectural Diagrams**: Responsive, pre-formatted cards for system topologies and database ERDs.

2. **Interactive In-Memory Quiz Runner (`quiz.html`)**:
   - Comprehensive quizzes available for Chapters 5 through 18.
   - Supports 5 assessment modalities: **Multiple-Choice Questions (MCQs)**, **True/False**, **Short-Answer reflections**, **Code Reading & Debugging**, and **Practical Coding Challenges**.
   - **Instant Automated Grading**: Automated scoring for MCQs and True/False with animated SVG score reveals and percentage badges.
   - **Deep Architectural Explanations**: Review mode displays your answer alongside the authoritative correct answer and comprehensive textbook rationale.
   - **Model Solutions**: Side-by-side comparison for subjective debugging and coding challenges.

3. **Distinctive Cookie Consent Experience ("A little cookie question 🍪")**:
   - Tasteful, compact banner matching the warm editorial palette.
   - Three transparent choices: **Accept optional cookies**, **Essential only**, and **Cookie preferences**.
   - Complete explanation on a dedicated [Cookie Policy](cookies.html) page with interactive controls to inspect and clear stored preferences.

4. **Instant Client-Side Search (`search.js`)**:
   - Universal search dialog triggered by `Ctrl+K`, `/`, or the header search button.
   - Rapidly indexes chapter titles, section headers, and full-text paragraphs.
   - Contextual keyword snippets with `<mark>` highlighting and direct keyboard navigation (`↑`, `↓`, `Enter`, `Esc`).

5. **Complete Legal & Communication Infrastructure**:
   - [Terms and Conditions](terms.html) defining acceptable educational use, disclaimer of liability, and third-party IP acknowledgments.
   - [Privacy Policy](privacy-policy.html) detailing zero quiz storage, local preferences, and static hosting considerations.
   - [Cookie Policy & Preferences](cookies.html) with transparent classification of client storage keys.
   - [Contact](contact.html) with direct `mailto:krunalkorat2004@gmail.com` link and one-click address copy.

---

## 🛠 Technology Stack

- **Markup**: HTML5 (Semantic elements: `<main>`, `<article>`, `<header>`, `<nav>`, `<aside>`, `<footer>`, `<section>`)
- **Styles**: CSS3 (Vanilla CSS with custom properties / design tokens, Flexbox, CSS Grid, smooth transitions, and responsive media queries)
- **Scripting**: Vanilla JavaScript (ES6+, modular architecture, zero bundler, zero dependencies)
- **Typography**:
  - Headings: *Playfair Display* (Google Fonts)
  - Interface & Body: *Poppins* (Google Fonts)
  - Code & Monospace: *JetBrains Mono* (Google Fonts)
- **Icons**: Handcrafted, accessible inline SVG icons
- **Hosting / Deployment**: Static hosting on Vercel or any static file server

---

## 📂 Project Directory Structure

```text
FastApi Study/
├── index.html                      # Homepage with hero, animated 3D book cover, curriculum & open-source section
├── textbook.html                   # Editorial digital textbook reader & reading toolbar
├── quiz.html                       # In-memory chapter quiz assessment engine & review modal
├── cookies.html                    # Cookie Policy & interactive consent management page
├── privacy-policy.html             # Transparent Privacy Policy detailing zero-tracking guarantee
├── terms.html                      # Terms and Conditions of educational use & intellectual property
├── contact.html                    # Contact page with verified direct mailto links
├── LICENSE                         # Permissive MIT License
├── README.md                       # Comprehensive project documentation & deployment guide
├── vercel.json                     # Vercel static routing configuration (clean URLs & asset caching)
├── .gitignore                      # Git ignore patterns for OS, Python, and editor artifacts
├── assets/
│   ├── css/
│   │   ├── base.css                # Global design tokens, typography, header, footer, modal, & cookie banner
│   │   ├── home.css                # Homepage hero, animated book canvas, curriculum parts, & open-source card
│   │   ├── reader.css              # Reading canvas, collapsible TOC, progress bar, & toolbar styling
│   │   ├── quiz.css                # Quiz stepper, radio options, score circles, & review explanations
│   │   └── pages.css               # Legal pages (Terms, Privacy, Cookies) and Contact page styling
│   ├── js/
│   │   ├── animations.js           # Page loader animation, 3D book cover tilt, and toast notification engine
│   │   ├── app.js                  # Global application controller, theme toggling, mobile drawer, code copy, & cookie consent
│   │   ├── search.js               # Client-side full-text search engine with keyboard shortcut listening
│   │   ├── reader.js               # Dynamic chapter reader, scroll spy, reading progress, and display controls
│   │   └── quiz.js                 # In-memory quiz engine, automated grading, score calculation, & answer review
│   └── content/
│       └── textbook-content.js     # Authoritative curriculum dataset (19 chapters, sections, code blocks, & quizzes)
└── tools/
    └── build_content.py            # Content extraction pipeline to compile Markdown sources into textbook-content.js
```

---

## 💻 Local Development Instructions

Because FastAPI Study is a pure static web application, no compilation, npm install, or build pipeline is needed.

### Method 1: Python Built-in Server (Recommended)
Python comes installed on most developer systems:
```bash
# In the repository root directory:
python -m http.server 8000
```
Visit `http://localhost:8000` in your web browser.

### Method 2: Node.js `npx serve`
If you have Node.js installed:
```bash
npx serve .
```

### Method 3: Direct File Execution
You can also open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Brave, Safari) using `file://` protocol. All navigation links and assets use relative paths.

---

## 📝 How to Add or Update Textbook Content

All curriculum text, code examples, quizzes, and answer explanations live in `assets/content/textbook-content.js`.

### Data Schema Overview
The dataset exposes a single global object: `window.FASTAPI_STUDY_DATA`:
```javascript
window.FASTAPI_STUDY_DATA = {
  parts: [
    { id: 1, title: "Part 1 — FastAPI Fundamentals", description: "..." }
  ],
  chapters: [
    {
      id: 5,
      partId: 2,
      cleanTitle: "Database Connection and SQLAlchemy Setup",
      videoRef: "Video 5 — SQLAlchemy Connection and Engine",
      readTime: "24 min read",
      available: true,
      sections: [
        {
          id: "sec-5-1",
          title: "Architecture & Engine Setup",
          paragraphs: [
            "Section explanation text...",
            {
              type: "code",
              language: "python",
              filename: "database.py",
              code: "from sqlalchemy import create_engine\n..."
            }
          ]
        }
      ],
      quiz: {
        mcqs: [
          {
            id: "ch5-mcq-1",
            question: "What is the primary role of create_engine?",
            options: ["A...", "B...", "C...", "D..."],
            answer: "A",
            explanation: "Detailed line-by-line explanation..."
          }
        ],
        trueFalse: [ ... ],
        shortAnswer: [ ... ],
        debugging: [ ... ],
        codingChallenge: [ ... ]
      }
    }
  ]
};
```

### Updating Content via the Extractor Script
To update from a master Markdown source pack:
1. Place or edit your source Markdown content.
2. Run the extraction utility:
   ```bash
   python tools/build_content.py
   ```
3. The script parses chapter headers, code snippets, quizzes, and answer keys, validating data structures and regenerating `assets/content/textbook-content.js`.

---

## 🎯 How the Quiz System Works

1. **State Isolation**: When a chapter is selected on `quiz.html`, `quiz.js` loads the chapter's quiz object from `window.FASTAPI_STUDY_DATA.chapters`.
2. **Volatile Memory Storage**: User responses are collected in a transient JavaScript object (`userResponses`) held in active browser tab memory.
3. **Automated Scoring**:
   - For Multiple-Choice Questions (MCQs) and True/False questions, each correct answer adds points to the final tally.
   - Upon clicking **Submit Quiz for Grading**, the grading algorithm compares user choices to authoritative answers.
4. **Answer Key Breakdown**:
   - An animated circular score reveal showcases the raw score and percentage.
   - A question-by-question review interface opens, color-coding correct and incorrect selections.
   - The authoritative explanation transcribed directly from the textbook is shown below each question.
   - Subjective challenges (Short Answer, Code Debugging, Coding Challenge) present the textbook model answer for self-auditing.

---

## 🔒 Privacy and Cookie Behavior

FastAPI Study is engineered around a strict **zero-tracking privacy model**:

- **No Quiz Data Persistence**: Under no circumstance are quiz answers, scores, attempts, or progress saved to `localStorage`, `sessionStorage`, `IndexedDB`, or cookies. Refreshing or closing the tab completely erases all quiz state.
- **Minimal Local Storage**: The website only stores two functional preferences:
  1. `fastapi_study_theme`: Stores `'light'` or `'dark'` to maintain visual reading comfort.
  2. `fastapi_cookie_consent`: Stores `'accepted'` or `'essential'` to remember whether the cookie banner was dismissed.
- **Zero Third-Party Trackers**: No Google Analytics, no Facebook Pixels, no advertising telemetry, and no cross-site user tracking scripts are loaded.
- **Essential Functionality**: Choosing "Essential only" on the cookie consent banner preserves 100% of website capabilities (the reader, quizzes, search, and code copying all continue to work).

---

## 🚀 Vercel Deployment Instructions

The repository is pre-configured with a production-ready `vercel.json` for static deployment.

### Deploying via Vercel Dashboard (Git Integration)
1. Push your repository to GitHub: `https://github.com/KrunalKorat/FastAPI-Study.git`.
2. Open the [Vercel Dashboard](https://vercel.com/) and click **Add New** → **Project**.
3. Import the `FastAPI-Study` repository.
4. In the Project Configuration:
   - **Framework Preset**: Select `Other`
   - **Root Directory**: `./`
   - **Build Command**: *(Leave empty)*
   - **Output Directory**: *(Leave empty)*
5. Click **Deploy**. Vercel will instantly serve the static website with worldwide edge caching.

### Deploying via Vercel CLI
```bash
# Install Vercel CLI globally if not already installed
npm install -g vercel

# Run deployment from root folder
vercel

# Deploy to production
vercel --prod
```

### Static Configuration Details (`vercel.json`)
```json
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🤝 GitHub Contribution Instructions

We welcome contributions from fellow Python and FastAPI developers!

1. **Fork the Repository**:
   Click the **Fork** button at [https://github.com/KrunalKorat/FastAPI-Study](https://github.com/KrunalKorat/FastAPI-Study).
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/<your-username>/FastAPI-Study.git
   cd FastAPI-Study
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/chapter-improvement
   ```
4. **Make Your Changes**:
   - Ensure clean HTML, CSS, and Vanilla JS formatting.
   - Maintain the existing editorial color palette and typography.
   - Verify that all relative links and quiz engines function correctly.
5. **Commit and Push**:
   ```bash
   git add .
   git commit -m "docs: improve Chapter 10 OAuth2 token flow explanation"
   git push origin feature/chapter-improvement
   ```
6. **Open a Pull Request**:
   Navigate to the original repository and open a Pull Request with a clear description of the improvements.

---

## ⚠️ Known Content Limitations

- **Chapters 1 through 4**: The master syllabus includes Part 1: FastAPI Fundamentals (Chapters 1–4). The original source files supplied for compilation commenced from Chapter 5. To maintain strict educational honesty without inventing counterfeit material, Chapters 1–4 are explicitly marked as *Awaiting Content Upload* in both the curriculum index and chapter reader. Community contributions of authoritative source text for these four chapters are welcome.
- **Chapter 19 (Production Docker)**: Focuses exclusively on containerizing the FastAPI application with a multi-stage Dockerfile and entrypoint script; no quiz was authored for this concluding chapter in the original source series.

---

## 📄 Open-Source License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

```text
MIT License

Copyright (c) 2026 Krunal Korat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

*Disclaimer: FastAPI is a registered open-source project by Sebastián Ramírez. Python is a trademark of the Python Software Foundation. FastAPI Study is an independent educational initiative.*
