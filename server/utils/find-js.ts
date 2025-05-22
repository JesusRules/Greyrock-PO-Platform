import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

//npx tsx utils/find-js.ts

function findMissingJsImports(dir: any) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findMissingJsImports(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      const content = readFileSync(fullPath, 'utf-8');

      // Match relative imports like './file' or '../utils/helper'
      const importRegex = /from\s+['"](\.\/|\.\.\/)([^'"]+)['"]/g;

      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] + match[2];
        const hasJsExtension = importPath.endsWith('.js');

        if (!hasJsExtension) {
          console.log(`❌ Missing .js in: ${match[0]}  → ${fullPath}`);
        }
      }
    }
  }
}

findMissingJsImports('./server'); // Or your relevant folder
