import { Client } from "@stomp/stompjs";

const WS_URL = "ws://103.90.224.152:8080/ws/events"; 

const gameWs = new Client({
  brokerURL: WS_URL,
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,

  debug: (str) => {
    console.log("[STOMP]", str);
  },

  onConnect: () => {
    console.log("✅ STOMP connected");

    // Subscribe room
    gameWs.subscribe("/topic/room/123", (msg) => {
      console.log("ROOM EVENT:", JSON.parse(msg.body));
    });

    // Send action
    gameWs.publish({
      destination: "/app/room/123/action",
      body: JSON.stringify({
        type: "MOVE",
        payload: { x: 10, y: 20 }
      })
    });
  },

  onStompError: (frame) => {
    console.error("❌ STOMP error", frame);
  }
});

export default gameWs;
