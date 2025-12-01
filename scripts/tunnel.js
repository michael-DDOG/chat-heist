import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const PORT = process.env.PORT || 3000;

console.log('\n🚇 Starting tunnel...');
console.log('━'.repeat(60));

// Try cloudflared first (recommended)
const cloudflared = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${PORT}`], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let foundUrl = false;

cloudflared.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);

  // Extract URL from cloudflared output
  const urlMatch = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
  if (urlMatch && !foundUrl) {
    foundUrl = true;
    const url = urlMatch[0];

    console.log('\n━'.repeat(60));
    console.log(`✅ Tunnel URL: ${url}`);
    console.log('━'.repeat(60));
    console.log('\n📋 Next steps:');
    console.log(`1. Update .env: APP_BASE_URL=${url}`);
    console.log(`2. Restart backend: pnpm dev`);
    console.log(`3. Set webhook:`);
    console.log(`   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"url":"${url}/telegram/webhook"}'`);
    console.log('\n⚠️  Keep this process running!\n');

    // Save URL to file
    writeFileSync('.tunnel-url', url);
  }
});

cloudflared.stderr.on('data', (data) => {
  console.error(data.toString());
});

cloudflared.on('error', (err) => {
  if (err.code === 'ENOENT') {
    console.error('\n❌ cloudflared not found!');
    console.error('\n📦 Install it:');
    console.error('   macOS:   brew install cloudflared');
    console.error('   Windows: choco install cloudflared');
    console.error('   Linux:   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
    console.error('\n   OR use ngrok instead: ngrok http 3000\n');
  } else {
    console.error('Tunnel error:', err);
  }
  process.exit(1);
});

cloudflared.on('close', (code) => {
  console.log(`\n❌ Tunnel closed with code ${code}`);
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  console.log('\n\n⏹️  Stopping tunnel...');
  cloudflared.kill();
  process.exit(0);
});
