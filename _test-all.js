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
    await run(conn, "pm2 flush hilal-backend");

    // Test selected with plain text
    console.log("=== TEST: /broadcast/selected plain text ===");
    let r = await run(conn, `curl -v -m 20 -X POST http://localhost:7777/api/broadcast/selected -H "Content-Type: application/json" -d '{"telegramIds":[6340537709],"message":"selected text test"}' 2>&1`, 25000);
    console.log(r);

    // Test all with plain text
    console.log("\n=== TEST: /broadcast/all plain text ===");
    r = await run(conn, `curl -v -m 20 -X POST http://localhost:7777/api/broadcast/all -H "Content-Type: application/json" -d '{"message":"broadcast all test"}' 2>&1`, 25000);
    console.log(r);

    console.log("\n=== LOGS ===");
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
