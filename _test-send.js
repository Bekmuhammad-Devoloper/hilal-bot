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
    // First flush logs
    await run(conn, "pm2 flush hilal-backend");
    console.log("Logs flushed.\n");

    // Test the broadcast/selected endpoint directly with curl
    console.log("=== TEST: send photo to user via curl ===");
    let r = await run(conn, `curl -v -m 30 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"test from server","mediaType":"photo","mediaUrl":"/uploads/1773940865093-124572169.png"}' 2>&1`, 40000);
    console.log(r);

    // Check logs
    console.log("\n=== ERRORS AFTER TEST ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 20 --nostream");
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
