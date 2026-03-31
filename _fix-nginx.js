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
    // 1. Check current nginx config for hilal-bot
    console.log("=== CURRENT NGINX CONFIG ===");
    let r = await run(conn, "cat /etc/nginx/sites-enabled/hilal-bot.bekmuhammad.uz 2>/dev/null || cat /etc/nginx/sites-available/hilal-bot.bekmuhammad.uz 2>/dev/null || ls /etc/nginx/sites-enabled/");
    console.log(r);

    // 2. Check nginx.conf for client_max_body_size
    console.log("\n=== NGINX.CONF client_max_body_size ===");
    r = await run(conn, "grep -n client_max_body_size /etc/nginx/nginx.conf /etc/nginx/sites-enabled/* /etc/nginx/conf.d/* 2>/dev/null || echo 'NOT FOUND'");
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
