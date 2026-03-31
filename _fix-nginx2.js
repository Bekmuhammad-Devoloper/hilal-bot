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
    // 1. Full nginx config
    console.log("=== FULL NGINX CONFIG ===");
    let r = await run(conn, "cat /etc/nginx/sites-enabled/hilal-bot");
    console.log(r);

    // 2. Check nginx.conf main
    console.log("\n=== NGINX.CONF ===");
    r = await run(conn, "grep -n 'client_max_body_size\\|http {' /etc/nginx/nginx.conf");
    console.log(r);

    // 3. Check NestJS uploads controller file limit
    console.log("\n=== UPLOADS CONTROLLER ===");
    r = await run(conn, "cat /root/hilal-bot/backend/src/uploads/uploads.controller.ts");
    console.log(r);

    // 4. Check NestJS main.ts for body limit
    console.log("\n=== MAIN.TS ===");
    r = await run(conn, "cat /root/hilal-bot/backend/src/main.ts");
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
