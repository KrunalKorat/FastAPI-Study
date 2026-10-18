# CHAPTER 4: Pydantic and Data Validation
*(Corresponding to Video Part 4: Data Validation & Schemas with Pydantic v2)*

### 4.1 Introduction to Pydantic v2 & Data Contracts
In modern REST APIs, clients send structured JSON payloads in the HTTP request body (typically with `POST`, `PUT`, and `PATCH` requests). Validating that incoming payloads contain all required fields, correct datatypes, and adhere to business logic constraints is critical for application security and stability.

FastAPI delegates data validation and serialization to **Pydantic**, Python's premier data parsing and validation library. In FastAPI, request bodies are declared as Python classes inheriting from Pydantic's **`BaseModel`**.

```
HTTP Client Request (JSON Body)
         │
         ▼
FastAPI Request Body Parser
         │
         ▼
Pydantic BaseModel Validation
   ├─► Check Required Fields
   ├─► Coerce & Validate Types (str, int, float, email, date)
   ├─► Enforce Custom Constraints (length, regex, ranges)
         │
    [ Valid ] ─────────────────────────► [ Invalid ]
         │                                    │
Passes validated Python object to route     Returns HTTP 422 with detailed field errors
```

### 4.2 Declaring Request Schemas with `BaseModel`
To declare a request body, define a class inheriting from `pydantic.BaseModel`:

```python
from typing import Optional
from fastapi import FastAPI, status
from pydantic import BaseModel, Field, EmailStr

app = FastAPI()

# 1. Define Pydantic Schema for incoming user registration
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Valid user email address")
    age: Optional[int] = Field(None, ge=18, le=120, description="Age must be 18 or older")
    bio: Optional[str] = Field(None, max_length=300)
    is_active: bool = True

# 2. Use schema in path operation
@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    print(f"Creating user: {user.username} ({user.email})")
    
    # Convert Pydantic model to Python dictionary
    user_data = user.model_dump()
    user_data["id"] = 101 # Simulated DB primary key
    
    return {
        "status": "success",
        "data": user_data
    }
```

### 4.3 Advanced Field Validation (`Field`)
Pydantic's `Field` function allows granular constraints on attributes:
- `...` (Ellipsis): Indicates the field is strictly required without a default.
- `min_length` / `max_length`: Enforces string length boundaries.
- `ge` (greater than or equal) / `le` (less than or equal): Enforces numeric boundaries.
- `gt` (greater than) / `lt` (less than): Strict numeric inequality.
- `pattern`: Enforces regular expression matches.
- `description`: Automatically generates documentation text inside `/docs`.

### 4.4 Data Filtering with `response_model`
In API engineering, incoming request schemas and outgoing response schemas often have different requirements. For instance, when a user registers, they submit a plain-text password. However, your API must **never** return passwords in JSON responses.

FastAPI solves this with **`response_model`**:

```python
from fastapi import FastAPI, status
from pydantic import BaseModel, EmailStr

app = FastAPI()

# Input Schema: Client sends plain-text password
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

# Output Schema: Password is completely omitted!
class UserPublic(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool = True

@app.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegister):
    fake_db_record = {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "password": "hashed_secret_string_never_returned",
        "is_active": True
    }
    
    # FastAPI automatically filters the dictionary through UserPublic,
    # stripping 'password' before sending the response to the client!
    return fake_db_record
```

### 4.5 Pydantic v2 Migration Best Practices
FastAPI supports Pydantic v2. Key syntactical patterns include:
- Use `model.model_dump()` instead of the deprecated `model.dict()`.
- Use `model.model_dump_json()` instead of `model.json()`.
- Configure model settings using `model_config = ConfigDict(from_attributes=True)` instead of the old nested `class Config:`.
- Use `from_attributes = True` (formerly `orm_mode = True`) to allow Pydantic to read data from SQLAlchemy ORM model objects.

