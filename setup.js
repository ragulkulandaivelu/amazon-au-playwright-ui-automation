// Run once from the repo root:  node setup.js
// Adds the allure-playwright reporter to playwright.config.ts (backup: .bak)
// and appends allure folders to .gitignore. Safe to run more than once.
const fs = require('fs');
const cfgPath = 'playwright.config.ts';
 
if (fs.existsSync(cfgPath)) {
  const src = fs.readFileSync(cfgPath, 'utf8');
  if (src.includes('allure-playwright')) {
    console.log('config: allure-playwright already present, skipping');
  } else {
    let out = null;
    if (/reporter\s*:\s*\[/.test(src)) {
      out = src.replace(/reporter\s*:\s*\[/, "reporter: [['allure-playwright'], ");
    } else {
      const m = src.match(/reporter\s*:\s*(['"][\w-]+['"])\s*,/);
      if (m) out = src.replace(m[0], `reporter: [[${m[1]}], ['allure-playwright']],`);
      else if (/defineConfig\(\s*\{/.test(src))
        out = src.replace(/defineConfig\(\s*\{/, "defineConfig({\n  reporter: [['list'], ['allure-playwright']],");
    }
    if (out) {
      fs.writeFileSync(cfgPath + '.bak', src);
      fs.writeFileSync(cfgPath, out);
      console.log('config: added allure-playwright reporter (backup: playwright.config.ts.bak)');
    } else {
      console.log("config: could not patch automatically. Add ['allure-playwright'] to the reporter array by hand.");
    }
  }
} else {
  console.log('config: playwright.config.ts not found. Run this from the repo root.');
}
 
const add = '\n# allure\nallure-results*/\nallure-report*/\n';
const cur = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
if (!cur.includes('allure-results')) { fs.appendFileSync('.gitignore', add); console.log('.gitignore: updated'); }
else console.log('.gitignore: already has allure entries');