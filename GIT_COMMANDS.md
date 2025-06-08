# Essential Git Commands

## Daily Workflow Commands

### 1. Starting Your Work
```bash
# Get the latest changes from GitHub
git pull
```

### 2. Checking Status
```bash
# See what files have changed
git status

# See detailed changes in files
git diff
```

### 3. Saving Your Changes
```bash
# Add all changed files
git add .

# Add specific file
git add filename

# Commit your changes with a message
git commit -m "Description of your changes"

# Push changes to GitHub
git push
```

## Useful Commands

### Viewing History
```bash
# See commit history
git log

# See commit history in one line
git log --oneline
```

### Branch Commands
```bash
# Create new branch
git branch branch-name

# Switch to a branch
git checkout branch-name

# Create and switch to new branch
git checkout -b branch-name

# List all branches
git branch
```

### Undoing Changes
```bash
# Discard changes in a file
git checkout -- filename

# Undo last commit (keep changes)
git reset HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## Common Scenarios

### 1. Starting a New Feature
```bash
git pull                    # Get latest changes
git checkout -b new-feature # Create and switch to new branch
# Make your changes
git add .
git commit -m "Add new feature"
git push -u origin new-feature
```

### 2. Updating Your Work
```bash
git pull                    # Get latest changes
# Make your changes
git add .
git commit -m "Update feature"
git push
```

### 3. If You Get Conflicts
```bash
git pull                    # This might show conflicts
# Fix conflicts in your code editor
git add .                   # Add fixed files
git commit -m "Resolve conflicts"
git push
```

## Best Practices

1. **Commit Often**
   - Make small, focused commits
   - Each commit should do one thing

2. **Write Clear Commit Messages**
   - Start with a verb (Add, Fix, Update, etc.)
   - Be specific about what changed
   - Example: "Add user authentication" or "Fix login button styling"

3. **Always Pull Before Push**
   - Get latest changes before pushing
   - This prevents conflicts

4. **Don't Commit**
   - `.env` files
   - `node_modules` folder
   - Build files
   - Log files
   - Database files

## If Something Goes Wrong

### 1. Undo Last Commit
```bash
git reset HEAD~1           # Keep changes
git reset --hard HEAD~1    # Discard changes
```

### 2. Discard All Changes
```bash
git checkout -- .         # Discard all changes
```

### 3. Get Latest Version
```bash
git fetch origin
git reset --hard origin/main
```

Remember: If you're unsure about a command, you can always use:
```bash
git help command-name
```
For example: `git help commit` 