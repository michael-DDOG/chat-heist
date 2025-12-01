import 'dotenv/config';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.argv.find((arg) => arg.startsWith('--url='))?.split('=')[1] || process.env.APP_BASE_URL;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in environment');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('❌ Webhook URL not provided');
  console.error('Usage: pnpm set:webhook --url=https://your-app.com');
  console.error('   Or: Set APP_BASE_URL in .env and run: pnpm set:webhook');
  process.exit(1);
}

const fullWebhookUrl = `${WEBHOOK_URL}/telegram/webhook`;

async function setWebhook() {
  try {
    console.log('🔗 Setting Telegram webhook...');
    console.log(`📍 Webhook URL: ${fullWebhookUrl}`);

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: fullWebhookUrl,
          allowed_updates: ['message', 'callback_query', 'inline_query'],
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log('');

      // Verify webhook
      const verifyResponse = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
      );
      const verifyData = await verifyResponse.json();

      if (verifyData.ok) {
        console.log('📊 Webhook Info:');
        console.log(`   URL: ${verifyData.result.url}`);
        console.log(`   Pending updates: ${verifyData.result.pending_update_count}`);
        if (verifyData.result.last_error_message) {
          console.log(`   ⚠️  Last error: ${verifyData.result.last_error_message}`);
        } else {
          console.log('   ✅ No errors');
        }
      }

      console.log('');
      console.log('🎮 Test your bot:');
      console.log(`   https://t.me/${process.env.TELEGRAM_BOT_USERNAME}`);
      console.log('');
    } else {
      console.error('❌ Failed to set webhook');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error);
    process.exit(1);
  }
}

async function deleteWebhook() {
  try {
    console.log('🗑️  Deleting webhook...');

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`,
      { method: 'POST' }
    );

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook deleted');
    } else {
      console.error('❌ Failed to delete webhook');
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error);
  }
}

// Main
const command = process.argv[2];

if (command === 'delete' || command === '--delete') {
  deleteWebhook();
} else {
  setWebhook();
}
