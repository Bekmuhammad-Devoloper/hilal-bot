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
    // Test Telegram sendMessage API directly
    console.log("=== TEST: Telegram sendMessage API directly ===");
    let r = await run(conn, `curl -s -m 15 -X POST "https://api.telegram.org/bot8678765504:AAEMaeGLXerTqpOm2bdd6jgcB8PZKCwCAjk/sendMessage" -H "Content-Type: application/json" -d '{"chat_id":6340537709,"text":"direct API test","parse_mode":"HTML"}'`, 20000);
    console.log(r);

    // Test via node
    console.log("\n=== TEST: node sendMessage ===");
    r = await run(conn, `cd /root/hilal-bot/backend && node -e "
const axios = require('axios');
const BOT_TOKEN = '8678765504:AAEMaeGLXerTqpOm2bdd6jgcB8PZKCwCAjk';
axios.post('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
  chat_id: 6340537709,
  text: 'node test',
  parse_mode: 'HTML'
}).then(r => console.log('OK:', r.data.ok))
.catch(e => console.log('ERROR:', e.response ? JSON.stringify(e.response.data) : e.message));
"`, 20000);
    console.log(r);

    // Check if sendToUser (which handles text without media) works
    console.log("\n=== TEST: sendToUser endpoint (text only) ===");
    await run(conn, "pm2 flush hilal-backend");
    r = await run(conn, `curl -v -m 20 -X POST http://localhost:7777/api/broadcast/user -H "Content-Type: application/json" -d '{"telegramId":6340537709,"message":"endpoint test text"}' 2>&1`, 25000);
    console.log(r);

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
