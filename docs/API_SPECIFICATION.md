# ProjectPulse API Specification

## API Style

Decision: Build REST APIs with JSON payloads.

Reasoning: The requirements explicitly ask for REST APIs. REST maps cleanly to projects, milestones, approvals, reports, notifications, and public share links.

## Base URL

Development:

`/api`

Versioning:

`/api/v1`

Decision: Use `/api/v1` for implementation.

Reasoning: Versioning creates room for future client-facing API changes without breaking deployed clients.

## Authentication

Access tokens:

- Short-lived JWT.
- Sent in `Authorization: Bearer <token>`.

Refresh tokens:

- Longer-lived.
- Stored securely by the client.
- Hashed server-side for revocation.

Decision: Separate access and refresh tokens.

Reasoning: This supports secure sessions while keeping API authorization fast.

## Standard Response Shapes

Success:

```json
{
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A readable error message",
    "details": {}
  }
}
```

Decision: Use consistent response envelopes.

Reasoning: The frontend needs predictable loading, error, toast, and form-validation behavior.

## Auth Endpoints

### Register

`POST /api/v1/auth/register`

Access: Public

Body:

- `name`
- `email`
- `password`
- `role`
- `companyName`

Returns:

- User profile.
- Access token.
- Refresh token.

### Login

`POST /api/v1/auth/login`

Access: Public

Body:

- `email`
- `password`

Returns:

- User profile.
- Access token.
- Refresh token.

### Refresh Token

`POST /api/v1/auth/refresh`

Access: Public with valid refresh token

Returns:

- New access token.
- Rotated refresh token.

### Logout

`POST /api/v1/auth/logout`

Access: Authenticated

Effect:

- Revokes the active refresh token.

### Forgot Password

`POST /api/v1/auth/forgot-password`

Access: Public

Effect:

- Starts password reset flow.

### Reset Password

`POST /api/v1/auth/reset-password`

Access: Public with reset token

Effect:

- Updates password hash.
- Revokes existing refresh tokens.

## Project Endpoints

### List Projects

`GET /api/v1/projects`

Access: Authenticated

Query:

- `status`
- `clientId`
- `search`
- `page`
- `limit`

Returns:

- Projects visible to the authenticated user.

### Create Project

`POST /api/v1/projects`

Access: Admin, Manager

Body:

- `name`
- `description`
- `clientId`
- `managerIds`
- `startDate`
- `dueDate`
- `priority`
- `budgetLabel`

Effects:

- Creates project.
- Creates audit log.

### Get Project

`GET /api/v1/projects/:projectId`

Access: Project members

Returns:

- Project overview.
- Health score.
- Progress summary.
- Recent activity.

### Update Project

`PATCH /api/v1/projects/:projectId`

Access: Admin, assigned Manager

Effects:

- Updates allowed project fields.
- Recalculates health score if needed.
- Creates audit log.

### Archive Project

`POST /api/v1/projects/:projectId/archive`

Access: Admin, owner Manager

Effects:

- Sets status to `archived`.
- Creates audit log.

### Manager Dashboard

`GET /api/v1/dashboard/manager`

Access: Admin, Manager

Returns:

- Active projects count.
- Completed projects count.
- Pending approvals count.
- Upcoming deadlines.
- Progress chart data.
- Completion trend.
- Recent activities.

### Client Dashboard

`GET /api/v1/dashboard/client`

Access: Client

Returns:

- Project health score.
- Current progress.
- Completed milestones.
- Pending approvals.
- Recent updates.
- AI weekly reports.

## Milestone Endpoints

### List Milestones

`GET /api/v1/projects/:projectId/milestones`

Access: Project members

Returns:

- Ordered milestone list.

### Create Milestone

`POST /api/v1/projects/:projectId/milestones`

Access: Admin, assigned Manager

Body:

- `title`
- `description`
- `startDate`
- `dueDate`
- `order`

Effects:

- Creates milestone.
- Recalculates project progress and health.
- Creates audit log.

### Update Milestone

