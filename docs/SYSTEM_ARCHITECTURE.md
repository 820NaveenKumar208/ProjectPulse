# ProjectPulse System Architecture

## Objective

ProjectPulse is a client-facing project visibility SaaS for agencies, freelancers, project managers, and clients. The architecture prioritizes trustworthy project status, approval control, auditability, secure public sharing, and AI-generated weekly reporting.

## Architectural Decisions

### Product Shape

Decision: Build a multi-role SaaS application, not a generic admin dashboard or Jira clone.

Reasoning: The product requirement centers on reducing manual status meetings. The system should make project progress, approvals, client feedback, and weekly summaries visible with minimal friction. A task-management-heavy model would distract from the core status-and-approval workflow.

### Frontend

Decision: Use React, TypeScript, TailwindCSS, and Framer Motion.

Reasoning: The requirements explicitly call for TypeScript, TailwindCSS, responsive layouts, reusable components, skeleton states, toast notifications, and subtle animation. React supports component reuse and role-specific screens cleanly, while Tailwind enables a custom premium SaaS interface without drifting into default template styling.

### Backend

Decision: Use Node.js, Express, TypeScript, and a layered architecture with routes, controllers, services, models, validators, middlewares, and utils.

Reasoning: This matches the requirement and keeps HTTP concerns separate from business rules. Approval workflow, health score calculation, audit logging, reporting, and notification creation belong in services so they can be tested independently.

### Database

Decision: Use MongoDB with dedicated collections for Users, Projects, Milestones, Approvals, Comments, Reports, Notifications, and AuditLogs.

Reasoning: MongoDB fits the document-oriented project domain, especially activity feeds, weekly report snapshots, milestone metadata, and public share configuration. Dedicated collections keep audit and approval history queryable without bloating the project document.

### Authentication

Decision: Use JWT access tokens, refresh tokens, password hashing, and role-based access control.

Reasoning: The application has authenticated manager/client dashboards plus unauthenticated public share pages. JWT supports stateless API authorization, while refresh token storage allows revocation and session control.

### Authorization Model

Decision: Use role-based access plus resource-level membership checks.

Reasoning: A user role alone is insufficient. A client should only access projects assigned to them, and a manager should only manage projects they own or are assigned to. Public share access must bypass login but remain read-only and token-scoped.

### Public Sharing

Decision: Generate opaque, high-entropy share tokens stored on the Project record with enable/disable and optional expiration metadata.

Reasoning: Public pages must not reveal internal project IDs or require login. Token-based sharing allows client-friendly URLs while supporting revocation, rotation, and read-only access.

### AI Weekly Reports

Decision: Generate reports from persisted project state, milestone status, approvals, comments, and audit logs, then store the generated report as a snapshot.

Reasoning: Storing snapshots preserves what was shown to clients at the time, supports PDF export, and avoids reports changing retroactively when project data changes.

### Auditability

Decision: Record major state-changing actions in AuditLogs.

Reasoning: Approval history is a core feature. Audit logs provide accountability for milestone changes, approvals, change requests, comments, public link changes, report generation, and notification delivery.

## High-Level Components

### Web Client

Responsibilities:

- Authentication screens.
- Manager dashboard.
- Project detail workspace.
- Client dashboard.
- Public share page.
- Approval and comment interactions.
- Report viewing and PDF export trigger.
- Loading, empty, error, and permission states.

### API Server

Responsibilities:

- Authentication and token refresh.
- User and role authorization.
- Project, milestone, approval, comment, report, notification, and share-link APIs.
- Project health score calculation.
- Weekly report orchestration.
- Audit log writing.
- Input validation and error handling.

### MongoDB

Responsibilities:

- Store users, projects, milestones, approvals, comments, reports, notifications, and audit logs.
- Support dashboard queries and timeline/activity views.
- Preserve historical approval and report state.

### AI Report Service

Responsibilities:

- Summarize completed work, pending work, risks, blockers, next-week plan, and overall health.
- Use structured project data as input.
- Store output in Reports.
- Provide export-ready report content.

### Notification Service

Responsibilities:

- Create in-app notifications for milestone updates, approval requests, approvals, change requests, comments, reports, and approaching deadlines.
- Support future email integration without changing core domain logic.

## Request Flow

### Authenticated Dashboard Flow

1. User logs in and receives access and refresh tokens.
2. Web client calls role-specific dashboard APIs.
3. API validates JWT and checks resource permissions.
4. Services query MongoDB and aggregate project metrics.
5. Web client renders dashboard cards, charts, activities, and pending actions.

### Milestone Approval Flow

1. Manager marks a milestone as ready for approval or complete.
2. API validates manager access.
3. Milestone status is updated.
4. Approval request is created.
5. Audit log is recorded.
6. Client notification is created.
7. Client approves or requests changes.
8. Approval history, milestone status, audit logs, and notifications are updated.

### Public Share Flow

1. Visitor opens `/share/:token`.
2. API validates the share token and public access settings.
3. API returns read-only project overview, progress, timeline, milestones, and latest updates.
4. No mutation endpoints are available through the public token.

### Weekly Report Flow

1. Manager triggers report generation or scheduled job runs.
2. Report service collects project, milestone, approval, comment, and audit data.
3. AI summary is generated using structured sections.
4. Report snapshot is saved.
5. Client notification is created.
6. Report can be viewed in-app or exported as PDF.

## Security Architecture

Decisions:

- Use Helmet for secure HTTP headers.
- Use rate limiting for auth and public endpoints.
- Use input validation on every write endpoint.
- Use password hashing with a strong adaptive algorithm.
- Use XSS protection through sanitization and React rendering safety.
- Use authorization middleware for role and resource checks.
- Store refresh tokens hashed, not as plain tokens.
- Never expose internal IDs on public share pages when not required.

Reasoning: ProjectPulse exposes client-facing and public-read surfaces, so both authenticated and unauthenticated routes need strong boundaries. Audit trails and approval records must be trustworthy.

## Deployment Architecture

Recommended production setup:

- Frontend deployed as a static React app.
- API deployed as a Node.js service.
- MongoDB Atlas or managed MongoDB.
- Environment-specific configuration for secrets, database URL, JWT secrets, AI provider key, and app URLs.
- CI pipeline runs linting, type checks, tests, and build.
- Production logs include request IDs and structured error details without leaking secrets.

## Non-Functional Requirements

- Responsive across desktop, tablet, and mobile.
- Fast dashboard loading with targeted API payloads.
- Clear loading, empty, and error states.
- Accessible color contrast for status indicators.
- Audit-friendly history for approval actions.
- No placeholder implementations in production paths.

