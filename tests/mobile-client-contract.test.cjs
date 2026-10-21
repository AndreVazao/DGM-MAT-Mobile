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
  assert.match(app, /api\/rendezvous\?public=1&node=PC-Vazao-Anjos/);
  assert.match(app, /d\.node&&d\.node\.endpoint/);
  assert.match(app, /Mensagem guardada neste telemóvel, mas NÃO enviada/);
  assert.match(app, /Falha ao enviar/);
  assert.match(app, /function makeId\(\)/);
  assert.match(app, /id:"local-"\+makeId\(\)/);
  assert.match(app, /id:"pending-"\+makeId\(\)/);
  assert.doesNotMatch(app, /https?:\/\/100\.[0-9.]+/);
});


test("native Android app keeps the header below the Android status bar safe area", () => {
  assert.match(app, /classList\.toggle\("native-app",isNativeApp\(\)\)/);
  const css = fs.readFileSync(path.join(root, "web/styles.css"), "utf8");
  assert.match(css, /\.native-app \.app\{padding-top:max\(env\(safe-area-inset-top\),56px\)\}/);
  assert.match(css, /\.native-app \.drawer\{top:max\(env\(safe-area-inset-top\),56px\)\}/);
});


test("USB recovery settings are visible and never bypass API authentication", () => {
  const html = fs.readFileSync(path.join(root, "web/index.html"), "utf8");
  assert.match(html, /openUsbSettings/);
  assert.match(html, /usbDiagnose/);
  assert.match(html, /usbReconnect/);
  assert.match(html, /usbRestart/);
  assert.match(html, /usbInstall/);
  assert.match(app, /\/mobile\/usb-recovery\/diagnose/);
  assert.match(app, /\/mobile\/usb-recovery\/state/);
  assert.match(app, /O emparelhamento remoto seguro ainda precisa de ser concluído/);
  assert.match(app, /confirm_install:Boolean\(confirmInstall\)/);
});
