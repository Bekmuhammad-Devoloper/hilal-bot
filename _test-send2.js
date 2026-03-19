const { Client } = require("ssh2");
const conn = new Client();

function run(conn, cmd, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve("TIMEOUT"), timeout);
    conn.exec(cmd, (err, stream) => {
      if (err) { clearTimeout(timer); return reject(err); }
      let out = "";
      let errOut = "";
      stream.on("data", (d) => (out += d.toString()));
      stream.stderr.on("data", (d) => (errOut += d.toString()));
      stream.on("close", () => {
        clearTimeout(timer);
        resolve(out + (errOut ? "\nSTDERR: " + errOut : ""));
      });
    });
  });
}

conn.on("ready", async () => {
  console.log("Connected!\n");

  try {
    // Test sending a simple text message first
    console.log("=== TEST 1: send plain text ===");
    let r = await run(conn, `curl -s -m 15 -X POST http://localhost:7777/api/broadcast/user -H "Content-Type: application/json" -d '{"telegramId":6340537709,"message":"test text only"}' 2>&1`, 20000);
    console.log(r);

    // Test sending photo directly via Telegram API
    console.log("\n=== TEST 2: send photo directly via Telegram API ===");
    r = await run(conn, `cd /root/hilal-bot/backend && node -e "
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const BOT_TOKEN = '8678765504:AAEMaeGLXerTqpOm2bdd6jgcB8PZKCwCAjk';
const form = new FormData();
form.append('chat_id', '6340537709');
form.append('photo', fs.createReadStream('./uploads/1773940865093-124572169.png'));
form.append('caption', 'test direct');
axios.post('https://api.telegram.org/bot' + BOT_TOKEN + '/sendPhoto', form, { headers: form.getHeaders() })
  .then(r => console.log('SUCCESS:', JSON.stringify(r.data).substring(0,200)))
  .catch(e => console.log('ERROR:', e.response ? JSON.stringify(e.response.data) : e.message));
"`, 20000);
    console.log(r);

    // Check errors
    console.log("\n=== LOGS ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 10 --nostream");
    console.log(r);

  } catch (e) {
    console.error("Error:", e.message);
  }

  conn.end();
});

conn.connect({
  host: "84.46.243.226",
  port: 22,
  username: "root",
  password: "ZiyodullohBekmuhammad1526",
});
