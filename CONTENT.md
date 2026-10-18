# FastAPI Study — Project Content & AI Implementation Guide

## 1. Project Overview

**Project name:** FastAPI Study  
**Purpose:** A simple, reliable learning website for studying FastAPI through a textbook-style reading experience, quizzes, and a YouTube video curriculum.  
**Repository:** https://github.com/KrunalKorat/FastAPI-Study.git  
**Deployment target:** Vercel

This file is the main project brief for the AI coding agent. Follow it before changing the codebase. Inspect the existing project first, preserve working functionality, and do not replace real content with placeholder text.

## 2. Main Requirements

- Build a minimalistic, easy-to-use learning interface.
- Use a blue color palette and **light mode only**.
- Keep the interface eye-comfortable: readable typography, sensible line length, restrained contrast, generous whitespace, and no unnecessary animation.
- Avoid clutter, oversized cards, excessive decoration, and redundant navigation.
- The textbook/reading area must show actual learning content when opened.
- Content must load reliably. Do not leave blank screens, empty routes, dead buttons, or placeholder sections.
- Include a quiz/practice experience connected to the learning material.
- Place the **YouTube video curriculum at the end** of the learning experience/page/navigation flow, after the textbook and learning/practice content.
- Use the official FastAPI documentation as the primary reference for FastAPI concepts: https://fastapi.tiangolo.com/
- Use the supplied YouTube video URLs if they exist in the repository, project brief, or user-provided data. Do not invent video IDs or pretend a video URL is valid.
- Keep content and UI data organized so it is easy to maintain.
- Check the existing code before creating or deleting files. Avoid unnecessary `.py` files and unnecessary dependencies.
- Keep the public repository up to date after completing the requested implementation.

## 3. Learning Experience and Suggested Order

The site should feel like a structured course, not a generic dashboard.

1. **Home / Course overview**
   - Explain what the learner will study.
   - Show clear progress or a simple course outline.
   - Provide a prominent action to continue reading.
2. **Textbook / Read**
   - Present complete, structured lesson content.
   - Include headings, explanations, code examples, and practical notes.
   - Provide clear previous/next lesson navigation.
3. **Practice / Quiz**
   - Offer questions relevant to the material.
   - Show answer feedback and a short explanation.
   - Do not mark an answer correct without checking it against the actual question's answer key.
4. **YouTube videos**
   - Put the video curriculum at the end.
   - Use the supplied YouTube URLs and titles when available.
   - Show each video's title, topic/chapter number, and a working embed or external YouTube link.
   - If a URL is missing or invalid, label it as needing a URL rather than fabricating one.

## 4. Curriculum: Chapters / Videos 1–19

Use this order for the supplied 19-part curriculum. Keep each lesson connected to its corresponding video when a valid video URL is available.

1. FastAPI basics
2. Templates and static files
3. Path parameters
4. Pydantic and data validation
5. SQLAlchemy
6. CRUD operations
7. Asynchronous programming
8. APIRouter and project organization
9. Fetch and CORS
10. JWT authentication
11. Authorization and role-based access control (RBAC)
12. File uploads and Pillow
13. Pagination
14. Background tasks and email
15. PostgreSQL and Alembic migrations
16. Amazon S3 / object storage
17. Testing
18. VPS deployment
19. Docker

For each chapter, include:
- Learning objectives
- A beginner-friendly explanation
- Relevant code examples
- A practical example or small exercise
- Common mistakes / troubleshooting notes
- A short recap
- Quiz questions with a verified answer key
- The related YouTube video link, if supplied and valid

Do not claim that a topic or feature is implemented if the repository does not contain it.

## 5. Textbook Content Rules

Use the official FastAPI documentation as the primary reference:
https://fastapi.tiangolo.com/

Write explanations in original, clear language. Do not copy large passages verbatim from the documentation. Keep terminology accurate and include source links for further reading.

At minimum, the textbook should cover these core FastAPI concepts where relevant to the course:

- What FastAPI is and when to use it
- Installing dependencies and running a development server
- Creating an application and defining routes
- HTTP methods and request/response behavior
- Path parameters and query parameters
- Request bodies and Pydantic models
- Validation and useful error responses
- Response models and status codes
- Dependency injection
- Organizing routes with APIRouter
- Async and await fundamentals
- Authentication and authorization concepts
- Testing endpoints
- Deployment considerations

The 19-part curriculum also includes database, frontend integration, file storage, background processing, and deployment topics. Explain these in the context of building a FastAPI application, and distinguish FastAPI features from features supplied by third-party libraries or infrastructure.

## 6. UI / UX Design System

### Visual direction
- Minimal, modern, calm, and documentation-focused.
- Blue is the primary accent color.
- Light mode only.
- Comfortable reading surface with dark, readable body text on a light background.
- Use color to indicate hierarchy and interaction, not as decoration.
- Avoid excessive gradients, glassmorphism, glowing effects, and heavy shadows.

