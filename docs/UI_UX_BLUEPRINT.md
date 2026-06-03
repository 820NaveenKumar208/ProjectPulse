# ProjectPulse UI/UX Blueprint

## Experience Goal

ProjectPulse should feel like a premium project visibility platform, not a traditional admin dashboard. The interface must help managers and clients understand project status, approvals, risks, and next steps without needing another status meeting.

The product should feel inspired by Linear, Vercel, Notion, and Stripe:

- Linear for speed, restraint, polished interactions, and focused workflows.
- Vercel for spacious layouts, sharp hierarchy, and modern product confidence.
- Notion for readable structured content and calm collaborative surfaces.
- Stripe for trustworthy financial-grade polish, data clarity, and refined cards.

Decision: Design every screen around project visibility and client confidence rather than generic management controls.

Reasoning: The product brief explicitly says ProjectPulse must not resemble a Bootstrap admin dashboard, CRUD college project, or Jira clone. A premium SaaS product should feel editorially composed, deeply intentional, and focused on the user's next decision.

## Anti-Dashboard Rules

ProjectPulse must avoid:

- Heavy left sidebars with many menu items.
- Dense table-first screens.
- Generic KPI widgets without product context.
- Admin-template icon grids.
- Chart-heavy layouts that do not drive action.
- Cramped panels and nested cards.
- Default Bootstrap visual patterns.

ProjectPulse should use:

- Spacious card-based layouts with clear purpose.
- Top navigation and contextual project navigation.
- Project health, progress, approvals, and timeline as first-class visual elements.
- Interactive timeline surfaces instead of task-table sprawl.
- Glassmorphism accents for important summary layers.
- Subtle Framer Motion transitions.
- Mobile-first responsive composition.

Decision: Use cards as structured product surfaces, not as decorative dashboard boxes.

Reasoning: Card-based layouts are required, but they should represent meaningful objects such as projects, milestones, approvals, reports, updates, and health summaries.

## Visual System

### Color

Required colors:

- Primary: `#2563EB`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`
- Background: `#F8FAFC`
- Dark text: `#111827`

Usage:

- Primary blue for primary actions, selected states, links, active timeline segments, and progress emphasis.
- Success green for approved, completed, healthy, and on-track states.
- Warning amber for pending approvals, upcoming deadlines, partial risk, and waiting states.
- Danger red for overdue, blocked, critical, or changes-requested states.
- Background should stay light, spacious, and quiet.
- Neutral grays should carry borders, dividers, metadata, disabled states, and secondary surfaces.

Decision: Keep the dominant interface neutral with precise status color.

Reasoning: ProjectPulse is a trust product. Color should clarify state, not create a loud dashboard aesthetic.

### Typography

Decision: Use modern, premium sans-serif typography with compact hierarchy and excellent readability.

Recommended direction:

- Use Inter, Geist, or a similar modern SaaS typeface.
- Use strong page titles with generous spacing.
- Use medium-weight section labels.
- Use large metric values only when the metric is decision-critical.
- Use readable body text for comments, reports, and client-facing summaries.
- Use small muted metadata for timestamps, authors, and audit details.

Reasoning: The application must feel premium and clear. Typography is the fastest way to avoid a generic dashboard feel.

### Layout

Decision: Use mobile-first responsive layouts that scale up into spacious desktop compositions.

Layout rules:

- Mobile starts with one clear primary action and one core status summary.
- Tablet uses two-column grids where content naturally pairs.
- Desktop uses generous two- and three-column compositions without overfilling the viewport.
- Keep page width constrained for reading-heavy screens.
- Use wider layouts only for timeline, milestone, and portfolio overview surfaces.
- Avoid nested cards.
- Use section bands or unframed layouts around cards.

Reasoning: Clients may open updates from mobile devices, while managers may work from desktop. The experience must feel intentional in both contexts.

### Glassmorphism

Decision: Use glassmorphism only as an accent layer for premium emphasis.

Appropriate uses:

- Top-level project health summary.
- Floating approval status panel.
- Public share hero summary.
- Timeline hover or selected milestone detail.
- Notification preview surfaces.

Avoid:

- Making every card translucent.
- Reducing readability.
- Using glass effects behind long body text.

Reasoning: Glassmorphism supports the requested premium feel, but overuse would make the app less readable and less trustworthy.

### Motion

Decision: Use Framer Motion for subtle transitions that explain state changes.

Motion patterns:

- Page content fades and rises slightly on route change.
- Cards stagger in quickly on dashboard load.
- Progress rings animate from previous value to new value.
- Timeline segments highlight smoothly on hover or selection.
- Approval state changes transition with restrained color and position changes.
- Toasts slide in and fade out.
- Skeleton loaders shimmer subtly.

