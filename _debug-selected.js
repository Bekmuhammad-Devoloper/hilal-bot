const { Client } = require("ssh2");
const conn = new Client();

function run(conn, cmd, timeout = 60000) {
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
    // Pull, build, restart
    let r = await run(conn, "cd /root/hilal-bot && git pull origin main");
    console.log("Pull:", r.includes("Fast-forward") ? "OK" : r);

    r = await run(conn, "cd /root/hilal-bot/backend && npm run build", 120000);
    console.log("Build:", r.includes("nest build") ? "OK" : r);

    await run(conn, "pm2 restart hilal-backend && pm2 flush hilal-backend");
    console.log("Restarted. Waiting 5s...");
    await new Promise(r => setTimeout(r, 5000));

    // Test selected with text
    console.log("\n=== TEST: /broadcast/selected text ===");
    r = await run(conn, `curl -s -m 40 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"debug logging test"}' 2>&1`, 45000);
    console.log("Response:", r || "(empty)");

    // Check logs
    console.log("\n=== ALL LOGS ===");
    r = await run(conn, "cat /root/.pm2/logs/hilal-backend-out-0.log | tail -20");
    console.log("OUT:", r);
    r = await run(conn, "cat /root/.pm2/logs/hilal-backend-error-0.log | tail -20");
    console.log("ERR:", r || "(empty)");

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
