module.exports = function (RED) {
  function MyAtmosphereConnectionNode(n) {
    RED.nodes.createNode(this, n);
    this.apiEndpoint = n.apiEndpoint;
    this.apiKey = this.credentials.apiKey;
  }
  RED.nodes.registerType(
    "myatmosphere-connection",
    MyAtmosphereConnectionNode,
    {
      credentials: {
        apiKey: { type: "password" },
      },
    }
  );
};