### 4.6 Common Mistakes & Troubleshooting
1. **Sending Request Bodies in GET Requests**: The HTTP specification does not define semantics for GET request bodies. Use `POST`, `PUT`, or `PATCH` when sending Pydantic payloads.
2. **Using Pydantic v1 Syntax**: Calling `user.dict()` triggers deprecation warnings in Pydantic v2; use `user.model_dump()`.
3. **Missing `response_model` Filtering**: Returning raw database dictionaries or ORM instances without `response_model` risks accidentally leaking internal password hashes, credit card tokens, or internal audit fields.
4. **EmailStr Validation Errors**: `EmailStr` requires the optional `email-validator` package (`pip install email-validator`).

### 4.7 Chapter 4 Recap
- Pydantic models define clear data contracts between API clients and backend services.
- `BaseModel` handles automatic type conversion, validation, and serialization.
- `Field(...)` enforces boundary constraints (`min_length`, `ge`, `pattern`) and documents fields in Swagger UI.
- `response_model` filters outgoing payloads, guaranteeing sensitive data (like passwords) is never leaked.
- In Pydantic v2, use `model_dump()` and `ConfigDict(from_attributes=True)`.

---

### 4.8 Chapter 4 Quiz Book & Assessment

#### Multiple-Choice Questions (10)
1. What base class must all Pydantic schemas inherit from?
   * A) `DataModel`
   * B) `BaseModel`
   * C) `SchemaModel`
   * D) `ObjectValidator`
2. How do you specify that a field in a Pydantic model is required using `Field`?
   * A) `Field(required=True)`
   * B) `Field(...)` (Ellipsis)
   * C) `Field(None)`
   * D) `Field(mandatory=True)`
3. What Pydantic v2 method converts a model instance into a standard Python dictionary?
   * A) `model.to_dict()`
   * B) `model.model_dump()`
   * C) `model.as_dict()`
   * D) `model.serialize()`
4. What parameter in route decorators filters outgoing JSON responses against an output schema?
   * A) `output_schema`
   * B) `response_model`
   * C) `return_type`
   * D) `serialize_as`
5. Which Pydantic data type validates that a string is a syntactically valid email address?
   * A) `Email`
   * B) `EmailStr`
   * C) `MailAddress`
   * D) `StringEmail`
6. In `Field(..., ge=18, le=100)`, what do `ge` and `le` mean?
   * A) Generate and Load
   * B) Greater than or equal to, and Less than or equal to
   * C) Global entry and Local entry
   * D) Get and List
7. How do you enable ORM object reading in Pydantic v2?
   * A) `class Config: orm_mode = True`
   * B) `model_config = ConfigDict(from_attributes=True)`
   * C) `model_config = {"read_orm": True}`
   * D) `BaseModel(orm=True)`
8. What HTTP status code is standard for successfully creating a resource via a `POST` request?
   * A) 200 OK
   * B) 201 Created
   * C) 204 No Content
   * D) 202 Accepted
9. What happens if a client submits a JSON body missing a required field declared in a Pydantic schema?
   * A) FastAPI sets the missing field to `None` silently.
   * B) FastAPI returns an automatic HTTP 422 Unprocessable Entity error detailing the missing field.
   * C) The Python server raises an unhandled 500 error.
   * D) FastAPI prompts the client to resubmit.
10. Which Pydantic `Field` constraint sets a maximum allowable character length for a string?
    * A) `max_size`
    * B) `max_length`
    * C) `limit`
    * D) `cap`

#### True or False Questions (5)
1. **[True/False]** A single FastAPI path operation function can accept both Path Parameters and a Pydantic Request Body concurrently.
2. **[True/False]** Pydantic only checks types at compile time and does not perform runtime data conversion.
3. **[True/False]** Using `response_model` ensures that fields not defined in the response model are excluded from the final HTTP JSON output.
4. **[True/False]** In Pydantic v2, `model.dict()` is the recommended method for dictionary conversion.
5. **[True/False]** Setting a field with `Optional[str] = None` makes that field optional in the request body.

#### Short-Answer Questions (5)
1. Explain the primary security benefit of using a `response_model` when returning user records.
2. What is the difference between data validation and data parsing (coercion) in Pydantic?
3. What is the role of `ConfigDict(from_attributes=True)` when integrating FastAPI with SQLAlchemy?
4. How do you define a nested Pydantic model (for example, an `Address` inside a `UserProfile`)?
5. What extra dependency must be installed to use `EmailStr`?

