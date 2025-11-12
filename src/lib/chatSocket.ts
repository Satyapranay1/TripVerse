import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client: Client;

export const connectChatSocket = () => {
  client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws/chat"),
    reconnectDelay: 3000,
  });
  client.activate();
  return client;
};

export const subscribeToChat = (conversationId: string, callback: (msg: any) => void) => {
  return client.subscribe(`/topic/conversations/${conversationId}`, (message) => {
    callback(JSON.parse(message.body));
  });
};

export const sendChatMessage = (conversationId: string, content: string) => {
  client.publish({
    destination: "/app/chat.send",
    body: JSON.stringify({ conversationId: Number(conversationId), content }),
  });
};
