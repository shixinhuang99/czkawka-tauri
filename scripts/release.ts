import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';

async function readPackageVersion(pkgPath: string): Promise<string> {
  const content = await fs.readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(content);
  return pkg.version;
}

function hasUnpushedCommits(): boolean {
  const result = execSync('git rev-list --count origin/main..main', {
    encoding: 'utf-8',
  });
  const unpushedCount = Number.parseInt(result.trim(), 10);
  return unpushedCount > 0;
}

function pushTag(version: string): void {
  console.log(`Creating tag ${version}...`);
  execSync(`git tag ${version}`, { stdio: 'inherit' });

  console.log(`Pushing tag ${version} to origin...`);
  execSync(`git push origin ${version}`, { stdio: 'inherit' });

  console.log(`Successfully pushed tag ${version}`);
}

async function main() {
  try {
    console.log('Checking for unpushed commits...');

    if (hasUnpushedCommits()) {
      console.error(
        'Error: There are unpushed commits. Please push all commits before releasing.',
      );
      process.exitCode = 1;
      return;
    }

    console.log('Reading current version...');
    const version = await readPackageVersion('./ui/package.json');

    console.log(`Current version: ${version}`);

    pushTag(version);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

main();
