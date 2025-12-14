# Cline CLI Setup Guide

## Overview

BugSmith uses Cline CLI to make autonomous code changes. This guide explains how to set up Cline CLI for your system.

## Platform Support

**Current Status:**
- ✅ **macOS**: Fully supported
- ✅ **Linux**: Fully supported  
- ✅ **Windows**: Supported via WSL2 (automatically detected)

## Installation

### macOS / Linux

1. **Check Node.js version** (requires Node.js 20+):
   ```bash
   node --version
   ```

2. **Install Cline CLI globally**:
   ```bash
   npm install -g cline
   ```

3. **Authenticate with Cline**:
   ```bash
   cline auth
   ```
   This will guide you through setting up your AI model provider.

4. **Verify installation**:
   ```bash
   cline --version
   ```

### Windows (via WSL2)

BugSmith automatically detects Windows and uses WSL2 to run Cline CLI. Follow these steps:

1. **Install WSL2** (if not already installed):
   ```powershell
   wsl --install
   ```
   Restart your computer when prompted.

2. **Install Node.js 20+ in WSL**:
   ```bash
   # Inside WSL
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install Cline CLI in WSL**:
   ```bash
   # Inside WSL
   npm install -g cline
   ```

4. **Authenticate Cline** (required before first use):
   ```bash
   # Inside WSL
   cline auth
   ```
   This will guide you through setting up your AI model provider.

5. **Verify installation**:
   ```powershell
   # From Windows PowerShell
   wsl cline version
   ```

**Note:** BugSmith automatically uses WSL on Windows. No additional configuration needed!

## Configuration

### Environment Variables

You can customize Cline CLI behavior via environment variables:

- `CLINE_COMMAND`: Override the Cline command (default: `"cline"` on Linux/macOS, `"wsl"` on Windows)
  - Example: `CLINE_COMMAND="npx cline"`
  
- `CLINE_ARGS`: Override command arguments (default: `[instruction, "--oneshot", "--yolo"]`)
  - Example: `CLINE_ARGS="--model gpt-4"`
  
- `USE_WSL`: Set to `"false"` to disable WSL on Windows (default: `"true"` on Windows)

### WSL Configuration (Windows)

BugSmith automatically detects Windows and uses WSL. If you need to disable WSL or use a different setup, add to your `.env.local`:

```env
USE_WSL=false  # Disable automatic WSL detection
CLINE_COMMAND=your-custom-command  # Override default command
```

## Troubleshooting

### "cline: command not found"

**macOS/Linux:**
- Ensure npm global bin directory is in your PATH
- Try: `export PATH="$PATH:$(npm bin -g)"`
- Restart your terminal

**Windows:**
- Cline CLI is not available for Windows yet
- Use one of the alternatives listed above

### Authentication Issues

Run `cline auth` to re-authenticate and configure your AI provider.

### Git Not Found

Cline requires Git to be installed and in your PATH:
- Download from [git-scm.com](https://git-scm.com/)
- Restart terminal after installation

## Next Steps

Once Cline CLI is installed and configured:

1. Ensure Git is installed and configured
2. Set up your GitHub token in `.env.local`
3. Run BugSmith agent - it will automatically use Cline CLI

## Resources

- [Cline CLI Documentation](https://docs.cline.bot/cline-cli/overview)
- [Cline GitHub Repository](https://github.com/cline/cline)
- [Node.js Download](https://nodejs.org/)

