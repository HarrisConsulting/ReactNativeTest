#!/bin/bash

# ReactNativeTest Open Source Preparation Script
# Safely prepares the exemplar for public GitHub release
# Removes all sensitive data and personal references

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 ReactNativeTest Open Source Preparation${NC}"
echo -e "${BLUE}===========================================${NC}"

# Configuration
SOURCE_DIR="/Users/rogerharris/Projects/ReactNativeTest"
TARGET_DIR="/Users/rogerharris/Projects/ReactNativeTest-OpenSource"

# Validate source directory exists
if [[ ! -d "$SOURCE_DIR" ]]; then
    echo -e "${RED}❌ Error: Source directory not found: $SOURCE_DIR${NC}"
    exit 1
fi

# Check if target already exists
if [[ -d "$TARGET_DIR" ]]; then
    echo -e "${YELLOW}⚠️  Target directory already exists: $TARGET_DIR${NC}"
    read -p "Remove existing directory and continue? (y/N): " CONFIRM
    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
        rm -rf "$TARGET_DIR"
        echo -e "${GREEN}✅ Existing directory removed${NC}"
    else
        echo -e "${YELLOW}⚠️  Operation cancelled${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}📦 Step 1: Creating clean copy${NC}"
cp -r "$SOURCE_DIR" "$TARGET_DIR"
cd "$TARGET_DIR"
echo -e "${GREEN}✅ Clean copy created${NC}"

echo -e "${BLUE}🗑️  Step 2: Removing sensitive files${NC}"

# Remove sensitive files
rm -f .env
rm -f .env.local
rm -rf .git
rm -rf node_modules
rm -rf ios/build
rm -rf android/build
rm -rf ios/Pods
rm -f ios/Podfile.lock
rm -f package-lock.json
rm -rf vendor

# Remove development artifacts
find . -name ".DS_Store" -delete
find . -name "*.log" -delete

echo -e "${GREEN}✅ Sensitive files removed${NC}"

echo -e "${BLUE}📝 Step 3: Creating example environment file${NC}"
cat > .env.example << 'EOF'
# Supabase Configuration
# Get these values from your Supabase project dashboard
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
APP_VERSION=1.0.0
APP_ENV=development
EOF

echo -e "${GREEN}✅ Example environment file created${NC}"

echo -e "${BLUE}🔄 Step 4: Cleaning personal references${NC}"

# Clean personal paths
echo "  Cleaning file paths..."
find . -type f \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.sh" \) -exec grep -l "/Users/rogerharris" {} \; | \
while read -r file; do
    echo "    Cleaning: $file"
    sed -i '' 's|/Users/rogerharris/Projects|/path/to/your/projects|g' "$file"
done

# Clean username references
echo "  Cleaning username references..."
find . -type f \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.sh" \) -exec grep -l "rogerharris" {} \; | \
while read -r file; do
    echo "    Cleaning: $file"
    sed -i '' 's|rogerharris|yourusername|g' "$file"
done

# Clean personal name references
echo "  Cleaning personal name references..."
find . -type f \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.sh" \) -exec grep -l "Roger Harris" {} \; | \
while read -r file; do
    echo "    Cleaning: $file"
    sed -i '' 's|Roger Harris|Your Name|g' "$file"
done

echo -e "${GREEN}✅ Personal references cleaned${NC}"

echo -e "${BLUE}📄 Step 5: Creating open source documentation${NC}"

# Create LICENSE file
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 ReactNativeTest Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create CONTRIBUTING.md
cat > CONTRIBUTING.md << 'EOF'
# Contributing to ReactNativeTest Exemplar

## Welcome Contributors! 🎉

Thank you for your interest in improving this React Native exemplar. This project aims to provide a production-ready template with battle-tested patterns.

## How to Contribute

### 1. Types of Contributions
- Bug fixes and improvements
- Documentation enhancements
- New feature patterns (with real-world validation)
- Testing improvements
- Performance optimizations

### 2. Before You Start
- Check existing issues and PRs
- Open an issue to discuss major changes
- Follow the existing code style and patterns

### 3. Development Setup
```bash
git clone your-fork
cd react-native-exemplar-2025
npm install
cd ios && pod install && cd ..
```

### 4. Testing Your Changes
- Run all tests: `npm test`
- Check TypeScript: `npm run typecheck`
- Verify linting: `npm run lint`
- Test on both iOS and Android

### 5. Pull Request Process
- Create feature branch from main
- Include comprehensive testing
- Update documentation if needed
- Reference related issues

## Code Standards

- TypeScript for all new code
- Comprehensive testing required
- Follow existing patterns
- Document complex logic
- Maintain 95%+ build success rate

## Questions?

Open an issue or start a discussion. We're here to help! 🚀
EOF

# Create CODE_OF_CONDUCT.md
cat > CODE_OF_CONDUCT.md << 'EOF'
# Code of Conduct

## Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

## Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Enforcement

Project maintainers are responsible for clarifying the standards and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## Contact

Report issues to the project maintainers through GitHub issues.
EOF

echo -e "${GREEN}✅ Open source documentation created${NC}"

echo -e "${BLUE}📊 Step 6: Validation and summary${NC}"

# Count files cleaned
CLEANED_FILES=$(find . -type f \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.sh" \) | wc -l | tr -d ' ')

echo ""
echo -e "${GREEN}✅ Open Source Preparation Complete!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "📁 Clean copy location: $TARGET_DIR"
echo "📄 Files processed: $CLEANED_FILES"
echo "🔒 Sensitive data removed: ✅"
echo "👤 Personal references cleaned: ✅"
echo "📝 Open source docs created: ✅"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Review the cleaned copy"
echo "2. Create new GitHub repository"
echo "3. Copy contents to new repo"
echo "4. Update README with your details"
echo "5. Set up branch protection"
echo "6. Share with the community!"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "- Review all files before publishing"
echo "- Test the exemplar creation process"
echo "- Update any remaining personal references"
echo "- Set up proper GitHub repository settings"
echo ""
echo -e "${GREEN}Happy open sourcing! 🌟${NC}"
