# CHAPTER 2: Templates and Static Files
*(Corresponding to Video Part 2: Static Files & Jinja2 Templates — Server-Side Rendering)*

### 2.1 Server-Side Rendering in Modern Python
While FastAPI is primarily celebrated as a high-performance REST and JSON API engine, it also provides first-class support for **Server-Side Rendering (SSR)**. In SSR applications, the server constructs complete HTML pages populated with dynamic database records before dispatching the response to the client browser.

FastAPI leverages **Jinja2**, Python's most popular templating engine, combined with Starlette's `StaticFiles` mounting system. This allows developers to construct full-stack applications with server-rendered dashboards, landing pages, and administration panels without requiring a separate Node.js frontend.

```
Client Browser ──► GET /dashboard
                     │
FastAPI Server       ├─► 1. Query Database for user records
                     ├─► 2. Pass data dictionary into Jinja2 Template
                     ├─► 3. Jinja2 interpolates variables into HTML
                     │
Client Browser ◄────┴─► Receives complete HTML with embedded CSS & JS
```

### 2.2 Serving Static Assets (`StaticFiles`)
Static assets — such as CSS stylesheets, JavaScript files, custom fonts, and images (PNG, SVG, Favicons) — must be served directly without template variable processing.

FastAPI provides the `StaticFiles` tool to mount a physical directory onto a specific URL prefix.

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Mount the local directory 'static' to the URL route '/static'
app.mount("/static", StaticFiles(directory="static"), name="static")
```
Once mounted, any file placed inside the local `./static/` folder (such as `static/css/style.css`) is immediately accessible via the URL `http://127.0.0.1:8000/static/css/style.css`.

### 2.3 Configuring Jinja2 Templates
To render HTML templates, install `jinja2`:
```bash
pip install jinja2
```

In your application code, instantiate `Jinja2Templates` pointing to your project's template directory:
```python
# main.py
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

# 1. Mount static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# 2. Configure Jinja2 templates directory
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
def render_home(request: Request):
    course_topics = [
        "FastAPI Basics",
        "Templates & Static Files",
        "Pydantic Validation",
        "SQLAlchemy ORM",
        "Docker Containerization"
    ]
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "page_title": "FastAPI Study — Home",
            "instructor": "Corey Schafer",
            "topics": course_topics
        }
    )
```

### 2.4 Jinja2 Template Syntax & Inheritance
Jinja2 separates layout structure from page-specific content through **Template Inheritance**.

#### Base Layout (`templates/base.html`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ page_title }}</title>
  <!-- Link static CSS dynamically using url_for -->
  <link rel="stylesheet" href="{{ url_for('static', path='css/style.css') }}">
</head>
<body>
  <header>
    <h1>FastAPI Learning Portal</h1>
  </header>

  <main>
    <!-- Child templates inject their custom content here -->
    {% block content %}{% endblock %}
  </main>

  <footer>
    <p>&copy; 2026 FastAPI Study. Instructor: {{ instructor }}</p>
  </footer>
</body>
</html>
```

#### Child Page (`templates/index.html`):
```html
{% extends "base.html" %}

{% block content %}
<h2>Available Modules</h2>
<ul>
  {% for topic in topics %}
    <li><strong>Module {{ loop.index }}:</strong> {{ topic }}</li>
  {% endfor %}
