# BugSmith - Developer Mission Control

A full-stack AI-agent powered web application for autonomous bug fixing, PR creation, and deployment.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ShadCN UI**
- **Vercel** (deployment ready)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. **Set up GitHub integration** (optional but recommended):
   - See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for detailed instructions
   - Create a GitHub Personal Access Token
   - Add it to `.env.local` as `GITHUB_TOKEN=your_token_here`
   - **For public repos:** Use `public_repo` scope
   - **For private repos:** Use `repo` scope

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── dashboard/      # Main dashboard page
│   ├── issues/         # GitHub issues listing
│   ├── agent-run/      # Agent execution monitoring
│   ├── prs/            # Pull requests management
│   └── layout.tsx      # Root layout with sidebar/nav
├── components/
│   ├── ui/             # ShadCN UI components
│   ├── sidebar.tsx     # Navigation sidebar
│   ├── top-nav.tsx     # Top navigation bar
│   ├── status-chip.tsx # Status indicators
│   ├── log-viewer.tsx  # Terminal-style log display
│   ├── stepper.tsx     # Pipeline step indicator
│   ├── issue-card.tsx  # Issue display card
│   └── pr-card.tsx     # PR display card
└── lib/
    └── utils.ts        # Utility functions
```

## Features

### Current (Mock Data)
- ✅ Dashboard with agent status and activity log
- ✅ Issues page with GitHub-style cards
- ✅ Agent run page with pipeline stepper and terminal logs
- ✅ PRs page with table and card views
- ✅ Dark mode developer theme
- ✅ Responsive design

### TODO: Integration Points

1. **Cline CLI Integration**
   - Connect to Cline API for agent reasoning
   - Stream agent thoughts in real-time
   - Trigger code generation workflows

2. **Kestra Workflow Integration**
   - Trigger Kestra workflows for agent execution
   - Stream workflow logs to terminal viewer
   - Monitor workflow status and progress

3. **GitHub API Integration** ✅
   - ✅ Fetch real GitHub issues
   - ⏳ Create pull requests programmatically
   - ⏳ Monitor PR status and reviews
   - See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for setup instructions

4. **CodeRabbit Integration**
   - Fetch review comments from CodeRabbit
   - Display review feedback in PR details

5. **Vercel Deployment Hooks**
   - Trigger deployments via Vercel API
   - Monitor deployment status
   - Display deployment logs

## Theme

The application uses a dark developer theme inspired by:
- GitHub Actions UI
- Vercel Deploy Logs UI
- Terminal aesthetics

Color palette:
- Background: `#0D1117`, `#161B22`
- Accent: `#3B82F6` (neon blue)
- Text: `#8B949E` (muted), `#FFFFFF` (primary)

## Deployment

The project is optimized for Vercel deployment. Simply push to your repository and connect it to Vercel.

## License

MIT

