# ProjectPulse Development Roadmap

## Roadmap Strategy

Decision: Build ProjectPulse in controlled vertical slices, not all at once.

Reasoning: The product brief explicitly requires step-by-step execution with tests, fixes, commits, and no placeholder implementations. Each phase should leave the application in a working state.

## Phase 1: Architecture Documents

Deliverables:

- `SYSTEM_ARCHITECTURE.md`
- `DATABASE_DESIGN.md`
- `API_SPECIFICATION.md`
- `UI_UX_BLUEPRINT.md`
- `DEVELOPMENT_ROADMAP.md`

Acceptance criteria:

- Product requirements are translated into implementation-ready decisions.
- No application code is written.
- User approval is received before implementation.

Status: Current phase.

## Phase 2: Project Foundation

Deliverables:

- Frontend app scaffold.
- Backend app scaffold.
- Shared TypeScript configuration decisions.
- Environment configuration examples.
- Folder structure matching the architecture.
- Basic health check endpoint.
- Basic frontend shell route.

Tests:

- Backend health check test.
- Frontend render smoke test.
- Type check.
- Lint.

Decision: Establish structure before domain logic.

Reasoning: A clear foundation prevents later features from being scattered across the codebase.

## Phase 3: Database Schema and Models

Deliverables:

- MongoDB connection.
- Mongoose or equivalent models for all required collections.
- Index definitions.
- Validation at model boundaries.
- Seed strategy for local development.

Tests:

- Model validation tests.
- Database connection test.
- Index creation verification where practical.

Decision: Build schemas before APIs.

Reasoning: API behavior depends on stable domain models and relationships.

## Phase 4: Authentication and Authorization

Deliverables:

- Register, login, logout, refresh token, forgot password, reset password.
- Password hashing.
- JWT access tokens.
- Refresh token storage and rotation.
- Role-based middleware.
- Resource authorization helpers.

Tests:

- Auth success and failure cases.
- Token refresh and revocation.
- Role access checks.
- Password validation.

Decision: Implement auth before protected product APIs.

Reasoning: Projects, approvals, reports, and comments all depend on correct user identity and permissions.

## Phase 5: Project and Milestone APIs

Deliverables:

- Project CRUD within approved scope.
- Project archive flow.
- Milestone creation and updates.
- Progress calculation.
- Health score calculation.
- Audit log creation for project and milestone changes.

Tests:

- Project access control.
- Milestone lifecycle.
- Progress recalculation.
- Health score cases.
- Audit log creation.

Decision: Build project visibility before approval workflow.

Reasoning: Approvals depend on meaningful projects and milestones.

## Phase 6: Approval Workflow

Deliverables:

- Request approval action.
- Client approve action.
- Client request changes action.
- Approval history.
- Required comments for change requests.
- Notifications for approval events.
- Audit logs for all approval decisions.

Tests:

- Manager request approval.
- Client approval.
- Client change request.
- Unauthorized approval attempts.
- Notification creation.
- Audit history correctness.

Decision: Treat approvals as explicit business actions.

Reasoning: This is a core differentiator and must be more reliable than a generic status update.

## Phase 7: Comments, Activity Feed, and Notifications

Deliverables:

- Project comments.
- Milestone-linked comments.
- Client-visible and internal visibility.
- Activity feed API.
- Notification list and read state.

Tests:

- Comment visibility rules.
- Activity ordering.
- Notification recipient rules.
- Client access boundaries.

Decision: Add collaboration after approvals.

Reasoning: Comments and activity become more useful once project and approval events exist.

## Phase 8: Dashboard UI

Deliverables:

- Auth screens.
- Manager dashboard.
- Client dashboard.
- Metric cards.
- Charts.
- Recent activity.
- Loading states.
- Empty states.
- Error states.
- Toast notifications.

Tests:

- Component render tests.
- Auth form validation tests.
- Dashboard data loading states.
- Responsive layout verification.

Decision: Build dashboards after core APIs.

Reasoning: The dashboards should display real data rather than mocked placeholder implementations.

## Phase 9: Project Page UI

Deliverables:

- Project overview.
- Progress ring.
- Timeline.
- Milestone tracker.
- Activity feed.
- Client comments.
- Approval history.
- Manager milestone actions.
- Client approval actions where role-appropriate.

Tests:

- Role-specific controls.
- Approval action states.
- Form validation.
- Loading and error states.
- Responsive checks.

Decision: Make the project page the central workspace.

Reasoning: Most product value lives in project-level visibility and client approvals.

## Phase 10: AI Weekly Reports

Deliverables:

- Report generation service.
- Report draft view.
- Publish flow.
- Client report view.
- PDF export.
- Report audit logs.
- Report notifications.

Tests:

- Report generation input assembly.
- Report persistence.
- Publish permissions.
- PDF export response.
- Client visibility.

Decision: Store generated reports as snapshots.

Reasoning: Published client reports should remain stable, auditable, and exportable.

## Phase 11: Public Share Links

Deliverables:

- Enable, rotate, and disable share links.
- Public read-only API.
- Public share page.
- Token validation.
- Public-safe data filtering.

Tests:

- Valid token access.
- Disabled token rejection.
- Expired token rejection.
- No private fields exposed.
- No mutation access through public routes.

Decision: Build public sharing after project pages.

Reasoning: Public pages should reuse the same trusted project visibility model while enforcing stricter data boundaries.

## Phase 12: Hardening and Production Readiness

Deliverables:

- Helmet.
- Rate limiting.
- Input sanitization.
- Central error handling.
- Logging.
- Environment validation.
- Build pipeline.
- Deployment configuration.
- Final responsive QA.

Tests:

- Full backend test suite.
- Frontend test suite.
- Type check.
- Lint.
- Production build.
- Manual responsive QA.
- Security-focused route checks.

Decision: Keep hardening as a dedicated phase and apply security basics earlier where needed.

Reasoning: Security appears throughout the product, but a final hardening pass catches cross-cutting issues before deployment.

## Commit Strategy

Decision: Commit after each completed phase once tests pass.

Reasoning: The product brief requires commits after every step. Phase commits make progress reviewable and rollback-friendly.

Recommended commit pattern:

- `docs: add projectpulse architecture plan`
- `chore: scaffold projectpulse apps`
- `feat: add database models`
- `feat: add authentication`
- `feat: add project and milestone APIs`
- `feat: add approval workflow`
- `feat: add dashboards`
- `feat: add project workspace`
- `feat: add weekly reports`
- `feat: add public share links`
- `chore: harden production readiness`

## Definition of Done

Each implementation phase is complete only when:

- The feature works end to end.
- Tests are added or updated.
- Type checks pass.
- Lint passes.
- No TODOs or placeholder implementations remain.
- Errors and loading states are handled.
- Role and resource authorization are verified.
- The change is committed after approval.