### Layout
- Keep navigation compact and predictable.
- Use a readable textbook column with a reasonable maximum width.
- Keep lesson navigation visible and easy to understand.
- Make the site responsive for desktop, tablet, and mobile.
- Keep the video section at the end, after the main learning material and quiz/practice content.

### Accessibility
- Use semantic headings in logical order.
- Ensure keyboard navigation and visible focus states.
- Give controls descriptive labels.
- Maintain adequate text contrast.
- Do not communicate status using color alone.
- Make embedded videos usable on small screens.

## 7. Reliability and Content Loading

Content must not disappear because of a missing import, route, network response, or empty data file.

- Identify the current content source and keep it consistent.
- If content is stored locally, ensure all referenced files exist and imports resolve.
- If remote content is fetched, implement loading, error, and empty states.
- Do not silently swallow errors.
- Do not display a blank reading page when a lesson fails to load.
- Provide a useful fallback message and a retry action where appropriate.
- Avoid depending on live scraping of the FastAPI documentation at runtime. Prefer maintained local lesson content with official documentation links.
- Do not hard-code fake progress, fake quiz scores, fake reviews, or fake video metadata.
- Verify every internal route and interactive control.

## 8. Data Structure Guidance

Follow the existing project architecture when practical. If lesson data needs a consistent structure, use a maintainable schema such as:

- `id`
- `title`
- `chapterNumber`
- `summary`
- `objectives`
- `sections`
- `codeExamples`
- `exercise`
- `commonMistakes`
- `recap`
- `quiz`
- `officialReferences`
- `youtubeUrl` (optional; only a verified supplied URL)

Keep video metadata separate from lesson prose if that makes the project easier to maintain. Do not duplicate the same content across multiple files without a clear reason.

## 9. YouTube Video Section — Must Be at the End

The 19-part YouTube curriculum must appear after the textbook and quiz/practice material.

Requirements:
- Preserve the user's supplied video order and titles.
- Use only URLs actually supplied or verified from the existing project data.
- Do not make up YouTube links, IDs, titles, durations, or thumbnails.
- Use responsive embeds when a valid YouTube URL supports embedding.
- Provide a direct “Watch on YouTube” link as a fallback.
- If embeds are blocked, the direct link should still work.
- Show a clear unavailable/missing-link state if a video URL is not available.
- Ensure the video list is not placed above or in the middle of the textbook content.

## 10. Repository and Implementation Workflow

1. Inspect the repository and identify the current framework, scripts, routes, content files, and existing functionality.
2. Read this file and map each requirement to the existing code.
3. Create a short `tasks.md` checklist if one does not already exist; update it as work progresses.
4. Implement in small, verifiable steps.
5. Run the available lint, type-check, test, and build commands.
6. Fix errors introduced by the changes.
7. Test the textbook route, lesson navigation, quizzes, video links, responsive layout, and error states.
8. Do not delete working features or configuration without a clear reason.
9. Commit and push the completed changes to the existing public repository:
   https://github.com/KrunalKorat/FastAPI-Study.git
10. Report what changed, tests run, build status, and any remaining issue. Never claim a push or deployment succeeded unless it actually did.

## 11. Acceptance Checklist

- [ ] The site uses a minimalistic blue design and light mode only.
- [ ] The interface is readable and comfortable for long study sessions.
- [ ] Opening “Read textbook” displays real lesson content.
- [ ] All 19 curriculum chapters are represented in the correct order.
- [ ] Lessons contain explanations and useful examples, not placeholder copy.
- [ ] Quiz answers are checked against a real answer key and feedback is shown.
- [ ] YouTube videos appear at the end of the learning experience.
- [ ] Video links are supplied/verified; no fabricated links or metadata.
- [ ] Missing content and loading failures have useful states instead of blank pages.
- [ ] Navigation and buttons work.
- [ ] Responsive layout and basic accessibility are checked.
- [ ] Production build succeeds, or any pre-existing blocker is clearly documented.
- [ ] Changes are pushed to the specified GitHub repository only after verifying the result.

## 12. Rules for the AI Coding Agent

- Treat this document as the project source of truth.
- Inspect the existing code before making changes.
- Do not guess missing URLs, credentials, API keys, or content.
- Do not use placeholder content to disguise incomplete functionality.
- Do not redesign the site into a busy dashboard.
- Do not switch away from the blue, light-mode, minimal reading-focused direction.
- Keep the YouTube video section at the end.
- Prefer simple, maintainable solutions over unnecessary abstractions.
- If a requirement cannot be completed with the available code or supplied data, explain the exact blocker and what is needed.
- Verify behavior rather than relying only on visual appearance.
