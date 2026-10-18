# QuickNotes REST API Design

This document specifies the production RESTful API design for the QuickNotes service backend.

## REST Endpoints Table

| Method | Path | Description | Success Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notes` | Retrieve a paginated list of notes for the authenticated user. | `200 OK` |
| `GET` | `/api/v1/notes/{id}` | Retrieve a single note by its unique ID. | `200 OK` |
| `POST` | `/api/v1/notes` | Create a new note. | `201 Created` |
| `PUT` | `/api/v1/notes/{id}` | Fully update an existing note. | `200 OK` |
| `DELETE` | `/api/v1/notes/{id}` | Delete a note by its unique ID. | `204 No Content` |
| `GET` | `/api/v1/tags/{tagId}/notes` | Retrieve all notes associated with a specific tag. | `200 OK` |

---

## Request & Response Examples

### 1. Create a Note (`POST /api/v1/notes`)
Request Body:
```json
{
  "title": "System Architecture Review",
  "body": "Discuss load balancing and database replication strategies.",
  "tag_ids": [2, 5]
}
Success Response (201 Created):
{
  "status": "success",
  "data": {
    "id": 4892,
    "user_id": 104,
    "title": "System Architecture Review",
    "body": "Discuss load balancing and database replication strategies.",
    "created_at": "2026-06-06T14:30:00Z",
    "updated_at": "2026-06-06T14:30:00Z"
  }
}

2. List Notes (GET /api/v1/notes)
Success Response (200 OK):
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "id": 4892,
      "user_id": 104,
      "title": "System Architecture Review",
      "body": "Discuss load balancing and database replication strategies.",
      "created_at": "2026-06-06T14:30:00Z"
    },
    {
      "id": 4891,
      "user_id": 104,
      "title": "Grocery List",
      "body": "Milk, eggs, coffee beans.",
      "created_at": "2026-06-05T09:15:00Z"
    }
  ]
}
Error Handling & Status Codes
The API returns standard HTTP status codes along with a JSON error body containing an error code and message.

Error Status Codes
400 Bad Request: Validation failure (e.g., missing or title exceeding 100 characters).

401 Unauthorized: Missing or invalid authentication token.

403 Forbidden: Authenticated user lacks permission to access or modify the requested resource.

404 Not Found: The requested resource ID does not exist.

500 Internal Server Error: Unexpected server-side failure.

Example Error Response Body (400 Bad Request)
JSON
{
  "status": "fail",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be 100 characters or fewer."
  }
}
