#!/bin/bash
#
# LifeOS Core — Workspace Analyzer
# Scans workspace and generates analysis report
# Compatible with Bash 3.2+ (macOS default)
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# Default values
WORKSPACE_PATH="."
VERBOSE=false
OUTPUT_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --output|-o)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: lifeos analyze [path] [options]"
            echo ""
            echo "Options:"
            echo "  --verbose, -v     Show detailed output"
            echo "  --output, -o      Write report to file"
            echo "  --help, -h        Show this help"
            exit 0
            ;;
        -*)
            echo "Unknown option: $1"
            exit 1
            ;;
        *)
            WORKSPACE_PATH="$1"
            shift
            ;;
    esac
done

# Resolve workspace path
WORKSPACE_PATH="$(cd "$WORKSPACE_PATH" && pwd)"
LIFEOS_DIR="$WORKSPACE_PATH/.lifeos"
REPORT_FILE="$LIFEOS_DIR/analysis-report.json"

print_header "🔍 LifeOS Workspace Analysis"
print_dim "Scanning: $WORKSPACE_PATH"
echo ""

# Create .lifeos directory if needed
mkdir -p "$LIFEOS_DIR"

# Initialize counters (Bash 3.2 compatible - no associative arrays)
COUNT_DAILY_NOTES=0
COUNT_PROJECTS=0
COUNT_PEOPLE=0
COUNT_AREAS=0
COUNT_KNOWLEDGE=0
COUNT_CONFIG=0
COUNT_MARKDOWN=0
COUNT_OTHER=0
SIZE_DAILY_NOTES=0
SIZE_PROJECTS=0
SIZE_PEOPLE=0
SIZE_AREAS=0
SIZE_KNOWLEDGE=0
SIZE_CONFIG=0
SIZE_MARKDOWN=0
SIZE_OTHER=0

TOTAL_FILES=0
TOTAL_SIZE=0
DAILY_NOTES=0
PROJECTS=0
ORPHANED_FILES=0

# Arrays for categorization (Bash 3.2 compatible)
DAILY_NOTES_LIST=""
PROJECTS_LIST=""
ORPHANED_LIST=""
CONFIG_FILES=""

print_info "Scanning files..."

# Find all files (respecting .gitignore if present)
if [[ -f "$WORKSPACE_PATH/.gitignore" ]]; then
    if is_git_repo && [[ "$(get_git_root)" == "$WORKSPACE_PATH" ]]; then
        FILE_LIST=$(git ls-files 2>/dev/null | while read -r f; do
            echo "$WORKSPACE_PATH/$f"
        done)
    else
        FILE_LIST=$(find "$WORKSPACE_PATH" -type f \
            ! -path "*/node_modules/*" \
            ! -path "*/.git/*" \
            ! -path "*/.next/*" \
            ! -path "*/dist/*" \
            ! -path "*/build/*" \
            ! -path "*/.lifeos/*" \
            2>/dev/null)
    fi
else
    FILE_LIST=$(find "$WORKSPACE_PATH" -type f \
        ! -path "*/node_modules/*" \
        ! -path "*/.git/*" \
        ! -path "*/.next/*" \
        ! -path "*/dist/*" \
        ! -path "*/build/*" \
        ! -path "*/.lifeos/*" \
        2>/dev/null)
fi

# Process each file
while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    [[ -f "$file" ]] || continue
    
    TOTAL_FILES=$((TOTAL_FILES + 1))
    FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    TOTAL_SIZE=$((TOTAL_SIZE + FILE_SIZE))
    
    CATEGORY=$(get_file_category "$file")
    
    # Update counters (Bash 3.2 compatible)
    case "$CATEGORY" in
        daily_note)
            COUNT_DAILY_NOTES=$((COUNT_DAILY_NOTES + 1))
            SIZE_DAILY_NOTES=$((SIZE_DAILY_NOTES + FILE_SIZE))
            DAILY_NOTES=$((DAILY_NOTES + 1))
            DAILY_NOTES_LIST="$DAILY_NOTES_LIST$file
