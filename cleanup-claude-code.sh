#!/bin/bash
# =============================================================================
# Claude Code Cleanup Script — i4t Software Development Team
# Supports Ubuntu 22.04+ and macOS 12+
# Removes all Vertex AI config so you can log in with a personal account.
#
# After running this script:
#   1. Run: claude  → log in with personal Anthropic account
#   2. Run: bash reconfigure-claude-code.sh
#          → sets up claude (personal) + claude-work (Vertex) split
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo "============================================="
echo "  Claude Code Cleanup — Remove Vertex Config"
echo "============================================="
echo ""

# -----------------------------------------------------------------------------
# 1. Detect OS
# -----------------------------------------------------------------------------
info "Detecting OS..."
IS_MACOS=false

case "$(uname -s)" in
  Darwin)
    IS_MACOS=true
    OS_NAME="macOS $(sw_vers -productVersion 2>/dev/null || echo '')"
    info "$OS_NAME — OK"
    ;;
  Linux)
    OS_NAME="Linux"
    info "$OS_NAME — OK"
    ;;
  *)
    error "Unsupported OS: $(uname -s)"
    ;;
esac

# -----------------------------------------------------------------------------
# 2. Detect shell rc file
#    macOS: default is zsh → ~/.zshrc, bash uses ~/.bash_profile
#    Linux: default is bash → ~/.bashrc, zsh uses ~/.zshrc
#    Also check all possible rc files so stale config is fully removed
# -----------------------------------------------------------------------------
if [ "$IS_MACOS" = true ]; then
  if [ "$SHELL" = "/bin/bash" ] || [ "$SHELL" = "/usr/bin/bash" ] || [ "$SHELL" = "/usr/local/bin/bash" ]; then
    SHELL_RC="$HOME/.bash_profile"
  else
    SHELL_RC="$HOME/.zshrc"
  fi
else
  if [ "$SHELL" = "/bin/zsh" ] || [ "$SHELL" = "/usr/bin/zsh" ]; then
    SHELL_RC="$HOME/.zshrc"
  else
    SHELL_RC="$HOME/.bashrc"
  fi
fi

# Build list of ALL rc files to clean — catches leftovers from other OSes
# or if the user switched shells after initial setup
ALL_RC_FILES=""
for f in "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.zshrc" "$HOME/.zprofile"; do
  if [ -f "$f" ]; then
    ALL_RC_FILES="$ALL_RC_FILES $f"
  fi
done

# -----------------------------------------------------------------------------
# 3. Check jq is installed
# -----------------------------------------------------------------------------
info "Checking jq..."
if ! command -v jq &>/dev/null; then
  echo ""
  echo -e "${RED}[ERROR]${NC} jq is required but not installed."
  echo ""
  if [ "$IS_MACOS" = true ]; then
    echo "    brew install jq"
  else
    echo "    sudo apt-get install -y jq"
  fi
  echo "    Then re-run: bash cleanup-claude-code.sh"
  echo ""
  exit 1
fi
info "jq $(jq --version) — OK"

# -----------------------------------------------------------------------------
# 4. Unset all Vertex vars from current session
# -----------------------------------------------------------------------------
info "Unsetting Vertex AI vars from current session..."
unset CLAUDE_CODE_USE_VERTEX
unset ANTHROPIC_VERTEX_PROJECT_ID
unset CLOUD_ML_REGION
unset ANTHROPIC_DEFAULT_SONNET_MODEL
unset ANTHROPIC_DEFAULT_HAIKU_MODEL
unset ANTHROPIC_BASE_URL
unset ANTHROPIC_API_KEY
info "Session cleared — OK"

# -----------------------------------------------------------------------------
# 5. Remove env block from ~/.claude/settings.json
# -----------------------------------------------------------------------------
CLAUDE_SETTINGS="$HOME/.claude/settings.json"

if [ -f "$CLAUDE_SETTINGS" ]; then
  info "Removing env block from ~/.claude/settings.json..."
  TMP=$(mktemp)
  jq 'del(.env)' "$CLAUDE_SETTINGS" > "$TMP" && mv "$TMP" "$CLAUDE_SETTINGS"
  info "settings.json env block removed — OK"
else
  warn "~/.claude/settings.json not found — skipping"
fi

