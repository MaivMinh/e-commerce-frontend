import { Client } from "@stomp/stompjs";

const prodUrl = "wss://moviereservation.software/websocket-bookings/";
const devUrl = "ws://103.90.224.152:8084/bookings";

const brokerUrl = devUrl;

const reviewClient = new Client({
  brokerURL: brokerUrl,
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

export default reviewClient;