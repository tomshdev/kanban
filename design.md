# GitHub Issues Kanban Board

## Overview

A Trello-like kanban board that uses GitHub Issues as the data store. Issues are organized into columns via labels (e.g., `kanban:backlog`, `kanban:todo`, `kanban:doing`, `kanban:done`).

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React + Vite | Fast, simple, no SSR needed |
| Drag & Drop | @dnd-kit/core | Modern, accessible, well-maintained |
| Styling | Tailwind CSS | Rapid UI development |
| GitHub API | Octokit | Official GitHub SDK |
| Auth | GitHub OAuth | Proper token flow |
| Deployment | Vercel | Free, auto-deploy from GitHub |

---

## Features (MVP)

### Must Have
- [ ] GitHub OAuth login
- [ ] Select repository from user's repos
- [ ] Display issues as cards in columns
- [ ] Drag cards between columns (updates label)
- [ ] Create new issue from board
- [ ] Click card to view/edit issue details

### Nice to Have (v2)
- [ ] Filter by assignee/milestone
- [ ] Custom column configuration
- [ ] Multiple repos in one board
- [ ] Real-time updates via webhooks
- [ ] Card ordering persistence

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                        │
│                  (React + Vite)                     │
├─────────────────────────────────────────────────────┤
│  Components:                                        │
│  ├── App.jsx          (routing, auth state)        │
│  ├── Login.jsx        (OAuth trigger)              │
│  ├── RepoSelector.jsx (pick repository)            │
│  ├── Board.jsx        (kanban container)           │
│  ├── Column.jsx       (single column)              │
│  ├── Card.jsx         (issue card)                 │
│  └── IssueModal.jsx   (create/edit issue)          │
├─────────────────────────────────────────────────────┤
│  Hooks:                                             │
│  ├── useAuth.js       (token management)           │
│  ├── useIssues.js     (fetch/update issues)        │
│  └── useRepos.js      (list user repos)            │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              Vercel Serverless Function             │
│                  /api/auth/callback                 │
│                                                     │
│  - Exchanges OAuth code for access token            │
│  - Returns token to frontend                        │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   GitHub API                        │
│                                                     │
│  - GET  /user/repos                                 │
│  - GET  /repos/{owner}/{repo}/issues               │
│  - POST /repos/{owner}/{repo}/issues               │
│  - PATCH /repos/{owner}/{repo}/issues/{number}     │
│  - GET  /repos/{owner}/{repo}/labels               │
│  - POST /repos/{owner}/{repo}/labels               │
└─────────────────────────────────────────────────────┘
```

---

## Data Model

### Columns (Labels)

Labels with `kanban:` prefix define columns:

```
kanban:backlog  → Backlog column
kanban:todo     → To Do column
kanban:doing    → In Progress column
kanban:done     → Done column
```

### Issue → Card Mapping

```javascript
{
  id: issue.id,
  number: issue.number,
  title: issue.title,
  body: issue.body,
  column: extractKanbanLabel(issue.labels), // e.g., "doing"
  assignees: issue.assignees,
  created_at: issue.created_at,
  html_url: issue.html_url
}
```

---

## OAuth Flow

```
1. User clicks "Login with GitHub"
2. Redirect to: https://github.com/login/oauth/authorize
   ?client_id=XXX
   &redirect_uri=https://yourapp.vercel.app/api/auth/callback
   &scope=repo
3. GitHub redirects back with ?code=XXX
4. Serverless function exchanges code for token:
   POST https://github.com/login/oauth/access_token
5. Token returned to frontend, stored in localStorage
6. All subsequent API calls use this token
```

---

## API Interactions

### Fetch Issues for Board

```javascript
// Get all open issues, then filter/group by kanban label
const { data: issues } = await octokit.rest.issues.listForRepo({
  owner,
  repo,
  state: 'open',
  per_page: 100
});

const columns = {
  backlog: issues.filter(i => hasLabel(i, 'kanban:backlog')),
  todo: issues.filter(i => hasLabel(i, 'kanban:todo')),
  doing: issues.filter(i => hasLabel(i, 'kanban:doing')),
  done: issues.filter(i => hasLabel(i, 'kanban:done')),
  // Issues without kanban label go to "backlog" by default
};
```

### Move Card (Drag & Drop)

```javascript
async function moveCard(issueNumber, fromColumn, toColumn) {
  const oldLabel = `kanban:${fromColumn}`;
  const newLabel = `kanban:${toColumn}`;
  
  // Get current labels, swap kanban label
  const issue = await octokit.rest.issues.get({ owner, repo, issue_number: issueNumber });
  const labels = issue.data.labels
    .map(l => l.name)
    .filter(l => !l.startsWith('kanban:'))
    .concat(newLabel);
  
  await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    labels
  });
}
```

### Initialize Labels (First Run)

```javascript
const KANBAN_LABELS = [
  { name: 'kanban:backlog', color: '6B7280', description: 'Backlog' },
  { name: 'kanban:todo', color: '3B82F6', description: 'To Do' },
  { name: 'kanban:doing', color: 'F59E0B', description: 'In Progress' },
  { name: 'kanban:done', color: '10B981', description: 'Done' },
];

