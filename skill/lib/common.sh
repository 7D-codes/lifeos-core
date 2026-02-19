#!/bin/bash
#
# Common functions for LifeOS Core
#

# Colors for output (only if terminal supports it)
if [[ -t 1 ]]; then
    readonly COLOR_RESET='\033[0m'
    readonly COLOR_BOLD='\033[1m'
    readonly COLOR_DIM='\033[2m'
    readonly COLOR_RED='\033[31m'
    readonly COLOR_GREEN='\033[32m'
    readonly COLOR_YELLOW='\033[33m'
    readonly COLOR_BLUE='\033[34m'
    readonly COLOR_MAGENTA='\033[35m'
    readonly COLOR_CYAN='\033[36m'
else
    readonly COLOR_RESET=''
    readonly COLOR_BOLD=''
    readonly COLOR_DIM=''
    readonly COLOR_RED=''
    readonly COLOR_GREEN=''
    readonly COLOR_YELLOW=''
    readonly COLOR_BLUE=''
    readonly COLOR_MAGENTA=''
    readonly COLOR_CYAN=''
fi

# Print functions
print_header() {
    echo -e "${COLOR_BOLD}${COLOR_CYAN}$1${COLOR_RESET}"
}

print_success() {
    echo -e "${COLOR_GREEN}✓ $1${COLOR_RESET}"
}

print_error() {
    echo -e "${COLOR_RED}✗ $1${COLOR_RESET}" >&2
}

print_warning() {
    echo -e "${COLOR_YELLOW}⚠ $1${COLOR_RESET}"
}

print_info() {
    echo -e "${COLOR_BLUE}ℹ $1${COLOR_RESET}"
}

print_dim() {
    echo -e "${COLOR_DIM}$1${COLOR_RESET}"
}

# Get workspace root (finds .lifeos or uses provided path)
get_workspace_root() {
    local path="${1:-.}"
    path="$(cd "$path" && pwd)"
    echo "$path"
}

# Create .lifeos directory structure
init_lifeos_dir() {
    local workspace="$1"
    local lifeos_dir="$workspace/.lifeos"
    
    mkdir -p "$lifeos_dir"
    mkdir -p "$lifeos_dir/backups"
    touch "$lifeos_dir/changes.log"
    
    echo "$lifeos_dir"
}

# Get current timestamp
get_timestamp() {
    date +%Y%m%d_%H%M%S
}

# Get ISO timestamp
get_iso_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Check if file is binary
is_binary() {
    local file="$1"
    if file "$file" | grep -q "text"; then
        return 1
    else
        return 0
    fi
}

# Check if file is markdown
is_markdown() {
    local file="$1"
    [[ "$file" == *.md ]] || [[ "$file" == *.mdx ]]
}

# Get file category based on path/name
get_file_category() {
    local file="$1"
    local basename=$(basename "$file")
    
    case "$basename" in
        SOUL.md|USER.md|AGENTS.md|MEMORY.md|SHIELD.md|BOOTSTRAP.md)
            echo "config"
            ;;
        *)
            if [[ "$file" == */memory/daily/* ]]; then
                echo "daily_note"
            elif [[ "$file" == */life/areas/projects/* ]]; then
                echo "project"
            elif [[ "$file" == */life/areas/people/* ]]; then
                echo "person"
            elif [[ "$file" == */life/areas/* ]]; then
                echo "area"
            elif [[ "$file" == */knowledge/* ]]; then
                echo "knowledge"
            elif [[ "$file" == */.lifeos/* ]]; then
                echo "lifeos_meta"
            elif is_markdown "$file"; then
                echo "markdown"
            else
                echo "other"
            fi
            ;;
    esac
}

# Count files by type
count_files() {
    local dir="$1"
    local pattern="${2:-*}"
    
    if [[ -d "$dir" ]]; then
        find "$dir" -type f -name "$pattern" 2>/dev/null | wc -l
    else
        echo 0
    fi
}

# Format number with commas
format_number() {
    printf "%'d" "$1" 2>/dev/null || echo "$1"
}

# Format bytes to human readable
format_bytes() {
    local bytes="$1"
    
    if [[ $bytes -lt 1024 ]]; then
        echo "${bytes}B"
    elif [[ $bytes -lt 1048576 ]]; then
        echo "$(echo "scale=1; $bytes/1024" | bc)K"
    elif [[ $bytes -lt 1073741824 ]]; then
        echo "$(echo "scale=1; $bytes/1048576" | bc)M"
    else
        echo "$(echo "scale=1; $bytes/1073741824" | bc)G"
    fi
}

# Ask for confirmation
confirm() {
    local message="$1"
    local response
    
    echo -ne "${COLOR_YELLOW}$message [y/N] ${COLOR_RESET}"
    read -r response
    
    [[ "$response" =~ ^[Yy]$ ]]
}

# Check if running in a git repo
is_git_repo() {
    git rev-parse --git-dir > /dev/null 2>&1
}

# Get git root if in repo
get_git_root() {
    if is_git_repo; then
        git rev-parse --show-toplevel
    else
        echo ""
    fi
}

# Read JSON value (simple, no external deps)
json_get() {
    local json="$1"
    local key="$2"
    
    echo "$json" | grep -o "\"$key\":\"[^\"]*\"" | cut -d'"' -f4
}