#### Code Reading & Debugging Questions (3)
1. **Identify the Deprecated Method**:
```python
@app.post("/items")
def create_item(item: ItemCreate):
    data = item.dict()
    return data
```
* **Question**: Why will this code trigger a deprecation warning in modern Pydantic v2, and what is the fix?

2. **Fix the Missing Constraint**:
```python
class Account(BaseModel):
    username: str
    balance: float = Field(..., gt=0)
    pin: int = Field(..., min_length=4, max_length=4)
```
* **Question**: Why will Python raise a `ValueError` when defining `min_length` on an `int` field?

3. **Response Model Leak**:
```python
@app.post("/login")
def login(user: UserLogin):
    user_db = authenticate_user(user.email, user.password)
    return user_db
```
* **Question**: How can the developer prevent leaking `password_hash` in the response?

#### Practical Coding Challenges (2)
1. **Challenge 1**: Write a Pydantic schema `ProductCreate` that requires `name` (3 to 100 characters), `price` (float greater than 0), and optional `tags` (a list of strings defaulting to an empty list).
2. **Challenge 2**: Write a complete FastAPI route `@app.post("/products", response_model=ProductResponse, status_code=201)` that receives `ProductCreate`, simulates generating an `id` and `created_at` timestamp, and returns the response formatted according to `ProductResponse`.

---

### 4.9 Chapter 4 Answer Key & Explanations

#### MCQ Answers
1. **B** — All Pydantic data schemas inherit from `BaseModel`.
2. **B** — The ellipsis `...` denotes a required field in `Field(...)`.
3. **B** — `model.model_dump()` is the official Pydantic v2 method for converting models to dictionaries.
4. **B** — `response_model` filters outgoing response payloads against an output schema.
5. **B** — `EmailStr` validates email formatting.
6. **B** — `ge` stands for greater than or equal to; `le` stands for less than or equal to.
7. **B** — `model_config = ConfigDict(from_attributes=True)` enables ORM model reading in Pydantic v2.
8. **B** — HTTP 201 Created is the standard status code for successful creation operations.
9. **B** — FastAPI validates payloads and returns HTTP 422 with a structured error message detailing missing fields.
10. **B** — `max_length` limits maximum string length in `Field()`.

#### True/False Answers
1. **True** — Route functions can freely mix path parameters, query parameters, and Pydantic request bodies.
2. **False** — Pydantic performs active runtime data coercion and validation on every request.
3. **True** — Fields present in the return dictionary but absent from `response_model` are automatically excluded.
4. **False** — `model.dict()` is deprecated in Pydantic v2; `model.model_dump()` should be used instead.
5. **True** — Supplying a default value of `None` makes the field optional in the request payload.

#### Short-Answer Solutions
1. `response_model` acts as a security filter that guarantees internal secrets (such as hashed passwords or internal database flags) are excluded from client-facing JSON responses.
2. Data parsing actively coerces input values (like converting string `"42"` to int `42`), whereas validation ensures the resulting value satisfies specified constraints (e.g. `val > 0`).
3. `from_attributes=True` allows Pydantic to read attributes directly from SQLAlchemy ORM objects (`user.username`) rather than requiring dictionary key indexing (`user["username"]`).
4. Declare the child model first as a `BaseModel` subclass, then declare an attribute on the parent model using the child model as its type hint (e.g. `address: Address`).
5. `email-validator` (`pip install email-validator`).

#### Debugging Solutions
1. **Fix**: In Pydantic v2, `item.dict()` is deprecated. Replace it with `item.model_dump()`.
2. **Fix**: `min_length` and `max_length` apply only to strings or sequences. For integers, use `ge=1000, le=9999` or change the type to `pin: str = Field(..., min_length=4, max_length=4)`.
3. **Fix**: Define a `UserResponse` Pydantic model that excludes `password_hash` and set `response_model=UserResponse` on the route decorator.
