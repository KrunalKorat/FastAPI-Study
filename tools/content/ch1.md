# CHAPTER 1: FastAPI Basics
*(Corresponding to Video Part 1: Getting Started — Web App & REST API Basics)*

### 1.1 Introduction to FastAPI & ASGI Architecture
FastAPI is a modern, high-performance web framework for building APIs with Python based on standard Python type hints. Built on top of **Starlette** (for web routing and ASGI concurrency) and **Pydantic** (for data validation and schema management), FastAPI delivers execution speeds comparable to NodeJS and Go.

Traditional Python web frameworks like Django and Flask historically adhered to the **WSGI (Web Server Gateway Interface)** standard. WSGI is fundamentally synchronous: every incoming HTTP request occupies a single server worker thread until the response completes. In contrast, FastAPI is built natively on **ASGI (Asynchronous Server Gateway Interface)**. ASGI enables Python's `asyncio` event loop to handle thousands of concurrent requests on a single worker thread while waiting for asynchronous I/O operations (such as database queries, external API calls, or disk reads) to resolve.

```
WSGI (Synchronous Request-per-Thread):
Request A ──► [ Worker Thread 1: Waiting on DB I/O ] ──► Response A
Request B ──► [ Blocked until Worker 1 completes   ]

ASGI (Asynchronous Event Loop Concurrency):
Request A ──► [ Event Loop: Dispatches async DB task ]
Request B ──► [ Event Loop: Immediately accepts Req B ]
Task A Done ─► [ Event Loop: Returns Response A       ]
```

### 1.2 Development Environment & Installation
To run a FastAPI application, you need the FastAPI library and an ASGI server. **Uvicorn** is the lightning-fast ASGI server implementation used in development and production.

```bash
# Recommended installation with standard dependencies (uvicorn, email-validator, etc.)
pip install "fastapi[standard]"

# Or install core packages independently
pip install fastapi uvicorn
```

### 1.3 Creating Your First API Endpoint
A minimal FastAPI application consists of instantiating the `FastAPI` class and defining path operation functions using Python decorators.

```python
# main.py
from fastapi import FastAPI

# 1. Create FastAPI application instance
app = FastAPI(
    title="FastAPI Study — API",
    description="Getting Started with FastAPI Basics",
    version="1.0.0"
)

# 2. Define a Path Operation Decorator for HTTP GET
@app.get("/")
def read_root():
    return {
        "status": "success",
        "message": "Welcome to FastAPI Study!",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "fastapi-study"}
```

#### Running the Development Server
Run Uvicorn from your command line terminal in the same directory as `main.py`:
```bash
uvicorn main:app --reload --port 8000
```
- `main`: The Python file name (`main.py` without the `.py` extension).
- `app`: The `FastAPI()` instance object created inside `main.py`.
- `--reload`: Enables hot reloading so the server automatically restarts upon code changes during local development.

### 1.4 Automatic Interactive API Documentation
One of FastAPI's greatest advantages is automatic, zero-configuration OpenAPI specification generation. As soon as you define an endpoint, FastAPI generates two distinct interactive documentation interfaces:

1. **Swagger UI (`http://127.0.0.1:8000/docs`)**:
   An interactive web dashboard where developers and frontend engineers can inspect all available routes, review expected request parameters, and execute real HTTP requests directly within the browser ("Try it out").
2. **ReDoc (`http://127.0.0.1:8000/redoc`)**:
   A clean, publication-grade technical documentation view optimized for team references and developer onboarding.

### 1.5 Practical Exercise: Creating a Greeting & Info API
Create an endpoint `@app.get("/info")` that returns a dictionary containing the application name, current framework version, and a list of supported features (`["ASGI Concurrency", "Automatic Docs", "Type Validation"]`). Test the endpoint in your browser at `http://localhost:8000/docs`.