Avoid:

- Bouncy motion.
- Long delays.
- Parallax-heavy effects.
- Animation that blocks task completion.

Reasoning: Motion should make product state feel alive without becoming entertainment.

## Navigation Model

Decision: Use a slim top navigation with role-aware destinations and contextual project controls.

Primary navigation:

- Dashboard.
- Projects.
- Approvals.
- Reports.
- Notifications.

Contextual project navigation:

- Overview.
- Milestones.
- Timeline.
- Comments.
- Approvals.
- Reports.
- Share.

Reasoning: This keeps the application from feeling like a traditional admin console while still giving managers and clients predictable paths.

## Screen Specification 1: Login

### Purpose

Let users access the platform with a polished, trustworthy first impression.

### Layout

Mobile:

- Full-screen centered form with generous padding.
- ProjectPulse wordmark at top.
- Compact welcome heading.
- Email and password fields.
- Primary sign-in button.
- Forgot password link.
- Register link below the form.

Desktop:

- Centered auth panel over a soft background.
- Optional right-side ambient product preview showing a blurred project progress card and approval chip.
- No marketing-heavy hero copy.

### Visual Design

- Light `#F8FAFC` background.
- White or softly translucent form card with subtle border.
- Primary blue sign-in button.
- Strong dark heading.
- Muted metadata and helper text.
- Premium empty-space treatment, not a dense form box.

### Interactions

- Inline validation for invalid email, missing password, and authentication failure.
- Submit button shows loading state.
- Password visibility toggle.
- Forgot password opens dedicated flow.
- Successful login routes users by role.

### Motion

- Form enters with a quick fade and slight upward movement.
- Field errors animate in without shifting the full layout abruptly.
- Submit loading state transitions smoothly.

### Decision

Keep login utilitarian but premium.

Reasoning: Authentication is not the main product experience, but it sets the trust baseline for clients and managers.

## Screen Specification 2: Manager Dashboard

### Purpose

Give managers a portfolio-level command center focused on active work, approvals, deadlines, and recent client-visible changes.

### Layout

Mobile:

- Header with greeting, notification button, and create project action.
- Horizontal summary card carousel for Active Projects, Completed Projects, Pending Approvals, and Upcoming Deadlines.
- "Needs attention" section first.
- Project progress cards stacked vertically.
- Recent activity feed below.

Tablet:

- Two-column metric grid.
- Needs-attention and recent activity side by side where space allows.
- Charts stack below key actions.

Desktop:

- Spacious top header with greeting, date context, search, notifications, and create project button.
- Four metric cards in a single row.
- Main content split into a wider project progress area and a narrower approvals/deadlines column.
- Completion trend and recent activity below.

### Required Sections

- Active Projects.
- Completed Projects.
- Pending Approvals.
- Upcoming Deadlines.
- Project Progress.
- Completion Trend.
- Recent Activities.

### Visual Design

- Metric cards should show concise values and contextual deltas.
- Pending approvals card should receive amber accent treatment.
- Upcoming deadlines should show date proximity and risk state.
- Project cards should include progress bar, health indicator, client name, next milestone, and due date.
- Charts should feel embedded into the SaaS surface, not pasted from a generic analytics template.

### Interactions

- Create project primary action.
- Click a project card to open Project Details.
- Click pending approval to jump directly to the approval item.
- Filter projects by status, health, deadline, and client.
- Recent activity items link to their source milestone, approval, comment, or report.

### Progress Visualization

- Use horizontal progress bars for project list scanning.
- Use small health badges beside each project.
- Use a trend line for completion over time.
- Avoid chart overload; every visualization must answer a manager question.

### Motion

- Metric cards stagger in on first load.
- Progress bars animate to current values.
- Filtering uses smooth layout transitions.
- Activity feed items fade in when new events arrive.

### Decision

Make the dashboard action-oriented rather than analytics-heavy.

Reasoning: Managers need to know what requires attention now, not browse an abstract admin overview.

## Screen Specification 3: Client Dashboard

### Purpose

Give clients a clear, calm view of project health, progress, required approvals, recent updates, and weekly AI reports.

### Layout

Mobile:

- Project selector if the client has multiple projects.
- Large health score card.
- Current progress summary.
- Pending approval card if action is needed.
- Recent updates.
- Weekly reports.

Tablet:

- Health and progress cards side by side.
- Pending approvals prominent beneath.
- Completed milestones and updates in a two-column layout.

Desktop:

- Hero-like project status band at top with health score, progress, deadline, and next milestone.
- Pending approvals panel near the top-right.
- Completed milestones timeline and recent updates below.
- AI weekly reports in a polished readable section.

### Required Sections

- Project Health Score.
- Current Progress.
- Completed Milestones.
- Pending Approvals.
- Recent Updates.
- AI Weekly Reports.

### Visual Design

- Use plain-language labels such as "On track", "Needs review", or "At risk".
- Health score should be prominent but not alarming.
- Pending approval cards should feel like client action cards, not task tickets.
- Weekly reports should read like executive summaries with structured sections.
- Completed milestones should feel celebratory but restrained.

### Interactions

- Select project when multiple projects exist.
- Open pending approval details.
- Approve or request changes.
- Open weekly report.
- Export report PDF.
- View recent update source.

### Progress Visualization

- Use a large health score ring or radial indicator.
- Use milestone completion timeline for completed work.
- Use a compact progress bar for current progress.
- Use clear color-coded risk indicators.

### Motion

- Health score counts or animates to current value.
- Pending approval panel transitions into focus when action is required.
- Report cards fade in as readable content blocks.

### Decision

Design the client dashboard as a status brief, not a project management tool.

Reasoning: Clients need confidence and control, not operational complexity.

## Screen Specification 4: Project Details

### Purpose

Provide the central workspace for project status, milestone progress, comments, approvals, reports, and audit history.

### Layout

Mobile:

- Project title and status header.
- Sticky compact action row for manager actions.
- Progress summary.
- Tabbed sections for Overview, Milestones, Timeline, Comments, Approvals, and Reports.
- Activity feed appears after summary content.

Tablet:

- Project summary and health panel side by side.
- Tabs or segmented navigation below.
- Milestone and activity sections stacked.

Desktop:

- Top project header with name, client, status, due date, health score, and share action.
- Left/main column for overview, timeline, and milestones.
- Right contextual column for approvals, comments, recent activity, and public share status.
- Contextual navigation below the header.

### Required Sections

- Project Overview.
- Progress Ring.
- Timeline.
- Milestone Tracker.
- Activity Feed.
- Client Comments.
- Approval History.

### Visual Design

- Use a premium project summary band rather than a generic details table.
- Display progress ring, health status, deadline, and next milestone as the first visual cluster.
- Use cards for meaningful modules such as "Next approval", "Latest client comment", and "This week's report".
- Keep audit entries visually quieter than active work.

### Interactions

- Edit project details for authorized managers.
- Create milestone.
- Update milestone progress.
- Request milestone approval.
- Add comment.
- Generate report.
- Enable, rotate, or disable public share link.
- Jump from activity feed item to source content.

### Progress Visualization

- Progress ring for overall project completion.
- Timeline for project sequence.
- Milestone tracker for operational progress.
- Health score badge with explanation tooltip.

### Motion

- Progress ring animates on load and when progress changes.
- Timeline selected milestone expands with smooth height transition.
- Activity feed updates with subtle entrance animation.

### Decision

Make Project Details the product's primary workspace.

Reasoning: This is where managers convert internal project state into client-facing visibility and approval control.

## Screen Specification 5: Milestone Tracker

### Purpose

Let managers and clients understand milestone sequence, status, progress, blockers, and approval readiness.

### Layout

Mobile:

- Vertical milestone list.
- Each milestone card shows title, status, due date, progress, and primary next action.
- Expandable details reveal comments, approval state, and activity.

Tablet:

- Vertical timeline with milestone cards aligned to timeline nodes.
- Selected milestone details appear inline.

Desktop:

- Interactive horizontal or vertical timeline depending on project length.
- Main milestone list with progress and status.
- Selected milestone detail panel with comments, approval history, and action controls.

### Visual Design

- Use status pills with consistent color mapping.
- Use timeline nodes for milestone state:
  - Empty for not started.
  - Blue for in progress.
  - Amber for pending approval.
  - Green for approved or completed.
  - Red for delayed or changes requested.
- Use progress bars inside milestone cards.
- Use soft glass highlight for the selected milestone detail panel.

### Interactions

- Expand or collapse milestone details.
- Drag or reorder milestones only if explicitly supported later.
- Update progress.
- Mark as ready for approval.
- View approval history.
- Add milestone comment.
- Filter by status.

### Progress Visualization

- Per-milestone progress bars.
- Overall timeline completion state.
- Due-date proximity indicator.
- Delayed milestone warning state.

### Motion

- Timeline nodes animate when status changes.
- Expanded milestone detail uses smooth height and opacity transitions.
- Progress bars animate from previous value to new value.

### Decision

Use an interactive timeline-first tracker instead of a task table.