</ul>
{% endblock %}
```

### 2.5 Practical Exercise: Creating a Dynamic User Profile Card
Create a template `profile.html` that extends `base.html` and renders a user card. Pass a dictionary in `main.py` containing `username`, `role` (e.g., `"Admin"` or `"Student"`), and an avatar image path served from `/static/images/`.

### 2.6 Common Mistakes & Troubleshooting
1. **KeyError: 'request'**: Forgetting to pass `"request": request` inside the `context` dictionary passed to `templates.TemplateResponse()` will raise an immediate runtime exception. Starlette's template engine requires the `Request` instance to generate URLs with `url_for`.
2. **TemplateNotFound**: Ensure the directory name supplied to `Jinja2Templates(directory="templates")` matches the physical folder on disk exactly.
3. **Static File 404 Not Found**: Make sure `app.mount()` is called before route definitions and that the relative path in `url_for('static', path='...')` exists inside the mounted directory.

### 2.7 Chapter 2 Recap
- `app.mount("/static", StaticFiles(directory="static"), name="static")` exposes static assets.
- `Jinja2Templates(directory="templates")` initializes the server-side template renderer.
- `templates.TemplateResponse("template.html", {"request": request, ...})` renders HTML with dynamic data.
- The `request` object must always be present in the Jinja2 context dictionary.
- Template inheritance (`{% extends %}` and `{% block %}`) promotes clean, DRY HTML structures.

---

### 2.8 Chapter 2 Quiz Book & Assessment

#### Multiple-Choice Questions (10)
1. Which templating engine is officially supported and standard in FastAPI?
   * A) Django Templates
   * B) Jinja2
   * C) Mako
   * D) Mustache
2. What class is used to mount static asset folders in FastAPI?
   * A) `StaticServer`
   * B) `StaticFiles`
   * C) `DirectoryMount`
   * D) `FileRouter`
3. What key is strictly required inside the context dictionary passed to `templates.TemplateResponse()`?
   * A) `"app"`
   * B) `"request"`
   * C) `"session"`
   * D) `"user"`
4. What response class should be specified in `@app.get("/", response_class=...)` when returning server-rendered HTML?
   * A) `JsonResponse`
   * B) `HTMLResponse`
   * C) `PlainTextResponse`
   * D) `FileResponse`
5. In Jinja2 syntax, how do you output the value of a variable named `user_name`?
   * A) `{% user_name %}`
   * B) `{{ user_name }}`
   * C) `{# user_name #}`
   * D) `$(user_name)`
6. What Jinja2 tag declares that a child template inherits from a master layout?
   * A) `{% include "base.html" %}`
   * B) `{% extends "base.html" %}`
   * C) `{% inherit "base.html" %}`
   * D) `{% import "base.html" %}`
7. How do you generate dynamic URLs for static files inside a Jinja2 template?
   * A) `{{ url_for('static', path='css/style.css') }}`
   * B) `{{ static('css/style.css') }}`
   * C) `{{ link('/static/css/style.css') }}`
   * D) `{{ route('static', file='style.css') }}`
8. What loop index variable does Jinja2 automatically provide to count iterations starting at 1?
   * A) `loop.count`
   * B) `loop.index`
   * C) `loop.iteration`
   * D) `loop.step`
9. What Jinja2 tag syntax is used for comments that will not appear in the rendered HTML output?
   * A) `<!-- comment -->`
   * B) `{# comment #}`
   * C) `// comment`
   * D) `/* comment */`
10. What parameter in `app.mount("/static", StaticFiles(...), name="static")` specifies the local directory path on the server?
    * A) `path`
    * B) `directory`
    * C) `folder`
    * D) `source`

#### True or False Questions (5)
1. **[True/False]** Static assets served via `StaticFiles` are processed by the Jinja2 template parser before transmission to the browser.
2. **[True/False]** A FastAPI application can return JSON endpoints and HTML template endpoints from the same application instance.
3. **[True/False]** Jinja2 template files must end with the `.jinja` file extension to be recognized by `Jinja2Templates`.
4. **[True/False]** Omitting `"request": request` from the Jinja2 context dictionary will raise a runtime exception in FastAPI.
5. **[True/False]** Template inheritance allows you to override specific named blocks in a parent template without rewriting the entire HTML document.