"
            ;;
        project)
            COUNT_PROJECTS=$((COUNT_PROJECTS + 1))
            SIZE_PROJECTS=$((SIZE_PROJECTS + FILE_SIZE))
            if [[ "$file" =~ /projects/([^/]+)/ ]]; then
                PROJECT_NAME="${BASH_REMATCH[1]}"
                if [[ ! "$PROJECTS_LIST" =~ "$PROJECT_NAME" ]]; then
                    PROJECTS_LIST="$PROJECTS_LIST$PROJECT_NAME
"
                    PROJECTS=$((PROJECTS + 1))
                fi
            fi
            ;;
        person)
            COUNT_PEOPLE=$((COUNT_PEOPLE + 1))
            SIZE_PEOPLE=$((SIZE_PEOPLE + FILE_SIZE))
            ;;
        area)
            COUNT_AREAS=$((COUNT_AREAS + 1))
            SIZE_AREAS=$((SIZE_AREAS + FILE_SIZE))
            ;;
        knowledge)
            COUNT_KNOWLEDGE=$((COUNT_KNOWLEDGE + 1))
            SIZE_KNOWLEDGE=$((SIZE_KNOWLEDGE + FILE_SIZE))
            ;;
        config)
            COUNT_CONFIG=$((COUNT_CONFIG + 1))
            SIZE_CONFIG=$((SIZE_CONFIG + FILE_SIZE))
            CONFIG_FILES="$CONFIG_FILES$file
"
            ;;
        markdown)
            COUNT_MARKDOWN=$((COUNT_MARKDOWN + 1))
            SIZE_MARKDOWN=$((SIZE_MARKDOWN + FILE_SIZE))
            # Check if it has metadata (not orphaned)
            if ! grep -q "^# " "$file" 2>/dev/null && \
               ! grep -q "^---" "$file" 2>/dev/null; then
                ORPHANED_FILES=$((ORPHANED_FILES + 1))
                ORPHANED_LIST="$ORPHANED_LIST$file
"
            fi
            ;;
        other)
            COUNT_OTHER=$((COUNT_OTHER + 1))
            SIZE_OTHER=$((SIZE_OTHER + FILE_SIZE))
            if [[ ! "$file" =~ \.(json|yaml|yml|toml|lock|log)$ ]]; then
                ORPHANED_FILES=$((ORPHANED_FILES + 1))
                ORPHANED_LIST="$ORPHANED_LIST$file
"
            fi
            ;;
    esac
done <<< "$FILE_LIST"

# Calculate derived metrics
MARKDOWN_FILES=$((COUNT_DAILY_NOTES + COUNT_PROJECTS + COUNT_PEOPLE + COUNT_AREAS + COUNT_KNOWLEDGE + COUNT_CONFIG + COUNT_MARKDOWN))

# Age analysis (daily notes) - simplified for Bash 3.2
RECENT_DAILY_NOTES=0
OLD_DAILY_NOTES=0

# Output summary
echo ""
print_header "📊 Analysis Summary"
echo ""
printf "  %-25s %10s\n" "Total Files:" "$(format_number $TOTAL_FILES)"
printf "  %-25s %10s\n" "Total Size:" "$(format_bytes $TOTAL_SIZE)"
echo ""
printf "  %-25s %10s\n" "Markdown Files:" "$(format_number $MARKDOWN_FILES)"
printf "  %-25s %10s\n" "Daily Notes:" "$(format_number $DAILY_NOTES)"
printf "  %-25s %10s\n" "Projects:" "$(format_number $PROJECTS)"
printf "  %-25s %10s\n" "Orphaned Files:" "$(format_number $ORPHANED_FILES)"
echo ""

