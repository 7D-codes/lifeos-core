#!/bin/bash
#
# LifeOS Core — Consent-Based Organization
# Suggests and applies organization with user consent
# Compatible with Bash 3.2+ (macOS default)
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# Default values
WORKSPACE_PATH="."
DRY_RUN=true
FORCE=false
APPLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --apply)
            APPLY=true
            DRY_RUN=false
            shift
            ;;
        --force)
            FORCE=true
            APPLY=true
            DRY_RUN=false
            shift
            ;;
        --help|-h)
            echo "Usage: lifeos organize [path] [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run     Preview only (default)"
            echo "  --apply       Ask for consent on each change"
            echo "  --force       Apply all after single confirmation"
            echo "  --help, -h    Show this help"
            echo ""
            echo "Safety:"
            echo "  • Always backs up before changes"
            echo "  • Logs all changes for rollback"
            echo "  • Never deletes files"
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
LIFEOS_DIR=$(init_lifeos_dir "$WORKSPACE_PATH")
REPORT_FILE="$LIFEOS_DIR/analysis-report.json"

print_header "🗂️  LifeOS Organization"
print_dim "Workspace: $WORKSPACE_PATH"
echo ""

# Check for analysis report
if [[ ! -f "$REPORT_FILE" ]]; then
    print_info "No analysis report found. Running analysis first..."
    "$SCRIPT_DIR/analyze.sh" "$WORKSPACE_PATH"
    echo ""
fi

# Parse orphaned files from report (simple approach)
ORPHANED_LIST=""
IN_ARRAY=false

while IFS= read -r line; do
    if [[ "$line" == *'"orphanedFiles"'* ]]; then
        IN_ARRAY=true
        continue
    fi
    if $IN_ARRAY; then
        if [[ "$line" == *']'* ]]; then
            break
        fi
        # Extract file path from JSON
        file=$(echo "$line" | grep -o '"[^"]*"' | head -1 | tr -d '"')
        if [[ -n "$file" && -f "$file" ]]; then
            ORPHANED_LIST="$ORPHANED_LIST$file
"
        fi
    fi
done < "$REPORT_FILE"

# Count orphaned files
TOTAL_ORPHANED=0
temp_list="$ORPHANED_LIST"
while IFS= read -r file; do
    [[ -n "$file" ]] && TOTAL_ORPHANED=$((TOTAL_ORPHANED + 1))
done <<< "$temp_list"

if [[ $TOTAL_ORPHANED -eq 0 ]]; then
    print_success "No orphaned files found!"
    print_info "Your workspace is well organized."
    exit 0
fi

echo "Found $TOTAL_ORPHANED orphaned file(s) to organize"
echo ""

# Show mode
if $DRY_RUN; then
    print_info "Mode: DRY RUN (preview only)"
    echo "  Use --apply to organize with consent prompts"
    echo "  Use --force to batch apply all suggestions"
    echo ""
elif $FORCE; then
    print_warning "Mode: FORCE (batch apply)"
    echo ""
    if ! confirm "This will apply ALL $TOTAL_ORPHANED suggestions. Continue?"; then
        print_info "Cancelled. No changes made."
        exit 0
    fi
    echo ""
else
    print_info "Mode: APPLY (consent required for each)"
    echo ""
fi

# Create backup if applying changes
if ! $DRY_RUN; then
    TIMESTAMP=$(get_timestamp)
    BACKUP_DIR="$LIFEOS_DIR/backups/$TIMESTAMP"
    mkdir -p "$BACKUP_DIR"
    print_info "Creating backup at: .lifeos/backups/$TIMESTAMP/"
    echo ""
fi

# Process each orphaned file
CHANGES_MADE=0
CHANGES_SKIPPED=0

