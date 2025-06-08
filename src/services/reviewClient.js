import { Client } from "@stomp/stompjs";

const prodUrl = "wss://moviereservation.software/websocket-bookings/";
const devUrl = "ws://localhost:8084/bookings";

const brokerUrl = devUrl;

const reviewClient = new Client({
  brokerURL: brokerUrl,
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

export default reviewClient;