### 1.6 Common Mistakes, Troubleshooting & Best Practices
1. **ModuleNotFoundError on Uvicorn**: Ensure your active virtual environment has `uvicorn` installed. If running in VS Code or Terminal, verify the virtual environment is activated (`source venv/bin/activate` or `.\\venv\\Scripts\\Activate.ps1`).
2. **Error: Could not import module 'main'**: Ensure you execute the `uvicorn main:app` command from the root directory where `main.py` actually resides.
3. **Returning Non-Serializable Objects**: FastAPI's automatic JSON serializer natively handles `dict`, `list`, `str`, `int`, `float`, and Pydantic models. Returning raw class instances without serialization will raise `ValueError` or `TypeError`.
4. **Port Already in Use**: If port 8000 is occupied by another process, supply an alternate port: `uvicorn main:app --port 8080 --reload`.

### 1.7 Chapter 1 Recap
- FastAPI uses Python standard type hints to deliver high-performance ASGI web APIs.
- Uvicorn acts as the asynchronous web server that translates HTTP packets into ASGI events.
- Path operation decorators (`@app.get()`, `@app.post()`) bind HTTP methods and URL paths to Python functions.
- Interactive documentation is automatically available at `/docs` (Swagger) and `/redoc` (ReDoc).

---

### 1.8 Chapter 1 Quiz Book & Assessment

#### Multiple-Choice Questions (10)
1. What does the acronym ASGI stand for?
   * A) Asynchronous Server Gateway Interface
   * B) Advanced Synchronous Gateway Integration
   * C) Automated Socket Gateway Interop
   * D) Application Server General Interface
2. Which lightning-fast ASGI server is standard for running FastAPI applications?
   * A) Gunicorn
   * B) Uvicorn
   * C) Apache
   * D) Waitress
3. What does the `--reload` flag do when executing `uvicorn main:app --reload`?
   * A) Automatically wipes and reloads the database
   * B) Automatically restarts the server process whenever source code files are saved
   * C) Clears browser cookies on every request
   * D) Re-downloads dependencies from PyPI
4. At what default URL path does FastAPI expose its interactive Swagger UI documentation?
   * A) `/swagger`
   * B) `/docs`
   * C) `/api/v1`
   * D) `/documentation`
5. At what default URL path does FastAPI provide the ReDoc alternative documentation?
   * A) `/redoc`
   * B) `/api-spec`
   * C) `/docs/redoc`
   * D) `/schema`
6. In the command `uvicorn main:app`, what does `main` refer to?
   * A) The primary function to execute
   * B) The Python file module `main.py`
   * C) The Git branch name
   * D) The HTTP host header
7. What underlying library provides FastAPI with its core HTTP routing and ASGI concurrency?
   * A) Flask
   * B) Starlette
   * C) Django
   * D) Tornado
8. What underlying library provides FastAPI with its schema validation and serialization?
   * A) Marshmallow
   * B) Pydantic
   * C) Cerberus
   * D) SchemaPy
9. Which Python decorator associates an endpoint with the HTTP GET method on root path `/`?
   * A) `@app.route("/")`
   * B) `@app.get("/")`
   * C) `@app.listen("/")`
   * D) `@app.endpoint("/")`
10. What format does FastAPI automatically use to serialize dictionary returns from route functions?
    * A) XML
    * B) JSON
    * C) YAML
    * D) Protocol Buffers

#### True or False Questions (5)
1. **[True/False]** FastAPI requires writing manual OpenAPI specifications in YAML before interactive documentation can appear.
2. **[True/False]** ASGI web servers allow multiple concurrent requests to be handled efficiently without creating an OS thread for every single client.
3. **[True/False]** When returning a Python `dict` from a path operation function, FastAPI automatically sets the HTTP `Content-Type` header to `application/json`.
4. **[True/False]** The `--reload` flag in Uvicorn should always be enabled in high-traffic production environments.
5. **[True/False]** You can run FastAPI applications with asynchronous `async def` functions as well as standard synchronous `def` functions.

#### Short-Answer Questions (5)
1. Explain the fundamental difference in concurrency between WSGI and ASGI servers.
2. What are the two distinct documentation interfaces generated out of the box by FastAPI?
3. What is the role of the `FastAPI()` instance in an application?
4. How does Python type hinting benefit developers using FastAPI?
5. Why is `--reload` recommended only for local development rather than production?