#### Short-Answer Questions (5)
1. Why is the `request` object required in the Jinja2 context dictionary?
2. What is the difference between `{% extends %}` and `{% include %}` in Jinja2?
3. How does `url_for('static', path='...')` prevent broken links when hosting applications on sub-paths?
4. When would a developer choose Server-Side Rendering (SSR) over a client-side Single Page Application (SPA)?
5. What command installs the Jinja2 dependency in a Python environment?

#### Code Reading & Debugging Questions (3)
1. **Identify the Bug**:
```python
@app.get("/items", response_class=HTMLResponse)
def get_items():
    return templates.TemplateResponse("items.html", {"items": ["Book", "Pen"]})
```
* **Question**: Why will this endpoint crash with a `KeyError: 'request'` when accessed in the browser?

2. **Fix the Template Syntax**:
```html
<ul>
  {% for product in products %}
    <li>{{ product.name }} - Price: ${{ product.price }
  {% endfor %}
</ul>
```
* **Question**: What syntax error exists on line 3?

3. **Static File Resolution**:
```python
app.mount("/assets", StaticFiles(directory="public"), name="static")
```
* **Question**: If a file exists at `./public/logo.png`, what is the correct URL path to access it in the browser?

#### Practical Coding Challenges (2)
1. **Challenge 1**: Write a complete FastAPI route `@app.get("/welcome")` that renders a template `welcome.html` passing the user's name and an integer `login_count`.
2. **Challenge 2**: Write a Jinja2 template snippet that displays a `<div>` with class `"badge-admin"` if `user.is_admin` is `True`, or `"badge-user"` if `False`.

---

### 2.9 Chapter 2 Answer Key & Explanations

#### MCQ Answers
1. **B** — Jinja2 is the standard templating engine integrated into Starlette and FastAPI.
2. **B** — `StaticFiles` is imported from `fastapi.staticfiles` to serve static directories.
3. **B** — `"request": request` is mandatory for Starlette template responses.
4. **B** — `HTMLResponse` sets the appropriate `text/html; charset=utf-8` header.
5. **B** — Double curly braces `{{ var }}` output interpolated variable expressions.
6. **B** — `{% extends "base.html" %}` establishes template inheritance.
7. **A** — `url_for('static', path='...')` computes canonical static URLs.
8. **B** — `loop.index` provides 1-based indexing in Jinja2 loops (`loop.index0` provides 0-based).
9. **B** — `{# ... #}` creates server-side comments stripped before sending HTML to the client.
10. **B** — The `directory` keyword argument supplies the local folder path.

#### True/False Answers
1. **False** — Static files are served directly as raw binary/text bytes without template parsing.
2. **True** — FastAPI easily serves both HTML pages and JSON REST API routes concurrently.
3. **False** — Template files typically use `.html` (e.g., `index.html`) so code editors provide HTML syntax highlighting.
4. **True** — Starlette's template renderer requires the `Request` object to build URL contexts; omitting it raises `KeyError`.
5. **True** — Child templates override specific `{% block %}` sections while keeping the overall layout intact.

#### Short-Answer Solutions
1. The `request` object provides request metadata, headers, client IP, and routing context required by internal template helper functions like `url_for()`.
2. `{% extends %}` inherits an entire structural skeleton and overrides defined blocks; `{% include %}` simply embeds a reusable HTML snippet (like a navbar or footer) into the current template.
3. `url_for()` dynamically calculates the root path, domain, and protocol, ensuring links remain valid even if the application is hosted behind a reverse proxy or sub-path prefix.
4. SSR is ideal for search engine optimization (SEO), fast initial page loads on low-powered devices, and simple web applications that don't need complex client-side state management.
5. `pip install jinja2`.

#### Debugging Solutions
1. **Fix**: The function signature must accept `request: Request`, and the context dictionary must include `"request": request`.
2. **Fix**: Line 3 has an unclosed curly brace on `product.price`. It should be `{{ product.price }}` with double closing braces.
3. **Fix**: The URL is `http://127.0.0.1:8000/assets/logo.png`.
