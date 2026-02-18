#!/bin/bash
#
# LifeOS Core - Analyze Script
# Scans workspace and reports organization status
# DRY RUN - never modifies files
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
LIFEOS_DIR="$WORKSPACE_DIR/.lifeos"
REPORT_FILE="$LIFEOS_DIR/analysis-report.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
VERBOSE=0
DRY_RUN=1

usage() {
    cat << EOF
Usage: lifeos analyze [OPTIONS]

Analyze your OpenClaw workspace and report organization status.

OPTIONS:
    -v, --verbose       Show detailed output
    -h, --help          Show this help message

EXAMPLES:
    lifeos analyze              # Quick analysis
    lifeos analyze --verbose    # Detailed analysis

EOF
}

log() {
    echo -e "${BLUE}[LifeOS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[Warning]${NC} $1"
}

error() {
    echo -e "${RED}[Error]${NC} $1"
}

success() {
    echo -e "${GREEN}[Success]${NC} $1"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Ensure workspace exists
if [[ ! -d "$WORKSPACE_DIR" ]]; then
    error "Workspace not found: $WORKSPACE_DIR"
    exit 1
fi

# Create .lifeos directory if needed
mkdir -p "$LIFEOS_DIR"

log "Analyzing workspace: $WORKSPACE_DIR"
echo ""

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
{
  "analysisDate": "",
  "workspacePath": "",
  "summary": {
    "totalFiles": 0,
    "markdownFiles": 0,
    "dailyNotes": 0,
    "projects": 0,
    "orphanedFiles": 0
  },
  "findings": [],
  "recommendations": []
}
EOF

# Function to count files by type
count_files() {
    local pattern=$1
    find "$WORKSPACE_DIR" -type f -name "$pattern" 2>/dev/null | wc -l
}

# Function to find markdown files
find_markdown() {
    find "$WORKSPACE_DIR" -type f \( -name "*.md" -o -name "*.MD" \) 2>/dev/null | grep -v node_modules | grep -v ".git"
}

# Function to find daily notes
find_daily_notes() {
    find "$WORKSPACE_DIR/memory/daily" -type f -name "*.md" 2>/dev/null | sort -r
}

# Function to find projects
find_projects() {
    find "$WORKSPACE_DIR/life/areas/projects" -type d -mindepth 1 -maxdepth 1 2>/dev/null | sort
}

# Analysis
echo "📊 Workspace Statistics"
echo "========================"
echo ""

TOTAL_FILES=$(find "$WORKSPACE_DIR" -type f 2>/dev/null | wc -l)
MD_FILES=$(find_markdown | wc -l)
DAILY_COUNT=$(find_daily_notes 2>/dev/null | wc -l)
PROJECT_COUNT=$(find_projects 2>/dev/null | wc -l)

echo "  Total files:        $TOTAL_FILES"
echo "  Markdown files:     $MD_FILES"
echo "  Daily notes:        $DAILY_COUNT"
echo "  Active projects:    $PROJECT_COUNT"
echo ""

# Check for key files
echo "📁 Key Files Found"
echo "=================="
echo ""

[[ -f "$WORKSPACE_DIR/SOUL.md" ]] && success "SOUL.md (Agent identity)" || warn "SOUL.md missing"
[[ -f "$WORKSPACE_DIR/USER.md" ]] && success "USER.md (User profile)" || warn "USER.md missing"
[[ -f "$WORKSPACE_DIR/AGENTS.md" ]] && success "AGENTS.md (Instructions)" || warn "AGENTS.md missing"
[[ -f "$WORKSPACE_DIR/MEMORY.md" ]] && success "MEMORY.md (Long-term memory)" || warn "MEMORY.md missing"

echo ""

# Check PARA structure
echo "🗂️  PARA Structure"
echo "=================="
echo ""

[[ -d "$WORKSPACE_DIR/life/areas/projects" ]] && success "Projects directory" || warn "Projects directory missing"
[[ -d "$WORKSPACE_DIR/life/areas/people" ]] && success "People directory" || warn "People directory missing"
[[ -d "$WORKSPACE_DIR/memory/daily" ]] && success "Daily notes directory" || warn "Daily notes missing"

echo ""

# Find orphaned files (markdown not in expected locations)
if [[ $VERBOSE -eq 1 ]]; then
    echo "🔍 Orphaned Files (markdown outside standard locations)"
    echo "======================================================="
    echo ""
    
    find_markdown | while read -r file; do
        # Check if file is in expected location
        if [[ ! "$file" =~ /(memory/|life/|projects/|resources/|archives/) ]]; then
            echo "  ⚠️  $file"
        fi
    done
    
    echo ""
fi

# Generate recommendations
echo "💡 Recommendations"
echo "=================="
echo ""

RECOMMENDATIONS=()

if [[ $DAILY_COUNT -eq 0 ]]; then
    RECOMMENDATIONS+=("Start using daily notes in memory/daily/ for better context tracking")
fi

if [[ $PROJECT_COUNT -eq 0 ]]; then
    RECOMMENDATIONS+=("Create your first project in life/areas/projects/")
fi

if [[ ! -f "$WORKSPACE_DIR/MEMORY.md" ]]; then
    RECOMMENDATIONS+=("Create MEMORY.md for long-term memory storage")
fi

if [[ ${#RECOMMENDATIONS[@]} -eq 0 ]]; then
    success "Your workspace looks well organized!"
else
    for i in "${!RECOMMENDATIONS[@]}"; do
        echo "  $((i+1)). ${RECOMMENDATIONS[$i]}"
    done
fi

echo ""

# Update report with actual data
TEMP_REPORT=$(mktemp)
jq --arg date "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
   --arg path "$WORKSPACE_DIR" \
   --argjson total "$TOTAL_FILES" \
   --argjson md "$MD_FILES" \
   --argjson daily "$DAILY_COUNT" \
   --argjson projects "$PROJECT_COUNT" \
   '.analysisDate = $date | .workspacePath = $path | .summary.totalFiles = $total | .summary.markdownFiles = $md | .summary.dailyNotes = $daily | .summary.projects = $projects' \
   "$REPORT_FILE" > "$TEMP_REPORT"
mv "$TEMP_REPORT" "$REPORT_FILE"

success "Analysis complete!"
log "Report saved to: $REPORT_FILE"

exit 0
