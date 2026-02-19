#!/bin/bash
#
# LifeOS Core — Rollback Changes
# Rolls back organization changes from a backup
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# Parse arguments
if [[ $# -lt 1 ]] || [[ "$1" == --help ]] || [[ "$1" == -h ]]; then
    echo "Usage: lifeos rollback <timestamp>"
    echo ""
    echo "Arguments:"
    echo "  timestamp    Backup timestamp (from .lifeos/backups/)"
    echo ""
    echo "Examples:"
    echo "  lifeos rollback 20260220_043000"
    echo ""
    echo "Note: This restores files from the backup but doesn't reverse moves."
    echo "      Use with caution."
    exit 0
fi

TIMESTAMP="$1"
WORKSPACE_PATH="${2:-.}"
WORKSPACE_PATH="$(cd "$WORKSPACE_PATH" && pwd)"

LIFEOS_DIR="$WORKSPACE_PATH/.lifeos"
BACKUP_DIR="$LIFEOS_DIR/backups/$TIMESTAMP"

print_header "⏪ LifeOS Rollback"
echo ""

# Verify backup exists
if [[ ! -d "$BACKUP_DIR" ]]; then
    print_error "Backup not found: $TIMESTAMP"
    echo ""
    echo "Available backups:"
    find "$LIFEOS_DIR/backups" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort -r | head -10
    exit 1
fi

print_info "Rollback target: $TIMESTAMP"
echo ""

# Show what's in the backup
FILE_COUNT=$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')
echo "  Files in backup: $FILE_COUNT"
echo ""

# Confirm
if ! confirm "Restore these $FILE_COUNT files to their original locations?"; then
    print_info "Rollback cancelled."
    exit 0
fi

echo ""
print_info "Restoring files..."
echo ""

# Restore files
RESTORED=0
FAILED=0

while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    
    filename=$(basename "$file")
    
    # Find where this file should go by looking at the changes log
    # Look for MOVE entries that mention this file
    ORIGINAL_PATH=""
    
    if [[ -f "$LIFEOS_DIR/changes.log" ]]; then
        # Search for MOVE entries for this file
        while IFS= read -r log_line; do
            if [[ "$log_line" == *"MOVE: *$filename"* ]]; then
                # Extract original path from log
                # Format: "2026-02-20T04:30:00Z [12345] MOVE: old/path/file.md → new/path/"
                if [[ "$log_line" =~ MOVE:\ (.+)\ → ]]; then
                    ORIGINAL_PATH="${BASH_REMATCH[1]}"
                    break
                fi
            fi
        done < "$LIFEOS_DIR/changes.log"
    fi
    
    # If we found the original path, restore there
    if [[ -n "$ORIGINAL_PATH" ]]; then
        TARGET="$WORKSPACE_PATH/$ORIGINAL_PATH"
    else
        # Otherwise restore to root
        TARGET="$WORKSPACE_PATH/$filename"
    fi
    
    if cp "$file" "$TARGET" 2>/dev/null; then
        echo -e "  ${COLOR_GREEN}✓${COLOR_RESET} Restored: $filename"
        RESTORED=$((RESTORED + 1))
    else
        echo -e "  ${COLOR_RED}✗${COLOR_RESET} Failed: $filename"
        FAILED=$((FAILED + 1))
    fi
done <<< "$(find "$BACKUP_DIR" -type f)"

echo ""
print_header "📋 Rollback Summary"
echo ""
echo "  Files restored: $RESTORED"
echo "  Failed: $FAILED"
echo ""

if [[ $FAILED -eq 0 ]]; then
    print_success "Rollback complete!"
else
    print_warning "Rollback completed with some failures"
fi

echo ""
print_info "Note: This restored files from backup but may not have placed"
echo "       them in the exact original locations. Check manually if needed."
echo ""
