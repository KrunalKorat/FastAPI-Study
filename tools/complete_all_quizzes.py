import json

raw = open('assets/content/textbook-content.js', encoding='utf-8').read()
prefix = raw[:raw.index('{')]
suffix = raw[raw.rindex('}')+1:]
data = json.loads(raw[raw.index('{'):raw.rindex('}')+1])

# Additional content for chapters 11 to 18

extra_quiz_data = {
    11: {
        "shortAnswer": [
            {
                "id": 1,
                "question": "What is the security role of FastAPI's `Depends()` in enforcing authorization?",
                "modelAnswer": "FastAPI's `Depends()` allows injecting authorization functions before route handlers execute. If the user lacks necessary permissions, an `HTTPException(status_code=403)` is raised immediately, halting route execution."
            },
            {
                "id": 2,
                "question": "Differentiate between Authentication (401 Unauthorized) and Authorization (403 Forbidden).",
                "modelAnswer": "Authentication validates identity ('Who are you?'), returning 401 if credentials are invalid or missing. Authorization determines privileges ('Are you allowed to perform this action?'), returning 403 if the authenticated identity lacks necessary permissions."
            },
            {
                "id": 3,
                "question": "Why should role checks (e.g. `is_admin`) be verified in the backend database or token rather than trusting clients?",
                "modelAnswer": "Client-supplied role headers or request bodies can be manipulated by malicious users. Roles must be verified against server-signed JWT claims or authoritative database records."
            },
            {
                "id": 4,
                "question": "How do you implement hierarchical RBAC (e.g. 'admin' inherits all 'editor' permissions)?",
                "modelAnswer": "By defining permission sets where higher roles include subsets of lower roles, or by checking an enumerated rank hierarchy where `user.role_level >= required_level`."
            },
            {
                "id": 5,
                "question": "What is the benefit of using a custom dependency class with `__call__` for RBAC checks?",
                "modelAnswer": "A parameterized dependency class allows writing `Depends(RequireRole('admin'))` or `Depends(RequirePermission('posts:delete'))` cleanly across multiple endpoints without repeating boilerplate."
            }
        ],
        "debugging": [
            {
                "id": 1,
                "prompt": "**Identify the Bug**:\n```python\n@app.delete('/posts/{id}')\ndef delete_post(id: int, user: User = Depends(get_current_user)):\n    if user.role != 'admin':\n        return {'error': 'Forbidden'}\n    crud.delete(id)\n```\n* **Question**: Why is returning a dictionary problematic for security?",
                "modelSolution": "**Fix**: It returns HTTP 200 OK with an error payload instead of raising `HTTPException(status_code=status.HTTP_403_FORBIDDEN)`. Clients and API gateways expect standard 403 HTTP status codes."
            },
            {
                "id": 2,
                "prompt": "**Identify the Bug**:\n```python\ndef require_admin(current_user: User = Depends(get_current_user)):\n    if not current_user.is_superuser:\n        raise HTTPException(status_code=401, detail='Admins only')\n```\n* **Question**: What is the incorrect HTTP status code used here?",
                "modelSolution": "**Fix**: 401 Unauthorized should be used for missing/invalid credentials. For authenticated users lacking permissions, use `status_code=status.HTTP_403_FORBIDDEN`."
            },
            {
                "id": 3,
                "prompt": "**Identify the Bug**:\n```python\nclass RoleChecker:\n    def __init__(self, allowed_roles: list[str]):\n        self.allowed_roles = allowed_roles\n    def __call__(user: User = Depends(get_current_user)):\n        ...\n```\n* **Question**: What parameter is missing from `__call__`?",
                "modelSolution": "**Fix**: `def __call__(self, user: User = Depends(get_current_user)):` is missing `self` as the first method argument."
            }
        ],
        "codingChallenges": [
            {
                "id": 1,
                "prompt": "**Challenge 1**: Write a reusable `RoleChecker` dependency class that takes a list of allowed roles (e.g. `['admin', 'moderator']`) in `__init__`, inspects `current_user.role` in `__call__`, and raises 403 Forbidden if not authorized."
            },
            {
                "id": 2,
                "prompt": "**Challenge 2**: Implement an endpoint `@app.patch('/users/{user_id}/status')` that requires `RoleChecker(['admin'])` and updates the target user's active status in the database."
            }
        ]
    },
    12: {
        "trueFalse": [
            {
                "id": 1,
                "question": "**[True/False]** `UploadFile` stores uploaded files entirely in RAM regardless of file size.",
                "correctAnswer": False,
                "explanation": "`UploadFile` uses a `SpooledTemporaryFile` which holds files in memory up to a rollover limit, streaming larger files safely to disk to prevent RAM exhaustion."
            },
            {
                "id": 2,
                "question": "**[True/False]** You should never trust the client-provided `file.filename` directly when saving files to disk.",
                "correctAnswer": True,
                "explanation": "Client filenames can contain path traversal characters (`../../etc/passwd`) or malicious extensions. Always sanitize or replace filenames with secure UUIDs."
            },
            {
                "id": 3,
                "question": "**[True/False]** Pillow's `image.thumbnail()` modifies the image in-place while preserving the aspect ratio.",
                "correctAnswer": True,
                "explanation": "`Image.thumbnail(size)` calculates the proportional dimensions and scales the image in-place without distortion."
            },
            {
                "id": 4,
                "question": "**[True/False]** FastAPI endpoints handling file uploads must expect the `application/json` Content-Type.",
                "correctAnswer": False,
                "explanation": "File upload endpoints require `multipart/form-data` encoding, supplied by the `python-multipart` library."
            },
            {
                "id": 5,
                "question": "**[True/False]** StaticFiles mounting allows serving uploaded images directly over HTTP.",
                "correctAnswer": True,
                "explanation": "Mounting `StaticFiles(directory='uploads')` under `/static` enables clients to fetch uploaded assets directly via URL."
            }
        ],
        "shortAnswer": [
            {
                "id": 1,
                "question": "What is the primary architectural advantage of `UploadFile` over `bytes = File(...)`?",
                "modelAnswer": "`UploadFile` uses a file-like stream backed by disk spooling, preventing out-of-memory crashes when multiple concurrent clients upload large media files."
            },
            {
                "id": 2,
                "question": "How do you validate that an uploaded file is a valid image before processing it with Pillow?",
                "modelAnswer": "Check `file.content_type` against permitted MIME types (e.g. `image/jpeg`, `image/png`) and wrap `Image.open(file.file)` in a `try...except UnidentifiedImageError` block."
            },
            {
                "id": 3,
                "question": "Why is `shutil.copyfileobj(file.file, buffer)` preferred over reading the whole file into a variable?",
                "modelAnswer": "`shutil.copyfileobj` streams chunks of bytes from source to destination without loading the entire payload into Python memory at once."
            },
            {
                "id": 4,
                "question": "What security vulnerability arises from using `open(f'uploads/{file.filename}', 'wb')`?",
                "modelAnswer": "Directory traversal attacks: an attacker can send a filename like `../../etc/cron.d/malicious` to overwrite critical system files."
            },
            {
                "id": 5,
                "question": "How should uploaded images be organized on disk to avoid filesystem degradation?",
                "modelAnswer": "Distribute files into subdirectories based on dates (`uploads/2026/10/`) or UUID prefixes (`uploads/ab/cd/`) to prevent single directories from exceeding OS file limits."
            }
        ],
        "debugging": [
            {
                "id": 1,
                "prompt": "**Identify the Bug**:\n```python\n@app.post('/upload')\ndef upload_avatar(avatar: UploadFile):\n    image = Image.open(avatar.file)\n    image.thumbnail((200, 200))\n    image.save('static/' + avatar.filename)\n```\n* **Question**: Why will this fail if the `static/` folder doesn't already exist or if the client sends an unsanitized filename?",
                "modelSolution": "**Fix**: Ensure `os.makedirs('static', exist_ok=True)` is called, and generate a safe UUID filename (e.g. `f'{uuid.uuid4()}.png'`) to prevent path traversal and collision bugs."
            },
            {
                "id": 2,
                "prompt": "**Identify the Bug**:\n```python\n@app.post('/photos')\nasync def upload_photo(file: UploadFile = File(...)):\n    contents = file.read()\n```\n* **Question**: Why does `file.read()` fail or return a coroutine in an `async def` route?",
                "modelSolution": "**Fix**: `UploadFile.read()` is an asynchronous coroutine. You must use `await file.read()` in async route handlers."
            },
            {
                "id": 3,
                "prompt": "**Identify the Bug**:\n```python\nfrom fastapi import FastAPI, File\napp = FastAPI()\n@app.post('/files')\ndef create_file(file: bytes = File(...)):\n    return {'file_size': len(file)}\n```\n* **Question**: What happens if a user uploads a 4 GB video file to this endpoint?",
                "modelSolution": "**Fix**: Using `bytes = File(...)` forces the entire 4 GB file into server RAM, crashing the server process with an Out of Memory error. Use `UploadFile` instead."
            }
        ],
        "codingChallenges": [
            {
                "id": 1,
                "prompt": "**Challenge 1**: Write a FastAPI route `@app.post('/avatar')` that accepts an `UploadFile`, validates that `content_type` is either `image/jpeg` or `image/png`, resizes it to a 150x150 thumbnail with Pillow, saves it to `media/avatars/{uuid}.jpg`, and returns the static URL."
            },
            {
                "id": 2,
                "prompt": "**Challenge 2**: Implement file cleanup logic: create a utility function `delete_user_avatar(file_path: str)` that safely removes the old avatar file from disk when a user uploads a replacement."
            }
        ]
    },
    13: {
        "trueFalse": [
            {
                "id": 1,
                "question": "**[True/False]** Querying a database with `SELECT * FROM posts` without pagination is safe for production systems with any data size.",
                "correctAnswer": False,
                "explanation": "Unpaginated queries on large tables exhaust database connection bandwidth and application RAM, leading to latency spikes and outages."
            },
            {
                "id": 2,
                "question": "**[True/False]** `OFFSET` in SQL tells the database engine how many records to skip before returning rows.",
                "correctAnswer": True,
                "explanation": "`OFFSET` skips the specified number of rows from the query result set."
            },
            {
                "id": 3,
                "question": "**[True/False]** In FastAPI, query parameters can have default values and validation constraints using Pydantic's `Query(ge=1, le=100)`.",
                "correctAnswer": True,
                "explanation": "`Query(default=10, ge=1, le=100)` provides automatic type conversion, parameter documentation, and boundary enforcement."
            },
            {
                "id": 4,
                "question": "**[True/False]** Keyset (cursor-based) pagination scales more efficiently than `OFFSET` pagination on tables with millions of rows.",
                "correctAnswer": True,
                "explanation": "`OFFSET` requires scanning and discarding previous rows, while keyset pagination uses indexed `WHERE id > last_seen_id` lookups in O(log N) time."
            },
            {
                "id": 5,
                "question": "**[True/False]** Returning total item count in paginated responses helps frontend clients calculate total pages.",
                "correctAnswer": True,
                "explanation": "Including `total_items`, `page`, and `page_size` allows user interfaces to render pagination numbers and disable next/previous buttons appropriately."
            }
        ],
        "shortAnswer": [
            {
                "id": 1,
                "question": "What is the mathematical formula for calculating SQL `OFFSET` from 1-indexed `page` and `limit`?",
                "modelAnswer": "`offset = (page - 1) * limit`. For example, Page 1 has offset 0; Page 2 with limit 20 has offset 20."
            },
            {
                "id": 2,
                "question": "Why is `OFFSET 1000000` slow on relational databases?",
                "modelAnswer": "The database must read, sort, and discard the first 1,000,000 rows from disk before returning the next batch, creating immense I/O and CPU overhead."
            },
            {
                "id": 3,
                "question": "How do you implement search filtering alongside pagination in SQLAlchemy 2.0?",
                "modelAnswer": "Chain `.where(Post.title.ilike(f'%{search}%'))` onto the `select(Post)` query before applying `.offset(skip).limit(limit)`."
            },
            {
                "id": 4,
                "question": "What standard HTTP status code should be returned if a client requests an empty page beyond the dataset boundary?",
                "modelAnswer": "HTTP 200 OK with an empty array `[]` (or empty items list in the pagination envelope), rather than a 404 error."
            },
            {
                "id": 5,
                "question": "What is the structure of a standard pagination envelope schema in Pydantic?",
                "modelAnswer": "`class PaginatedResponse(BaseModel): items: list[Item]; total: int; page: int; page_size: int; total_pages: int`"
            }
        ],
        "debugging": [
            {
                "id": 1,
                "prompt": "**Identify the Bug**:\n```python\n@app.get('/posts')\ndef get_posts(page: int = 1, limit: int = 10, db: Session = Depends(get_db)):\n    offset = page * limit\n    return db.query(Post).offset(offset).limit(limit).all()\n```\n* **Question**: Why does the client miss the first 10 posts when requesting `page=1`?",
                "modelSolution": "**Fix**: `offset = (page - 1) * limit`. When `page = 1`, `1 * 10 = 10`, which skips the entire first page of posts."
            },
            {
                "id": 2,
                "prompt": "**Identify the Bug**:\n```python\n@app.get('/items')\ndef read_items(limit: int = 100000):\n    return db.query(Item).limit(limit).all()\n```\n* **Question**: What security vulnerability does this unconstrained query parameter expose?",
                "modelSolution": "**Fix**: Resource exhaustion DoS. A malicious client can pass `?limit=1000000` to force heavy queries. Constrain with `limit: int = Query(default=20, le=100)`."
            },
            {
                "id": 3,
                "prompt": "**Identify the Bug**:\n```python\nquery = select(Post)\nif search:\n    query.where(Post.title.contains(search))\nposts = db.scalars(query.offset(skip).limit(limit)).all()\n```\n* **Question**: Why does the search filter not apply to the executed query?",
                "modelSolution": "**Fix**: In SQLAlchemy 2.0, `query.where(...)` returns a new query object. You must reassign it: `query = query.where(Post.title.contains(search))`."
            }
        ],
        "codingChallenges": [
            {
                "id": 1,
                "prompt": "**Challenge 1**: Create a generic Pydantic pagination schema `PaginatedResponse[T]` using Python generics, containing `items: list[T]`, `total: int`, `page: int`, `size: int`, and `pages: int`."
            },
            {
                "id": 2,
                "prompt": "**Challenge 2**: Write an endpoint `@app.get('/products')` that accepts `page: int = Query(1, ge=1)`, `size: int = Query(20, ge=1, le=100)`, and optional `category: Optional[str] = None`, executing both the count query and paginated item query."
            }
        ]
    },
    14: {
        "trueFalse": [
            {
                "id": 1,
                "question": "**[True/False]** FastAPI's `BackgroundTasks` executes functions after the HTTP response has been sent to the client.",
                "correctAnswer": True,
                "explanation": "FastAPI sends the HTTP response immediately to the client and continues executing scheduled background tasks in the background."
            },
            {
                "id": 2,
                "question": "**[True/False]** FastAPI `BackgroundTasks` should be used for long-running heavy ML model training spanning several hours.",
                "correctAnswer": False,
                "explanation": "FastAPI `BackgroundTasks` runs inside the same process. Heavy, long-running tasks should use a dedicated distributed task queue like Celery with Redis."
            },
            {
                "id": 3,
                "question": "**[True/False]** You can add multiple background tasks to a single `BackgroundTasks` instance in a route.",
                "correctAnswer": True,
                "explanation": "`background_tasks.add_task(func1, arg1)` can be called multiple times to queue several tasks sequentially."
            },
            {
                "id": 4,
                "question": "**[True/False]** Password reset tokens should be valid indefinitely until the user clicks the link.",
                "correctAnswer": False,
                "explanation": "Password reset tokens must have short expiration windows (e.g. 15 to 30 minutes) to minimize exposure to token interception."
            },
            {
                "id": 5,
                "question": "**[True/False]** Sending emails synchronously inside a route handler blocks the client request until the SMTP server replies.",
                "correctAnswer": True,
                "explanation": "Synchronous SMTP network calls take 1-3 seconds, delaying HTTP response delivery unless deferred to a background task."
            }
        ],
        "shortAnswer": [
            {
                "id": 1,
                "question": "What is the primary user-experience benefit of dispatching transactional emails in `BackgroundTasks`?",
                "modelAnswer": "The HTTP endpoint responds instantly (e.g. in 15ms) with a success status, while the 2-second SMTP connection and email delivery occurs asynchronously."
            },
            {
                "id": 2,
                "question": "What parameters does `background_tasks.add_task()` accept?",
                "modelAnswer": "It takes the callable function as the first argument, followed by any positional `*args` and keyword `**kwargs` to pass to that function when executed."
            },
            {
                "id": 3,
                "question": "Why should password reset endpoints always return HTTP 200 even if the requested email is not found?",
                "modelAnswer": "To prevent email enumeration attacks: returning 404 allows attackers to probe which email addresses exist in the system."
            },
            {
                "id": 4,
                "question": "When does an enterprise architecture outgrow FastAPI's built-in `BackgroundTasks` in favor of Celery or ARQ?",
                "modelAnswer": "When tasks require automatic retries upon failure, persistent job queues across server reboots, rate limiting, progress tracking, or dedicated worker servers."
            },
            {
                "id": 5,
                "question": "What cryptographic method should be used to sign password reset tokens without database state?",
                "modelAnswer": "JWT tokens signed with a dedicated secret key, with a short expiration (`exp`) and a subject claim containing user ID and purpose (`{'sub': user_id, 'scope': 'password_reset'}`)."
            }
        ],
        "debugging": [
            {
                "id": 1,
                "prompt": "**Identify the Bug**:\n```python\n@app.post('/register')\ndef register(user: UserCreate, tasks: BackgroundTasks):\n    tasks.add_task(send_welcome_email(user.email))\n    return {'msg': 'Registered'}\n```\n* **Question**: Why does this crash or execute immediately instead of running in the background?",
                "modelSolution": "**Fix**: `send_welcome_email(user.email)` calls the function immediately! Pass the function reference and arguments separately: `tasks.add_task(send_welcome_email, user.email)`."
            },
            {
                "id": 2,
                "prompt": "**Identify the Bug**:\n```python\ndef write_audit_log(db: Session, action: str):\n    db.add(AuditLog(action=action))\n    db.commit()\n\n@app.post('/items')\ndef create_item(tasks: BackgroundTasks, db: Session = Depends(get_db)):\n    tasks.add_task(write_audit_log, db, 'item_created')\n    return {'status': 'ok'}\n```\n* **Question**: Why does `write_audit_log` fail with a closed session error?",
                "modelSolution": "**Fix**: The `db` session dependency is closed when the HTTP response finishes, before the background task runs. Pass raw data IDs and create a fresh session inside the background task."
            },
            {
                "id": 3,
                "prompt": "**Identify the Bug**:\n```python\n@app.post('/reset-password')\ndef request_reset(email: str, tasks: BackgroundTasks):\n    user = db.query(User).filter(User.email == email).first()\n    if not user:\n        raise HTTPException(status_code=404, detail='User not found')\n```\n* **Question**: What privacy/security flaw exists here?",
                "modelSolution": "**Fix**: Returning 404 allows attackers to enumerate registered users. Return generic 200 OK: 'If the email exists, a reset link has been dispatched.'"
            }
        ],
        "codingChallenges": [
            {
                "id": 1,
                "prompt": "**Challenge 1**: Implement an async background notification worker `send_notification_email(to_email: str, subject: str, body: str)` and trigger it from a `@app.post('/orders')` endpoint using `BackgroundTasks`."
            },
            {
                "id": 2,
                "prompt": "**Challenge 2**: Build an end-to-end password reset flow: generate a 15-minute JWT token with `'type': 'reset'`, dispatch it via background task, and write a verification endpoint `@app.post('/reset-password/confirm')` that decodes and updates the password."
            }
        ]
    },
    15: {
        "trueFalse": [
            {
                "id": 1,
                "question": "**[True/False]** Alembic is a lightweight database migration tool for usage with SQLAlchemy.",
                "correctAnswer": True,
                "explanation": "Alembic is the official database migration tool for SQLAlchemy, managing schema versions and incremental DDL scripts."
            },
            {
                "id": 2,
                "question": "**[True/False]** `Base.metadata.create_all(bind=engine)` automatically alters existing columns in production tables when models change.",
                "correctAnswer": False,
                "explanation": "`create_all` only creates tables if they do not exist; it cannot alter existing columns or add new fields to existing production tables without dropping them."
            },
            {
                "id": 3,
                "question": "**[True/False]** `alembic revision --autogenerate -m 'add column'` inspects model changes and drafts migration scripts automatically.",
                "correctAnswer": True,
                "explanation": "Alembic's autogenerate inspects `target_metadata` against current database schema to generate `upgrade()` and `downgrade()` operations."
            },
            {
                "id": 4,
                "question": "**[True/False]** Alembic migration scripts must always be manually reviewed before applying to production databases.",
                "correctAnswer": True,
                "explanation": "Autogenerate may misinterpret renamed columns as drop-and-add operations, leading to data loss unless reviewed."
            },
            {
                "id": 5,
                "question": "**[True/False]** PostgreSQL connection strings for psycopg3 begin with `postgresql+psycopg://`.",
                "correctAnswer": True,
                "explanation": "SQLAlchemy uses driver-specific prefixes such as `postgresql+psycopg://` or `postgresql+asyncpg://` to identify the database client driver."
            }
        ],
        "shortAnswer": [
            {
                "id": 1,
                "question": "What command applies all pending Alembic migrations to the target database?",
                "modelAnswer": "`alembic upgrade head`"
            },
            {
                "id": 2,
                "question": "What is the role of `alembic_version` table created by Alembic in your database?",
                "modelAnswer": "It stores a single record containing the version string of the currently applied migration revision, allowing Alembic to track schema state."
            },
            {
                "id": 3,
                "question": "What key variable must be configured in `alembic/env.py` for autogenerate to detect models?",
                "modelAnswer": "`target_metadata = Base.metadata` where `Base` contains your imported SQLAlchemy model declarations."
            },
            {
                "id": 4,
                "question": "What is the command to roll back the most recently applied migration?",
                "modelAnswer": "`alembic downgrade -1`"
            },
            {
                "id": 5,
                "question": "Why should database credentials never be hardcoded into `alembic.ini`?",
                "modelAnswer": "To prevent accidental credential leaks into version control; database connection strings should be loaded dynamically from environment variables in `env.py`."
            }
        ],
        "debugging": [
            {
                "id": 1,
                "prompt": "**Identify the Bug**:\n```python\n# alembic/env.py\ntarget_metadata = None\n```\n* **Question**: Why does running `alembic revision --autogenerate -m 'init'` produce an empty migration script?",
                "modelSolution": "**Fix**: `target_metadata` is set to `None`. You must import your model base and assign `target_metadata = Base.metadata`."
            },
            {
                "id": 2,
                "prompt": "**Identify the Bug**:\n```bash\n$ alembic upgrade head\nModuleNotFoundError: No module named 'psycopg2'\n```\n* **Question**: What causes this error when connecting to PostgreSQL with `postgresql://` URL?",
                "modelSolution": "**Fix**: Default `postgresql://` defaults to the `psycopg2` driver. Install `psycopg2-binary` or specify `postgresql+psycopg://` with `psycopg[binary]` installed."
            },
            {
                "id": 3,
                "prompt": "**Identify the Bug**:\n```python\ndef upgrade():\n    op.add_column('users', sa.Column('phone', sa.String(), nullable=False))\n```\n* **Question**: Why does this migration fail when applied to a table with 50,000 existing users?",
                "modelSolution": "**Fix**: Adding a `NOT NULL` column without a `server_default` fails because existing rows cannot have null values. Add a default or set `nullable=True` initially."
            }
        ],
        "codingChallenges": [
            {
                "id": 1,
                "prompt": "**Challenge 1**: Initialize an Alembic environment with `alembic init alembic`, configure `env.py` to read `DATABASE_URL` from an environment variable via `os.getenv()`, and connect `target_metadata`."
            },
            {
                "id": 2,
                "prompt": "**Challenge 2**: Write an Alembic migration script manually that creates a `posts` table with `id` (primary key), `title` (varchar 100), `content` (text), and a foreign key `user_id` referencing `users.id` with `ondelete='CASCADE'`."
            }
        ]
    },
    16: {
        "trueFalse": [
            {
                "id": 1,
                "question": "**[True/False]** Amazon S3 is an object storage service designed for storing and retrieving any amount of data over HTTP.",
                "correctAnswer": True,
                "explanation": "Amazon S3 provides virtually unlimited, scalable cloud object storage accessible via REST APIs."
            },
            {
                "id": 2,
                "question": "**[True/False]** In production, file uploads should be saved on the ephemeral local disk of a cloud container.",
                "correctAnswer": False,
                "explanation": "Container file systems are ephemeral and destroyed during restarts or autoscaling. Uploads must be stored in persistent object storage like S3."
            },
            {
                "id": 3,
                "question": "**[True/False]** Boto3 is the official AWS SDK for Python.",
                "correctAnswer": True,
                "explanation": "Boto3 is the Python SDK maintained by AWS for interacting with Amazon Web Services, including S3, DynamoDB, and SQS."
            },
            {
                "id": 4,
                "question": "**[True/False]** S3 Presigned URLs allow clients to download private files securely without making the entire bucket public.",
                "correctAnswer": True,
                "explanation": "Presigned URLs grant temporary, time-limited access to specific objects using the creator's security credentials."
            },
            {
                "id": 5,
                "question": "**[True/False]** Storing AWS Access Key IDs and Secret Keys directly in your FastAPI code is safe if the repo is private.",
                "correctAnswer": False,
                "explanation": "Secrets must never be stored in source code; use environment variables, AWS IAM roles, or secret managers."
            }
        ],
        "shortAnswer": [
            {
                "id": 1,
                "question": "What method on the `boto3.client('s3')` object uploads a file-like stream directly to S3?",
                "modelAnswer": "`s3_client.upload_fileobj(file.file, Bucket=bucket_name, Key=object_key)`"
            },
            {
                "id": 2,
                "question": "What is the purpose of setting `ContentType` in S3 object metadata when uploading files?",
                "modelAnswer": "It ensures web browsers render images, videos, and PDFs directly in the browser instead of forcing a generic binary file download."
            },
            {
                "id": 3,
                "question": "How do presigned URLs improve backend server scalability during file downloads?",
                "modelAnswer": "Clients stream the large media file directly from AWS S3 servers rather than routing bandwidth through your FastAPI server."
            },
            {
                "id": 4,
                "question": "What is an S3 bucket name naming constraint you must adhere to?",
                "modelAnswer": "Bucket names must be globally unique across all AWS accounts, between 3 and 63 characters long, and contain only lowercase letters, numbers, and hyphens."
            },
            {
                "id": 5,
                "question": "How do you authenticate with AWS services when hosting FastAPI on an EC2 instance or ECS container?",
                "modelAnswer": "Attach an IAM Role with appropriate S3 policies directly to the compute instance; Boto3 automatically retrieves temporary STS credentials."
            }
        ],
        "debugging": [
            {
                "id": 1,
                "prompt": "**Identify the Bug**:\n```python\ns3 = boto3.client('s3')\ns3.upload_fileobj(upload_file.file, 'my-bucket', 'avatar.jpg')\n```\n* **Question**: Why does downloading the uploaded image display as raw binary or force a download?",
                "modelSolution": "**Fix**: `ContentType` was omitted. Specify `ExtraArgs={'ContentType': upload_file.content_type}` so S3 serves the appropriate HTTP MIME header."
            },
            {
                "id": 2,
                "prompt": "**Identify the Bug**:\n```python\nurl = s3.generate_presigned_url(\n    'get_object',\n    Params={'Bucket': 'private-bucket', 'Key': 'invoice.pdf'},\n    ExpiresIn=3600\n)\n```\n* **Question**: What happens to this download link after 3600 seconds?",
                "modelSolution": "**Fix**: The link expires after 1 hour (3600 seconds) and AWS returns an XML `AccessDenied` error. Adjust `ExpiresIn` or generate fresh presigned URLs on demand."
            },
            {
                "id": 3,
                "prompt": "**Identify the Bug**:\n```python\ns3 = boto3.client('s3', aws_access_key_id='AKIA...', aws_secret_access_key='wJal...')\n```\n* **Question**: What critical security risk does hardcoding AWS credentials in Python files present?",
                "modelSolution": "**Fix**: Credential leakage. If committed to version control, automated scrapers can compromise the account. Load credentials via environment variables or IAM Instance Profiles."
            }
        ],
        "codingChallenges": [
            {
                "id": 1,
                "prompt": "**Challenge 1**: Write a modular S3 service class `S3Service` with methods `upload_file(file: UploadFile) -> str` returning the public/presigned URL and `delete_file(key: str) -> bool`."
            },
            {
                "id": 2,
                "prompt": "**Challenge 2**: Implement an endpoint `@app.get('/files/{file_key}/download-link')` that verifies the requesting user is authenticated and generates a 15-minute S3 presigned download URL."
            }
        ]
    },
    17: {
        "trueFalse": [
            {
                "id": 1,
                "question": "**[True/False]** FastAPI's `TestClient` is built on top of HTTPX.",
                "correctAnswer": True,
                "explanation": "FastAPI's `TestClient` is powered by HTTPX, providing a requests-like interface for making test requests to ASGI applications."
            },
            {
                "id": 2,
                "question": "**[True/False]** Automated tests should write to and mutate production database tables.",
                "correctAnswer": False,
                "explanation": "Tests must use an isolated test database (e.g. SQLite in-memory or a dedicated PostgreSQL test container) to prevent production data corruption."
            },
            {
                "id": 3,
                "question": "**[True/False]** FastAPI's `app.dependency_overrides` dictionary allows replacing real database sessions with mock sessions in tests.",
                "correctAnswer": True,
                "explanation": "`app.dependency_overrides[get_db] = override_get_db` lets tests cleanly swap out production dependencies."
            },
            {
                "id": 4,
                "question": "**[True/False]** Pytest fixtures defined in `conftest.py` are automatically discovered across all test files in the directory.",
                "correctAnswer": True,
                "explanation": "Pytest automatically shares fixtures declared in `conftest.py` without requiring explicit imports."
            },
            {
                "id": 5,
                "question": "**[True/False]** `pytest -v --cov` runs test suites and outputs a statement code coverage report.",
                "correctAnswer": True,
                "explanation": "With `pytest-cov` installed, `--cov` analyzes executed lines and reports code coverage percentages."
            }
        ],
        "shortAnswer": [
            {
                "id": 1,
                "question": "How do you test an endpoint that requires authentication headers using `TestClient`?",
                "modelAnswer": "Pass the header dictionary: `client.get('/protected', headers={'Authorization': f'Bearer {token}'})`."
            },
            {
                "id": 2,
                "question": "Why is testing async FastAPI routes with `httpx.AsyncClient` advantageous over synchronous `TestClient`?",
                "modelAnswer": "It allows using `await client.get(...)` inside `@pytest.mark.anyio` async test functions, natively simulating async event loop behavior."
            },
            {
                "id": 3,
                "question": "What is the purpose of resetting `app.dependency_overrides.clear()` after tests finish?",
                "modelAnswer": "To prevent mock overrides from leaking into subsequent test modules or production application state."
            },
            {
                "id": 4,
                "question": "How should database rollbacks be handled between test cases?",
                "modelAnswer": "Wrap each test execution in a database transaction and roll it back on teardown, or re-instantiate a clean in-memory SQLite schema per test."
            },
            {
                "id": 5,
                "question": "What library allows mocking AWS S3 interactions in Pytest without making real network calls?",
                "modelAnswer": "`moto` (e.g. `@mock_aws`), which intercepts Boto3 network calls in-memory."
            }
        ],
        "debugging": [
            {
                "id": 1,
                "prompt": "**Identify the Bug**:\n```python\ndef test_create_user():\n    client = TestClient(app)\n    response = client.post('/users', {'email': 'test@example.com'})\n    assert response.status_code == 201\n```\n* **Question**: Why does this test fail with `422 Unprocessable Entity`?",
                "modelSolution": "**Fix**: Passing a dict directly sends form data. For JSON request bodies, pass `json={'email': 'test@example.com'}`."
            },
            {
                "id": 2,
                "prompt": "**Identify the Bug**:\n```python\n@pytest.fixture\ndef client():\n    app.dependency_overrides[get_db] = override_get_db\n    return TestClient(app)\n```\n* **Question**: What issue occurs when multiple test suites run consecutively?",
                "modelSolution": "**Fix**: Dependency overrides persist after the test. Use `yield TestClient(app)` followed by `app.dependency_overrides.clear()` in fixture teardown."
            },
            {
                "id": 3,
                "prompt": "**Identify the Bug**:\n```python\nasync def test_get_items():\n    async with AsyncClient(app=app, base_url='http://test') as ac:\n        res = ac.get('/items')\n        assert res.status_code == 200\n```\n* **Question**: Why does `res.status_code` raise an AttributeError?",
                "modelSolution": "**Fix**: `ac.get()` returns a coroutine in `AsyncClient`. You must await the call: `res = await ac.get('/items')`."
            }
        ],
        "codingChallenges": [
            {
                "id": 1,
                "prompt": "**Challenge 1**: Write a `conftest.py` with an isolated SQLite in-memory test database fixture that runs migrations on setup, yields a `Session`, and drops tables on teardown."
            },
            {
                "id": 2,
                "prompt": "**Challenge 2**: Implement an end-to-end integration test `test_user_registration_and_login()` that registers a new user, checks password hashing, logs in to obtain a JWT token, and accesses a protected endpoint."
            }
        ]
    },
    18: {
        "trueFalse": [
            {
                "id": 1,
                "question": "**[True/False]** In a Linux VPS production environment, Uvicorn should run directly on port 80 as root.",
                "correctAnswer": False,
                "explanation": "Running web applications as root is a security risk. Uvicorn should run as an unprivileged system user behind an Nginx reverse proxy on port 80/443."
            },
            {
                "id": 2,
                "question": "**[True/False]** Nginx acts as a reverse proxy, handling SSL/TLS termination, static file serving, and forwarding requests to Uvicorn.",
                "correctAnswer": True,
                "explanation": "Nginx excels at handling client connections, HTTPS encryption, compression, and request routing to backend ASGI servers."
            },
            {
                "id": 3,
                "question": "**[True/False]** Systemd is a Linux system and service manager used to automatically restart Uvicorn if the process crashes or the server reboots.",
                "correctAnswer": True,
                "explanation": "Creating a systemd service file (e.g. `/etc/systemd/system/fastapi.service`) with `Restart=always` ensures high availability."
            },
            {
                "id": 4,
                "question": "**[True/False]** Certbot automates obtaining and renewing free SSL certificates from Let's Encrypt.",
                "correctAnswer": True,
                "explanation": "Certbot manages the ACME protocol to provision and automatically renew SSL/TLS certificates for Nginx."
            },
            {
                "id": 5,
                "question": "**[True/False]** UFW (Uncomplicated Firewall) on Ubuntu should leave all ports wide open for ease of debugging.",
                "correctAnswer": False,
                "explanation": "UFW should only allow necessary ports (typically SSH port 22, HTTP 80, and HTTPS 443), blocking all other ports."
            }
        ],
        "shortAnswer": [
            {
                "id": 1,
                "question": "What is the role of Gunicorn with Uvicorn workers (`gunicorn -w 4 -k uvicorn.workers.UvicornWorker`)?",
                "modelAnswer": "Gunicorn acts as a process manager, spawning and monitoring multiple worker processes across CPU cores to handle concurrent traffic."
            },
            {
                "id": 2,
                "question": "What Nginx directive passes HTTP traffic to the backend Uvicorn socket or port?",
                "modelAnswer": "`proxy_pass http://127.0.0.1:8000;` (or unix socket `proxy_pass http://unix:/run/fastapi.sock;`)"
            },
            {
                "id": 3,
                "question": "Why are `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` headers required in Nginx?",
                "modelAnswer": "To forward the real client IP address and protocol to FastAPI, which otherwise would only see the local Nginx proxy address (127.0.0.1)."
            },
            {
                "id": 4,
                "question": "What command reloads Nginx configuration after editing a site file without dropping active connections?",
                "modelAnswer": "`sudo nginx -t && sudo systemctl reload nginx`"
            },
            {
                "id": 5,
                "question": "How do you inspect the live logs of a systemd service named `fastapi`?",
                "modelAnswer": "`sudo journalctl -u fastapi -f`"
            }
        ],
        "debugging": [
            {
                "id": 1,
                "prompt": "**Identify the Bug**:\n```nginx\nlocation / {\n    proxy_pass http://127.0.0.1:8000;\n}\n```\n* **Question**: Why do Swagger UI redirects in FastAPI fail with HTTP instead of HTTPS behind an SSL-terminating Nginx?",
                "modelSolution": "**Fix**: Nginx must pass the scheme: `proxy_set_header X-Forwarded-Proto $scheme;` so FastAPI recognizes that the original client request arrived over HTTPS."
            },
            {
                "id": 2,
                "prompt": "**Identify the Bug**:\n```ini\n[Service]\nExecStart=/usr/bin/python3 main.py\n```\n* **Question**: Why does the service crash with missing packages when run under systemd?",
                "modelSolution": "**Fix**: It runs the system Python instead of the virtual environment. Use `/home/appuser/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000`."
            },
            {
                "id": 3,
                "prompt": "**Identify the Bug**:\n```bash\n$ sudo ufw allow 8000\n```\n* **Question**: Why is exposing Uvicorn's internal port directly to the public internet bad practice?",
                "modelSolution": "**Fix**: It bypasses Nginx SSL termination, rate limiting, and security filters. Only ports 80, 443, and SSH should be open; bind Uvicorn to `127.0.0.1:8000` or a unix socket."
            }
        ],
        "codingChallenges": [
            {
                "id": 1,
                "prompt": "**Challenge 1**: Write a complete systemd service file `/etc/systemd/system/fastapi.service` configuring `User`, `WorkingDirectory`, `ExecStart` with Gunicorn + Uvicorn worker, `Restart=always`, and `EnvironmentFile`."
            },
            {
                "id": 2,
                "prompt": "**Challenge 2**: Write a complete Nginx server block configuration for `api.example.com` routing port 80 traffic to HTTPS 443, serving `/static/` directly from disk, and proxying API calls with complete `X-Forwarded-*` headers."
            }
        ]
    }
}

# Update chapters in data
for ch in data['chapters']:
    ch_id = ch['id']
    if ch_id in extra_quiz_data:
        q = ch.setdefault('quiz', {})
        extras = extra_quiz_data[ch_id]
        for k, v in extras.items():
            q[k] = v
        print(f"Updated Chapter {ch_id} with extra quiz items: {list(extras.keys())}")

with open('assets/content/textbook-content.js', 'w', encoding='utf-8') as f:
    f.write(prefix + json.dumps(data, indent=2, ensure_ascii=False) + suffix)

print("Saved updated assets/content/textbook-content.js successfully!")
