# CHAPTER 3: Path Parameters
*(Corresponding to Video Part 3: Path Parameters — Type Validation & Custom Error Handlers)*

### 3.1 Declaring Path Parameters & Type Annotations
In RESTful API design, **Path Parameters** are variable segments of the URL path used to identify a specific resource. For example, in `/users/42`, `42` is a dynamic path parameter representing the user's primary identifier.

FastAPI makes declaring path parameters intuitive by using Python format-string syntax in route decorators, combined with standard Python type annotations in the endpoint function signature.

```python
from fastapi import FastAPI

app = FastAPI()

# {item_id} in the path corresponds directly to the item_id parameter in the function
@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {
        "item_id": item_id,
        "type": str(type(item_id)),
        "description": f"Retrieved record for item #{item_id}"
    }
```

### 3.2 Automatic Type Validation & 422 Errors
When a client requests `GET /items/42`, FastAPI converts `"42"` into Python `int` `42` and returns HTTP 200 OK.

However, if a client requests `GET /items/foo`, FastAPI detects that `"foo"` cannot be cast to an integer. Instead of crashing with a Python `ValueError` or unhandled 500 Internal Server Error, FastAPI immediately interrupts request execution and responds with a standard **HTTP 422 Unprocessable Entity** error:

```json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "item_id"],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "foo"
    }
  ]
}
```

### 3.3 Route Order & Precedence
In FastAPI, routes are evaluated in the **exact order they are declared in the code**. This is critical when defining fixed endpoints that could collide with dynamic path parameters.

```python
# CORRECT ORDER:
# 1. Define fixed/static paths first
@app.get("/users/me")
def get_current_user():
    return {"user": "Current authenticated user profile"}

# 2. Define parameterized paths second
@app.get("/users/{user_id}")
def get_user_by_id(user_id: int):
    return {"user_id": user_id}
```
If `@app.get("/users/{user_id}")` were declared first, an incoming request to `/users/me` would match `{user_id}` with the string `"me"`. Because `user_id` expects an integer, FastAPI would return an HTTP 422 error instead of matching the intended `/users/me` endpoint.

### 3.4 Predefined Choices with Python `Enum`
When a path parameter should only accept a predefined set of valid strings, use Python's built-in `enum.Enum`:

```python
from enum import Enum
from fastapi import FastAPI

class ModelName(str, Enum):
    ALEXNET = "alexnet"
    RESNET = "resnet"
    LENET = "lenet"

app = FastAPI()

@app.get("/models/{model_name}")
def get_model(model_name: ModelName):
    if model_name is ModelName.ALEXNET:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}
    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}
    return {"model_name": model_name, "message": "Have some residuals"}
```
FastAPI automatically populates the interactive `/docs` Swagger UI with a dropdown selector showing only the allowed values (`alexnet`, `resnet`, `lenet`). Any other value returns an automatic HTTP 422 error.

### 3.5 Combining Path & Query Parameters
FastAPI automatically distinguishes between **Path Parameters** (declared in the path string) and **Query Parameters** (declared only in function arguments):

```python
from typing import Optional
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

# Database simulation
fake_items_db = {
    1: {"name": "Laptop", "category": "electronics", "in_stock": True},
    2: {"name": "Desk Chair", "category": "furniture", "in_stock": False},
    3: {"name": "Coffee Mug", "category": "kitchenware", "in_stock": True}
}

@app.get("/items/{item_id}")
def read_item(item_id: int, include_details: bool = False, q: Optional[str] = None):
    if item_id not in fake_items_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID {item_id} was not found in database."
        )
    
    item = fake_items_db[item_id]
    response = {"item_id": item_id, "name": item["name"]}
    if include_details:
        response["details"] = item
    if q:
        response["query"] = q
    return response
```

### 3.6 Common Mistakes & Troubleshooting
1. **Route Ordering Collisions**: Always declare fixed routes (e.g. `/users/current`) before dynamic parameterized routes (`/users/{id}`).
2. **Missing `raise` on HTTPException**: Writing `HTTPException(...)` without `raise` merely creates an exception object without halting execution. Always write `raise HTTPException(...)`.
3. **Type Mismatches in Path Definitions**: Ensure the parameter name inside curly braces `{item_id}` matches the function argument name `item_id` character for character.