Reasoning: The product must avoid becoming Jira. Milestones are client-visible progress markers, not granular task-management rows.

## Screen Specification 6: Approval Workflow

### Purpose

Make client approvals fast, deliberate, auditable, and visually distinct from ordinary comments or status changes.

### States

- No approval requested.
- Ready for approval.
- Pending client review.
- Approved.
- Changes requested.
- Superseded or cancelled.

### Manager Experience

Layout:

- Approval panel attached to the relevant milestone.
- Current approval status at top.
- Request approval action.
- Optional manager comment field.
- Previous approval history below.

Interactions:

- Manager marks milestone ready for approval.
- Manager adds request context.
- System creates pending approval.
- Client notification is generated.
- Approval panel locks direct completion until client responds.

### Client Experience

Layout:

- Approval request card appears prominently on Client Dashboard and Project Details.
- Card includes milestone title, manager note, deliverable summary, due date, and status.
- Primary action: Approve.
- Secondary action: Request Changes.
- Change request opens comment field and requires a reason.

Interactions:

- Approve with optional comment.
- Request changes with required comment.
- View prior approval decisions.
- Return to project status after action.

### Visual Design

- Pending approval uses amber accent.
- Approved uses green accent with confirmation timestamp.
- Changes requested uses red accent and clearly shows client comment.
- Audit metadata includes user, timestamp, and action.
- Approval history should feel like a signed record, not a chat thread.

### Motion

- Approval card enters with subtle emphasis when action is required.
- Approve transition changes status from pending to approved with smooth color shift.
- Request changes transition reveals required comment field without disorienting layout movement.
- Toast confirms completion.

### Decision

Treat approval as a dedicated workflow with explicit states and actions.

Reasoning: Client approval control is a core differentiator. It must be more trustworthy than a generic status dropdown.

## Screen Specification 7: Public Share Page

### Purpose

Provide a polished, no-login, read-only project progress page for stakeholders who only need visibility.

### Layout

Mobile:

- Public project header.
- Progress and health summary.
- Timeline.
- Milestone list.
- Latest updates.
- Footer with project identity and read-only context.

Tablet:

- Progress summary and next milestone side by side.
- Timeline followed by latest updates.

Desktop:

- Presentation-quality top section with project name, client-visible status, progress, deadline, and health.
- Large visual progress area.
- Timeline and milestone cards below.
- Latest updates and published reports near the bottom.

### Required Sections

- Project Overview.
- Progress.
- Timeline.
- Milestones.
- Latest Updates.

### Visual Design

- Remove app navigation, internal controls, and manager-only metadata.
- Use a refined public-facing layout that feels like a shared status brief.
- Use glassmorphism only in the hero summary or progress panel.
- Keep branding subtle but present.
- Make the page feel secure by being clean and minimal, not warning-heavy.

### Interactions

- Read-only milestone expansion.
- Read-only timeline exploration.
- Open latest updates.
- Open published weekly reports if allowed.
- No commenting, approval, editing, or internal activity access.

### Progress Visualization

- Large progress indicator near the top.
- Timeline with completed, current, and upcoming milestones.
- Latest update cards with timestamps.
- Health status indicator using plain language.

### Motion

- Public page content enters smoothly.
- Timeline highlights on hover or tap.
- Progress indicator animates once on load.

### Decision

Design the public share page as a polished project status presentation.

Reasoning: Public links are often the first thing external stakeholders see. They should communicate professionalism and confidence without requiring a login.

## Component System

Core components:

- App shell.
- Auth panel.
- Top navigation.
- Context navigation.
- Metric card.
- Project card.
- Progress ring.
- Linear progress bar.
- Health score badge.
- Status pill.
- Interactive timeline.
- Milestone card.
- Milestone detail panel.
- Approval panel.
- Approval action card.
- Comment composer.
- Activity feed.
- Report viewer.
- Notification menu.
- Public share header.
- Empty state.
- Error state.
- Skeleton loader.
- Toast.
- Modal dialog.

Decision: Build reusable domain components rather than generic dashboard widgets.

Reasoning: The component system should reinforce that ProjectPulse is a client-facing project visibility platform.

## Accessibility and Responsiveness

Requirements:

- Mobile-first layouts.
- Keyboard-accessible forms, menus, modals, and timeline interactions.
- Clear focus states.
- Sufficient color contrast.
- Status must never rely on color alone.
- Touch targets should be comfortable on mobile.
- Text should not overflow cards or controls.
- Loading and empty states must be understandable.

Decision: Treat accessibility as part of premium quality.

Reasoning: A trustworthy SaaS product must be usable, readable, and predictable for every role and screen size.

