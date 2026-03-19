const { Client } = require("ssh2");
const conn = new Client();

function run(conn, cmd, timeout = 120000) {
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
    // 1. Git pull
    console.log("=== GIT PULL ===");
    let r = await run(conn, "cd /root/hilal-bot && git pull origin main");
    console.log(r);

    // 2. Build backend
    console.log("\n=== BACKEND BUILD ===");
    r = await run(conn, "cd /root/hilal-bot/backend && npm run build", 120000);
    console.log(r);

    // 3. Verify fix
    console.log("\n=== VERIFY: no form_data_1.default ===");
    r = await run(conn, "grep 'form_data_1.default\\|require(\"form-data\")' /root/hilal-bot/backend/dist/src/broadcast/broadcast.service.js");
    console.log(r);

    // 4. Restart backend
    console.log("\n=== RESTART ===");
    r = await run(conn, "pm2 restart hilal-backend");
    console.log(r);

    // 5. Wait
    await new Promise(r => setTimeout(r, 4000));

    // 6. Flush logs and test photo send
    await run(conn, "pm2 flush hilal-backend");
    console.log("\n=== TEST: photo send ===");
    r = await run(conn, `curl -s -m 20 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"Deploy test — photo","mediaType":"photo","mediaUrl":"/uploads/1773940865093-124572169.png"}'`, 25000);
    console.log("Response:", r);

    // 7. Check logs
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
