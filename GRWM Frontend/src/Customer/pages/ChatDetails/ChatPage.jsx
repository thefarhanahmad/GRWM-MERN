import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { HiMenu, HiX } from "react-icons/hi";

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const { type = "seller" } = useParams();
  const [showSidebar, setShowSidebar] = useState(true); // Sidebar state for mobile
  const userType = type;

  const { pathname } = useLocation();
  const currentChatId = pathname.split("/chat/")[1]?.split("/")[1] || null;

  console.log("current chat id  : ", currentChatId);
  const token =
    useSelector((state) => state.user?.token) || localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchChats(userType);
  }, [userType]);

  useEffect(() => {
    // On small screen, hide sidebar after selecting chat
    if (currentChatId) {
      setShowSidebar(false);
    }
  }, [currentChatId]);

  const fetchChats = async (type) => {
    try {
      const res = await axios.get(`${baseUrl}/my-chats?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("chat sidebar res : ", res);
      setChats(res.data.data);
    } catch (error) {
      console.error("Error fetching chats:", error.response?.data?.message);
    }
  };
  console.log("chats : ", chats);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with hamburger (mobile only) */}
      <div className="flex items-center justify-between p-4 md:hidden border-b shadow-sm">
        <h2 className="text-xl font-semibold">Messages</h2>
        <button
          className="text-2xl"
          onClick={() => setShowSidebar((prev) => !prev)}
        >
          {showSidebar ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Toggle Tabs */}
      <div className="px-4 md:px-6 pt-3 md:pt-6 pb-2 border-b border-gray-200 flex space-x-4 text-sm md:text-base">
        <Link
          to="/chat/seller"
          className={`px-2 md:px-4 py-2 border-b-2 transition ${
            userType === "seller"
              ? "border-black text-black font-semibold"
              : "border-transparent text-gray-500"
          }`}
        >
          Selling Chats
        </Link>
        <Link
          to="/chat/buyer"
          className={`px-2 md:px-4 py-2 border-b-2 transition ${
            userType === "buyer"
              ? "border-black text-black font-semibold"
              : "border-transparent text-gray-500"
          }`}
        >
          Buying Chats
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex h-[calc(100vh-140px)] md:h-[80vh]">
        {/* Sidebar */}
        <aside
          className={`absolute md:static top-0 left-0 z-30 w-72 md:w-1/4 bg-gray-100 p-4 h-[80vh] overflow-y-auto border-r transform transition-transform duration-300 ease-in-out
          ${
            showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">Chats</h2>

          {chats?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[80%] text-gray-500">
              {/* Empty inbox icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mb-3 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4l-2 3-2-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              <p className="text-lg font-semibold">Your inbox is empty</p>
              <p className="text-sm text-gray-400 text-center">
                Start a new conversation and connect with others.
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.chatId}
                to={`/chat/${userType}/${chat?.user?._id}`}
                className={`block p-3 mb-3 ${
                  currentChatId === chat?.user?._id
                    ? "bg-gray-800 text-white"
                    : "bg-white"
                } rounded-lg shadow-md`}
              >
                <div className="flex items-center justify-between p-1 transition-all relative rounded-md">
                  <div className="flex items-center gap-3 flex-1">
                    {chat?.user?.profileImage ? (
                      <div className="relative">
                        <img
                          src={chat.user.profileImage}
                          alt={chat.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {chat.unread && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 border-white border-2 rounded-full" />
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-base">
                        {chat?.user?.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate max-w-[200px]">
                        {chat?.user?.name}
                      </span>
                      <span
                        className={`text-sm truncate max-w-[200px] ${
                          chat.unread ? "font-semibold" : ""
                        }`}
                      >
                        {chat?.lastMessage
                          ? chat.lastMessage.length > 30
                            ? `${chat.lastMessage.slice(0, 30)}...`
                            : chat.lastMessage
                          : "No messages yet"}
                      </span>
                    </div>
                  </div>

                  <div className="ml-2 text-xs whitespace-nowrap">
                    {chat?.lastMessageTime
                      ? new Date(chat.lastMessageTime).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : ""}
                  </div>
                </div>
              </Link>
            ))
          )}
        </aside>

        {/* Chat Main Section */}
        <main
          className={`flex-1 bg-white px-4 md:px-6 py-4 md:py-6 overflow-y-auto w-full transition-all duration-300
          ${showSidebar ? "hidden md:block" : "block"}`}
        >
          {!currentChatId ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2462/2462719.png"
                alt="No chat selected"
                className="w-32 h-32 mb-4 opacity-80"
              />
              <h2 className="text-xl font-semibold mb-2">
                No conversation selected
              </h2>
              <p className="text-sm text-center max-w-sm">
                Select a conversation from the sidebar to start chatting. Your
                messages will appear here.
              </p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
