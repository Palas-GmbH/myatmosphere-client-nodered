module.exports = function (RED) {
  const signalR = require("@microsoft/signalr");

  function MyAtmosphereMeasurementsNode(config) {
    RED.nodes.createNode(this, config);
    this.connectionConfig = RED.nodes.getNode(config.connection);
    const node = this;

    node.log(
      `Connection config, Url: ${node.connectionConfig?.apiEndpoint}`,
      node.connectionConfig
    );

    const serialNumbers = config.serialNumbers
      ? config.serialNumbers.split(",").map((s) => s.trim())
      : [];

    let configMeasurementTypes = config.measurementTypes
      ?.trim()
      ?.split(",")
      .map((s) => s.trim())
      .filter((s) => s?.length > 0);

    if (
      configMeasurementTypes?.length > 0 &&
      configMeasurementTypes.every((t) => t !== "timestamp")
    ) {
      configMeasurementTypes.push("timestamp");
    }
    const measurementTypes = configMeasurementTypes || [];

    let connection = null;
    let connected = false;
    let activeSubscriptions = [];

    // Unsubscribe from all active subscriptions
    async function unsubscribeAll() {
      if (!connection || !connected || !activeSubscriptions.length) return;
      const dataSet = "Measurements";
      for (const { serial, measurementTypes } of activeSubscriptions) {
        try {
          await connection.invoke(
            "DeviceUnsubscribe",
            serial,
            dataSet,
            measurementTypes
          );
          node.log(
            `Unsubscribed from ${serial}:${dataSet}:${measurementTypes.join(
              ","
            )}`
          );
        } catch (err) {
          node.warn(
            `Failed to unsubscribe from ${serial}:${dataSet}:${measurementTypes.join(
              ","
            )}: ${err}`
          );
        }
      }
      activeSubscriptions = [];
    }

    async function connect() {
      // Unsubscribe and stop previous connection if exists
      if (connection && connected) {
        await unsubscribeAll();
        await connection.stop();
      }

      const myAtmosphereMeasurementsHubUrl = `${
        node.connectionConfig?.apiEndpoint
      }/streams/measurements?access_token=Api-Key%20${encodeURIComponent(
        node.connectionConfig?.apiKey
      )}`;
      const measurementTypesString =
        measurementTypes?.length > 0 ? measurementTypes.join(", ") : "all";
      node.log(
        `Subscribing to devices: ${serialNumbers.join(
          ", "
        )} for measurement types: ${measurementTypesString}`
      );

      connection = new signalR.HubConnectionBuilder()
        .withUrl(myAtmosphereMeasurementsHubUrl)
        .withAutomaticReconnect([0, 5000, 30000, 120000, 600000, 3600000])
        .build();

      // Handle reconnected - re-subscribe to all
      connection.onreconnected(async () => {
        node.status({ fill: "green", shape: "dot", text: "reconnected" });
        connected = true;
        node.log("Connection re-established, re-subscribing...");
        await subscribeAll();
      });

      connection.onreconnecting(() => {
        node.status({ fill: "yellow", shape: "ring", text: "reconnecting..." });
        connected = false;
      });

      connection.onclose(async (error) => {
        node.status({ fill: "red", shape: "ring", text: "disconnected" });
        connected = false;
        if (error) {
          node.error("Connection closed with error: " + error);
        }
        // Optionally, try to reconnect after a delay (SignalR's automaticReconnect usually handles this)
      });

      // Subscribe to all topics
      async function subscribeAll() {
        const dataSet = "Measurements";
        activeSubscriptions = [];
        for (const serial of serialNumbers) {
          try {
            await connection.invoke(
              `Device${dataSet}Subscribe`,
              serial,
              measurementTypes
            );
            node.log(
              `Subscribed to ${serial}:${dataSet}:${measurementTypes.join(",")}`
            );
          } catch (err) {
            node.error(
              `Failed to subscribe to ${serial}:${dataSet}:${measurementTypes.join(
                ","
              )}: ${err}`
            );
            continue;
          }
          const groupName = `${serial}:${dataSet}:${measurementTypes.join(
            ","
          )}`;
          node.log(`Registering handler for group: ${groupName}`);
          connection.off(`Receive:${groupName}`);
          connection.on(`Receive:${groupName}`, (data) => {
            node.send({ payload: data, device: serial, dataSet: dataSet });
          });
          activeSubscriptions.push({ serial, measurementTypes });
        }
      }

      // Actually start the connection and subscribe
      connection
        .start()
        .then(async () => {
          node.status({ fill: "green", shape: "dot", text: "connected" });
          connected = true;
          await subscribeAll();
        })
        .catch((err) => {
          node.status({
            fill: "red",
            shape: "ring",
            text: "connection failed",
          });
          node.error("Connection failed: " + err);
          connected = false;
        });
    }

    // On shutdown, always unsubscribe first, then stop connection
    node.on("close", async function (done) {
      try {
        await unsubscribeAll();
        if (connection) {
          await connection.stop();
        }
        done();
      } catch (err) {
        done();
      }
    });

    // Optionally allow dynamic input
    node.on("input", function (msg) {
      // You could handle new subscriptions here dynamically
    });

    // Ensure we have a valid connection node
    if (
      !(node.connectionConfig?.apiEndpoint?.length > 0) ||
      !(node.connectionConfig?.apiKey?.length > 0) ||
      node.connectionConfig?.apiEndpoint === "undefined" ||
      node.connectionConfig?.apiKey === "undefined"
    ) {
      node.error("Invalid connection configuration.");
      return;
    }

    // Start on deploy
    connect();
  }

  RED.nodes.registerType(
    "myatmosphere-measurements",
    MyAtmosphereMeasurementsNode
  );
};
