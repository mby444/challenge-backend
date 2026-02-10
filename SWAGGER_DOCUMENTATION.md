# API Documentation Guide

## Overview

This project now includes comprehensive **OpenAPI (Swagger)** documentation for all API endpoints. The documentation is interactive, automatically generated, and always up-to-date with the codebase.

## Accessing the Swagger Documentation

### Development Mode

1. Start the development server:

   ```bash
   npm run start:dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/api-docs
   ```

### Production Mode

1. Build and start the production server:

   ```bash
   npm run build
   npm run start:prod
   ```

2. Access the documentation at:
   ```
   http://localhost:3000/api-docs
   ```

## Features

The Swagger documentation includes:

✅ **Complete API Coverage**: All endpoints are documented with detailed descriptions
✅ **Request/Response Examples**: Real-world examples for every endpoint
✅ **Authentication**: Built-in JWT authentication testing capability
✅ **Interactive Testing**: Test API endpoints directly from the browser
✅ **Schema Validation**: Detailed request and response schemas
✅ **Error Responses**: Comprehensive error response documentation

## API Overview

### Base URL

All API endpoints are prefixed with `/api`:

```
http://localhost:3000/api
```

### Authentication

Most endpoints require JWT authentication. To use authenticated endpoints:

1. **Register** a new user or **Login** with existing credentials via:
   - `POST /api/auth/register`
   - `POST /api/auth/login`

2. Copy the `access_token` from the response

3. Click the **"Authorize"** button (🔓) at the top of the Swagger UI

4. Enter your token in the format: `Bearer YOUR_ACCESS_TOKEN`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

5. Click **"Authorize"** to apply the token to all requests

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint             | Description                    | Auth Required |
| ------ | -------------------- | ------------------------------ | ------------- |
| POST   | `/api/auth/register` | Register a new user account    | ❌            |
| POST   | `/api/auth/login`    | Authenticate and get JWT token | ❌            |

### Users (`/api/users`)

| Method | Endpoint        | Description                 | Auth Required |
| ------ | --------------- | --------------------------- | ------------- |
| GET    | `/api/users/me` | Get current user profile    | ✅            |
| PATCH  | `/api/users/me` | Update current user profile | ✅            |
| DELETE | `/api/users/me` | Delete current user account | ✅            |

### Tasks (`/api/tasks`)

| Method | Endpoint         | Description          | Auth Required |
| ------ | ---------------- | -------------------- | ------------- |
| POST   | `/api/tasks`     | Create a new task    | ✅            |
| GET    | `/api/tasks`     | Get all user's tasks | ✅            |
| GET    | `/api/tasks/:id` | Get a specific task  | ✅            |
| PATCH  | `/api/tasks/:id` | Update a task        | ✅            |
| DELETE | `/api/tasks/:id` | Delete a task        | ✅            |

### Tags (`/api/tags`)

| Method | Endpoint                         | Description          | Auth Required |
| ------ | -------------------------------- | -------------------- | ------------- |
| POST   | `/api/tags`                      | Create a new tag     | ✅            |
| GET    | `/api/tags`                      | Get all user's tags  | ✅            |
| GET    | `/api/tags/:id`                  | Get a specific tag   | ✅            |
| PATCH  | `/api/tags/:id`                  | Update a tag         | ✅            |
| DELETE | `/api/tags/:id`                  | Delete a tag         | ✅            |
| POST   | `/api/tags/:tagId/tasks/:taskId` | Attach tag to task   | ✅            |
| DELETE | `/api/tags/:tagId/tasks/:taskId` | Detach tag from task | ✅            |

## Using the Swagger UI

### Testing an Endpoint

1. Navigate to the endpoint you want to test
2. Click on the endpoint to expand its details
3. Click **"Try it out"**
4. Fill in the required parameters and request body
5. Click **"Execute"**
6. View the response below, including:
   - Response code
   - Response body
   - Response headers
   - cURL command for the request

### Example: Creating a Task

1. First, authenticate (see Authentication section above)
2. Navigate to `POST /api/tasks`
3. Click **"Try it out"**
4. Edit the request body:
   ```json
   {
     "title": "Complete project documentation",
     "description": "Write comprehensive API documentation using OpenAPI/Swagger",
     "isCompleted": false
   }
   ```
5. Click **"Execute"**
6. View the created task in the response

## Response Codes

The API uses standard HTTP status codes:

- **200 OK**: Successful GET/PATCH request
- **201 Created**: Successful POST request
- **204 No Content**: Successful DELETE request
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists

## Data Models

All data models (DTOs) are fully documented in the Swagger UI with:

- Field descriptions
- Data types
- Validation rules
- Example values

### Example Models

**User**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "birth": "1990-01-15T00:00:00.000Z",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z"
}
```

**Task**

```json
{
  "id": "750e8400-e29b-41d4-a716-446655440001",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "isCompleted": false,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z",
  "tags": []
}
```

**Tag**

```json
{
  "id": "850e8400-e29b-41d4-a716-446655440003",
  "name": "Urgent",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z"
}
```

## Swagger Configuration

The Swagger configuration is located in `src/main.ts` and includes:

- **API Title**: Task Management API
- **Version**: 1.0
- **Authentication**: JWT Bearer token
- **Tags**: Authentication, Users, Tasks, Tags

## Exporting OpenAPI Specification

You can export the OpenAPI specification in JSON format by accessing:

```
http://localhost:3000/api-docs-json
```

This can be used with tools like:

- Postman (import collection)
- Insomnia
- API testing frameworks
- Code generators

## Benefits of Swagger Documentation

1. **Developer Experience**: Interactive documentation makes it easy to understand and test the API
2. **Always Up-to-Date**: Documentation is generated from code decorators
3. **Client Generation**: OpenAPI spec can generate client SDKs in various languages
4. **Testing**: Built-in UI for testing endpoints without additional tools
5. **Collaboration**: Clear contract between frontend and backend teams

## Swagger Decorators Used

The following NestJS Swagger decorators are used throughout the codebase:

- `@ApiTags()`: Group endpoints by resource
- `@ApiOperation()`: Describe endpoint operations
- `@ApiResponse()`: Document response codes and schemas
- `@ApiBody()`: Describe request body
- `@ApiParam()`: Document URL parameters
- `@ApiProperty()`: Document DTO properties
- `@ApiPropertyOptional()`: Document optional DTO properties
- `@ApiBearerAuth()`: Mark endpoints requiring JWT authentication

## Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)

## Troubleshooting

### Swagger UI Not Loading

1. Ensure the server is running
2. Check the console for errors
3. Verify the port is correct (default: 3000)
4. Clear browser cache and reload

### Authentication Not Working

1. Ensure you've copied the complete token
2. Include the "Bearer " prefix
3. Check token hasn't expired
4. Verify you're authenticated before testing protected endpoints

## Contact

For questions or issues with the API documentation, please consult the Swagger UI at `/api-docs` or refer to this guide.