### 3.7 Chapter 3 Recap
- Path parameters capture dynamic values from URL path segments using `{param_name}`.
- Python type annotations (`int`, `str`, `float`, `UUID`, `Enum`) trigger automatic type conversion and validation.
- Invalid parameter types return standard HTTP 422 Unprocessable Entity responses automatically.
- Route declaration order matters: place static routes before parameterized routes.
- `HTTPException(status_code=..., detail=...)` sends clear HTTP error responses to clients.

---

### 3.8 Chapter 3 Quiz Book & Assessment

#### Multiple-Choice Questions (10)
1. How do you declare a path parameter named `user_id` in a FastAPI route decorator?
   * A) `@app.get("/users/:user_id")`
   * B) `@app.get("/users/{user_id}")`
   * C) `@app.get("/users/<user_id>")`
   * D) `@app.get("/users/$user_id")`
2. What HTTP status code does FastAPI automatically return when a path parameter fails type validation?
   * A) HTTP 400 Bad Request
   * B) HTTP 422 Unprocessable Entity
   * C) HTTP 404 Not Found
   * D) HTTP 500 Internal Server Error
3. What happens if `@app.get("/posts/{post_id}")` is declared *before* `@app.get("/posts/latest")`?
   * A) FastAPI will raise an error at startup.
   * B) A request to `/posts/latest` will be captured by `{post_id}` with `post_id = "latest"`.
   * C) `/posts/latest` will take precedence automatically.
   * D) The server will crash.
4. Which standard Python module is used to define predefined fixed choice parameters in FastAPI?
   * A) `collections`
   * B) `enum`
   * C) `itertools`
   * D) `dataclasses`
5. How does FastAPI determine whether a function parameter is a Path Parameter or a Query Parameter?
   * A) By the parameter's type hint.
   * B) If the parameter name appears inside `{}` in the route path, it is a Path Parameter; otherwise, it is a Query Parameter.
   * C) Query parameters must be prefixed with `q_`.
   * D) You must always use the `Query()` wrapper function.
6. What exception class should be raised to return an HTTP 404 error from an endpoint?
   * A) `NotFoundError`
   * B) `HTTPException`
   * C) `RouteException`
   * D) `RequestError`
7. What argument in `HTTPException` specifies the user-facing error message?
   * A) `message`
   * B) `detail`
   * C) `error`
   * D) `description`
8. If a path parameter is typed as `item_id: int`, what type is the value when passed into the function?
   * A) `str`
   * B) `int`
   * C) `float`
   * D) `bytes`
9. How can a query parameter be made optional with a default value of `None`?
   * A) `q: str = None` or `q: Optional[str] = None`
   * B) `q: str = required`
   * C) `q: optional(str)`
   * D) `q: None[str]`
10. What module provides standardized HTTP status code constants such as `HTTP_404_NOT_FOUND` in FastAPI?
    * A) `fastapi.codes`
    * B) `fastapi.status`
    * C) `http.constants`
    * D) `urllib.status`

#### True or False Questions (5)
1. **[True/False]** Path parameters in FastAPI are always received as strings regardless of the type annotation.
2. **[True/False]** When using an `Enum` for path parameters, FastAPI automatically restricts the OpenAPI documentation to only allow valid enum options.
3. **[True/False]** Raising `HTTPException(status_code=400, detail="Invalid data")` terminates request execution immediately and returns a JSON error response.
4. **[True/False]** Static route definitions should always be placed below parameterized route definitions in your Python code.
5. **[True/False]** FastAPI can automatically parse standard Python `UUID` path parameters and validate their hex format.

#### Short-Answer Questions (5)
1. What is the key difference between a Path Parameter and a Query Parameter in URL anatomy?
2. Explain why FastAPI returns HTTP 422 instead of HTTP 400 for type conversion failures.
3. Why is it important to inherit from `(str, Enum)` when creating an enum for FastAPI path parameters?
4. What happens if you instantiate an `HTTPException` without using the `raise` keyword?
5. How does FastAPI handle boolean query parameters like `?include_details=true` or `?include_details=1`?

#### Code Reading & Debugging Questions (3)
1. **Identify the Route Order Bug**:
```python
@app.get("/orders/{order_id}")
def get_order(order_id: int):
    return {"order_id": order_id}

@app.get("/orders/recent")
def get_recent_orders():
    return {"orders": ["Order 101", "Order 102"]}
```
* **Question**: What error occurs when a client makes a `GET /orders/recent` request?