# -----------------------------------------------------------------------------
# 6. Remove all Claude/Vertex config from ALL shell rc files
#    Cleans every rc file that exists, not just the current shell's one.
#    This catches cases where the user ran the setup script on a different
#    shell, or switched from bash to zsh (or vice versa) after setup.
# -----------------------------------------------------------------------------
CLEANED_ANY=false

for RC_FILE in $ALL_RC_FILES; do
  if grep -qE "Claude Code|claude-work|CLAUDE_CODE_USE_VERTEX|ANTHROPIC_VERTEX|ANTHROPIC_DEFAULT_SONNET" "$RC_FILE" 2>/dev/null; then
    info "Removing Claude Code config from $RC_FILE..."

    TMP_RC=$(mktemp)
    # Remove marker blocks
    awk '
      /# >>> Claude Code/ { skip=1 }
      /# <<< Claude Code/ { skip=0; next }
      !skip { print }
    ' "$RC_FILE" > "$TMP_RC"

    # Remove any loose lines outside a block
    grep -vE "CLAUDE_CODE_USE_VERTEX|ANTHROPIC_VERTEX_PROJECT_ID|CLOUD_ML_REGION|ANTHROPIC_DEFAULT_SONNET_MODEL|ANTHROPIC_DEFAULT_HAIKU_MODEL|claude-work|ANTHROPIC_API_KEY=.*gcloud" \
      "$TMP_RC" > "$RC_FILE" || true
    rm -f "$TMP_RC"

    info "$RC_FILE cleaned — OK"
    CLEANED_ANY=true
  fi
done

if [ "$CLEANED_ANY" = false ]; then
  info "No Claude Code config found in any shell rc file — skipping"
fi

# -----------------------------------------------------------------------------
# 7. Verify everything is clean
# -----------------------------------------------------------------------------
echo ""
info "Verifying cleanup..."
ERRORS=0

# Check session
[ -z "$CLAUDE_CODE_USE_VERTEX" ] \
  && info "✓ Session:         CLAUDE_CODE_USE_VERTEX unset" \
  || { warn "✗ CLAUDE_CODE_USE_VERTEX still set in session"; ERRORS=$((ERRORS+1)); }

# Check settings.json
if [ -f "$CLAUDE_SETTINGS" ]; then
  ENV_BLOCK=$(jq -r '.env | if . == null then "null" else "present" end' "$CLAUDE_SETTINGS")
  [ "$ENV_BLOCK" = "null" ] \
    && info "✓ settings.json:   env block removed" \
    || { warn "✗ settings.json still has env block"; ERRORS=$((ERRORS+1)); }
fi

# Check all rc files are clean
RC_CLEAN=true
for RC_FILE in $ALL_RC_FILES; do
  if grep -qE "CLAUDE_CODE_USE_VERTEX|ANTHROPIC_VERTEX|claude-work|ANTHROPIC_DEFAULT_SONNET" "$RC_FILE" 2>/dev/null; then
    warn "✗ $RC_FILE still has Claude/Vertex lines"
    ERRORS=$((ERRORS+1))
    RC_CLEAN=false
  fi
done
[ "$RC_CLEAN" = true ] && info "✓ Shell rc files:  no Claude/Vertex config remaining"

echo ""
if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}================================================${NC}"
  echo -e "${GREEN}  Cleanup complete!${NC}"
  echo -e "${GREEN}${NC}"
  echo -e "${GREEN}  OS: $OS_NAME${NC}"
  echo -e "${GREEN}${NC}"
  echo -e "${GREEN}  Next steps:${NC}"
  echo -e "${GREEN}${NC}"
  echo -e "${GREEN}  1. Log in with your personal account:${NC}"
  echo -e "${GREEN}     claude${NC}"
  echo -e "${GREEN}     → Select: 1. Claude account with subscription${NC}"
  echo -e "${GREEN}${NC}"
  echo -e "${GREEN}  2. Set up personal + work split:${NC}"
  echo -e "${GREEN}     bash reconfigure-claude-code.sh${NC}"
  echo -e "${GREEN}================================================${NC}"
else
  echo -e "${RED}================================================${NC}"
  echo -e "${RED}  Cleanup finished with $ERRORS error(s).${NC}"
  echo -e "${RED}  Fix warnings above then re-run:${NC}"
  echo -e "${RED}    bash cleanup-claude-code.sh${NC}"
  echo -e "${RED}================================================${NC}"
fi
echo ""
