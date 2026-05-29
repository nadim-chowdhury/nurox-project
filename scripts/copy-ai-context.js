const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const contextAnchorPath = path.join(rootDir, 'docs', 'AI_CONTEXT_ANCHOR.md');
const geminiRulesPath = path.join(rootDir, 'GEMINI.md');

function getGitStatus() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    return { branch, status };
  } catch (error) {
    return { branch: 'unknown', status: 'Git is not initialized or not installed' };
  }
}

function copyToClipboard(text) {
  const platform = process.platform;
  return new Promise((resolve, reject) => {
    let proc;
    if (platform === 'win32') {
      proc = spawn('clip');
    } else if (platform === 'darwin') {
      proc = spawn('pbcopy');
    } else {
      // Try xclip, fallback to xsel
      try {
        proc = spawn('xclip', ['-selection', 'clipboard']);
      } catch {
        try {
          proc = spawn('xsel', ['--clipboard', '--input']);
        } catch {
          return reject(new Error('No clipboard utility found (clip, pbcopy, xclip, xsel).'));
        }
      }
    }

    proc.on('error', (err) => reject(err));
    proc.on('close', () => resolve());

    proc.stdin.write(text);
    proc.stdin.end();
  });
}

async function main() {
  console.log('\x1b[36m%s\x1b[0m', '🔄 Gathering Nurox ERP Development Context...');

  let contextAnchor = '';
  let geminiRules = '';

  try {
    if (fs.existsSync(contextAnchorPath)) {
      contextAnchor = fs.readFileSync(contextAnchorPath, 'utf8');
    } else {
      console.warn('⚠️ docs/AI_CONTEXT_ANCHOR.md not found.');
    }

    if (fs.existsSync(geminiRulesPath)) {
      geminiRules = fs.readFileSync(geminiRulesPath, 'utf8');
    } else {
      console.warn('⚠️ GEMINI.md not found.');
    }
  } catch (error) {
    console.error('❌ Failed to read context files:', error.message);
    process.exit(1);
  }

  const { branch, status } = getGitStatus();

  const aggregatePrompt = `======================================================================
NUROX ERP — SESSION RECOVERY & CONTEXT BOOTSTRAP
======================================================================

I am resuming development of Nurox ERP. Below is the absolute source of truth
regarding project rules, design systems, and current progress.

Please absorb this state completely before proceeding with any edits or logic.

----------------------------------------------------------------------
1. SYSTEM STATE & ACTIVE BRANCH
----------------------------------------------------------------------
Active Git Branch: ${branch}

Git Status (Modified Files):
${status || 'No modified files (working directory clean)'}

----------------------------------------------------------------------
2. DEVELOPMENT GUIDELINES (GEMINI.md)
----------------------------------------------------------------------
${geminiRules || 'No GEMINI.md found.'}

----------------------------------------------------------------------
3. CURRENT PROGRESS & ROADMAP (docs/AI_CONTEXT_ANCHOR.md)
----------------------------------------------------------------------
${contextAnchor || 'No AI_CONTEXT_ANCHOR.md found.'}

======================================================================
Ready! Let's continue working on the next task seamlessly.
======================================================================`;

  try {
    await copyToClipboard(aggregatePrompt);
    console.log('\n\x1b[32m%s\x1b[0m', '✅ Success! Ultimate context copied to clipboard.');
    console.log('\x1b[33m%s\x1b[0m', '📋 You can now paste this prompt directly into your new AI session/account to instantly restore perfect context.');
  } catch (error) {
    console.log('\n\x1b[31m%s\x1b[0m', '❌ Clipboard copy failed automatically.');
    console.log('You can copy the following context manually:\n');
    console.log(aggregatePrompt);
  }
}

main();
