#!/bin/bash
#
# LifeOS Core - Organize Script
# Suggests and applies organization with user consent
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
LIFEOS_DIR="$WORKSPACE_DIR/.lifeos"
CHANGES_LOG="$LIFEOS_DIR/changes.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Flags
APPLY=0
FORCE=0
VERBOSE=0
BACKUP=1

usage() {
    cat << EOF
Usage: lifeos organize [OPTIONS]

Suggests and applies organization to your workspace.

OPTIONS:
    --apply             Apply changes (requires confirmation)
    --force             Skip confirmation prompts (use with caution)
    --no-backup         Skip creating backups
    -v, --verbose       Show detailed output
    -h, --help          Show this help message

EXAMPLES:
    lifeos organize              # Preview suggestions only (safe)
    lifeos organize --apply      # Apply with confirmation
    lifeos organize --apply --force   # Auto-apply (dangerous)

EOF
}

log() { echo -e "${BLUE}[LifeOS]${NC} $1"; }
warn() { echo -e "${YELLOW}[Warning]${NC} $1"; }
error() { echo -e "${RED}[Error]${NC} $1"; }
success() { echo -e "${GREEN}[Success]${NC} $1"; }
info() { echo -e "${CYAN}[Info]${NC} $1"; }

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --apply)
            APPLY=1
            shift
            ;;
        --force)
            FORCE=1
            shift
            ;;
        --no-backup)
            BACKUP=0
            shift
            ;;
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

mkdir -p "$LIFEOS_DIR"

# Track changes
CHANGE_ID=$(date +%s)
CHANGES_MADE=()

log_change() {
    local action="$1"
    local target="$2"
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [$CHANGE_ID] $action: $target" >> "$CHANGES_LOG"
    CHANGES_MADE+=("$action: $target")
}

# Backup function
create_backup() {
    if [[ $BACKUP -eq 0 ]]; then
        return 0
    fi
    
    local backup_dir="$LIFEOS_DIR/backups/$CHANGE_ID"
    mkdir -p "$backup_dir"
    
    log "Creating backup at: $backup_dir"
    
    # Backup key files
    cp -r "$WORKSPACE_DIR/memory" "$backup_dir/" 2>/dev/null || true
    cp -r "$WORKSPACE_DIR/life" "$backup_dir/" 2>/dev/null || true
    cp "$WORKSPACE_DIR/"*.md "$backup_dir/" 2>/dev/null || true
    
    success "Backup created"
}

# Consent function
ask_consent() {
    local action="$1"
    local target="$2"
    
    if [[ $FORCE -eq 1 ]]; then
        return 0
    fi
    
    echo ""
    info "Proposed change:"
    echo "  Action: $action"
    echo "  Target: $target"
    echo ""
    
    while true; do
        read -rp "Apply this change? [y/n/a/q]: " response
        case $response in
            [Yy]*)
                return 0
                ;;
            [Nn]*)
                return 1
                ;;
            [Aa]*)
                FORCE=1
                return 0
                ;;
            [Qq]*)
                log "Organization cancelled by user"
                exit 0
                ;;
            *)
                echo "Please answer y (yes), n (no), a (apply all), or q (quit)"
                ;;
        esac
    done
}

# Organization functions
suggest_daily_notes_structure() {
    if [[ ! -d "$WORKSPACE_DIR/memory/daily" ]]; then
        echo "  📅 Create memory/daily/ directory for daily notes"
        
        if [[ $APPLY -eq 1 ]] && ask_consent "Create directory" "memory/daily/"; then
            mkdir -p "$WORKSPACE_DIR/memory/daily"
            log_change "CREATE_DIR" "memory/daily/"
            success "Created memory/daily/"
        fi
    fi
}

suggest_para_structure() {
    local para_dirs=(
        "life/areas/projects"
        "life/areas/people"
        "life/areas/resources"
        "life/areas/archives"
    )
    
    for dir in "${para_dirs[@]}"; do
        if [[ ! -d "$WORKSPACE_DIR/$dir" ]]; then
            echo "  📁 Create $dir/ directory"
            
            if [[ $APPLY -eq 1 ]] && ask_consent "Create directory" "$dir/"; then
                mkdir -p "$WORKSPACE_DIR/$dir"
                log_change "CREATE_DIR" "$dir/"
                success "Created $dir/"
            fi
        fi
    done
}

suggest_core_files() {
    local core_files=(
        "SOUL.md:Agent identity and personality"
        "USER.md:User profile and preferences"
        "AGENTS.md:Agent instructions and patterns"
        "MEMORY.md:Long-term memory storage"
    )
    
    for item in "${core_files[@]}"; do
        IFS=':' read -r file description <<< "$item"
        
        if [[ ! -f "$WORKSPACE_DIR/$file" ]]; then
            echo "  📄 Create $file ($description)"
            
            if [[ $APPLY -eq 1 ]] && ask_consent "Create file" "$file"; then
                cat > "$WORKSPACE_DIR/$file" << EOF
# $file

*Created by LifeOS Core on $(date +%Y-%m-%d)*

EOF
                log_change "CREATE_FILE" "$file"
                success "Created $file"
            fi
        fi
    done
}

# Main execution
echo ""
log "LifeOS Organization"
echo "==================="
echo ""

if [[ $APPLY -eq 0 ]]; then
    info "DRY RUN MODE - No changes will be made"
    info "Run with --apply to make changes"
    echo ""
fi

if [[ $APPLY -eq 1 && $BACKUP -eq 1 ]]; then
    create_backup
fi

echo "📋 Suggested Changes:"
echo ""

suggest_daily_notes_structure
suggest_para_structure
suggest_core_files

echo ""

if [[ $APPLY -eq 0 ]]; then
    info "This was a dry run. No changes were made."
    log "Run 'lifeos organize --apply' to apply changes"
elif [[ ${#CHANGES_MADE[@]} -eq 0 ]]; then
    success "No changes needed! Your workspace is organized."
else
    success "Organization complete!"
    log "Changes made: ${#CHANGES_MADE[@]}"
    log "Change log: $CHANGES_LOG"
    
    if [[ $BACKUP -eq 1 ]]; then
        log "Backup available at: $LIFEOS_DIR/backups/$CHANGE_ID"
    fi
fi

echo ""
exit 0
