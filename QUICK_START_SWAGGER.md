# 📚 Quick Start Guide - Swagger API Documentation

## 🚀 Start the Server

```bash
npm run start:dev
```

Console output:

```
Application is running on: http://localhost:3000
Swagger documentation is available at: http://localhost:3000/api-docs
```

## 🌐 Access Swagger UI

Open your browser and navigate to:

```
http://localhost:3000/api-docs
```

## 📋 API Endpoints Overview

### 🔐 Authentication (No Auth Required)

```
POST   /api/auth/register    Register new user
POST   /api/auth/login       Login and get JWT token
```

### 👤 Users (🔒 Auth Required)

```
GET    /api/users/me         Get current user profile
PATCH  /api/users/me         Update current user profile
DELETE /api/users/me         Delete current user account
```

### ✅ Tasks (🔒 Auth Required)

```
POST   /api/tasks            Create new task
GET    /api/tasks            Get all user's tasks
GET    /api/tasks/:id        Get specific task
PATCH  /api/tasks/:id        Update task
DELETE /api/tasks/:id        Delete task
```

### 🏷️ Tags (🔒 Auth Required)

```
POST   /api/tags                      Create new tag
GET    /api/tags                      Get all user's tags
GET    /api/tags/:id                  Get specific tag
PATCH  /api/tags/:id                  Update tag
DELETE /api/tags/:id                  Delete tag
POST   /api/tags/:tagId/tasks/:taskId Attach tag to task
DELETE /api/tags/:tagId/tasks/:taskId Detach tag from task
```

## 🔑 Using Authentication in Swagger

### Step 1: Register or Login

1. Expand `POST /api/auth/register` or `POST /api/auth/login`
2. Click **"Try it out"**
3. Fill in the request body:
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User",
     "birth": "1990-01-15"
   }
   ```
4. Click **"Execute"**
5. **Copy** the `access_token` from the response

### Step 2: Authorize

1. Click the **"Authorize"** button (🔓) at the top right
2. In the dialog, enter: `Bearer YOUR_ACCESS_TOKEN`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**
4. Click **"Close"**

### Step 3: Test Protected Endpoints

Now you can test any endpoint marked with 🔒!

## 💡 Example Workflow

### Create a Task

```
POST /api/tasks
```

Request Body:

```json
{
  "title": "Complete API Documentation",
  "description": "Write comprehensive Swagger documentation",
  "isCompleted": false
}
```

Response (201):

```json
{
  "id": "750e8400-e29b-41d4-a716-446655440001",
  "title": "Complete API Documentation",
  "description": "Write comprehensive Swagger documentation",
  "isCompleted": false,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z"
}
```

### Create a Tag

```
POST /api/tags
```

Request Body:

```json
{
  "name": "Urgent"
}
```

### Attach Tag to Task

```
POST /api/tags/{tagId}/tasks/{taskId}
```

Use the IDs from previous responses!

## 🎯 Features

✅ **Interactive Testing** - Test all endpoints directly from browser  
✅ **Clear Examples** - Realistic request/response examples  
✅ **Authentication** - Built-in JWT token management  
✅ **Error Documentation** - All error responses explained  
✅ **Real-time Validation** - See validation errors immediately

## 📊 Response Status Codes

- **200 OK** - Successful GET/PATCH request
- **201 Created** - Successful POST request
- **204 No Content** - Successful DELETE request
- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Missing or invalid token
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate resource

## 🔍 Tips

1. **Expand/Collapse** - Click on endpoints to see details
2. **Model Schemas** - Click "Model" tab to see full data structure
3. **cURL Commands** - Copy cURL commands for CLI testing
4. **Persistent Auth** - Token persists in Swagger UI session
5. **Try It Out** - Green "Execute" button sends real requests

## 📖 Full Documentation

For complete documentation, see:

- `SWAGGER_DOCUMENTATION.md` - Detailed usage guide
- `OPENAPI_IMPLEMENTATION_SUMMARY.md` - Implementation details

## 🎉 You're Ready!

Visit **http://localhost:3000/api-docs** and start exploring your API!

All endpoints are fully documented in English with clear descriptions, examples, and error handling.

---

**Happy Testing! 🚀**
