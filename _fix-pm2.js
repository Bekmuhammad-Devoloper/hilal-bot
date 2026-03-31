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
    // Delete the fork mode process
    console.log("=== Fixing PM2 ===");
    let r = await run(conn, "pm2 delete hilal-backend 2>/dev/null; cd /root/hilal-bot/backend && pm2 start dist/src/main.js --name hilal-backend --cwd /root/hilal-bot/backend");
    console.log(r);

    await new Promise(r => setTimeout(r, 4000));
    await run(conn, "pm2 flush hilal-backend");

    // Check mode and cwd
    console.log("\n=== PM2 check ===");
    r = await run(conn, "pm2 describe hilal-backend | grep -E 'pid|exec|mode|cwd|status'");
    console.log(r);

    // Check logs (should show port message)
    console.log("\n=== OUT LOGS ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 5 --nostream --out");
    console.log(r);

    // Test
    console.log("\n=== TEST: GET users ===");
    r = await run(conn, "curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 10 http://localhost:7777/api/broadcast/users");
    console.log(r);

    console.log("\n=== TEST: POST selected text ===");
    r = await run(conn, `curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 10 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"cwd fixed test"}'`);
    console.log(r);

    console.log("\n=== TEST: POST selected text AGAIN ===");
    r = await run(conn, `curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 10 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"cwd fixed test 2"}'`);
    console.log(r);

    // PM2 save
    console.log("\n=== PM2 SAVE ===");
    r = await run(conn, "pm2 save");
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
