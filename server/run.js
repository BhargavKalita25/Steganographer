const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isWin = process.platform === 'win32';
const serverDir = __dirname;
const localVenvDir = path.join(serverDir, '.venv');
const localVenvPy = path.join(localVenvDir, isWin ? 'Scripts/python.exe' : 'bin/python');

// Fallback venv directory used when project path contains OS PATH separator (';' on Windows)
const fallbackVenvDir = path.join(os.homedir(), '.steganographer', 'venv');
const fallbackVenvPy = path.join(fallbackVenvDir, isWin ? 'Scripts/python.exe' : 'bin/python');

function findSystemPython() {
  const candidates = isWin ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const cmd of candidates) {
    try {
      const res = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
      if (res.status === 0) return cmd;
    } catch (e) {}
  }
  return isWin ? 'python' : 'python3';
}

function getPythonExecutable(isSetup) {
  if (isSetup) {
    return findSystemPython();
  }
  if (fs.existsSync(localVenvPy)) {
    return localVenvPy;
  }
  if (fs.existsSync(fallbackVenvPy)) {
    return fallbackVenvPy;
  }
  return findSystemPython();
}

const args = process.argv.slice(2);
const isSetup = args.includes('--setup');
const isTest = args.includes('--test');

const scriptFile = isTest ? 'test.py' : 'run.py';
const scriptPath = path.join(serverDir, scriptFile);
const pyExecutable = getPythonExecutable(isSetup);

const forwardedArgs = [scriptPath, ...args.filter(a => a !== '--test')];

const proc = spawn(pyExecutable, forwardedArgs, {
  cwd: serverDir,
  stdio: 'inherit',
  env: process.env,
});

proc.on('error', (err) => {
  console.error(`\nFailed to start Python process using '${pyExecutable}':`, err.message);
  if (!isWin) {
    console.error('Please ensure Python 3 is installed: sudo apt install python3 python3-venv python3-pip');
  } else {
    console.error('Please ensure Python is installed and added to your system PATH.');
  }
  process.exit(1);
});

['SIGINT', 'SIGTERM', 'SIGBREAK'].forEach(sig => {
  try {
    process.on(sig, () => {
      if (proc && !proc.killed) {
        proc.kill(sig);
      }
    });
  } catch (e) {}
});

proc.on('exit', (code, signal) => {
  process.exit(code !== null ? code : (signal ? 1 : 0));
});
