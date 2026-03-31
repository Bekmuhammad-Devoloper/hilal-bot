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
    // Add client_max_body_size to /api/ location block
    console.log("=== Adding client_max_body_size to /api/ location ===");
    let r = await run(conn, `sed -i '/location \\/api\\// {
n
s|proxy_pass http://127.0.0.1:7777/api/;|proxy_pass http://127.0.0.1:7777/api/;\\n        client_max_body_size 100M;|
}' /etc/nginx/sites-enabled/hilal-bot`);
    console.log(r || "Done");

    // Verify the change
    console.log("\n=== UPDATED CONFIG ===");
    r = await run(conn, "cat /etc/nginx/sites-enabled/hilal-bot");
    console.log(r);

    // Test nginx config
    console.log("\n=== NGINX TEST ===");
    r = await run(conn, "nginx -t 2>&1");
    console.log(r);

    // Reload nginx
    console.log("\n=== RELOAD NGINX ===");
    r = await run(conn, "systemctl reload nginx 2>&1");
    console.log(r || "Nginx reloaded!");

    // Quick test
    console.log("\n=== TEST API ===");
    r = await run(conn, "curl -s -w ' HTTP:%{http_code}' -m 5 http://localhost:7777/api/broadcast/users");
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
