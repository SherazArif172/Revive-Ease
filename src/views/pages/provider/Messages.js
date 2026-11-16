import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import Send from "../../../assets/icons/chat.png";
import { Card } from "@mui/material";
import BackArrow from "../../../assets/icons/backArrow.png";
import { formatDate } from "../../../utils/dateUtils";
import { useLocation, useNavigate } from "react-router-dom";
import { base_url } from "../../../global/global";
import { CSpinner } from "@coreui/react";
import { useNotifications } from "../../../Components/header/Notifications";

const Messages = () => {
  const { state } = useLocation();
  const { markMessageChatAsRead } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRoomIds, setChatRoomIds] = useState({ providerCoachChatId: null, patientCoachChatId: null });
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const loggedInUser = useSelector((state) => state.user?.userData?.first_name);
  const provideImage = useSelector((state) => state.user?.profileData?.profile_img);
  const coachImage = useSelector((state) => state.allPatients?.patient?.patientData?.coach?.profile_img);
  const userobject_id = useSelector((state) => state.user?.id);
  const userTypeget = useSelector((state) => state.user?.userType);
  const navigate = useNavigate();
  const patientId = state?._id ? state?._id : state?.patientId;
  const socketRef = useRef();
  const currentChatIdRef = useRef(null);
  const {
    senderProfileImage,
  } = state || {};
  useEffect(() => {
    if (currentChatId) {
      markMessageChatAsRead(currentChatId);
    }
  }, []);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.REACT_APP_SOCKET_SERVER_URL);

    socketRef.current.on("connect", () => {

    });

    socketRef.current.on("disconnect", () => {

    });

    socketRef.current.on("room_created", (data) => {
      if (data.providerCoachChatId && data.patientCoachChatId) {
        setChatRoomIds({
          providerCoachChatId: data.providerCoachChatId,
          patientCoachChatId: data.patientCoachChatId,
        });

        setCurrentChatId(data.providerCoachChatId);
      } else {
        console.error("Missing room IDs in room_created event:", data);
      }
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
    });

    if (userobject_id && userTypeget && patientId) {
      socketRef.current.emit("getChatRooms", { userId: userobject_id, userType: userTypeget, patientId });

      socketRef.current.on("chatRooms", (data) => {
        if (data.error) {
          return;
        }

        const providerCoachChatId = data.chatRooms?.find((room) => room.chatType === "Provider-Coach")?._id || null;
        const patientCoachChatId = data.chatRooms?.find((room) => room.chatType === "Patient-Coach")?._id || null;

        setChatRoomIds({ providerCoachChatId, patientCoachChatId });

        setCurrentChatId(providerCoachChatId);
      });
    }

    socketRef.current.on("new_message", (message) => {
      if (message?.chatId && message.chatId === currentChatIdRef.current) {
        setMessages((prevMessages) => {
          const updated = [...prevMessages, message];
          return Array.from(new Map(updated.map((msg) => [msg._id, msg])).values());
        });
      } else {
        console.warn("Message not for the current chat room. Ignoring.");
      }
    });

    socketRef.current.on("chatHistory", (fetchedMessages) => {
      setLoading(false);
      if (fetchedMessages.length > 0) {
        setMessages((prevMessages) => {
          const allMessages = [...prevMessages, ...fetchedMessages];
          const uniqueMessages = Array.from(new Map(allMessages.map((msg) => [msg._id, msg])).values());
          return uniqueMessages;
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userobject_id, userTypeget, patientId]);

  useEffect(() => {
    if (chatRoomIds.providerCoachChatId === null || chatRoomIds.patientCoachChatId === null) {

      socketRef.current.emit("createRoom", {
        patientId,
        loggedInUserId: userobject_id,
        loggedInUserType: userTypeget === "coach" ? "CoachProviderModel" : userTypeget,
      });
    }
  }, [chatRoomIds, patientId, userobject_id, userTypeget]);

  useEffect(() => {
    currentChatIdRef.current = currentChatId; // Keep ref updated with latest chat ID
  }, [currentChatId]);

  useEffect(() => {
    const socket = socketRef.current;

    if (socket && socket.connected && currentChatId) {
      socket.emit("join_chat", currentChatId);
      socket.emit("getChat", currentChatId);
    }

    return () => {
      if (socket && socket.connected && currentChatId) {
        socket.emit("leave_chat", currentChatId);
      }
    };
  }, [currentChatId, userobject_id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessageRead = ({ chatId, userId }) => {
      console.log(`User ${userId} has read messages in chat ${chatId}`);
      // You can add logic to update message state here if needed
    };

    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("message_read", handleMessageRead);
    };
  }, []);

  const handleSendMessage = useCallback(() => {
    const messageToSend = newMessage.trim();
    if (messageToSend && currentChatId) {
      const senderDetails = {
        first_name: loggedInUser || "Unknown",
      };

      const message = {
        chatId: currentChatId,
        sender: userobject_id,
        senderType: userTypeget,
        senderDetails,
        text: messageToSend,
        timestamp: new Date(),
        isPending: true,
      };

      // setMessages((prevMessages) => [...prevMessages, message]);

      socketRef.current.emit("sendMessage", message, (ack) => {
        if (ack.error) {
          console.error(`Message failed to send: ${ack.error}`);
        } else if (ack.messageDetails && ack.messageDetails._id) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.timestamp === message.timestamp
                ? { ...msg, ...ack.messageDetails, isPending: false }
                : msg
            )
          );
        }
      });

      setNewMessage("");
    }
  }, [newMessage, currentChatId, loggedInUser, userobject_id, userTypeget]);

  const providerCoachMessages = messages.filter((msg) => msg.chatId === chatRoomIds.providerCoachChatId);

  const messagesEndRef = useRef(null);


  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [providerCoachMessages]);

  return (
    <div className="clearfix p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="d-flex align-items-center pointer"
          onClick={() => {
            navigate(-1);
          }}
        >

          <img loading="lazy" src={BackArrow} height={15} width={9.6} alt="Back Arrow" />
          <h5 className="text-xl font-semibold mt-2 px-2">Message Coach</h5>
        </div>
      </div>


      <div className="position-relative">
        <Card className="bg-white shadow-lg rounded-lg p-4" style={{ height: "75vh", display: "flex", flexDirection: "column" }}>

          {/* Chat Messages (Scrollable Area) */}


          {loading ? <div className="chat-loader flex-items-center">
            <CSpinner color="success" />

          </div> : providerCoachMessages.length === 0 ? (<div className="chat-loader flex-items-center ">
            No messages yet. Start the conversation!
          </div>) :
            (<div style={{ flex: 1, overflowY: "auto", paddingBottom: "80px" }}>
              {providerCoachMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`d-flex flex-column ${msg.sender === userobject_id ? "align-items-end" : "align-items-start"} mt-3`}
                  style={{ width: "100%" }}
                >
                  {/* Message Meta */}
                  <div className="d-flex align-items-center" style={{ fontSize: "13px", color: "#666" }}>
                    {msg.sender !== userobject_id ? (
                      <>
                        <img loading="lazy"
                          src={senderProfileImage || base_url + coachImage}
                          alt="Patient Avatar"
                          className="rounded-circle me-2"
                          style={{ width: "35px", height: "35px" }}
                        />
                        <b className="text-black" style={{ marginLeft: "5px" }}>{msg.senderDetails?.first_name || "Unknown"}</b>
                        <span className="dotClass mx-1"></span>   {formatDate(msg.timestamp, "MM/dd/yyyy hh:mm a")}
                      </>
                    ) : (
                      <>
                        {formatDate(msg.timestamp, "MM/dd/yyyy hh:mm a")}  <span className="dotClass mx-1"></span> <b className="text-black">{msg.senderDetails?.first_name || "Unknown"}</b>
                        <img loading="lazy"
                          src={base_url + provideImage}
                          alt="Coach Avatar"
                          className="rounded-circle ms-2"
                          style={{ width: "35px", height: "35px" }}
                        />
                      </>
                    )}
                  </div>

                  {/* Message Box */}
                  <div
                    className="d-flex-rounded"
                    style={{
                      backgroundColor: msg.sender === userobject_id ? "#F7F7F7" : "#007E9E1A",
                      padding: "12px 15px",
                      marginRight: "35px",
                      marginLeft: "35px",
                      borderRadius: "8px",
                      maxWidth: "70%",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <p style={{ marginBottom: "0px" }}>{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>)}
          <div
            style={{
              position: "fix",
              bottom: "0",
              left: "0",
              width: "100%",
              backgroundColor: "white",
              padding: "10px",
            }}
          >
            <div className="col-12 d-flex row mb-2 shadow rounded " style={{ backgroundColor: "#F7F7F7" }}>
              <div className="mt-4 ms-1 d-flex align-items-center w-full">
                <input
                  type="text"
                  className="form-control w-100 me-3 p-2 p-3 mb-4 rounded bg-gray-200 border-0 chat-msg"
                  placeholder="enter your text here"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newMessage.trim()) {
                      handleSendMessage();
                      setNewMessage("");
                      setTimeout(scrollToBottom, 100);
                    }
                  }}
                />

                <div
                  style={{
                    backgroundColor: '#F88200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '5px',
                    height: "55%",
                    padding: '10px',
                    marginBottom: '24px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleSendMessage();
                    setTimeout(scrollToBottom, 100);
                  }}
                >
                  <img loading="lazy" src={Send} width={30} height={26} alt="Send" style={{ color: "white" }} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

  );
};

export default Messages;
