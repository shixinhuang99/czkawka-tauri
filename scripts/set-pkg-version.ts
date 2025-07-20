import fs from 'node:fs/promises';

async function setPkgVersion(pkgPath: string, version: string) {
  const pkgContent = await fs.readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(pkgContent);
  pkg.version = version;
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
}

async function main() {
  const version = process.argv[2];
  if (!version) {
    return;
  }
  console.log('set package version to', version);
  await setPkgVersion('./ui/package.json', version);
}

main();
