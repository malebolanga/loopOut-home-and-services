import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const androidRoot = path.join(clientRoot, 'android');
const isWindows = process.platform === 'win32';
const gradleCommand = isWindows ? (process.env.ComSpec || 'cmd.exe') : './gradlew';
const gradleArgs = isWindows
  ? ['/d', '/s', '/c', 'gradlew.bat', 'assembleDebug']
  : ['assembleDebug'];

const build = spawn(gradleCommand, gradleArgs, {
  cwd: androidRoot,
  env: process.env,
  stdio: 'inherit',
});

build.on('error', (error) => {
  console.error(`Could not start the Android Gradle build: ${error.message}`);
  process.exitCode = 1;
});

build.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Android Gradle build stopped by ${signal}.`);
    process.exitCode = 1;
    return;
  }

  process.exitCode = code ?? 1;
});
