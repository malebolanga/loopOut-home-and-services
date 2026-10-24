import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const androidRoot = path.join(clientRoot, 'android');
const isWindows = process.platform === 'win32';
const javaBinary = isWindows ? 'java.exe' : 'java';
const bundledJdkCandidates = [
  process.env.ANDROID_STUDIO_JBR,
  process.env.STUDIO_JDK,
  process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Android', 'Android Studio', 'jbr'),
  'C:\\Program Files\\Android\\Android Studio\\jbr',
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'Android Studio', 'jbr'),
].filter(Boolean);
const detectedJdk = bundledJdkCandidates.find((jdkPath) => existsSync(path.join(jdkPath, 'bin', javaBinary)));
const javaHome = process.env.JAVA_HOME && existsSync(path.join(process.env.JAVA_HOME, 'bin', javaBinary))
  ? process.env.JAVA_HOME
  : detectedJdk;
const apkPath = path.join(androidRoot, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const buildEnv = {
  ...process.env,
  ...(javaHome ? { JAVA_HOME: javaHome, PATH: `${path.join(javaHome, 'bin')}${path.delimiter}${process.env.PATH || ''}` } : {}),
  GRADLE_USER_HOME: process.env.GRADLE_USER_HOME || path.join(androidRoot, '.gradle-build-home'),
};

if (!javaHome && !process.env.PATH?.split(path.delimiter).some((entry) => existsSync(path.join(entry, javaBinary)))) {
  console.error('Java was not found. Install Android Studio or set JAVA_HOME to a JDK 21 installation.');
  process.exit(1);
}

const gradleCommand = isWindows ? (process.env.ComSpec || 'cmd.exe') : './gradlew';
const gradleArgs = isWindows
  ? ['/d', '/s', '/c', 'gradlew.bat', 'assembleDebug']
  : ['assembleDebug'];

const build = spawn(gradleCommand, gradleArgs, {
  cwd: androidRoot,
  env: buildEnv,
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
  if (process.exitCode === 0) {
    if (!existsSync(apkPath)) {
      console.error('Gradle completed but did not create the expected debug APK.');
      process.exitCode = 1;
      return;
    }
    const sizeMb = (statSync(apkPath).size / (1024 * 1024)).toFixed(2);
    console.log(`Debug APK created: ${apkPath} (${sizeMb} MB)`);
  }
});
