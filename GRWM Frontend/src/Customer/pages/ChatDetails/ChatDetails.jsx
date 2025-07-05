import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const baseUrl = import.meta.env.VITE_BASE_URL;
const chatUrl = import.meta.env.VITE_CHAT_URL;
const socket = io(chatUrl, { transports: ["websocket"] });

const ChatDetail = () => {
  const { receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const user = useSelector((state) => state.user?.user);
  const token =
    useSelector((state) => state.user?.token) || localStorage.getItem("token");

  const [selectedUser, setSelectedUser] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [firstSender, setFirstSender] = useState(null);

  const senderMessages = [
    "Is this product available?",
    "Can I get any discount on the product?",
    "What are the measurements for the product?",
    "Expected delivery time?",
    "Yes",
    "No",
    "Okay",
    "Thanks",
  ];

  useEffect(() => {
    // Reset unread count
    if (window?.setUnreadCount) window.setUnreadCount(0);
  }, []);

  // ✅ Join socket and listen for messages
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);
    console.log("🟢 Joined socket as:", user._id);

    const handleMessage = (data) => {
      console.log("📩 Real-time message received:", data);
      // ✅ Always show message if it's coming from other user OR same
      if (
        String(data.senderId) === String(receiverId) ||
        String(data.senderId) === String(user._id)
      ) {
        setMessages((prev) => [
          ...prev,
          {
            sender: { _id: data.senderId },
            text: data.message,
            timestamp: data.timestamp,
          },
        ]);
      }
    };

    socket.on("receive-message", handleMessage);

    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, [user?._id, receiverId]);

  // ✅ Fetch messages initially
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${baseUrl}/messages/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFirstSender(res?.data?.data[0]?.sender || null);
        setMessages(res.data.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (receiverId && user?._id) fetchMessages();
  }, [receiverId, user?._id]);

  // ✅ Fetch receiver details
  useEffect(() => {
    const fetchReceiver = async () => {
      try {
        const res = await axios.get(`${baseUrl}/user/${receiverId}`);
        if (res.data.success) {
          setSelectedUser(res.data.user);
        }
      } catch (error) {
        console.error("Error fetching receiver:", error);
      }
    };

    if (receiverId) fetchReceiver();
  }, [receiverId]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;
    try {
      const res = await axios.post(
        `${baseUrl}/send-msg`,
        { receiverId, text: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newMsg = {
        ...res.data.data,
        sender: { _id: user._id },
      };

      setMessages((prev) => [...prev, newMsg]);

      // 🔥 Real-time emit
      socket.emit("send-message", {
        senderId: user._id,
        receiverId,
        message,
      });
      console.log("📤 Emitting message:", {
        senderId: user._id,
        receiverId,
        message,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const isSenderAllowedToSendPredefined =
    messages.length === 0 || (firstSender && firstSender._id === user._id);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-black text-white text-start font-semibold text-lg flex items-center gap-3">
        {selectedUser?.profileImage ? (
          <img
            src={selectedUser.profileImage}
            alt={selectedUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-bold">
            {selectedUser?.name?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span>{selectedUser?.name}</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          messages.map((msg, index) => {
            const isUserMessage = String(msg.sender._id) === String(user._id);
            return (
              <div
                key={index}
                className={`p-3 my-2 rounded-lg max-w-[60%] ${
                  isUserMessage
                    ? "bg-gray-200 text-black self-end rounded-br-none shadow-md"
                    : "bg-white text-black self-start rounded-bl-none shadow-md border border-gray-300"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs text-gray-500 block mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        {isSenderAllowedToSendPredefined ? (
          <>
            <p className="text-gray-600 mb-2">Choose a question:</p>
            <div className="flex flex-wrap gap-2">
              {senderMessages.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(msg)}
                  className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  {msg}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchInput.trim()) {
                  sendMessage(searchInput);
                  setSearchInput("");
                }
              }}
            />
            <button
              onClick={() => {
                if (searchInput.trim()) {
                  sendMessage(searchInput);
                  setSearchInput("");
                }
              }}
              className="p-3 px-5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDetail;