while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    [[ -f "$file" ]] || continue
    
    rel_path="${file#$WORKSPACE_PATH/}"
    filename=$(basename "$file")
    
    # Suggest category based on content/filename
    SUGGESTED_CATEGORY=""
    SUGGESTED_PATH=""
    
    # Analyze filename for clues
    if [[ "$filename" =~ (todo|task|checklist) ]]; then
        SUGGESTED_CATEGORY="tasks"
        SUGGESTED_PATH="life/areas/tasks/"
    elif [[ "$filename" =~ (idea|thought|brainstorm) ]]; then
        SUGGESTED_CATEGORY="ideas"
        SUGGESTED_PATH="life/areas/ideas/"
    elif [[ "$filename" =~ (note|draft) ]]; then
        SUGGESTED_CATEGORY="notes"
        SUGGESTED_PATH="life/resources/notes/"
    elif [[ "$filename" =~ (meeting|call|discussion) ]]; then
        SUGGESTED_CATEGORY="meetings"
        SUGGESTED_PATH="life/areas/meetings/"
    elif [[ "$filename" =~ (read|book|article|paper) ]]; then
        SUGGESTED_CATEGORY="reading"
        SUGGESTED_PATH="life/resources/reading/"
    elif [[ "$filename" =~ (script|tool|util) ]]; then
        SUGGESTED_CATEGORY="tools"
        SUGGESTED_PATH="life/resources/tools/"
    else
        SUGGESTED_CATEGORY="uncategorized"
        SUGGESTED_PATH="life/resources/misc/"
    fi
    
    # Check file content for better categorization
    if [[ -f "$file" ]]; then
        # Check if binary first
        if file "$file" | grep -q "text" 2>/dev/null; then
            content=$(head -50 "$file" 2>/dev/null || echo "")
            
            if [[ "$content" =~ (TODO|FIXME|task|action item) ]]; then
                SUGGESTED_CATEGORY="tasks"
                SUGGESTED_PATH="life/areas/tasks/"
            elif [[ "$content" =~ (http|github\.com|@|#) ]] && [[ "$filename" =~ \.(md|txt)$ ]]; then
                SUGGESTED_CATEGORY="resources"
                SUGGESTED_PATH="life/resources/links/"
            fi
        fi
    fi
    
    echo "  File: $rel_path"
    echo "  Suggested: $SUGGESTED_CATEGORY → $SUGGESTED_PATH"
    
    if $DRY_RUN; then
        echo "  [DRY RUN - no changes]"
        echo ""
        continue
    fi
    
    # Apply or confirm
    if $FORCE; then
        DO_MOVE=true
    else
        if confirm "  Move to $SUGGESTED_PATH?"; then
            DO_MOVE=true
        else
            DO_MOVE=false
        fi
    fi
    
    if $DO_MOVE; then
        # Create target directory
        TARGET_DIR="$WORKSPACE_PATH/$SUGGESTED_PATH"
        mkdir -p "$TARGET_DIR"
        
        # Backup first
        cp "$file" "$BACKUP_DIR/"
        
        # Move file
        TARGET_FILE="$TARGET_DIR/$filename"
        
        # Handle name collisions
        if [[ -f "$TARGET_FILE" ]]; then
            TIMESTAMP_SUFFIX=$(date +%Y%m%d_%H%M%S)
            TARGET_FILE="$TARGET_DIR/${filename%.*}_${TIMESTAMP_SUFFIX}.${filename##*.}"
        fi
        
        mv "$file" "$TARGET_FILE"
        
        # Log the change
        echo "$(get_iso_timestamp) [$$] MOVE: $rel_path → $SUGGESTED_PATH$(basename "$TARGET_FILE")" >> "$LIFEOS_DIR/changes.log"
        
        print_success "Moved to: $SUGGESTED_PATH$(basename "$TARGET_FILE")"
        CHANGES_MADE=$((CHANGES_MADE + 1))
    else
        echo "  [Skipped]"
        CHANGES_SKIPPED=$((CHANGES_SKIPPED + 1))
    fi
    
    echo ""
done <<< "$ORPHANED_LIST"

# Summary
echo ""
print_header "📋 Organization Summary"
echo ""

if $DRY_RUN; then
    print_info "Dry run complete. No changes made."
    echo ""
    echo "  Files that would be organized: $TOTAL_ORPHANED"
    echo ""
    echo "To apply changes:"
    echo "  lifeos organize --apply    # Ask for each"
    echo "  lifeos organize --force    # Batch apply all"
else
    print_success "Changes complete!"
    echo ""
    echo "  Files organized: $CHANGES_MADE"
    echo "  Files skipped: $CHANGES_SKIPPED"
    echo "  Backup location: .lifeos/backups/$TIMESTAMP/"
    echo ""
    
    if [[ $CHANGES_MADE -gt 0 ]]; then
        echo "Changes logged to: .lifeos/changes.log"
        echo ""
        echo "To rollback:"
        echo "  lifeos rollback $TIMESTAMP"
    fi
fi

echo ""