# Category breakdown
if $VERBOSE; then
    print_header "📁 Category Breakdown"
    echo ""
    
    print_category() {
        local name="$1"
        local count="$2"
        local size="$3"
        if [[ $count -gt 0 ]]; then
            printf "  %-15s %6s files  %8s\n" "$name:" "$count" "$(format_bytes $size)"
        fi
    }
    
    print_category "daily_notes" "$COUNT_DAILY_NOTES" "$SIZE_DAILY_NOTES"
    print_category "projects" "$COUNT_PROJECTS" "$SIZE_PROJECTS"
    print_category "people" "$COUNT_PEOPLE" "$SIZE_PEOPLE"
    print_category "areas" "$COUNT_AREAS" "$SIZE_AREAS"
    print_category "knowledge" "$COUNT_KNOWLEDGE" "$SIZE_KNOWLEDGE"
    print_category "config" "$COUNT_CONFIG" "$SIZE_CONFIG"
    print_category "markdown" "$COUNT_MARKDOWN" "$SIZE_MARKDOWN"
    print_category "other" "$COUNT_OTHER" "$SIZE_OTHER"
    echo ""
fi

# Daily notes health
if [[ $DAILY_NOTES -gt 0 ]]; then
    print_header "📝 Daily Notes"
    printf "  Total daily notes: %s\n" "$(format_number $DAILY_NOTES)"
    
    if [[ $DAILY_NOTES -lt 7 ]]; then
        echo ""
        print_warning "Daily note consistency is low"
        echo ""
        echo "  💡 Tip: Try to create a daily note each morning."
        echo "     Even a few lines helps maintain continuity."
    fi
    echo ""
fi

# Orphaned files
if [[ $ORPHANED_FILES -gt 0 ]]; then
    print_header "⚠️  Orphaned Files ($ORPHANED_FILES)"
    echo ""
    echo "  These files may need organization:"
    echo ""
    
    if $VERBOSE; then
        echo "$ORPHANED_LIST" | head -10 | while read -r file; do
            [[ -z "$file" ]] && continue
            rel_path="${file#$WORKSPACE_PATH/}"
            echo "    • $rel_path"
        done
        [[ $ORPHANED_FILES -gt 10 ]] && echo "    ... and $((ORPHANED_FILES - 10)) more"
    else
        echo "    Run with --verbose to see the list"
        echo "    Run 'lifeos organize --apply' to categorize them"
    fi
    echo ""
fi

# Generate simplified JSON report
REPORT=$(cat << EOF
{
  "analysisDate": "$(get_iso_timestamp)",
  "workspacePath": "$WORKSPACE_PATH",
  "summary": {
    "totalFiles": $TOTAL_FILES,
    "totalSize": $TOTAL_SIZE,
    "markdownFiles": $MARKDOWN_FILES,
    "dailyNotes": $DAILY_NOTES,
    "projects": $PROJECTS,
    "orphanedFiles": $ORPHANED_FILES
  },
  "categories": {
    "dailyNotes": $COUNT_DAILY_NOTES,
    "projects": $COUNT_PROJECTS,
    "people": $COUNT_PEOPLE,
    "areas": $COUNT_AREAS,
    "knowledge": $COUNT_KNOWLEDGE,
    "config": $COUNT_CONFIG,
    "markdown": $COUNT_MARKDOWN,
    "other": $COUNT_OTHER
  },
  "orphanedFiles": $(echo "$ORPHANED_LIST" | head -20 | awk 'NF' | while read -r f; do [[ -n "$f" ]] && echo "\"$f\","; done | sed '$ s/,$//')
}
EOF
)

# Save report
echo "$REPORT" > "$REPORT_FILE"
print_success "Report saved to: ${REPORT_FILE#$WORKSPACE_PATH/}"

# Also save to output file if specified
if [[ -n "$OUTPUT_FILE" ]]; then
    echo "$REPORT" > "$OUTPUT_FILE"
    print_success "Report also saved to: $OUTPUT_FILE"
fi

echo ""
print_info "Next steps:"
echo "  • Run 'lifeos organize --apply' to categorize orphaned files"
echo "  • Run 'lifeos status' to see current organization state"
echo ""
