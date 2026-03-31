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
    // Restart fresh
    await run(conn, "pm2 restart hilal-backend && pm2 flush hilal-backend");
    console.log("Restarted. Waiting 6s...\n");
    await new Promise(r => setTimeout(r, 6000));

    // Test all key endpoints sequentially
    console.log("=== 1. GET /broadcast/users ===");
    let r = await run(conn, "curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 15 http://localhost:7777/api/broadcast/users", 20000);
    console.log(r);

    console.log("\n=== 2. POST /broadcast/selected (photo) ===");
    r = await run(conn, `curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 15 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"final test photo","mediaType":"photo","mediaUrl":"/uploads/1773940865093-124572169.png"}'`, 20000);
    console.log(r);

    console.log("\n=== 3. POST /broadcast/selected (text) ===");
    r = await run(conn, `curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 15 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"final test text"}'`, 20000);
    console.log(r);

    console.log("\n=== 4. POST /broadcast/all (text) ===");
    r = await run(conn, `curl -s -w '\\nHTTP:%{http_code} TIME:%{time_total}s' -m 15 -X POST http://localhost:7777/api/broadcast/all -H "Content-Type: application/json" -d '{"message":"final test all"}'`, 20000);
    console.log(r);

    // Check logs
    console.log("\n=== LOGS ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 20 --nostream --out");
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
