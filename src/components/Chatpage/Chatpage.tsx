import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import "./Chatpage.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = import.meta.env.VITE_API_BASE_URL;

let socket: Socket;

export default function Chatpage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ================= SOCKET INIT ================= */

  useEffect(() => {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ================= FETCH CHAT USERS ================= */

  const fetchChatUsers = async (searchText = "") => {
    try {
      const res = await axios.get(
        `${API_URL}/getChatUsers`,
        {
          params: {
            userId: user.id,
            search: searchText,
          },
        }
      );

      setUsers(res.data?.apiResponseData || []);
    } catch (error) {
      console.error("Failed to load chat users");
    }
  };

  useEffect(() => {
    fetchChatUsers();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchChatUsers(search);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= ROOM ID ================= */

  const getRoomId = (id1: string, id2: string) =>
    [id1, id2].sort().join("_");

  /* ================= SELECT USER ================= */

  const handleSelectUser = (u: any) => {
    setSelectedUser(u);
    setMessages([]);

    const roomId = getRoomId(user.id, u._id);
    socket.emit("join_room", { roomId });
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const roomId = getRoomId(user.id, selectedUser._id);

    const payload = {
      senderId: user.id,
      receiverId: selectedUser._id,
      roomId,
      message,
    };

    socket.emit("send_message", payload);

    // optimistic UI
    // setMessages((prev) => [...prev, payload]);
    setMessage("");
  };

  return (
    <div className="page-container">
      <div className="chat-page-wrapper">
        <div className="chat-page">
          {/* ================= LEFT ================= */}
          <div className="chat-sidebar">
            <h3>Chats</h3>

            <input
              className="chat-search"
              placeholder="Search users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <ul className="user-list">
              {users.map((u) => (
                <li
                  key={u._id}
                  className={selectedUser?._id === u._id ? "active" : ""}
                  onClick={() => handleSelectUser(u)}
                >
                  <div className="user-name">{u.name}</div>
                  <div className="user-role">{u.role}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="chat-window">
            {selectedUser ? (
              <>
                <div className="chat-header">
                  <strong>{selectedUser.name}</strong>
                </div>

                <div className="chat-messages">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`chat-message ${
                        m.senderId === user.id ? "sent" : "received"
                      }`}
                    >
                      {m.message}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="chat-input">
                  <label className="attach-btn">📎
                    <input type="file" hidden />
                  </label>

                  <input
                    placeholder="Type a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />

                  <button onClick={sendMessage}>Send</button>
                </div>
              </>
            ) : (
              <div className="chat-empty">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
