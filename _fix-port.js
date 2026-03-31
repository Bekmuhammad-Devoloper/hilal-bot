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
    // Check what's on port 7777
    console.log("=== PORT 7777 ===");
    let r = await run(conn, "ss -tlnp | grep 7777");
    console.log(r);

    console.log("\n=== PROCESSES using port 7777 ===");
    r = await run(conn, "lsof -i :7777 2>/dev/null || fuser 7777/tcp 2>/dev/null");
    console.log(r);

    // Kill everything on port 7777
    console.log("\n=== Kill all on port 7777 ===");
    r = await run(conn, "fuser -k 7777/tcp 2>/dev/null; sleep 1; ss -tlnp | grep 7777");
    console.log(r || "Port 7777 is now free");

    // Delete and restart PM2 backend
    console.log("\n=== Restart PM2 ===");
    r = await run(conn, "pm2 delete hilal-backend 2>/dev/null; sleep 1; cd /root/hilal-bot/backend && pm2 start dist/src/main.js --name hilal-backend --cwd /root/hilal-bot/backend");
    console.log(r);

    // Wait for startup
    console.log("Waiting 5s...");
    await new Promise(r => setTimeout(r, 5000));

    // Check if it started properly
    console.log("\n=== STARTUP LOG ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 5 --nostream --out");
    console.log(r);

    // Check port
    console.log("\n=== PORT CHECK ===");
    r = await run(conn, "ss -tlnp | grep 7777");
    console.log(r);

    // Test
    console.log("\n=== TEST 1 ===");
    r = await run(conn, "curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 10 http://localhost:7777/api/broadcast/users");
    console.log(r);

    console.log("\n=== TEST 2 ===");
    r = await run(conn, `curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 10 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"port fixed test"}'`);
    console.log(r);

    console.log("\n=== TEST 3 ===");
    r = await run(conn, `curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 10 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"port fixed test 2"}'`);
    console.log(r);

    // Save
    await run(conn, "pm2 save");

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
