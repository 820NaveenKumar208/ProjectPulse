# ProjectPulse REST API Specification

All API requests are prefixed with `/api/v1`. Request and response bodies are formatted as JSON.

---

## 🔒 Authentication Headers

Protected endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## 👥 1. Authentication Endpoints

### Register User
* **Method & Route**: `POST /auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "manager",
    "organizationId": "org-123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "data": {
      "user": {
        "id": "60d5ec4b868e4a2e58eb3d44",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "manager",
        "organizationId": "org-123"
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### Login User
* **Method & Route**: `POST /auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123"
  }
  ```
* **Success Response (200 OK)**: Same structure as Register response.

### Refresh Token
* **Method & Route**: `POST /auth/refresh`
* **Access**: Public (Requires valid Refresh Token)
* **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

---

## 📁 2. Project Management Endpoints

### List Projects
* **Method & Route**: `GET /projects`
* **Access**: Protected (Managers see owned; Clients see assigned)
* **Query Parameters**:
  * `page` (optional, default: 1)
  * `limit` (optional, default: 20)
  * `search` (optional, filters by name/description)
  * `status` (optional: `planning`, `active`, `paused`, `completed`, `archived`)
* **Success Response (200 OK)**:
  ```json
  {
    "data": {
      "projects": [
        {
          "id": "60d5ec4b868e4a2e58eb3d45",
          "name": "Website redesign",
          "description": "Redesign corporate site",
          "clientId": "60d5ec4b868e4a2e58eb3d46",
          "managerId": "60d5ec4b868e4a2e58eb3d44",
          "startDate": "2026-06-10T00:00:00.000Z",
          "endDate": "2026-08-30T00:00:00.000Z",
          "status": "planning",
          "progress": 0,
          "healthScore": 50,
          "healthStatus": "good"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
  ```

### Create Project
* **Method & Route**: `POST /projects`
* **Access**: Protected (Managers only)
* **Request Body**:
  ```json
  {
    "name": "SaaS Platform Development",
    "description": "Building next-gen dashboard",
    "clientId": "60d5ec4b868e4a2e58eb3d46",
    "startDate": "2026-07-01",
    "endDate": "2026-12-31"
  }
  ```
* **Success Response (201 Created)**: Returns the created Project object.

### Get Project Details
* **Method & Route**: `GET /projects/:projectId`
* **Access**: Protected (Manager / Assigned Client)

### Update Project
* **Method & Route**: `PUT /projects/:projectId`
* **Access**: Protected (Manager only)

### Delete Project
* **Method & Route**: `DELETE /projects/:projectId`
* **Access**: Protected (Manager only)

---

## 🏁 3. Milestone Management Endpoints

### List Milestones
* **Method & Route**: `GET /projects/:projectId/milestones`
* **Access**: Protected

### Create Milestone
* **Method & Route**: `POST /projects/:projectId/milestones`
* **Access**: Protected (Manager only)
* **Request Body**:
  ```json
  {
    "title": "Wireframes Approval",
    "description": "Deliver final UX layout mocks",
    "dueDate": "2026-07-15"
  }
  ```

### Request Approval on Milestone
* **Method & Route**: `POST /projects/milestones/:milestoneId/request-approval`
* **Access**: Protected (Manager only)
* **Success Response (200 OK)**: Triggers an `APPROVAL_REQUESTED` notification for the client.

### Client Approve Milestone
* **Method & Route**: `POST /projects/milestones/:milestoneId/approve`
* **Access**: Protected (Client only)
* **Success Response (200 OK)**: Triggers an `APPROVAL_APPROVED` notification for the manager. Sets status to `completed`.

### Client Request Changes on Milestone
* **Method & Route**: `POST /projects/milestones/:milestoneId/request-changes`
* **Access**: Protected (Client only)
* **Request Body**:
  ```json
  {
    "notes": "Please update color contrast on home screen."
  }
  ```
* **Success Response (200 OK)**: Triggers an `APPROVAL_REJECTED` notification for the manager. Sets status to `changes_requested`.

---

## 📈 4. AI Reports Endpoints

### Generate AI Weekly Report
* **Method & Route**: `POST /projects/:projectId/reports`
* **Access**: Protected (Manager only)
* **Success Response (201 Created)**: Returns the generated weekly report (Completed Work, Risks, Blockers, overall Health Score). Triggers `REPORT_GENERATED` notification for the client.

### List Project Reports
* **Method & Route**: `GET /projects/:projectId/reports`
* **Access**: Protected

---

## 🔗 5. Public Share Links Endpoints

### Retrieve Project Progress publicly (No Login Required)
* **Method & Route**: `GET /share/:token`
* **Access**: Public
* **Success Response (200 OK)**: Returns read-only project metadata, milestone timeline, progress percentage, and health status.

### Enable / Rotate Public Share Link
* **Method & Route**: `POST /projects/:projectId/share`
* **Access**: Protected (Manager only)
* **Request Body**:
  ```json
  {
    "expiresInDays": 30
  }
  ```
* **Success Response (200 OK)**: Returns the active `shareToken`.

### Disable Public Share Link
* **Method & Route**: `DELETE /projects/:projectId/share`
* **Access**: Protected (Manager only)
