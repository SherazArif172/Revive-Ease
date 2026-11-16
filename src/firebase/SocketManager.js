// src/firebase/SocketManager.js
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { useNotifications } from "../Components/header/Notifications";

const SocketManager = () => {
  const { socket, isConnected } = useSocket();
  const currentUserId = useSelector((state) => state.user?.id);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!socket || !isConnected || !currentUserId) {
      console.warn("SocketManager: Skipping setup - socket:", socket, "isConnected:", isConnected, "userId:", currentUserId);
      return;
    }

    // Join all chat rooms
    socket.emit("getChatRooms", { userId: currentUserId, userType: "user" }, (ack) => {
      if (ack?.chatRooms) {
        ack.chatRooms.forEach((room) => {
          socket.emit("join_chat", room._id);
          console.log(`Joined chat room: ${room._id}`);
        });
      }
    });

    // 🔔 Handle new message
    const handleNewMessage = (message) => {
      console.log('SocketManager: new_message received:', message);
      const senderId = message?.sender || message?.senderDetails?._id;
      console.log('SocketManager: senderId:', senderId, 'currentUserId:', currentUserId);
      
      if (senderId === currentUserId) {
        console.log('SocketManager: Message from current user, skipping notification');
        return;
      }

      const newNotification = {
        id: message._id || Date.now(),
        sender: message.senderDetails?.first_name || "User",
        text: message.text || "You have a new message",
        timestamp: new Date().toISOString(),
        chatId: message.chatId,
        isRead: false,
      };

      console.log('SocketManager: Creating notification:', newNotification);
      addNotification(newNotification);
    };

    socket.on("new_message", handleNewMessage);
    console.log('SocketManager: new_message event listener attached');

    socket.on("connect", () => {
      console.log("Reconnected. Joining rooms again.");
      socket.emit("getChatRooms", { userId: currentUserId, userType: "user" }, (ack) => {
        if (ack?.chatRooms) {
          ack.chatRooms.forEach((room) => {
            socket.emit("join_chat", room._id);
          });
        }
      });
    });

    socket.on("disconnect", () => console.log("Disconnected"));
    socket.on("connect_error", (err) => console.error("Socket Error:", err));

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [socket, isConnected, currentUserId, addNotification]);

  return null;
};

export default SocketManager;
