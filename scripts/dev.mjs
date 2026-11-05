import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

function run(command) {
  return spawn(
    isWindows ? 'cmd.exe' : 'npm',
    isWindows ? ['/d', '/s', '/c', command] : command.split(' '),
    {
      stdio: 'inherit',
      shell: false
    }
  );
}

const children = [
  run('npm run dev -w @orbitdesk/api'),
  run('npm run dev -w @orbitdesk/web')
];

const stop = () => {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill();
    }
  });
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

const results = await Promise.all(
  children.map(
    (child) =>
      new Promise((resolve, reject) => {
        child.on('error', reject);
        child.on('exit', (code) => resolve(code ?? 0));
      })
  )
);

process.exit(results.find((code) => code !== 0) ?? 0);
