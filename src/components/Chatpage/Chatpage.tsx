// import { useEffect, useRef, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import axios from "axios";
// import "./Chatpage.css";

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
// const API_URL = import.meta.env.VITE_API_BASE_URL;

// let socket: Socket;

// export default function Chatpage() {
//   const user = JSON.parse(localStorage.getItem("user") || "{}");

//   const [users, setUsers] = useState<any[]>([]);
//   const [search, setSearch] = useState("");
//   const [selectedUser, setSelectedUser] = useState<any>(null);

//   const [messages, setMessages] = useState<any[]>([]);
//   const [message, setMessage] = useState("");

  
// const [hasMore, setHasMore] = useState(true);
// const [loadingOld, setLoadingOld] = useState(false);

//   const chatEndRef = useRef<HTMLDivElement>(null);

//   /* ================= SOCKET INIT ================= */

//   useEffect(() => {
//     socket = io(SOCKET_URL, {
//       transports: ["websocket"],
//     });

//     socket.on("connect", () => {
//       console.log("✅ Socket connected:", socket.id);
//     });

//     socket.on("receive_message", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   /* ================= FETCH CHAT USERS ================= */

//   const fetchChatUsers = async (searchText = "") => {
//     try {
//       const res = await axios.get(
//         `${API_URL}/getChatUsers`,
//         {
//           params: {
//             userId: user.id,
//             search: searchText,
//           },
//         }
//       );

//       setUsers(res.data?.apiResponseData || []);
//     } catch (error) {
//       console.error("Failed to load chat users");
//     }
//   };

//   useEffect(() => {
//     fetchChatUsers();
//   }, []);

//   useEffect(() => {
//     const delay = setTimeout(() => {
//       fetchChatUsers(search);
//     }, 300);

//     return () => clearTimeout(delay);
//   }, [search]);

//   /* ================= AUTO SCROLL ================= */

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   /* ================= ROOM ID ================= */

//   const getRoomId = (id1: string, id2: string) =>
//     [id1, id2].sort().join("_");

//   /* ================= SELECT USER ================= */
//   const handleSelectUser = async (u: any) => {
//     setSelectedUser(u);
  
//     await loadChatHistory(u._id);
  
//     const roomId = getRoomId(user.id, u._id);
//     socket.emit("join_room", { roomId });
//   };

//   /* ================= SEND MESSAGE ================= */

//   const sendMessage = () => {
//     if (!message.trim() || !selectedUser) return;

//     const roomId = getRoomId(user.id, selectedUser._id);

//     const payload = {
//       senderId: user.id,
//       receiverId: selectedUser._id,
//       roomId,
//       message,
//     };

//     socket.emit("send_message", payload);

//     // optimistic UI
//     // setMessages((prev) => [...prev, payload]);
//     setMessage("");
//   };

//   const loadChatHistory = async (otherUserId: string) => {
//     const res = await axios.get(
//       `${import.meta.env.VITE_API_BASE_URL}/getChatMessages`,
//       {
//         params: {
//           userId: user.id,
//           otherUserId,
//         },
//       }
//     );
  
//     setMessages(res.data?.apiResponseData || []);
//   };
//   const formatTime = (date: string) => {
//     return new Date(date).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };


//   const loadInitialMessages = async (otherUserId: string) => {
//     const res = await axios.get(
//       `${API_URL}/getChatMessages`,
//       {
//         params: {
//           userId: user.id,
//           otherUserId,
//           limit: 20,
//         },
//       }
//     );
  
//     const data = res.data?.apiResponseData || [];
  
//     setMessages(data.reverse()); // oldest → newest
//     setHasMore(data.length === 20);
//   };

//   const loadOlderMessages = async () => {
//     if (!hasMore || loadingOld || messages.length === 0) return;
  
//     setLoadingOld(true);
  
//     const oldestMessage = messages[0];
  
//     const res = await axios.get(
//       `${API_URL}/getChatMessages`,
//       {
//         params: {
//           userId: user.id,
//           otherUserId: selectedUser._id,
//           limit: 20,
//           before: oldestMessage.createdAt,
//         },
//       }
//     );
  
//     const data = res.data?.apiResponseData || [];
  
//     if (data.length < 20) setHasMore(false);
  
//     setMessages((prev) => [...data.reverse(), ...prev]);
  
//     setLoadingOld(false);
//   };
//   const chatRef = useRef<HTMLDivElement>(null);

//   const handleScroll = () => {
//     if (!chatRef.current) return;
  
//     if (chatRef.current.scrollTop === 0) {
//       loadOlderMessages();
//     }
//   };  

  

//   return (
//     <div className="page-container">
//       <div className="chat-page-wrapper">
//         <div className="chat-page">
//           {/* ================= LEFT ================= */}
//           <div className="chat-sidebar">
//             <h3>Chats</h3>

//             <input
//               className="chat-search"
//               placeholder="Search users"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />

