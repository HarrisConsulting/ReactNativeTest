# CI/CD Duplicate Workflow Prevention Guide

**Issue Discovered**: August 5, 2025\
**Root Cause**: Multiple workflow files with identical `name:` fields\
**Impact**: Confusing success/failure patterns for same commit\
**Solution**: Ensure only ONE active workflow file

---

## 🚨 **The Problem**

### **Symptoms**

- Same commit triggers multiple workflow runs
- Some runs succeed while others fail immediately
- Inconsistent pipeline results despite identical code
- Confusing GitHub Actions dashboard showing mixed results

### **Root Cause**

Multiple workflow files in `.github/workflows/` with the **same `name:` field**:

```yaml
# File 1: .github/workflows/ci-cd.yml
name: React Native CI/CD Pipeline # ⚠️ Same name

# File 2: .github/workflows/ci-cd-backup.yml
name: React Native CI/CD Pipeline # ⚠️ Same name

# File 3: .github/workflows/ci-cd-clean.yml
name: React Native CI/CD Pipeline # ⚠️ Same name
```

### **What Happens**

1. **Push to main** triggers ALL workflow files matching the `on:` conditions
2. **Multiple workflows run simultaneously** for the same commit
3. **Different outcomes** due to different file contents (corrupted vs clean)
4. **GitHub UI shows confusing results** - same commit with success + failure

---

## 🔍 **Detection Methods**

### **GitHub Actions UI Signs**

- Multiple workflow runs for same commit hash
- Same commit time but different run numbers
- Mixed success (✅) and failure (❌) for identical code
- Different workflow names or same names with different outcomes

### **Command Line Detection**

```bash
# Check for multiple workflow files
ls -la .github/workflows/

# Check recent runs for duplicates
gh run list --limit 10

# Look for same commit with multiple runs
gh run list --json conclusion,createdAt,displayTitle,number
```

### **Pattern Recognition**

- **Immediate failures** (0-10 seconds) - usually backup/corrupted files
- **Normal successes** (45-120 seconds) - clean working files
- **Same commit hash** with different run IDs

---

## ✅ **Prevention & Solution**

### **Step 1: Audit Existing Workflows**

```bash
# List all workflow files
find .github/workflows -name "*.yml" -o -name "*.yaml"

# Check for duplicate names in workflow files
grep -r "^name:" .github/workflows/
```

### **Step 2: Remove Duplicates**

```bash
# Remove backup files (safe - they're backups)
rm .github/workflows/*backup*.yml
rm .github/workflows/*clean*.yml
rm .github/workflows/*old*.yml

# Disable instead of delete (if unsure)
mv .github/workflows/ci-cd-backup.yml .github/workflows/ci-cd-backup.yml.disabled
```

### **Step 3: Ensure Unique Names**

If you need multiple workflows, ensure unique names:

```yaml
# Production workflow
name: React Native CI/CD Pipeline

# Development workflow
name: React Native Development Pipeline

# Feature testing workflow
name: React Native Feature Testing
```

### **Step 4: Validate Setup**

```bash
# Verify only one active workflow
ls -la .github/workflows/*.yml

# Test with a commit
git add . && git commit -m "test: verify single workflow"
git push

# Check results
gh run list --limit 3
```

---

## 📋 **Best Practices**

### **Workflow File Management**

1. **One Active Workflow**: Keep only ONE primary workflow file
2. **Descriptive Names**: Use unique, descriptive workflow names
3. **Backup Strategy**: Store backups outside `.github/workflows/` directory
4. **Version Control**: Use git tags/branches for workflow versioning

### **Naming Conventions**

```yaml
# ✅ GOOD: Unique descriptive names
name: "React Native Production Pipeline"
name: "React Native Development CI"
name: "React Native Security Scan"

# ❌ BAD: Duplicate or generic names
name: "CI/CD Pipeline" # Too generic
name: "React Native CI/CD" # Likely to be duplicated
```

### **File Organization**

```
.github/workflows/
├── ci-cd.yml                    # ✅ Active pipeline
├── disabled/
│   ├── ci-cd-backup.yml         # ✅ Safely stored backup
│   └── ci-cd-old-version.yml    # ✅ Historical version
└── experimental/
    └── feature-pipeline.yml     # ✅ Development workflows
```

---

## 🛠 **Implementation in New Projects**

### **Project Setup Checklist**

- [ ] Create single workflow file: `.github/workflows/ci-cd.yml`
- [ ] Use unique workflow name
- [ ] Verify no duplicate workflows exist
- [ ] Test with initial commit
- [ ] Document workflow purpose and maintenance

### **Code Review Guidelines**

- [ ] Check for workflow file changes in PRs
- [ ] Verify workflow names are unique
- [ ] Ensure no accidental duplicate workflows
- [ ] Test workflow changes in feature branches

### **Maintenance Routine**

- [ ] Monthly audit of workflow files
- [ ] Clean up disabled/backup workflows
- [ ] Update documentation when workflows change
- [ ] Monitor for unexplained multiple runs

---

## 🔧 **Emergency Resolution**

If you discover this issue in production:

```bash
# 1. Immediate fix - remove duplicates
cd .github/workflows
ls -la  # List all workflows
rm *backup*.yml *clean*.yml *old*.yml  # Remove known duplicates

# 2. Commit the fix
git add -A
git commit -m "fix: Remove duplicate CI/CD workflows causing conflicting runs"
git push

# 3. Verify resolution
gh run list --limit 5  # Should show only one run per commit
```

---

## 📚 **Integration with Existing Guides**

This issue and solution have been integrated into:

- ✅ `.github/copilot-instructions.md` (Issue #6)
- ✅ `docs/react-native-zero-to-production-guide.md` (Step 4.1 warning)
- ✅ `docs/react-native-quick-setup-checklist.md` (Phase 4 warning)
- ✅ All troubleshooting quick-reference tables

---

## 🎯 **Key Takeaways**

1. **Multiple workflow files** with same `name:` field cause conflicts
2. **GitHub triggers ALL matching workflows** for each push
3. **Same commit** can have different outcomes from different workflow files
4. **Prevention is key**: Audit workflow files during project setup
5. **Quick detection**: Look for multiple runs of same commit
6. **Simple fix**: Remove duplicate/backup workflow files

**Remember**: One commit should trigger one workflow run for consistent,
predictable CI/CD behavior! 🚀
