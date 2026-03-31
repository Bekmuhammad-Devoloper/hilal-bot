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
    // 1. Pull latest
    console.log("=== GIT PULL ===");
    let r = await run(conn, "cd /root/hilal-bot && git pull origin main");
    console.log(r);

    // 2. Build backend
    console.log("\n=== BUILD BACKEND ===");
    r = await run(conn, "cd /root/hilal-bot/backend && npm run build 2>&1", 60000);
    console.log(r);

    // 3. Build admin
    console.log("\n=== BUILD ADMIN ===");
    r = await run(conn, "cd /root/hilal-bot/admin && npm run build 2>&1", 120000);
    console.log(r);

    // 4. Fix Nginx - add proxy timeouts to /api/ location
    console.log("\n=== FIX NGINX TIMEOUTS ===");
    // Check if proxy_read_timeout already exists in /api/ block
    r = await run(conn, "grep proxy_read_timeout /etc/nginx/sites-enabled/hilal-bot || echo 'NOT_FOUND'");
    console.log("Current proxy_read_timeout:", r.trim());

    if (r.includes("NOT_FOUND")) {
      // Add proxy timeouts after client_max_body_size in /api/ block
      r = await run(conn, `sed -i '/location \\/api\\//,/}/ {
/client_max_body_size/a\\        proxy_read_timeout 300s;\\n        proxy_connect_timeout 300s;\\n        proxy_send_timeout 300s;
}' /etc/nginx/sites-enabled/hilal-bot`);
      console.log("Added proxy timeouts");
    } else {
      console.log("Already has proxy_read_timeout");
    }

    // Also add to /uploads/ block
    r = await run(conn, `grep -A5 'location /uploads/' /etc/nginx/sites-enabled/hilal-bot | grep proxy_read_timeout || echo 'NOT_IN_UPLOADS'`);
    if (r.includes("NOT_IN_UPLOADS")) {
      r = await run(conn, `sed -i '/location \\/uploads\\//,/}/ {
/client_max_body_size/a\\        proxy_read_timeout 300s;\\n        proxy_connect_timeout 300s;\\n        proxy_send_timeout 300s;
}' /etc/nginx/sites-enabled/hilal-bot`);
      console.log("Added proxy timeouts to /uploads/ too");
    }

    // Verify nginx config
    console.log("\n=== VERIFY NGINX ===");
    r = await run(conn, "cat /etc/nginx/sites-enabled/hilal-bot");
    console.log(r);

    // Test nginx
    console.log("\n=== NGINX TEST ===");
    r = await run(conn, "nginx -t 2>&1");
    console.log(r);

    // Reload nginx
    console.log("\n=== RELOAD NGINX ===");
    r = await run(conn, "systemctl reload nginx 2>&1");
    console.log(r || "Nginx reloaded!");

    // 5. Restart PM2 processes
    console.log("\n=== RESTART PM2 ===");
    r = await run(conn, "pm2 restart hilal-backend hilal-admin 2>&1");
    console.log(r);

    await new Promise(r => setTimeout(r, 3000));

    // 6. Test
    console.log("\n=== TEST ENDPOINTS ===");
    r = await run(conn, "curl -s -w ' HTTP:%{http_code} TIME:%{time_total}s' -m 10 http://localhost:7777/api/broadcast/users");
    console.log("GET users:", r);

    r = await run(conn, "curl -s -w ' HTTP:%{http_code} TIME:%{time_total}s' -m 5 -o /dev/null http://localhost:8888");
    console.log("Admin:", r);

    // Test upload endpoint exists
    r = await run(conn, "curl -s -w ' HTTP:%{http_code}' -m 5 -X POST http://localhost:7777/api/uploads/upload");
    console.log("Upload endpoint:", r);

    console.log("\n✅ DEPLOY COMPLETE!");

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
