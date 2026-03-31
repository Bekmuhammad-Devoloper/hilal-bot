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
    // First restart to clear stuck requests
    await run(conn, "pm2 restart hilal-backend && pm2 flush hilal-backend");
    console.log("Restarted. Waiting 5s...");
    await new Promise(r => setTimeout(r, 5000));

    // Test GET users first (should be instant)
    console.log("=== TEST 1: GET /broadcast/users ===");
    let r = await run(conn, "curl -s -m 5 http://localhost:7777/api/broadcast/users", 10000);
    console.log("Users:", r.substring(0, 100));

    // Now test /broadcast/selected with text - NO PREVIOUS REQUESTS
    console.log("\n=== TEST 2: POST /broadcast/selected (text, FIRST request) ===");
    r = await run(conn, `curl -s -w "\\n%{http_code}\\n%{time_total}" -m 30 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"first request test"}'`, 35000);
    console.log("Response:", r);

    // Check logs
    console.log("\n=== LOGS ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 15 --nostream");
    console.log(r);

    // Check if it's a Telegram 429 rate limit
    console.log("\n=== TEST 3: Direct Telegram sendMessage ===");
    r = await run(conn, `curl -s -m 10 "https://api.telegram.org/bot8678765504:AAEMaeGLXerTqpOm2bdd6jgcB8PZKCwCAjk/sendMessage" -H "Content-Type: application/json" -d '{"chat_id":6340537709,"text":"rate limit check"}'`, 15000);
    console.log("Telegram response:", r.substring(0, 200));

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
