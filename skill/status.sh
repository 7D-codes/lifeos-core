#!/bin/bash
#
# LifeOS Core — Status Display
# Shows current organization state
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# Default values
WORKSPACE_PATH="."
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: lifeos status [path] [options]"
            echo ""
            echo "Options:"
            echo "  --verbose, -v     Show detailed output"
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
CHANGES_LOG="$LIFEOS_DIR/changes.log"

print_header "📊 LifeOS Workspace Status"
print_dim "Path: $WORKSPACE_PATH"
echo ""

# Check if LifeOS has been initialized
if [[ ! -d "$LIFEOS_DIR" ]]; then
    print_warning "LifeOS not initialized in this workspace"
    echo ""
    echo "Run 'lifeos analyze' to get started."
    exit 0
fi

# Show last analysis date
if [[ -f "$REPORT_FILE" ]]; then
    ANALYSIS_DATE=$(grep -o '"analysisDate": "[^"]*"' "$REPORT_FILE" | cut -d'"' -f4 || echo "Unknown")
    print_info "Last analyzed: $ANALYSIS_DATE"
    echo ""
fi

# Quick stats from report
if [[ -f "$REPORT_FILE" ]]; then
    TOTAL_FILES=$(grep -o '"totalFiles": [0-9]*' "$REPORT_FILE" | grep -o '[0-9]*' || echo 0)
    DAILY_NOTES=$(grep -o '"dailyNotes": [0-9]*' "$REPORT_FILE" | grep -o '[0-9]*' || echo 0)
    PROJECTS=$(grep -o '"projects": [0-9]*' "$REPORT_FILE" | grep -o '[0-9]*' || echo 0)
    ORPHANED=$(grep -o '"orphanedFiles": [0-9]*' "$REPORT_FILE" | grep -o '[0-9]*' || echo 0)
    
    print_header "📈 Quick Stats"
    echo ""
    printf "  %-20s %8s\n" "Total Files:" "$(format_number $TOTAL_FILES)"
    printf "  %-20s %8s\n" "Daily Notes:" "$(format_number $DAILY_NOTES)"
    printf "  %-20s %8s\n" "Projects:" "$(format_number $PROJECTS)"
    
    if [[ $ORPHANED -gt 0 ]]; then
        printf "  %-20s %8s %s\n" "Orphaned Files:" "$(format_number $ORPHANED)" "${COLOR_YELLOW}(needs attention)${COLOR_RESET}"
    else
        printf "  %-20s %8s %s\n" "Orphaned Files:" "0" "${COLOR_GREEN}✓${COLOR_RESET}"
    fi
    echo ""
fi

# Recent changes
if [[ -f "$CHANGES_LOG" ]] && [[ -s "$CHANGES_LOG" ]]; then
    CHANGE_COUNT=$(wc -l < "$CHANGES_LOG" | tr -d ' ')
    
    print_header "📝 Recent Changes ($(format_number $CHANGE_COUNT) total)"
    echo ""
    
    # Show last 10 changes
    tail -10 "$CHANGES_LOG" | while IFS= read -r line; do
        # Parse log line: "2026-02-20T04:30:00Z [12345] MOVE: old/path → new/path"
        if [[ "$line" =~ \[.*\]\ (.*) ]]; then
            ACTION="${BASH_REMATCH[1]}"
            
            if [[ "$ACTION" == MOVE:* ]]; then
                echo -e "  ${COLOR_CYAN}→${COLOR_RESET} ${ACTION#MOVE: }"
            elif [[ "$ACTION" == CREATE:* ]]; then
                echo -e "  ${COLOR_GREEN}+${COLOR_RESET} ${ACTION#CREATE: }"
            elif [[ "$ACTION" == DELETE:* ]]; then
                echo -e "  ${COLOR_RED}-${COLOR_RESET} ${ACTION#DELETE: }"
            else
                echo "  • $ACTION"
            fi
        fi
    done
    
    echo ""
    
    if [[ $CHANGE_COUNT -gt 10 ]]; then
        print_dim "  ... and $((CHANGE_COUNT - 10)) more changes"
        echo ""
    fi
fi

# Backup status
BACKUP_DIR="$LIFEOS_DIR/backups"
if [[ -d "$BACKUP_DIR" ]]; then
    BACKUP_COUNT=$(find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
    
    if [[ $BACKUP_COUNT -gt 0 ]]; then
        print_header "💾 Backups"
        echo ""
        printf "  %d backup(s) available\n" "$BACKUP_COUNT"
        echo ""
        
        if $VERBOSE; then
            echo "  Available rollbacks:"
            find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d | sort -r | head -5 | while read -r backup; do
                backup_name=$(basename "$backup")
                backup_date="${backup_name:0:8}"
                backup_time="${backup_name:9:2}:${backup_name:11:2}:${backup_name:13:2}"
                file_count=$(find "$backup" -type f | wc -l | tr -d ' ')
                echo "    • $backup_date $backup_time ($file_count files)"
            done
            echo ""
        fi
    fi
fi

# Recommendations
print_header "💡 Recommendations"
echo ""

if [[ -f "$REPORT_FILE" ]]; then
    ORPHANED=$(grep -o '"orphanedFiles": [0-9]*' "$REPORT_FILE" | grep -o '[0-9]*' || echo 0)
    
    if [[ $ORPHANED -gt 10 ]]; then
        print_warning "You have $ORPHANED orphaned files"
        echo "  Run: lifeos organize --apply"
        echo ""
    fi
fi

# Check daily note consistency
TODAY=$(date +%Y-%m-%d)
TODAY_NOTE="$WORKSPACE_PATH/memory/daily/$TODAY.md"

if [[ ! -f "$TODAY_NOTE" ]]; then
    print_warning "No daily note for today ($TODAY)"
    echo "  Create it at: memory/daily/$TODAY.md"
    echo ""
fi

# Show quick actions
echo "  Quick actions:"
echo "    lifeos analyze       # Refresh analysis"
echo "    lifeos organize      # Categorize orphaned files"
echo "    lifeos status        # Show this status"
echo ""
