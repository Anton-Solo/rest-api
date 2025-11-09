# REST API with In-Memory Database

Simple CRUD API built with Node.js and TypeScript, featuring in-memory storage and horizontal scaling capabilities.

## Features

- ✅ Pure Node.js HTTP server (no frameworks like Express)
- ✅ TypeScript with strict type checking
- ✅ In-memory database
- ✅ Full CRUD operations for User resources
- ✅ UUID validation
- ✅ Comprehensive error handling
- ✅ Automated testing with Jest
- ✅ Horizontal scaling with Node.js Cluster API

## Requirements

- Node.js >= 24.10.0 (recommended) or >= 22.0.0
- npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Anton-Solo/rest-api.git
cd rest-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, default PORT is 4000):
```bash
cp .env.example .env
```

Edit `.env` if you want to change the port:
```env
PORT=4000
```

## Available Scripts

### Development Mode
```bash
npm run start:dev
# or
npm run dev
```
Starts the server in development mode with hot reload using `ts-node-dev`.

### Production Mode
```bash
npm run start:prod
```
Builds the TypeScript code and runs the compiled JavaScript.

### Multi-Instance Mode (Horizontal Scaling)
```bash
npm run start:multi
```
Starts multiple worker processes using Node.js Cluster API:
- Creates N-1 workers (where N = number of CPU cores, minimum 1)
- Each worker listens on the same PORT
- Node.js automatically distributes incoming connections using round-robin
- Automatic worker restart on failure

**Note:** In cluster mode, each worker has its own in-memory database. For production use with shared state, consider using Redis or another external data store.

### Build
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist/` directory.

### Testing
```bash
npm test
```
Runs the test suite with Jest (10 test scenarios covering all CRUD operations).

## API Endpoints

### Base URL
```
http://localhost:4000/api
```

### Endpoints

#### GET `/api/users`
Get all users.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "username": "string",
    "age": number,
    "hobbies": ["string"]
  }
]
```

#### GET `/api/users/{userId}`
Get user by ID.

**Responses:**
- `200 OK` - User found
- `400 Bad Request` - Invalid UUID
- `404 Not Found` - User not found

#### POST `/api/users`
Create a new user.

**Request Body:**
```json
{
  "username": "string",
  "age": number,
  "hobbies": ["string"]
}
```

**Responses:**
- `201 Created` - User created successfully
- `400 Bad Request` - Invalid request body

#### PUT `/api/users/{userId}`
Update existing user.

**Request Body:**
```json
{
  "username": "string",
  "age": number,
  "hobbies": ["string"]
}
```

**Responses:**
- `200 OK` - User updated successfully
- `400 Bad Request` - Invalid UUID or request body
- `404 Not Found` - User not found

#### DELETE `/api/users/{userId}`
Delete user by ID.

**Responses:**
- `204 No Content` - User deleted successfully
- `400 Bad Request` - Invalid UUID
- `404 Not Found` - User not found

## User Model

```typescript
{
  id: string;        // UUID v4, generated automatically
  username: string;  // Required
  age: number;       // Required, integer
  hobbies: string[]; // Required, can be empty array
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4000
```

## Project Structure

```
src/
├── index.ts                    # Main entry point (single instance)
├── clusterSimple.ts           # Cluster mode entry point
├── server.ts                  # HTTP server factory
├── router.ts                  # Request routing
├── controllers/
│   └── userController.ts      # User CRUD operations
├── db/
│   └── database.ts            # In-memory database
├── types/
│   └── user.ts                # TypeScript interfaces
├── utils/
│   ├── request.ts             # Request parsing utilities
│   ├── response.ts            # Response utilities
│   └── validation.ts          # Input validation
└── __tests__/
    └── api.test.ts            # API integration tests
```

## Testing

### Automated Tests

The project includes comprehensive test coverage with Jest and Supertest:

- **Scenario 1:** Complete CRUD flow (create → read → update → delete)
- **Scenario 2:** Validation tests (invalid UUID, missing fields, wrong types)
- **Scenario 3:** Non-existing resources (404 errors)
- **Scenario 4:** Multiple users management

Run tests:
```bash
npm test
```

**Expected output:**
```
Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

### Manual Testing with Postman

#### Option 1: Import Postman Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the `postman_collection.json` file from the project root
4. The collection "REST API - CRUD Users" will appear in your workspace

#### Option 2: Manual API Testing

**Prerequisites:**
- Start the server: `npm run start:dev`
- Server will run on `http://localhost:4000`

**Test Sequence:**

1. **GET all users (empty array)**
   ```
   GET http://localhost:4000/api/users
   Expected: 200 OK, []
   ```

2. **Create a user**
   ```
   POST http://localhost:4000/api/users
   Headers: Content-Type: application/json
   Body:
   {
     "username": "John Doe",
     "age": 30,
     "hobbies": ["reading", "gaming"]
   }
   Expected: 201 Created
   Response: { "id": "uuid-here", "username": "John Doe", ... }
   ```
   **⚠️ Important:** Copy the `id` from the response for next requests!

3. **Get user by ID**
   ```
   GET http://localhost:4000/api/users/{id}
   Replace {id} with the UUID from step 2
   Expected: 200 OK
   ```

4. **Update user**
   ```
   PUT http://localhost:4000/api/users/{id}
   Headers: Content-Type: application/json
   Body:
   {
     "username": "Jane Doe",
     "age": 25,
     "hobbies": ["painting"]
   }
   Expected: 200 OK
   ```

5. **Delete user**
   ```
   DELETE http://localhost:4000/api/users/{id}
   Expected: 204 No Content
   ```

6. **Verify deletion**
   ```
   GET http://localhost:4000/api/users/{id}
   Expected: 404 Not Found
   ```

#### Using Postman Variables

To avoid manually copying UUIDs:

1. Create a new Environment in Postman
2. Add a variable: `userId`
3. In the POST request, go to **Tests** tab and add:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("userId", jsonData.id);
   ```
4. Use `{{userId}}` in subsequent requests instead of hardcoded IDs

### Manual Testing with cURL

```bash
# 1. Get all users
curl http://localhost:4000/api/users

# 2. Create a user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"John Doe","age":30,"hobbies":["reading"]}'

# 3. Get user by ID (replace UUID with actual ID from step 2)
curl http://localhost:4000/api/users/YOUR-UUID-HERE

# 4. Update user
curl -X PUT http://localhost:4000/api/users/YOUR-UUID-HERE \
  -H "Content-Type: application/json" \
  -d '{"username":"Jane Doe","age":25,"hobbies":["painting"]}'

# 5. Delete user
curl -X DELETE http://localhost:4000/api/users/YOUR-UUID-HERE

# 6. Verify deletion (should return 404)
curl http://localhost:4000/api/users/YOUR-UUID-HERE
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid input (UUID, request body)
- `404 Not Found` - Resource not found or invalid endpoint
- `500 Internal Server Error` - Server-side errors

## Troubleshooting

### Port Already in Use

If you get an error that port 4000 is already in use:

```bash
# Find and kill the process using port 4000
lsof -ti:4000 | xargs kill -9

# Or change the port in .env file
PORT=3000
```

### Tests Failing

Make sure no server is running when executing tests:

```bash
# Kill any running servers
pkill -f "tsx watch"
pkill -f "node dist"

# Then run tests
npm test
```

### Module Not Found Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```
## Project Highlights





