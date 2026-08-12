const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const proxyquire = require("proxyquire").noCallThru().noPreserveCache();

const packageRoot = path.resolve(__dirname, "..");

function loadNode(file, signalr) {
  const modulePath = path.join(packageRoot, file);
  return signalr
    ? proxyquire(modulePath, { "@microsoft/signalr": signalr })
    : require(modulePath);
}

function createRed({ connectionNode } = {}) {
  const registered = new Map();

  return {
    registered,
    nodes: {
      createNode(node, config) {
        node.credentials = config.credentials || {};
        node.handlers = new Map();
        node.logs = [];
        node.warnings = [];
        node.errors = [];
        node.statuses = [];
        node.sent = [];
        node.on = (event, handler) => node.handlers.set(event, handler);
        node.log = (...args) => node.logs.push(args);
        node.warn = (...args) => node.warnings.push(args);
        node.error = (...args) => node.errors.push(args);
        node.status = (status) => node.statuses.push(status);
        node.send = (message) => node.sent.push(message);
      },
      getNode() {
        return connectionNode;
      },
      registerType(name, constructor, options) {
        registered.set(name, { constructor, options });
      },
    },
  };
}

test("registers the connection node and retains its configured credentials", () => {
  const RED = createRed();
  loadNode("connection.js")(RED);

  const registration = RED.registered.get("myatmosphere-connection");
  assert.ok(registration);
  assert.deepEqual(registration.options, {
    credentials: { apiKey: { type: "password" } },
  });

  const node = new registration.constructor({
    apiEndpoint: "https://api.example.test",
    credentials: { apiKey: "secret" },
  });
  assert.equal(node.apiEndpoint, "https://api.example.test");
  assert.equal(node.apiKey, "secret");
});

test("connects, subscribes, delivers measurements, and cleans up subscriptions", async () => {
  const calls = [];
  const events = new Map();
  const connection = {
    withUrl(url) {
      calls.push(["withUrl", url]);
      return this;
    },
    withAutomaticReconnect(delays) {
      calls.push(["withAutomaticReconnect", delays]);
      return this;
    },
    build() {
      return this;
    },
    onreconnected(handler) {
      events.set("reconnected", handler);
    },
    onreconnecting(handler) {
      events.set("reconnecting", handler);
    },
    onclose(handler) {
      events.set("close", handler);
    },
    off(name) {
      calls.push(["off", name]);
    },
    on(name, handler) {
      events.set(name, handler);
    },
    async invoke(...args) {
      calls.push(["invoke", ...args]);
    },
    start() {
      return Promise.resolve();
    },
    async stop() {
      calls.push(["stop"]);
    },
  };
  const signalr = {
    HubConnectionBuilder: class {
      withUrl(url) {
        return connection.withUrl(url);
      }
    },
  };
  const RED = createRed({
    connectionNode: {
      apiEndpoint: "https://api.example.test/",
      apiKey: "key with spaces",
    },
  });
  loadNode("measurements.js", signalr)(RED);

  const registration = RED.registered.get("myatmosphere-measurements");
  const node = new registration.constructor({
    connection: "connection-id",
    serialNumbers: " one, two ",
    measurementTypes: "temperature, humidity",
  });
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(calls.slice(0, 4), [
    ["withUrl", "https://api.example.test//streams/measurements?access_token=Api-Key%20key%20with%20spaces"],
    ["withAutomaticReconnect", [0, 5000, 30000, 120000, 600000, 3600000]],
    ["invoke", "DeviceMeasurementsSubscribe", "one", ["temperature", "humidity", "timestamp"]],
    ["off", "Receive:one:Measurements:temperature,humidity,timestamp"],
  ]);
  assert.ok(events.has("Receive:two:Measurements:temperature,humidity,timestamp"));

  events.get("Receive:one:Measurements:temperature,humidity,timestamp")({ value: 42 });
  assert.deepEqual(node.sent, [{ payload: { value: 42 }, device: "one", dataSet: "Measurements" }]);

  await new Promise((resolve) => node.handlers.get("close")(resolve));
  assert.ok(calls.some((call) => call[0] === "invoke" && call[1] === "DeviceUnsubscribe" && call[2] === "one"));
  assert.ok(calls.some((call) => call[0] === "stop"));
});

test("does not start a connection when the configuration node is invalid", () => {
  const RED = createRed({ connectionNode: { apiEndpoint: "undefined", apiKey: "" } });
  const signalr = {
    HubConnectionBuilder: class {
      withUrl() {
        throw new Error("an invalid configuration must not start SignalR");
      }
    },
  };
  loadNode("measurements.js", signalr)(RED);

  const registration = RED.registered.get("myatmosphere-measurements");
  const node = new registration.constructor({});
  assert.deepEqual(node.errors, [["Invalid connection configuration."]]);
});
