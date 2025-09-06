import { type ChildProcess, spawn } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';
import kill from 'tree-kill';

type CmdName = 'tailwindcss' | 'ui' | 'tauri';

interface Cmd {
  name: CmdName;
  runner: string;
  args: string[];
  closed?: boolean;
  cp?: ChildProcess;
  cwd?: string;
}

const cwd = process.cwd();

const allCmd: Cmd[] = [
  {
    name: 'tailwindcss',
    runner: 'node',
    args: ['--run', 'tailwindcss'],
    cwd: path.join(cwd, 'ui'),
  },
  {
    name: 'ui',
    runner: 'node',
    args: ['--run', 'dev'],
    cwd: path.join(cwd, 'ui'),
  },
  {
    name: 'tauri',
    runner: 'cargo',
    args: ['run'],
  },
];

export function run(names: CmdName[]) {
  const cmds = allCmd.filter((cmd) => names.includes(cmd.name));

  const checkAndExit = () => {
    if (cmds.every((cmd) => cmd.closed)) {
      process.exitCode = 0;
      process.exit();
    }
  };

  const killAll = () => {
    for (const cmd of cmds) {
      if (cmd.closed) {
        continue;
      }
      if (cmd.cp?.pid) {
        kill(cmd.cp.pid);
      }
    }
  };

  for (const cmd of cmds) {
    const cp = spawn(cmd.runner, cmd.args, {
      cwd: cmd.cwd,
      env: {
        ...process.env,
        FORCE_COLOR: '1',
        NO_COLOR: undefined,
        NODE_DISABLE_COLORS: undefined,
        CARGO_TERM_COLOR: 'always',
      },
    });

    cp.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    cp.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    cp.on('error', (err) => {
      cmd.closed = true;
      console.error(err);
      checkAndExit();
    });

    cp.on('spawn', () => {
      cmd.cp = cp;
    });

    cp.on('close', () => {
      cmd.closed = true;
      if (cmd.name === 'tauri') {
        killAll();
      }
      checkAndExit();
    });
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    process.stdin.pause();
    killAll();
  });
}
