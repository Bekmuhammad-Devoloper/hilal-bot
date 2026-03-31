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
    // Check current PM2 list
    console.log("=== PM2 LIST ===");
    let r = await run(conn, "pm2 list");
    console.log(r);

    // Restart hilal-admin and hilal-bot (they got killed when PM2 daemon died)
    console.log("\n=== Restart other hilal processes ===");
    
    // Check if admin and bot are running
    r = await run(conn, "pm2 list | grep -E 'hilal-admin|hilal-bot'");
    console.log("Current hilal processes:", r || "(none found)");

    // Start admin
    console.log("\n=== Start hilal-admin ===");
    r = await run(conn, "cd /root/hilal-bot/admin && pm2 start node_modules/.bin/next --name hilal-admin --cwd /root/hilal-bot/admin -- start --port 8888");
    console.log(r);

    // Start bot
    console.log("\n=== Start hilal-bot ===");
    r = await run(conn, "cd /root/hilal-bot/bot && pm2 start dist/index.js --name hilal-bot --cwd /root/hilal-bot/bot");
    console.log(r);

    // Start guardy on its correct port (NOT 7777!)
    console.log("\n=== Check guardy config ===");
    r = await run(conn, "cat /var/www/guardy/ecosystem.config.js 2>/dev/null || cat /var/www/guardy/.env 2>/dev/null | grep PORT || echo 'no config found'");
    console.log(r);

    // Start guardy with its correct port from ecosystem
    console.log("\n=== Start guardy ===");
    r = await run(conn, "cd /var/www/guardy && pm2 start ecosystem.config.js 2>/dev/null || pm2 start dist/main.js --name guardy --cwd /var/www/guardy");
    console.log(r);

    await new Promise(r => setTimeout(r, 3000));

    // Final PM2 list
    console.log("\n=== FINAL PM2 LIST ===");
    r = await run(conn, "pm2 list");
    console.log(r);

    // Check ports
    console.log("\n=== PORTS ===");
    r = await run(conn, "ss -tlnp | grep -E '7777|8888|3000|3001'");
    console.log(r);

    // Save PM2
    await run(conn, "pm2 save");
    console.log("PM2 saved.");

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
