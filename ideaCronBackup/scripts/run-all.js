import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, '..');

const steps = [
  ['backup', [path.join(scriptDir, 'backup.js')]],
  ['verify', [path.join(scriptDir, 'verify.js')]],
  ['cleanup', [path.join(scriptDir, 'cleanup.js'), '--apply']],
];

function runStep(name, args) {
  return new Promise((resolve, reject) => {
    console.log(`[START] ${name}`);
    const child = spawn(process.execPath, args, { cwd: projectDir, stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`[OK] ${name}`);
        resolve();
      } else {
        reject(new Error(`${name} terminó con código ${code}`));
      }
    });
  });
}

try {
  console.log(`[START] proceso completo ${new Date().toISOString()}`);
  for (const [name, args] of steps) await runStep(name, args);
  console.log(`[OK] proceso completo ${new Date().toISOString()}`);
} catch (error) {
  console.error(`[ERROR] proceso completo: ${error.message}`);
  process.exitCode = 1;
}
