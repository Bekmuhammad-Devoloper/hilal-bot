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
    console.log("=== Restarting backend ===");
    let r = await run(conn, "pm2 restart hilal-backend && pm2 flush hilal-backend");
    console.log("Restarted. Waiting 5s...");
    await new Promise(r => setTimeout(r, 5000));

    // ONLY test selected text — nothing else
    console.log("\n=== TEST: /broadcast/selected text ONLY ===");
    r = await run(conn, `curl -v -m 30 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"isolated test"}' 2>&1`, 35000);
    console.log(r);

    // Check all logs
    console.log("\n=== ALL LOGS ===");
    r = await run(conn, "cat /root/.pm2/logs/hilal-backend-error-0.log");
    console.log("ERRORS:", r || "(empty)");
    r = await run(conn, "cat /root/.pm2/logs/hilal-backend-out-0.log");
    console.log("OUT:", r);

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
