# How to Push Code to GitHub

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Name it: `caring-reminder`
4. Choose **Public** or **Private**
5. **DO NOT** check "Initialize with README"
6. Click **"Create repository"**

## Step 2: Copy Your Repository URL

After creating, GitHub will show you a URL like:
```
https://github.com/YOUR_USERNAME/caring-reminder.git
```
Copy this URL - you'll need it!

## Step 3: Open Terminal and Run These Commands

Open Terminal (or your command line) and run these commands one by one:

```bash
# Navigate to your project folder
cd "/Users/shaoyingluo/Caring Reminder"

# Initialize git repository
git init

# Add all your files
git add .

# Make your first commit
git commit -m "Initial commit: Caring Reminder app"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/caring-reminder.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Authentication

When you run `git push`, GitHub will ask for credentials:

**Option A: Personal Access Token (Recommended)**
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name it: "Caring Reminder"
4. Check "repo" permission
5. Click "Generate token"
6. Copy the token (you'll only see it once!)
7. When git asks for password, paste the token instead

**Option B: GitHub CLI (Easier)**
```bash
# Install GitHub CLI (if not installed)
brew install gh

# Login to GitHub
gh auth login

# Then try git push again
git push -u origin main
```

## Troubleshooting

**"fatal: remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/caring-reminder.git
```

**"Permission denied"**
- Make sure you're using a Personal Access Token, not your password
- Or use GitHub CLI: `gh auth login`

**"Repository not found"**
- Double-check the repository URL
- Make sure the repository exists on GitHub
- Make sure you're using the correct username

## Success!

Once `git push` completes, you should see:
```
Enumerating objects: X, done.
Writing objects: 100% (X/X), done.
To https://github.com/YOUR_USERNAME/caring-reminder.git
 * [new branch]      main -> main
```

Then visit: `https://github.com/YOUR_USERNAME/caring-reminder` to see your code!


