const Chat = require("../models/ChatModel.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");

// 🚫 Comprehensive Restricted Words List
const restrictedWords = [
  "abuse",
  "asshole",
  "bitch",
  "bastard",
  "bullshit",
  "crap",
  "damn",
  "dick",
  "dumbass",
  "fag",
  "fuck",
  "fucker",
  "fucking",
  "gay",
  "idiot",
  "jerk",
  "loser",
  "moron",
  "nigga",
  "nigger",
  "piss",
  "prick",
  "pussy",
  "retard",
  "shit",
  "slut",
  "stupid",
  "twat",
  "whore",
  "wanker",

  // 🚫 Racial & Discriminatory Words
  "chink",
  "spic",
  "wetback",
  "kike",
  "cracker",
  "gook",
  "raghead",
  "tranny",

  // 🚫 Sexual & Inappropriate Words
  "anal",
  "blowjob",
  "cock",
  "cunt",
  "dildo",
  "fisting",
  "handjob",
  "jizz",
  "masturbate",
  "nude",
  "orgasm",
  "penis",
  "porn",
  "rape",
  "sex",
  "sperm",
  "tits",
  "vagina",

  // 🚫 Common Misspellings & Variants (Leetspeak)
  "fuk",
  "fck",
  "sh1t",
  "a$$",
  "b1tch",
  "d1ck",
  "p0rn",
  "c0ck",
  "wh0re",
  "sl*t",
  "b@stard",
  "f@ggot",
  "n1gger",
  "h0e",
  "dumb@ss",
  "puss!y",
  "c*nt",

  // 🚫 Hate Speech & Extremism
  "terrorist",
  "isis",
  "hitler",
  "nazi",
  "klan",
  "kkk",

  // 🚫 Drug-Related Words
  "cocaine",
  "heroin",
  "meth",
  "weed",
  "marijuana",
  "ecstasy",
  "lsd",
  "crack",
  "opium",

  // 🚫 Self-Harm & Suicide
  "suicide",
  "kill myself",
  "cutting",
  "self harm",
  "die alone",

  // 🚫 Scam & Phishing Words
  "free money",
  "bitcoin scam",
  "pay me",
  "giveaway",
  "lottery",
  "win cash",
];

// 🚫 Function to detect URLs
const containsURL = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  return urlRegex.test(text);
};

// ✅ Send Message (Push into Existing Chat)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.userId;

    console.log("Receiver ID:", receiverId);
    console.log("Sender ID:", senderId);
    console.log("Text:", text);

    // Validate if IDs are correct MongoDB ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sender or receiver ID",
      });
    }

    if (!receiverId || !text) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message text are required",
      });
    }

    // 🚫 Check for restricted words
    const lowerCaseText = text.toLowerCase();
    if (restrictedWords.some((word) => lowerCaseText.includes(word))) {
      return res.status(400).json({
        success: false,
        message: "Message contains restricted words.",
      });
    }

    // 🚫 Check for URLs
    if (containsURL(text)) {
      return res.status(400).json({
        success: false,
        message: "Message cannot contain URLs.",
      });
    }

    // Generate unique chatId (Ensuring consistent order)
    const chatId =
      senderId.toString() < receiverId.toString()
        ? `${senderId}_${receiverId}`
        : `${receiverId}_${senderId}`;

    // Find or create chat
    let chat = await Chat.findOne({ chatId });

    if (!chat) {
      chat = new Chat({
        chatId,
        senderId,
        receiverId,
        messages: [],
      });
      await chat.save();
    }

    // Add new message
    const newMessage = {
      sender: senderId,
      receiver: receiverId,
      text,
      timestamp: new Date(),
      seen: false,
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Get All Messages in a Chat
const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user.userId;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    // Generate unique chatId (Ensuring consistent order)
    const chatId =
      senderId < receiverId
        ? `${senderId}_${receiverId}`
        : `${receiverId}_${senderId}`;

    // ✅ Mark all unread messages (where current user is the receiver) as seen
    await Chat.updateOne(
      { chatId },
      {
        $set: { "messages.$[elem].seen": true },
      },
      {
        arrayFilters: [
          {
            "elem.receiver": senderId, // current user is receiver of those messages
            "elem.seen": false,
          },
        ],
      }
    );

    // Find chat and populate sender & receiver details
    const chat = await Chat.findOne({ chatId })
      .populate("messages.sender", "name email") // Populate sender details
      .populate("messages.receiver", "name email"); // Populate receiver details

    if (!chat) {
      return res.status(200).json({
        success: true,
        message: "No messages found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: chat.messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Get All Chats of Logged-in User
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type } = req.query;

    if (!type || (type !== "seller" && type !== "buyer")) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter. Type must be 'seller' or 'buyer'.",
      });
    }

    const filter =
      type === "buyer" ? { senderId: userId } : { receiverId: userId };

    const chats = await Chat.find(filter)
      .populate("senderId", "name email profileImage phone")
      .populate("receiverId", "name email profileImage phone")
      .sort({ updatedAt: -1 });

    if (!chats.length) {
      return res.status(200).json({
        success: true,
        message: "No chats found.",
        data: [],
      });
    }

    // Format response to exclude self from user details
    const chatList = chats.map((chat) => {
      const otherUser =
        chat.senderId._id.toString() === userId
          ? chat.receiverId
          : chat.senderId;
      const lastMsg = chat.messages[chat.messages.length - 1];
      const isUnread =
        lastMsg && !lastMsg.seen && lastMsg.sender.toString() !== userId;

      return {
        chatId: chat.chatId,
        user: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          profileImage: otherUser.profileImage,
          phone: otherUser.phone,
        },
        lastMessage: chat.messages?.length
          ? chat.messages[chat.messages.length - 1].text
          : "No messages yet",
        lastMessageTime: chat.updatedAt,
        unread: isUnread, // 👈 Flag to tell if this chat has unread last message
      };
    });

    res.status(200).json({
      success: true,
      message: "Chats retrieved successfully",
      data: chatList,
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { sendMessage, getMessages, getUserChats };
