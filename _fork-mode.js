const { Client } = require("ssh2");
const conn = new Client();

function run(conn, cmd, timeout = 15000) {
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
    // Check what's listening on 7777
    console.log("=== WHO IS ON PORT 7777 ===");
    let r = await run(conn, "ss -tlnp | grep 7777");
    console.log(r);

    // Check all node processes
    console.log("\n=== ALL NODE PROCESSES ===");
    r = await run(conn, "ps aux | grep 'dist/src/main.js' | grep -v grep");
    console.log(r);

    // Check PM2 process details for hilal-backend
    console.log("\n=== PM2 hilal-backend ===");
    r = await run(conn, "pm2 describe hilal-backend | grep -E 'pid|exec|mode|instances|status'");
    console.log(r);

    // Kill ALL and restart fresh in fork mode
    console.log("\n=== Switch to fork mode ===");
    r = await run(conn, "pm2 delete hilal-backend 2>/dev/null; pm2 start /root/hilal-bot/backend/dist/src/main.js --name hilal-backend --node-args='--max-old-space-size=512' -f");
    console.log(r);

    await new Promise(r => setTimeout(r, 4000));

    // Check mode
    console.log("\n=== PM2 mode check ===");
    r = await run(conn, "pm2 describe hilal-backend | grep -E 'pid|exec|mode|instances|status'");
    console.log(r);

    // Flush logs
    await run(conn, "pm2 flush hilal-backend");

    // Test GET users
    console.log("\n=== TEST 1: GET /broadcast/users ===");
    r = await run(conn, "curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 10 http://localhost:7777/api/broadcast/users");
    console.log(r);

    // Test POST selected text
    console.log("\n=== TEST 2: POST /broadcast/selected (text) ===");
    r = await run(conn, `curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 10 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"fork mode test"}'`);
    console.log(r);

    // Test POST selected text again
    console.log("\n=== TEST 3: POST /broadcast/selected (text) again ===");
    r = await run(conn, `curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 10 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"fork mode test 2"}'`);
    console.log(r);

    // Logs
    console.log("\n=== LOGS ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 15 --nostream --out");
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
