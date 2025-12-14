# GitHub Integration Setup

## Creating a GitHub Personal Access Token

### Option 1: Classic Personal Access Token (Recommended for Public Repos)

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a descriptive name (e.g., "BugSmith App")
4. Select the expiration (or "No expiration" for development)
5. **Select the following scope:**
   - **`public_repo`** - For public repositories only
   - OR **`repo`** - For both public and private repositories (broader access)
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't be able to see it again!)

### Option 2: Fine-Grained Personal Access Token (For More Control)

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (fine-grained)"**
3. Give it a name and select expiration
4. Select the repository access (specific repos or all repos)
5. Under **"Repository permissions"**, set:
   - **Issues**: Read access
   - **Metadata**: Read access (always required)
6. Click **"Generate token"**
7. Copy the token

## Setting Up the Token in BugSmith

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add your token:

```env
GITHUB_TOKEN=your_token_here
```

3. **Important:** Restart your development server after adding the token:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

## Token Scopes Explained

- **`public_repo`** - Read/write access to public repositories (sufficient for most use cases)
- **`repo`** - Full access to both public and private repositories (use if you need private repo access)

**Note:** GitHub doesn't have separate `repo:read` or `issues:read` scopes. The `repo` or `public_repo` scope includes read access to issues.

## Testing the Integration

1. Start your dev server: `npm run dev`
2. Navigate to the **Issues** page
3. Enter a repository (e.g., `vercel/next.js`)
4. Click **"Fetch Issues"**
5. You should see real GitHub issues appear!

## Troubleshooting

### "GitHub authentication failed"
- Make sure your token is correctly set in `.env.local`
- Restart your dev server after adding the token
- Verify the token hasn't expired

### "Repository not found"
- Check the repository name format: `owner/repo` (e.g., `vercel/next.js`)
- Make sure the repository exists and is accessible
- For private repos, ensure your token has `repo` scope (not just `public_repo`)

### "GITHUB_TOKEN environment variable is not set"
- Create `.env.local` file in the project root
- Add `GITHUB_TOKEN=your_token_here`
- Restart the dev server