async function ensureLabelsExist(owner, repo) {
  const { data: existingLabels } = await octokit.rest.issues.listLabelsForRepo({ owner, repo });
  const existingNames = existingLabels.map(l => l.name);
  
  for (const label of KANBAN_LABELS) {
    if (!existingNames.includes(label.name)) {
      await octokit.rest.issues.createLabel({ owner, repo, ...label });
    }
  }
}
```

---

## File Structure

```
github-kanban/
├── src/
│   ├── components/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── RepoSelector.jsx
│   │   ├── Board.jsx
│   │   ├── Column.jsx
│   │   ├── Card.jsx
│   │   └── IssueModal.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useIssues.js
│   │   └── useRepos.js
│   ├── lib/
│   │   ├── github.js        # Octokit instance
│   │   └── constants.js     # Label definitions
│   ├── main.jsx
│   └── index.css            # Tailwind imports
├── api/
│   └── auth/
│       └── callback.js      # Vercel serverless function
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Environment Variables

```bash
# .env.local (local development)
VITE_GITHUB_CLIENT_ID=your_client_id

# Vercel environment variables (set in dashboard)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

---

## Setup Instructions (for README)

### 1. Create GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps → New
2. Set:
   - Application name: `GitHub Kanban`
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/callback`
3. Save Client ID and Client Secret

### 2. Deploy to Vercel

```bash
# Clone and install
git clone https://github.com/yourusername/github-kanban.git
cd github-kanban
npm install

# Deploy
npx vercel

# Set environment variables in Vercel dashboard:
# - GITHUB_CLIENT_ID
# - GITHUB_CLIENT_SECRET
# - VITE_GITHUB_CLIENT_ID (same as GITHUB_CLIENT_ID)
```

### 3. Local Development

```bash
cp .env.example .env.local
# Edit .env.local with your GitHub OAuth credentials

npm run dev
```

---

## UI Wireframe

```
┌────────────────────────────────────────────────────────────────────┐
│  🗂️ GitHub Kanban          [user/repo ▼]              [@username] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│  │   BACKLOG    │ │    TO DO     │ │    DOING     │ │    DONE    ││
│  │              │ │              │ │              │ │            ││
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌────────┐ ││
│  │ │ #12      │ │ │ │ #15      │ │ │ │ #18      │ │ │ │ #10    │ ││
│  │ │ Add auth │ │ │ │ Fix bug  │ │ │ │ Update   │ │ │ │ Setup  │ ││
│  │ │          │ │ │ │ in login │ │ │ │ docs     │ │ │ │ CI/CD  │ ││
│  │ │ @alice   │ │ │ │          │ │ │ │ @bob     │ │ │ │ @alice │ ││
│  │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │ │ └────────┘ ││
│  │              │ │              │ │              │ │            ││
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │              │ │ ┌────────┐ ││
│  │ │ #14      │ │ │ │ #16      │ │ │              │ │ │ #8     │ ││
│  │ │ Design   │ │ │ │ Refactor │ │ │              │ │ │ Init   │ ││
│  │ │ system   │ │ │ │ API      │ │ │              │ │ │ project│ ││
│  │ └──────────┘ │ │ └──────────┘ │ │              │ │ └────────┘ ││
│  │              │ │              │ │              │ │            ││
│  │ [+ Add card] │ │ [+ Add card] │ │ [+ Add card] │ │[+ Add card]││
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘│
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Claude Code Prompts

Use these prompts sequentially with Claude Code:

### Prompt 1: Project Setup
```
Create a new React + Vite project called "github-kanban" with:
- Tailwind CSS configured
- @dnd-kit/core and @dnd-kit/sortable installed
- octokit installed
- File structure as defined in the plan
- Basic vercel.json for deployment
- .env.example with required variables
- .gitignore for Node + env files
```

### Prompt 2: Auth Flow
```
Implement GitHub OAuth:
1. Create /api/auth/callback.js serverless function that exchanges code for token
2. Create useAuth hook that:
   - Stores token in localStorage
   - Provides login/logout functions
   - Exposes isAuthenticated state
3. Create Login component with "Sign in with GitHub" button
4. Handle OAuth redirect flow in App.jsx
```

### Prompt 3: Repository Selection
```
Implement repo selection:
1. Create useRepos hook to fetch user's repos (owned + collaborator)
2. Create RepoSelector component with dropdown
3. Store selected repo in localStorage
4. Add ensureLabelsExist function that creates kanban labels if missing
```

### Prompt 4: Kanban Board
```
Implement the kanban board:
1. Create useIssues hook to fetch and cache issues
2. Create Board component using @dnd-kit
3. Create Column component (droppable)
4. Create Card component (draggable)
5. Implement moveCard function that updates issue labels
6. Add optimistic updates for smooth UX
```

### Prompt 5: Issue Management
```
Implement issue create/edit:
1. Create IssueModal component for creating new issues
2. Add "+" button to each column that opens modal with that column's label pre-selected
3. Click on card opens modal in edit mode
4. Modal shows: title, body (markdown), assignees, labels
```

### Prompt 6: Polish & Deploy
```
Final polish:
1. Add loading states and error handling
2. Add empty state for boards with no issues
3. Responsive design for mobile
4. README with setup instructions
5. Deploy to Vercel
```

---

## Potential Issues & Solutions

| Issue | Solution |
|-------|----------|
| Rate limiting (5000/hr) | Cache aggressively, batch requests |
| Large repos (100+ issues) | Pagination, only fetch open issues |
| Concurrent edits | Optimistic UI + retry on conflict |
| Labels conflict with existing | Use unique prefix `kanban:` |
| Card ordering | Store order in issue body as JSON comment, or accept no ordering for MVP |

---

## Success Criteria

MVP is complete when:
1. ✅ User can log in with GitHub
2. ✅ User can select any repo they have access to
3. ✅ Issues display in correct columns based on labels
4. ✅ Drag & drop moves issues between columns
5. ✅ User can create new issues from the board
6. ✅ Deployed and publicly accessible