`PATCH /api/v1/milestones/:milestoneId`

Access: Admin, assigned Manager

Effects:

- Updates milestone.
- Recalculates project progress and health.
- Creates audit log.

### Mark Ready For Approval

`POST /api/v1/milestones/:milestoneId/request-approval`

Access: Admin, assigned Manager

Body:

- `comment`

Effects:

- Sets milestone status to `ready_for_approval`.
- Creates pending approval.
- Notifies client.
- Creates audit log.

## Approval Endpoints

### List Approvals

`GET /api/v1/projects/:projectId/approvals`

Access: Project members

Returns:

- Approval history for the project.

### Approve Milestone

`POST /api/v1/approvals/:approvalId/approve`

Access: Assigned Client

Body:

- `comment`

Effects:

- Marks approval as approved.
- Updates milestone status.
- Recalculates health score.
- Notifies manager.
- Creates audit log.

### Request Changes

`POST /api/v1/approvals/:approvalId/request-changes`

Access: Assigned Client

Body:

- `comment`

Effects:

- Marks approval as changes requested.
- Updates milestone status.
- Notifies manager.
- Creates audit log.

Decision: Use explicit approval action endpoints.

Reasoning: Approval and change request are important business events, not generic field updates. Explicit endpoints make authorization, validation, notifications, and audit logs safer.

## Comment Endpoints

### List Comments

`GET /api/v1/projects/:projectId/comments`

Access: Project members

Query:

- `milestoneId`
- `reportId`
- `visibility`

### Create Comment

`POST /api/v1/projects/:projectId/comments`

Access: Project members

Body:

- `body`
- `milestoneId`
- `approvalId`
- `reportId`
- `visibility`

Effects:

- Creates comment.
- Creates notification when relevant.
- Creates audit log for client-visible comments.

## Report Endpoints

### List Reports

`GET /api/v1/projects/:projectId/reports`

Access: Project members

### Generate Weekly Report

`POST /api/v1/projects/:projectId/reports/generate`

Access: Admin, assigned Manager

Body:

- `weekStart`
- `weekEnd`

Effects:

- Generates AI weekly report.
- Stores report snapshot.
- Creates audit log.

### Publish Report

`POST /api/v1/reports/:reportId/publish`

Access: Admin, assigned Manager

Effects:

- Publishes report to client dashboard.
- Notifies client.
- Creates audit log.

### Export Report PDF

`GET /api/v1/reports/:reportId/export.pdf`

Access: Project members

Returns:

- PDF file.

## Notification Endpoints

### List Notifications

`GET /api/v1/notifications`

Access: Authenticated

Query:

- `unreadOnly`

### Mark Notification Read

`POST /api/v1/notifications/:notificationId/read`

Access: Notification recipient

## Public Share Link Endpoints

### Enable Share Link

`POST /api/v1/projects/:projectId/share-link`

Access: Admin, assigned Manager

Body:

- `expiresAt`

Returns:

- Public share URL.

### Rotate Share Link

`POST /api/v1/projects/:projectId/share-link/rotate`

Access: Admin, assigned Manager

Returns:

- New public share URL.

### Disable Share Link

`DELETE /api/v1/projects/:projectId/share-link`

Access: Admin, assigned Manager

Effect:

- Disables public access.

### Public Project View

`GET /api/v1/public/share/:token`

Access: Public

Returns:

- Read-only project overview.
- Progress.
- Timeline.
- Milestones.
- Latest client-visible updates.

Decision: Public APIs are separate from authenticated project APIs.

Reasoning: This reduces the risk of accidentally allowing mutation or leaking private manager-only data.

## Validation Requirements

- Validate all request bodies.
- Validate ObjectId formats.
- Enforce date ordering.
- Enforce milestone progress from 0 to 100.
- Require comments for change requests.
- Restrict role assignment to authorized users.
- Sanitize user-provided text.

## Rate Limiting

Decision: Apply stricter limits to auth and public share endpoints.

Reasoning: Login, reset, and public token routes are more exposed to abuse than authenticated internal APIs.