2. **Fix the Exception**:
```python
@app.get("/items/{id}")
def get_item(id: int):
    if id > 100:
        HTTPException(status_code=404, detail="Item not found")
    return {"item_id": id}
```
* **Question**: Why does this endpoint return `{"item_id": 105}` even when `id` is 105?

3. **Enum Matching**:
```python
class Tag(Enum):
    PYTHON = "python"
    FASTAPI = "fastapi"

@app.get("/tags/{tag}")
def get_tag(tag: Tag):
    return {"tag": tag.value}
```
* **Question**: Why will `/docs` render properly, but inheriting `(str, Enum)` is strongly recommended over plain `Enum`?

#### Practical Coding Challenges (2)
1. **Challenge 1**: Create a FastAPI route `@app.get("/courses/{course_code}")` where `course_code` must be an uppercase string between 3 and 8 characters. Raise an `HTTPException` with status code 400 if the code contains lowercase letters.
2. **Challenge 2**: Write an endpoint `@app.get("/calculate/{operation}/{a}/{b}")` where `operation` is an enum (`add`, `subtract`, `multiply`), and `a` and `b` are floats. Return the calculated result in a JSON object.

---

### 3.9 Chapter 3 Answer Key & Explanations

#### MCQ Answers
1. **B** — Curly braces `{user_id}` denote path parameters in FastAPI.
2. **B** — Type conversion failures trigger HTTP 422 Unprocessable Entity.
3. **B** — Route evaluation is sequential; `/posts/{post_id}` intercepts the string `"latest"`.
4. **B** — Python's `enum.Enum` defines fixed choice sets.
5. **B** — Parameters present in the path template are path params; remaining parameters are query params.
6. **B** — `HTTPException` is the standard exception class in FastAPI/Starlette.
7. **B** — The `detail` keyword argument contains the error description string or list.
8. **B** — FastAPI converts the string to Python `int` before executing the function body.
9. **A** — `q: Optional[str] = None` or `q: str = None` makes query parameters optional.
10. **B** — `fastapi.status` provides standard HTTP status constants (aliases of `http.HTTPStatus`).

#### True/False Answers
1. **False** — FastAPI automatically parses and converts the parameter to the type specified in the type hint (e.g. `int`, `float`, `UUID`).
2. **True** — The OpenAPI schema detects enum members and renders them as dropdown choices in Swagger UI.
3. **True** — Raising `HTTPException` halts execution and sends the formatted JSON error response immediately.
4. **False** — Static routes must be defined *before* parameterized routes to prevent path collisions.
5. **True** — Declaring `item_id: UUID` automatically validates standard UUID strings (e.g. `123e4567-e89b-12d3-a456-426614174000`).

#### Short-Answer Solutions
1. Path parameters are part of the resource identifier hierarchy (`/users/123`), whereas query parameters appear after the `?` delimiter (`/users?role=admin&limit=10`) and are typically used for filtering, sorting, or pagination.
2. HTTP 422 (Unprocessable Entity) specifically indicates that the request syntax was received correctly (valid HTTP/JSON), but the semantic content or type instructions were unprocessable, following RFC 4918.
3. Inheriting from `str` (`class ModelName(str, Enum)`) ensures OpenAPI documentation accurately serializes the values as strings and allows string comparisons directly without calling `.value`.
4. Without `raise`, Python evaluates the expression, creates an unused exception object in memory, and continues executing the remainder of the function.
5. FastAPI intelligently converts truthy strings (`"true"`, `"True"`, `"1"`, `"yes"`, `"on"`) to Python `True`, and falsy strings (`"false"`, `"0"`, `"no"`, `"off"`) to `False`.

#### Debugging Solutions
1. **Fix**: `/orders/{order_id}` matches the request with `order_id = "recent"`. Because `order_id` is typed as an `int`, FastAPI returns a 422 Unprocessable Entity error. Reorder the routes so `@app.get("/orders/recent")` appears first.
2. **Fix**: The code instantiates `HTTPException` without the `raise` keyword. Change line 4 to `raise HTTPException(status_code=404, detail="Item not found")`.
3. **Fix**: Inheriting from `str` (`class Tag(str, Enum)`) ensures the OpenAPI documentation properly types the parameter as a string in Swagger UI and ReDoc.
