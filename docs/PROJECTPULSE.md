\# PROJECTPULSE - BUILD INSTRUCTIONS



You are a senior product engineer, SaaS architect, UI/UX designer, backend engineer, database architect, and DevOps engineer.



Your task is to build a production-quality SaaS application called ProjectPulse.



DO NOT create a generic admin dashboard.



DO NOT create a CRUD college project.



DO NOT create a Jira clone.



Build a modern client-facing project visibility platform focused on agencies and freelancers.



\---



\## PRODUCT VISION



ProjectPulse solves one problem:



Clients constantly ask:



"What's the status?"



Managers constantly send updates manually.



ProjectPulse eliminates status meetings by giving clients real-time visibility and approval control.



The application should feel premium, modern, trustworthy, and startup-quality.



Think:

Linear + Stripe + Notion + Vercel



NOT:

Bootstrap admin dashboard

Generic template UI

Old enterprise software



\---



\## TARGET USERS



1\. Agency Owners

2\. Project Managers

3\. Freelancers

4\. Clients



\---



\## CORE WORKFLOW



Manager creates project



Manager creates milestones



Manager updates milestone progress



Client receives update



Client approves or requests changes



System records audit history



AI generates weekly summary



Client views progress from shareable link



\---



\## UI DESIGN RULES



The UI must be unique.



Avoid:



\* Bootstrap appearance

\* Sidebars with dozens of menus

\* Default admin templates



Create:



\* Modern SaaS design

\* Glassmorphism accents

\* Soft shadows

\* Large whitespace

\* Premium typography

\* Responsive layouts



Use:



TailwindCSS



Design Inspiration:



Linear

Stripe Dashboard

Vercel

Arc Browser



\---



\## COLOR SYSTEM



Primary:

\#2563EB



Success:

\#10B981



Warning:

\#F59E0B



Danger:

\#EF4444



Background:

\#F8FAFC



Dark Text:

\#111827



\---



\## PAGE STRUCTURE



AUTH



Login



Register



Forgot Password



\---



MANAGER DASHBOARD



Top Cards:



Active Projects



Completed Projects



Pending Approvals



Upcoming Deadlines



Charts:



Project Progress



Completion Trend



Recent Activities



\---



PROJECT PAGE



Project Overview



Progress Ring



Timeline



Milestone Tracker



Activity Feed



Client Comments



Approval History



\---



CLIENT DASHBOARD



Project Health Score



Current Progress



Completed Milestones



Pending Approvals



Recent Updates



AI Weekly Reports



\---



PUBLIC SHARE PAGE



No Login



Read Only



Professional Presentation



Project Overview



Progress



Timeline



Milestones



Latest Updates



\---



\## UNIQUE FEATURES



FEATURE 1



Client Approval Workflow



Manager marks milestone complete



Client can:



Approve



or



Request Changes



Store:



Timestamp



Comment



User



History



\---



FEATURE 2



AI Weekly Report



Generate:



Completed Work



Pending Work



Risks



Blockers



Next Week Plan



Overall Health



Export PDF



\---



FEATURE 3



Project Health Score



Calculate:



Milestones Completed



Days Remaining



Delayed Tasks



Approval Rate



Display:



0-100 score



Color-coded indicator



\---



FEATURE 4



Public Progress Link



Generate secure URL



Example:



/share/project-token



No login required



Read-only access



\---



DATABASE



MongoDB



Collections:



Users



Projects



Milestones



Approvals



Comments



Reports



Notifications



AuditLogs



\---



BACKEND



Node.js



Express



Architecture:



controllers



routes



services



middlewares



models



validators



utils



\---



AUTHENTICATION



JWT



Refresh Tokens



Role Based Access



Admin



Manager



Client



\---



SECURITY



Helmet



Rate Limiting



Input Validation



XSS Protection



Password Hashing



Authorization Middleware



\---



API REQUIREMENTS



Create REST APIs for:



Auth



Projects



Milestones



Approvals



Reports



Notifications



Public Share Links



\---



RESPONSIVENESS



Desktop



Tablet



Mobile



Must work perfectly on all screen sizes.



\---



ANIMATIONS



Use Framer Motion.



Subtle transitions only.



No excessive effects.



\---



CODE QUALITY



TypeScript



Reusable Components



Clean Architecture



Error Handling



Loading States



Skeleton Loaders



Toast Notifications



\---



EXECUTION STRATEGY



DO NOT build everything at once.



STEP 1



Generate architecture documents.



STEP 2



Create folder structure.



STEP 3



Create database schema.



STEP 4



Create backend APIs.



STEP 5



Create authentication.



STEP 6



Create dashboard UI.



STEP 7



Create project management.



STEP 8



Create approval workflow.



STEP 9



Create AI reports.



STEP 10



Create public share links.



STEP 11



Testing.



STEP 12



Deployment.



After every step:



Run tests



Fix errors



Commit changes



Continue



Never leave TODOs.



Never generate placeholder implementations.



Always produce working production-ready code.



