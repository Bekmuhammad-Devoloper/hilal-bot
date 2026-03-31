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
    // Check guardy status
    console.log("=== GUARDY STATUS ===");
    let r = await run(conn, "pm2 describe guardy | grep -E 'status|restart|pid|port'");
    console.log(r);

    // Check guardy logs for port conflict
    console.log("\n=== GUARDY LOGS ===");
    r = await run(conn, "pm2 logs guardy --lines 10 --nostream");
    console.log(r);

    // Fix guardy port to 3333 (unique port)
    console.log("\n=== FIX GUARDY PORT ===");
    r = await run(conn, "pm2 delete guardy 2>/dev/null; cd /var/www/guardy && PORT=3333 pm2 start dist/main.js --name guardy --cwd /var/www/guardy");
    console.log(r);

    await new Promise(r => setTimeout(r, 3000));

    // Verify
    console.log("\n=== VERIFY all ports ===");
    r = await run(conn, "ss -tlnp | grep -E '7777|8888|3333|3000|3001'");
    console.log(r);

    // Verify guardy is healthy
    console.log("\n=== GUARDY STATUS ===");
    r = await run(conn, "pm2 describe guardy | grep -E 'status|restart|pid'");
    console.log(r);

    // Test hilal endpoints one more time
    console.log("\n=== TEST: hilal broadcast/users ===");
    r = await run(conn, "curl -s -w ' TIME:%{time_total}s' -m 5 http://localhost:7777/api/broadcast/users");
    console.log(r);

    console.log("\n=== TEST: hilal broadcast/selected text ===");
    r = await run(conn, `curl -s -w ' TIME:%{time_total}s' -m 10 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"all fixed!"}'`);
    console.log(r);

    // Test admin
    console.log("\n=== TEST: admin ===");
    r = await run(conn, "curl -s -w ' HTTP:%{http_code} TIME:%{time_total}s' -m 5 -o /dev/null http://localhost:8888");
    console.log(r);

    // Test via domain
    console.log("\n=== TEST: via domain ===");
    r = await run(conn, "curl -s -w ' HTTP:%{http_code} TIME:%{time_total}s' -m 5 -o /dev/null https://hilal-bot.bekmuhammad.uz");
    console.log(r);

    // Save
    await run(conn, "pm2 save");
    console.log("\nPM2 saved!");

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
