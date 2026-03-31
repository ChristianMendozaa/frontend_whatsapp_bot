const { execSync } = require('child_process');
try {
  const result = execSync('npm run build', { stdio: 'pipe' });
  console.log("SUCCESS");
} catch(e) {
  require('fs').writeFileSync('build_err_real.log', e.stdout.toString('utf8') + '\n\n' + e.stderr.toString('utf8'));
  console.log("FAILED");
}
