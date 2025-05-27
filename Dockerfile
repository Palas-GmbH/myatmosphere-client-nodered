# Use the official Node-Red Docker image as the base image
FROM nodered/node-red:4.0.9-22-minimal

RUN mkdir -p /usr/src/node-red/node-red-contrib-myatmosphere

# Copy custom node files into the container
COPY src/node-red-contrib-myatmosphere/* /usr/src/node-red/node-red-contrib-myatmosphere/

# Change working directory to the custom node directory
WORKDIR /usr/src/node-red/node-red-contrib-myatmosphere

# Install dependencies for the custom node
RUN npm install

# Change working directory back to Node-Red user directory
WORKDIR /usr/src/node-red

# Install your custom node globally
RUN npm install /usr/src/node-red/node-red-contrib-myatmosphere

# Expose the default Node-Red port
EXPOSE 1880

# Start Node-Red
CMD ["npm", "start", "--", "--userDir", "/data"]
