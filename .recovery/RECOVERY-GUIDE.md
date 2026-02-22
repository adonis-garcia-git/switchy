# Claude Code Recovery Guide

## What Happened

A `git checkout` wiped unstaged working tree changes, losing hours of work across 60+ files. The code was recovered using Claude Code's built-in file history backups, which are stored completely outside the git repo and are unaffected by any git operations.

## Where Claude Code Stores Data

All recovery data lives in `~/.claude/` — **git cannot touch this directory**.

| What | Location | Description |
|------|----------|-------------|
| Prompt history | `~/.claude/history.jsonl` | Every prompt you've ever typed, across all projects |
| Pasted content | `~/.claude/paste-cache/` | Full text of everything you've pasted into prompts |
| File backups | `~/.claude/file-history/` | Snapshots of every file Claude edited, versioned per session |
| Debug logs | `~/.claude/debug/` | Technical logs (not human-readable conversations) |

## Step 1: Recover Your Prompt History

Extract all prompts for a specific project with full pasted content resolved:

```bash
python3 << 'PYEOF'
import json, os
from datetime import datetime

PROJECT_SUFFIX = "switchy"  # Change to your project name
paste_cache = os.path.expanduser("~/.claude/paste-cache")

def resolve_paste(entry):
    if isinstance(entry, dict):
        if "content" in entry:
            return entry["content"]
        if "contentHash" in entry:
            path = os.path.join(paste_cache, entry["contentHash"] + ".txt")
            if os.path.exists(path):
                with open(path) as f:
                    return f.read()
    return str(entry)

with open(os.path.expanduser("~/.claude/history.jsonl")) as f:
    lines = f.readlines()

sep = "=" * 80
with open("prompt-history-full.txt", "w") as out:
    for line in lines:
        try:
            entry = json.loads(line.strip())
        except:
            continue
        if not entry.get("project", "").endswith(PROJECT_SUFFIX):
            continue
        ts = entry.get("timestamp", 0)
        dt = datetime.fromtimestamp(ts / 1000).strftime("%Y-%m-%d %H:%M")
        display = entry.get("display", "").strip()
        out.write(sep + "\n[" + dt + "]\n" + sep + "\n" + display + "\n")
        for key, val in entry.get("pastedContents", {}).items():
            out.write("\n--- [Pasted text #" + str(key) + "] ---\n")
            out.write(resolve_paste(val) + "\n")
        out.write("\n\n")

print("Saved to prompt-history-full.txt")
PYEOF
```

## Step 2: Understand File History Structure

Claude Code backs up every file it edits to:

```
~/.claude/file-history/<session-id>/<file-hash>@v1
~/.claude/file-history/<session-id>/<file-hash>@v2
```

- Each `<session-id>` is a UUID representing one Claude Code conversation
- `<file-hash>` is `sha256(absolute_file_path)[:16]`
- `@v1` is the file before Claude's first edit, `@v2` after the first edit, `@v3` after the second, etc.
- These are **full file snapshots**, not diffs

## Step 3: List All Backed-Up Sessions

```bash
python3 << 'PYEOF'
import os
from datetime import datetime

base = os.path.expanduser("~/.claude/file-history")
sessions = []
for d in os.listdir(base):
    full = os.path.join(base, d)
    if not os.path.isdir(full):
        continue
    files = os.listdir(full)
    if not files:
        continue
    latest = max(os.path.getmtime(os.path.join(full, f)) for f in files)
    earliest = min(os.path.getmtime(os.path.join(full, f)) for f in files)
    sessions.append((d, datetime.fromtimestamp(earliest), datetime.fromtimestamp(latest), len(files)))

sessions.sort(key=lambda s: s[2], reverse=True)
for sid, start, end, count in sessions[:20]:
    print(f"{sid}  {start:%b %d %H:%M} - {end:%b %d %H:%M}  ({count} snapshots)")
PYEOF
```

## Step 4: Restore All Files to a Specific Point in Time

This is the key script. Set `CUTOFF` to the timestamp just before the destructive action occurred. It restores every file to its latest backed-up version from before that time.

```bash
python3 << 'PYEOF'
import os, hashlib
from datetime import datetime

# ===== CONFIGURE THESE =====
PROJECT = "/Users/mickeymouse/projects/switchy"  # Your project root
CUTOFF = datetime(2026, 2, 22, 4, 21)            # Restore to state BEFORE this time
# ===========================

base = os.path.expanduser("~/.claude/file-history")

# Build hash -> filepath mapping by scanning project files
hash_to_path = {}
skip_dirs = {"node_modules", ".git", ".next", ".convex", "dist", ".recovery", ".claude"}
for root, dirs, files in os.walk(PROJECT):
    dirs[:] = [d for d in dirs if d not in skip_dirs]
    for f in files:
        full = os.path.join(root, f)
        rel = os.path.relpath(full, PROJECT)
        h = hashlib.sha256(full.encode()).hexdigest()[:16]
        hash_to_path[h] = rel

# Find latest backup of each file BEFORE the cutoff
latest = {}
for session_id in os.listdir(base):
    session_dir = os.path.join(base, session_id)
    if not os.path.isdir(session_dir):
        continue
    for entry in os.listdir(session_dir):
        if "@" not in entry:
            continue
        file_hash = entry.split("@")[0]
        filepath = hash_to_path.get(file_hash)
        if not filepath:
            continue
        full_snapshot = os.path.join(session_dir, entry)
        mtime = os.path.getmtime(full_snapshot)
        if datetime.fromtimestamp(mtime) <= CUTOFF:
            if filepath not in latest or mtime > latest[filepath][1]:
                latest[filepath] = (full_snapshot, mtime)

# Restore files
restored = 0
for filepath, (snapshot, mtime) in sorted(latest.items()):
    if filepath in (".env.local", ".env.local.example"):
        continue
    target = os.path.join(PROJECT, filepath)
    with open(snapshot, "rb") as f:
        backup = f.read()
    if os.path.exists(target):
        with open(target, "rb") as f:
            if f.read() == backup:
                continue
    os.makedirs(os.path.dirname(target), exist_ok=True)
    with open(target, "wb") as f:
        f.write(backup)
    dt = datetime.fromtimestamp(mtime)
    print(f"  Restored: {filepath} (from {dt:%b %d %H:%M})")
    restored += 1

print(f"\nDone. Restored {restored} files to pre-{CUTOFF:%H:%M} state.")
PYEOF
```

## Important Notes

1. **File history only covers files Claude edited.** If you manually edited a file and Claude never touched it, there's no backup here.

2. **The hash is `sha256(absolute_path)[:16]`.** If your project moves to a different directory, the hashes won't match. You'd need to adjust the script to try both old and new paths.

3. **Post-disaster backups may be bad.** If Claude Code runs after a `git checkout` wipes your files, it will back up the *wiped* versions. Always use a time cutoff from BEFORE the destructive action.

4. **Prevention is better than recovery:**
   - Commit frequently, even WIP commits
   - Use `git stash` before risky operations
   - Use `git worktree` for isolated experiments
   - Never run `git checkout .` or `git checkout -- .` on a dirty working tree unless you're sure

5. **These backups persist forever** (until you manually delete `~/.claude/file-history/`). Even if you delete the entire project repo, the backups survive.
