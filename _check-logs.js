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
    // Check backend error logs
    console.log("=== BACKEND ERROR LOGS (last 30) ===");
    let r = await run(conn, "pm2 logs hilal-backend --lines 30 --nostream --err");
    console.log(r);

    // Check backend out logs
    console.log("\n=== BACKEND OUT LOGS (last 30) ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 30 --nostream --out");
    console.log(r);

    // Check uploads directory
    console.log("\n=== UPLOADS DIR ===");
    r = await run(conn, "ls -la /root/hilal-bot/backend/uploads/");
    console.log(r);

    // Check if form-data is installed
    console.log("\n=== FORM-DATA INSTALLED? ===");
    r = await run(conn, "ls /root/hilal-bot/backend/node_modules/form-data/package.json 2>/dev/null && echo 'YES' || echo 'NO'");
    console.log(r);

    // Check the compiled broadcast.service.js for FormData import
    console.log("\n=== CHECK FormData import in compiled code ===");
    r = await run(conn, "head -20 /root/hilal-bot/backend/dist/src/broadcast/broadcast.service.js");
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
