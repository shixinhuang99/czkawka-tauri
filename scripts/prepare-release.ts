import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import semver, { type ReleaseType } from 'semver';

async function readPackageVersion(pkgPath: string): Promise<string> {
  const content = await fs.readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(content);
  return pkg.version;
}

async function setPackageVersion(
  pkgPath: string,
  version: string,
): Promise<void> {
  const content = await fs.readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(content);
  pkg.version = version;
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
}

function calculateNewVersion(
  currentVersion: string,
  releaseType: ReleaseType,
): string {
  const newVersion = semver.inc(currentVersion, releaseType);
  if (!newVersion) {
    throw new Error(
      `Invalid release type or current version: ${currentVersion} -> ${releaseType}`,
    );
  }
  return newVersion;
}

function isReleaseType(releaseType: string): releaseType is ReleaseType {
  return semver.RELEASE_TYPES.includes(releaseType as any);
}

async function main() {
  const releaseType = process.argv[2];

  if (!releaseType || !isReleaseType(releaseType)) {
    console.error('Usage: tsx prepare-release.ts <major|minor|patch>');
    console.error('Example: tsx prepare-release.ts patch');
    process.exitCode = 1;
    return;
  }

  try {
    console.log(`Preparing ${releaseType} release...`);

    const currentVersion = await readPackageVersion('./ui/package.json');
    const newVersion = calculateNewVersion(currentVersion, releaseType);

    console.log(`Current version: ${currentVersion}`);
    console.log(`New version: ${newVersion}`);

    await setPackageVersion('./ui/package.json', newVersion);

    execSync(`cargo set-version ${newVersion}`, { stdio: 'inherit' });

    console.log('Formatting files...');
    execSync('just fmt', { stdio: 'inherit' });

    console.log('Creating commit...');
    execSync(`git commit -am "prepare release ${newVersion}"`, {
      stdio: 'inherit',
    });

    console.log(`Successfully prepared release ${newVersion}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

main();
