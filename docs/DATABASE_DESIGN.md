# ProjectPulse Database Design

## Database Choice

Decision: Use MongoDB as the primary database.

Reasoning: The requirements explicitly specify MongoDB. ProjectPulse data is naturally document-oriented: projects contain rich metadata, milestones evolve over time, reports are snapshots, and activity feeds depend on flexible event records.

## Design Principles

- Keep frequently queried entities in dedicated collections.
- Reference users and projects by ObjectId for ownership and permissions.
- Preserve approval and audit history as append-oriented records.
- Store AI reports as immutable snapshots after generation.
- Avoid embedding unbounded arrays such as comments, approvals, notifications, and audit logs inside Projects.
- Use denormalized summary fields only where they improve dashboard performance and can be recalculated.

## Collections

## Users

Purpose: Store agency owners, managers, freelancers, clients, and admins.

Fields:

- `_id`
- `name`
- `email`
- `passwordHash`
- `role`: `admin`, `manager`, or `client`
- `companyName`
- `avatarUrl`
- `isActive`
- `refreshTokenHashes`
- `lastLoginAt`
- `createdAt`
- `updatedAt`

Indexes:

- Unique index on `email`.
- Index on `role`.
- Index on `isActive`.

Decision: Keep `admin`, `manager`, and `client` as the initial role set.

Reasoning: The requirements list these roles for RBAC. Agency owners and freelancers can initially use the manager capability set unless a later approval introduces more granular organization roles.

## Projects

Purpose: Store top-level project visibility records.

Fields:

- `_id`
- `name`
- `description`
- `clientId`
- `ownerId`
- `managerIds`
- `status`: `planning`, `active`, `paused`, `completed`, `archived`
- `startDate`
- `dueDate`
- `completedAt`
- `budgetLabel`
- `priority`
- `healthScore`
- `healthStatus`: `excellent`, `good`, `at_risk`, `critical`
- `progressPercent`
- `shareTokenHash`
- `shareEnabled`
- `shareExpiresAt`
- `lastActivityAt`
- `createdAt`
- `updatedAt`

Indexes:

- Index on `ownerId`.
- Index on `managerIds`.
- Index on `clientId`.
- Index on `status`.
- Index on `dueDate`.
- Sparse index on `shareTokenHash`.
- Compound index on `{ clientId, status }`.
- Compound index on `{ ownerId, status }`.

Decision: Store `healthScore` and `progressPercent` as cached fields.

Reasoning: Dashboards need fast summary cards and charts. These values can be recalculated whenever milestones, approvals, or deadlines change.

## Milestones

Purpose: Track project phases and approval-ready deliverables.

Fields:

- `_id`
- `projectId`
- `title`
- `description`
- `status`: `not_started`, `in_progress`, `ready_for_approval`, `approved`, `changes_requested`, `completed`, `delayed`
- `progressPercent`
- `order`
- `startDate`
- `dueDate`
- `completedAt`
- `approvedAt`
- `createdBy`
- `updatedBy`
- `createdAt`
- `updatedAt`

Indexes:

- Compound index on `{ projectId, order }`.
- Compound index on `{ projectId, status }`.
- Index on `dueDate`.

Decision: Keep milestones separate from projects.

Reasoning: Milestones have their own lifecycle, comments, approvals, and audit entries. A separate collection avoids large project documents and supports direct queries for deadlines and approval queues.

## Approvals

Purpose: Record client approval decisions and change requests.

Fields:

- `_id`
- `projectId`
- `milestoneId`
- `requestedBy`
- `reviewedBy`
- `status`: `pending`, `approved`, `changes_requested`, `cancelled`
- `requestComment`
- `responseComment`
- `requestedAt`
- `reviewedAt`
- `createdAt`
- `updatedAt`

Indexes:

- Compound index on `{ projectId, status }`.
- Compound index on `{ milestoneId, createdAt }`.
- Index on `reviewedBy`.
- Index on `requestedAt`.

Decision: Use a dedicated Approvals collection instead of only status fields on Milestones.

Reasoning: Approval history is a unique feature. Dedicated records preserve every request, response, timestamp, comment, and user involved.

## Comments

Purpose: Store client and manager discussion on projects, milestones, reports, and approvals.

Fields:

- `_id`
- `projectId`
- `milestoneId`
- `approvalId`
- `reportId`
- `authorId`
- `body`
- `visibility`: `internal` or `client_visible`
- `createdAt`
- `updatedAt`
- `deletedAt`

Indexes:

- Compound index on `{ projectId, createdAt }`.
- Compound index on `{ milestoneId, createdAt }`.
- Index on `authorId`.

Decision: Include `visibility`.

Reasoning: Managers may need internal notes later, while the client-facing product must clearly separate what clients can see.

## Reports

Purpose: Store AI weekly report snapshots.

Fields:

- `_id`
- `projectId`
- `generatedBy`
- `weekStart`
- `weekEnd`
- `status`: `draft`, `published`, `archived`
- `completedWork`
- `pendingWork`
- `risks`
- `blockers`
- `nextWeekPlan`
- `overallHealth`
- `healthScoreAtGeneration`
- `sourceSummary`
- `pdfUrl`
- `publishedAt`
- `createdAt`
- `updatedAt`

Indexes:

- Compound index on `{ projectId, weekStart }`.
- Compound index on `{ projectId, status }`.
- Index on `publishedAt`.

Decision: Store generated report content as fields rather than regenerating on read.

Reasoning: Weekly reports are client-facing records. They should remain stable after publication and support auditability and PDF export.

## Notifications

Purpose: Store in-app notifications.

Fields:

- `_id`
- `recipientId`
- `projectId`
- `milestoneId`
- `approvalId`
- `reportId`
- `type`
- `title`
- `message`
- `readAt`
- `createdAt`

Indexes:

- Compound index on `{ recipientId, readAt, createdAt }`.
- Index on `projectId`.
- Index on `type`.

Decision: Start with in-app notifications.

Reasoning: The database requirement includes Notifications, but email delivery is not explicitly required for the first implementation. This design allows email integration later.

## AuditLogs

Purpose: Preserve a trustworthy history of important actions.

Fields:

- `_id`
- `actorId`
- `projectId`
- `milestoneId`
- `approvalId`
- `reportId`
- `action`
- `entityType`
- `entityId`
- `before`
- `after`
- `metadata`
- `ipAddress`
- `userAgent`
- `createdAt`

Indexes:

- Compound index on `{ projectId, createdAt }`.
- Compound index on `{ actorId, createdAt }`.
- Index on `action`.
- Index on `entityType`.

Decision: Use append-only audit records.

Reasoning: Audit logs should describe what happened without being rewritten by normal product workflows.

## Project Health Score

Decision: Calculate health score from milestone completion, days remaining, delayed milestones, and approval rate.

Recommended formula:

- Milestone completion: 40%
- Schedule health: 25%
- Delay penalty: 20%
- Approval rate: 15%

Reasoning: This reflects the product requirement while keeping the score explainable. Completion matters most, schedule pressure matters next, and approvals reflect client confidence.

## Data Retention

Decision: Soft-delete collaborative records where user trust matters, and archive projects instead of hard-deleting by default.

Reasoning: Clients and managers need historical accountability. Hard deletion should be limited to administrative or compliance workflows.

