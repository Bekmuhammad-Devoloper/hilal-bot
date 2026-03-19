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
    // Check compiled broadcast.service.js for the sendMsg method and FormData usage
    console.log("=== CHECK sendMsg in compiled code ===");
    let r = await run(conn, "grep -n 'form_data\\|FormData\\|sendMsg\\|sendPhoto\\|getHeaders\\|form.append' /root/hilal-bot/backend/dist/src/broadcast/broadcast.service.js");
    console.log(r);

    // Check if FormData is correctly imported (default vs named)
    console.log("\n=== CHECK FormData require ===");
    r = await run(conn, `cd /root/hilal-bot/backend && node -e "
const fd = require('form-data');
console.log('typeof fd:', typeof fd);
console.log('typeof fd.default:', typeof fd.default);
const FD = fd.default || fd;
const f = new FD();
console.log('form instance:', f.constructor.name);
console.log('has getHeaders:', typeof f.getHeaders);
"`);
    console.log(r);

    // Check what form_data_1 resolves to in the compiled code
    console.log("\n=== CHECK compiled form-data import ===");
    r = await run(conn, `cd /root/hilal-bot/backend && node -e "
const form_data_1 = require('form-data');
console.log('form_data_1:', typeof form_data_1);
console.log('form_data_1.default:', typeof form_data_1.default);

// simulate what compiled code does: 'import FormData from form-data' => form_data_1.default
try {
  const F = form_data_1.default;
  console.log('Using .default:', F);
  if (F) {
    const f = new F();
    console.log('ok');
  }
} catch(e) {
  console.log('ERROR with .default:', e.message);
}

// Now try direct
try {
  const f = new form_data_1();
  console.log('Direct works:', f.constructor.name);
} catch(e) {
  console.log('ERROR with direct:', e.message);
}
"`);
    console.log(r);

    // Check the actual line in compiled code that does `new form_data_1`
    console.log("\n=== CHECK new FormData usage ===");
    r = await run(conn, "grep -n 'new form_data' /root/hilal-bot/backend/dist/src/broadcast/broadcast.service.js");
    console.log(r);

    // Flush and test send with inline error logging
    console.log("\n=== FLUSH & TEST sendToUser ===");
    await run(conn, "pm2 flush hilal-backend");
    r = await run(conn, `curl -v -m 15 -X POST http://localhost:7777/api/broadcast/user -H "Content-Type: application/json" -d '{"telegramId":6340537709,"message":"hello plain text test"}' 2>&1`, 20000);
    console.log(r);

    console.log("\n=== LOGS AFTER TEST ===");
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