#### Code Reading & Debugging Questions (3)
1. **Identify the Bug**:
```python
from fastapi import FastAPI
app = FastAPI()

@app.get("/items")
def get_items()
    return ["item1", "item2"]
```
* **Question**: Why will Python raise a `SyntaxError` when attempting to start this application?

2. **Fix the Import**:
```python
# main.py
import fastapi

@app.get("/")
def home():
    return {"message": "Hello"}
```
* **Question**: Why does this code crash on line 4 with `NameError: name 'app' is not defined`?

3. **Uvicorn CLI Analysis**:
```bash
uvicorn app:main --reload
```
* **Question**: If your file is named `main.py` and contains `app = FastAPI()`, why will this command fail to start?

#### Practical Coding Challenges (2)
1. **Challenge 1**: Write a complete `main.py` file that instantiates FastAPI, defines a root endpoint returning `{"project": "FastAPI Study"}`, and a `/version` endpoint returning `{"version": "1.0.0", "status": "online"}`.
2. **Challenge 2**: Write a path operation `@app.get("/server-time")` that imports Python's `datetime` module and returns the current UTC timestamp formatted as an ISO-8601 string inside a JSON dictionary.

---

### 1.9 Chapter 1 Answer Key & Explanations

#### MCQ Answers
1. **A** — ASGI stands for Asynchronous Server Gateway Interface, the standard for asynchronous Python web servers.
2. **B** — Uvicorn is the lightning-fast, production-ready ASGI server built on `uvloop` and `httptools`.
3. **B** — `--reload` monitors the local filesystem and restarts the server process whenever changes are saved.
4. **B** — Swagger UI is served natively at `/docs`.
5. **A** — ReDoc is served natively at `/redoc`.
6. **B** — In `main:app`, `main` specifies the Python file `main.py` where the application is defined.
7. **B** — Starlette powers FastAPI's high-performance routing, middleware, and request/response pipeline.
8. **B** — Pydantic handles data validation, conversion, and serialization.
9. **B** — `@app.get("/")` is FastAPI's decorator for GET requests.
10. **B** — Responses are serialized to JSON (`application/json`) by default.

#### True/False Answers
1. **False** — FastAPI generates OpenAPI specifications completely automatically from your Python function signatures and type hints.
2. **True** — ASGI servers use event loops to manage thousands of concurrent I/O connections concurrently.
3. **True** — FastAPI sets `Content-Type: application/json` automatically when returning dictionaries or Pydantic models.
4. **False** — `--reload` adds file monitoring overhead and resource consumption; production uses stable worker processes without reload.
5. **True** — FastAPI supports both `async def` (for async non-blocking code) and regular `def` (which FastAPI executes in an external threadpool).

#### Short-Answer Solutions
1. WSGI assigns each request to a dedicated OS thread and blocks until I/O finishes. ASGI uses a single-threaded cooperative event loop to handle concurrent requests without thread-locking during I/O waits.
2. Swagger UI (`/docs`) provides interactive endpoint testing directly in the browser; ReDoc (`/redoc`) provides clean, organized API documentation.
3. The `FastAPI()` instance serves as the central application registry coordinating routes, middleware, exception handlers, and OpenAPI metadata.
4. Type hints enable automatic data validation, conversion, automatic OpenAPI schema generation, and full IDE auto-completion.
5. `--reload` introduces filesystem watcher polling overhead and unstable process restarts unsuitable for multi-worker production clusters.

#### Debugging Solutions
1. **Fix**: Line 5 is missing a colon `:` at the end of the function definition (`def get_items():`).
2. **Fix**: The code imports the package `fastapi` but never creates the application instance. Add `from fastapi import FastAPI` and `app = FastAPI()`.
3. **Fix**: The syntax is `file_name:instance_name`. If the file is `main.py` and the variable is `app`, the command must be `uvicorn main:app --reload`.
