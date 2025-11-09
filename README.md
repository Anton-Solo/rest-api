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

- Node.js >= 24.10.0
- npm

## Installation

```bash
npm install
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

The project includes comprehensive test coverage:

- **Scenario 1:** Complete CRUD flow (create → read → update → delete)
- **Scenario 2:** Validation tests (invalid UUID, missing fields, wrong types)
- **Scenario 3:** Non-existing resources (404 errors)
- **Scenario 4:** Multiple users management

Run tests:
```bash
npm test
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid input (UUID, request body)
- `404 Not Found` - Resource not found or invalid endpoint
- `500 Internal Server Error` - Server-side errors

## Development

Built with:
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **uuid** - UUID generation
- **dotenv** - Environment variables

## License

ISC

