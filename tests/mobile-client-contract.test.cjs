const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "web/app.js"), "utf8");
const config = JSON.parse(fs.readFileSync(path.join(root, "capacitor.config.json"), "utf8"));

test("native Android WebView does not mistake its own localhost for the PC brain", () => {
  assert.match(app, /function isNativeApp\(\)/);
  assert.match(app, /const native=isNativeApp\(\)/);
  assert.match(app, /if\(!native&&\(/);
  assert.match(app, /fetch\(RENDEZVOUS/);
});

test("Capacitor wrapper points to the existing web client and stable application ID", () => {
  assert.equal(config.appId, "com.andrevazao.dgmmatmobile");
  assert.equal(config.webDir, "web");
  assert.equal(config.server.androidScheme, "https");
  assert.ok(fs.existsSync(path.join(root, config.webDir, "index.html")));
});

test("mobile client keeps rendezvous discovery and never embeds a PC address", () => {
  assert.match(app, /public-discovery\?node=PC-Vazao-Anjos/);
  assert.doesNotMatch(app, /https?:\/\/100\.[0-9.]+/);
});
