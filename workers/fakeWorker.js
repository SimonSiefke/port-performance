const channel = new MessageChannel();

channel.port1.onmessage = ({ data }) => {
  channel.port1.postMessage(data);
};

export const port = channel.port2;
