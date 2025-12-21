# Git Setup Instructions

## Step 1: Configure Git (Already Done)
```bash
git config --global user.email "sdm800884@gmail.com"
git config --global user.name "Mohammad-abdo"
```

## Step 2: Remove Old Remote and Add New One
```bash
git remote remove origin
git remote add origin https://github.com/Mohammad-abdo/DR_LOW.git
```

## Step 3: Add All Files
```bash
git add .
```

## Step 4: Commit Changes
```bash
git commit -m "Initial commit: D.Low LMS Frontend"
```

## Step 5: Push to GitHub
```bash
git push -u origin main
```

## If you get authentication error:
Use GitHub Personal Access Token instead of password:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. Use token as password when pushing



























