import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import Send from "../../../../assets/icons/chat.png";
import { formatDate } from "../../../../utils/dateUtils";
import { base_url } from "../../../../global/global";
import { CSpinner } from "@coreui/react";
import { useNotifications } from "../../../../Components/header/Notifications";

const Communication = ({ state }) => {
  const { markMessageChatAsRead } = useNotifications();
  const [isEdit, setIsEdit] = useState("md");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRoomIds, setChatRoomIds] = useState({ providerCoachChatId: null, patientCoachChatId: null });
  const [currentChatId, setCurrentChatId] = useState(state?.chatId || null);
  const loggedInUser = useSelector((state) => state?.user?.userData?.first_name);
  const userobject_id = useSelector((state) => state?.user?.id);
  const userTypeget = useSelector((state) => state?.user?.userType);
  const coachImage = useSelector((state) => state?.user?.profileData?.profile_img);
  const patientId = state?._id ? state?._id : state?.patientId;
  const patientImage = useSelector((state) => state?.allPatients?.patient?.patientData?.profile_img);
  const {
    senderProfileImage,
  } = state || {};
  const providerImage = useSelector((state) => state?.allPatients?.patient?.patientData?.provider?.profile_img);
  const socketRef = useRef();
  const currentChatIdRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);
  const chatParticipantImage = isEdit === "md" ? providerImage || patientImage : patientImage;

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

        const notificationChatId = state?.chatId;
        const targetChatId = notificationChatId
          ? notificationChatId
          : isEdit === "md" ? data.providerCoachChatId : data.patientCoachChatId;
        setCurrentChatId(targetChatId || null);
      } else {
        console.error("Missing room IDs in room_created event:", data);
      }
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socketRef.current.on("chatHistory", (fetchedMessages) => {
      setIsLoading(false);
      if (fetchedMessages.length > 0) {
        setMessages((prevMessages) => {
          const allMessages = [...prevMessages, ...fetchedMessages];
          const uniqueMessages = Array.from(new Map(allMessages.map((msg) => [msg._id, msg])).values());
          return uniqueMessages;
        });
      } else {
        console.log('📭 No messages in chat history');
      }
    });

    // Handle new messages
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

    if (userobject_id && userTypeget && patientId) {
      socketRef.current.emit("getChatRooms", { userId: userobject_id, userType: userTypeget, patientId });

      socketRef.current.on("chatRooms", (data) => {
        if (data.error) {
          console.error('❌ ChatRooms error:', data.error);
          setIsLoading(false);
          return;
        }

        const providerCoachChatId = data.chatRooms?.find((room) => room.chatType === "Provider-Coach")?._id || null;
        const patientCoachChatId = data.chatRooms?.find((room) => room.chatType === "Patient-Coach")?._id || null;


        setChatRoomIds({ providerCoachChatId, patientCoachChatId });

        const notificationChatId = state?.chatId;
        const targetChatId = notificationChatId
          ? notificationChatId
          : isEdit === "md" ? providerCoachChatId : patientCoachChatId;

        setCurrentChatId(targetChatId || null);

        if (targetChatId) {
          socketRef.current.emit("getChat", targetChatId);
        }
      });
    }

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

  // When arriving via notifications, ensure correct tab is selected based on chatId
  useEffect(() => {
    if (!state?.chatId) return;
    const { providerCoachChatId, patientCoachChatId } = chatRoomIds || {};
    if (state.chatId === patientCoachChatId) {
      setIsEdit("patient");
      setCurrentChatId(state.chatId);
    } else if (state.chatId === providerCoachChatId) {
      setIsEdit("md");
      setCurrentChatId(state.chatId);
    }
  }, [state?.chatId, chatRoomIds]);

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // React to chatId changes from navigation state (e.g., switching notifications/patients)
  useEffect(() => {
    if (state?.chatId) {
      setCurrentChatId(state.chatId);
    }
  }, [state?.chatId]);

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

  const toggle = (val) => {
    setIsEdit(val);

    const targetChatId = val === "md" ? chatRoomIds.providerCoachChatId : chatRoomIds.patientCoachChatId;
    setCurrentChatId(targetChatId);
  };

  const providerCoachMessages = messages.filter((msg) => msg.chatId === chatRoomIds.providerCoachChatId);
  const patientCoachMessages = messages.filter((msg) => msg.chatId === chatRoomIds.patientCoachChatId);

  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!currentChatId) return;
    // Whenever messages change, check for unread in current chat
    const unread = messages.some(msg => !msg.readBy?.includes(userobject_id) && msg.chatId === currentChatId);
    if (unread) {
      markMessageChatAsRead(currentChatId);
    }
  }, [messages, currentChatId, userobject_id]);
  // Scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [isEdit, providerCoachMessages, patientCoachMessages]);

  return (
    <>

      <div className="default-container mt-3  bg-white" >
        <div className="clearfix">
          <div className="rounded  ms-3 me-1 " >
            <div>
              <ul className="nav nav-tabs mb-4 " id="patientTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    style={{ color: isEdit === "md" ? "#F88200" : "grey" }}
                    onClick={() => toggle("md")}
                  >
                    <b>MD Chat Log</b>
                  </button>
                </li>
                <li className="nav-item " role="presentation">
                  <button
                    className="nav-link"
                    style={{ color: isEdit === "patient" ? "#F88200" : "grey" }}
                    onClick={() => toggle("patient")}
                  >
                    <b>Patient Chat Log</b>
                  </button>
                </li>
              </ul>
            </div>


            {isLoading ? (
              <div className="flex-items-center my-5">
                <CSpinner color="success" />
              </div>
            ) :
              (isEdit === "md" ? providerCoachMessages : patientCoachMessages).length > 0 ? (
                <div style={{ maxHeight: "65vh", overflowY: "auto", paddingBottom: "80px" }}>
                  {(isEdit === "md" ? providerCoachMessages : patientCoachMessages).map((msg, index) => (
                    <div
                      key={index}
                      className={`d-flex flex-column ${msg.sender === userobject_id ? "align-items-end" : "align-items-start"} `}
                      style={{ width: "100%" }}
                    >
                      <div className="d-flex align-items-center" style={{ fontSize: "13px", color: "#666", margin: "2px" }}>
                        {msg.sender !== userobject_id && (
                          <>
                            <img loading="lazy"
                              src={
                                senderProfileImage || base_url + (chatParticipantImage)
                              }
                              alt="Patient Avatar"
                              className="rounded-circle me-2"
                              style={{ width: "35px", height: "35px" }}
                            />
                            <b style={{ marginLeft: "5px" }} className="text-black">{msg.senderDetails?.first_name || "Unknown"}</b>
                            <span className="dotClass mx-1"></span> {formatDate(msg.timestamp, "MM/dd/yyyy hh:mm a")}
                          </>
                        )}
                        {msg.sender === userobject_id && (
                          <>
                            {formatDate(msg.timestamp, "MM/dd/yyyy hh:mm a")} <span className="dotClass mx-1"></span> <b className="text-black" >{msg.senderDetails?.first_name || "Unknown"}</b>
                            <img loading="lazy"
                              src={base_url + coachImage}
                              alt="Coach Avatar"
                              className="rounded-circle ms-2"
                              style={{ width: "35px", height: "35px" }}
                            />
                          </>
                        )}
                      </div>
                      <div
                        className="d-flex-rounded"
                        style={{
                          backgroundColor: msg.sender === userobject_id ? "#D0E5D2" : "#FCF9E4",
                          padding: "12px 15px",
                          marginRight: "35px",
                          marginLeft: "35px",
                          borderRadius: "8px",
                          maxWidth: "70%",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <div className="markdown-container">
                          <ReactMarkdown>{msg.text || ""}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center my-5">
                  No messages yet. Start the conversation!
                </div>
              )}
            {/* Messages Container */}
            <div
              style={{
                position: "fix",
                bottom: "0",
                left: "0",
                width: "100%",
                backgroundColor: "white"
              }}
            >
              <div className="col-12 d-flex row mb-2 shadow rounded bg-white">
                <div className="mt-4 ms-1 d-flex align-items-center w-full">
                  <input
                    key={isEdit}
                    type="text"
                    className="form-control w-100 me-3 p-3 mb-4 rounded bg-gray-200 border-0 chat-msg"
                    style={{ backgroundColor: "#F1F1F1" }}
                    placeholder="Write Your Message Here"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        handleSendMessage('');
                        setNewMessage('');
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
                    <img loading="lazy"
                      src={Send}
                      width={30}
                      height={26}
                      alt="Send"
                      style={{ color: 'white' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>


  );
};

export default Communication;