//             <ul className="user-list">
//               {users.map((u) => (
//                 <li
//                   key={u._id}
//                   className={selectedUser?._id === u._id ? "active" : ""}
//                   onClick={() => handleSelectUser(u)}
//                 >
//                   <div className="user-name">{u.name}</div>
//                   <div className="user-role">{u.role}</div>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* ================= RIGHT ================= */}
//           <div className="chat-window">
//             {selectedUser ? (
//               <>
//                 <div className="chat-header">
//                   <strong>{selectedUser.name}</strong>
//                 </div>

//                 <div className="chat-messages"  ref={chatRef} onScroll={handleScroll}>
//                   {messages.map((m, i) => (
//                    <div
//                    className={`chat-message ${
//                      m.senderId === user.id ? "sent" : "received"
//                    }`}
//                  >
//                    <div className="message-text">{m.message}</div>
//                    <div className="message-time">
//                      {formatTime(m.createdAt)}
//                    </div>
//                  </div>
//                   ))}
//                   <div ref={chatEndRef} />
//                 </div>

//                 <div className="chat-input">
//                   <label className="attach-btn">📎
//                     <input type="file" hidden />
//                   </label>

//                   <input
//                     placeholder="Type a message"
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//                   />

//                   <button onClick={sendMessage}>Send</button>
//                 </div>
//               </>
//             ) : (
//               <div className="chat-empty">
//                 Select a user to start chatting
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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

  const [hasMore, setHasMore] = useState(true);
  const [loadingOld, setLoadingOld] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ================= SOCKET INIT ================= */

  useEffect(() => {
    socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ================= FETCH CHAT USERS ================= */

  const fetchChatUsers = async (searchText = "") => {
    const res = await axios.get(`${API_URL}/getChatUsers`, {
      params: { userId: user.id, search: searchText },
    });

    setUsers(res.data?.apiResponseData || []);
  };

  useEffect(() => {
    fetchChatUsers();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => fetchChatUsers(search), 300);
    return () => clearTimeout(delay);
  }, [search]);

  /* ================= ROOM ID ================= */

  const getRoomId = (a: string, b: string) => [a, b].sort().join("_");

  /* ================= LOAD MESSAGES ================= */

  const loadInitialMessages = async (otherUserId: string) => {
    const res = await axios.get(`${API_URL}/getChatMessages`, {
      params: {
        userId: user.id,
        otherUserId,
        limit: 20,
      },
    });

    const data = res.data?.apiResponseData || [];
    setMessages(data.reverse());
    setHasMore(data.length === 20);

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView();
    }, 0);
  };

  const loadOlderMessages = async () => {
    if (!hasMore || loadingOld || messages.length === 0) return;

    setLoadingOld(true);

    const oldest = messages[0];
    const prevHeight = chatRef.current!.scrollHeight;

    const res = await axios.get(`${API_URL}/getChatMessages`, {
      params: {
        userId: user.id,
        otherUserId: selectedUser._id,
        limit: 20,
        before: oldest.createdAt,
      },
    });

    const data = res.data?.apiResponseData || [];
    if (data.length < 20) setHasMore(false);

    setMessages((prev) => [...data.reverse(), ...prev]);

    setTimeout(() => {
      const newHeight = chatRef.current!.scrollHeight;
      chatRef.current!.scrollTop = newHeight - prevHeight;
    }, 0);

    setLoadingOld(false);
  };

  /* ================= SCROLL ================= */

  const handleScroll = () => {
    if (chatRef.current?.scrollTop === 0) {
      loadOlderMessages();
    }
  };

  /* ================= SELECT USER ================= */

  const handleSelectUser = async (u: any) => {
    setSelectedUser(u);
    await loadInitialMessages(u._id);

    const roomId = getRoomId(user.id, u._id);
    socket.emit("join_room", { roomId });
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const payload = {
      senderId: user.id,
      receiverId: selectedUser._id,
      roomId: getRoomId(user.id, selectedUser._id),
      message,
    };

    socket.emit("send_message", payload);
    setMessage("");
  };

  /* ================= DATE HELPERS ================= */

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDateLabel = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ================= RENDER ================= */

  let lastDate = "";

  return (
    <div className="page-container">
        <div className="chat-page">
          {/* LEFT */}
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

          {/* RIGHT */}
          <div className="chat-window">
            {selectedUser ? (
              <>
                <div className="chat-header">
                  <strong>{selectedUser.name}</strong>
                </div>

                <div
                  className="chat-messages"
                  ref={chatRef}
                  onScroll={handleScroll}
                >
                  {messages.map((m, i) => {
                    const dateLabel = formatDateLabel(m.createdAt);
                    const showDate = dateLabel !== lastDate;
                    lastDate = dateLabel;

                    return (
                        <div key={i}>
                        {showDate && (
                          <div className="date-separator">
                            {dateLabel}
                          </div>
                        )}
                      
                        <div
                          className={`message-row ${
                            m.senderId === user.id ? "right" : "left"
                          }`}
                        >
                          <div
                            className={`chat-message ${
                              m.senderId === user.id ? "sent" : "received"
                            }`}
                          >
                            <div>{m.message}</div>
                            <div className="message-time">
                              {formatTime(m.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    );
                  })}
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
  );
}
