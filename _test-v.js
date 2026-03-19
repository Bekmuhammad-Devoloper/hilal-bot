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
    // Wait for backend to fully start
    console.log("Waiting 5s for startup...");
    await new Promise(r => setTimeout(r, 5000));

    // Flush logs
    await run(conn, "pm2 flush hilal-backend");

    // Test with verbose curl
    console.log("\n=== TEST: verbose photo send ===");
    let r = await run(conn, `curl -v -m 20 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"Photo test 2","mediaType":"photo","mediaUrl":"/uploads/1773940865093-124572169.png"}' 2>&1`, 25000);
    console.log(r);

    // Check errors
    console.log("\n=== ERRORS ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 15 --nostream");
    console.log(r);

    // Also test plain text to see if it works
    console.log("\n=== TEST: plain text send ===");
    r = await run(conn, `curl -v -m 15 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"plain text test 2"}' 2>&1`, 20000);
    console.log(r);

    console.log("\n=== ERRORS 2 ===");
    r = await run(conn, "pm2 logs hilal-backend --lines 10 --nostream");
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
