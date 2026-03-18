"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatWindow from "../../components/ChatWindow";
import Navbar from "../../components/Navbar";
import ProfilePanel from "../../components/ProfilePanel";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { connectSocket, disconnectSocket, getSocket } from "../../services/socket";

const getParticipantId = (value) => (typeof value === "string" ? value : value?._id);

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    token,
    authReady,
    logout,
    updateCurrentUser
  } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [profileTarget, setProfileTarget] = useState(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const lastSearchRef = useRef("");
  const selectedUserRef = useRef(null);
  const pendingOfflineRef = useRef(new Map());
  const selectedUserId = selectedUser?._id || null;
  const activeSelectedUser = useMemo(() => {
    if (!selectedUserId) {
      return null;
    }

    return users.find((item) => item._id === selectedUserId) || selectedUser;
  }, [users, selectedUserId, selectedUser]);

  useEffect(() => {
    selectedUserRef.current = activeSelectedUser;
  }, [activeSelectedUser]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileChatOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(
    () => () => {
      pendingOfflineRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      pendingOfflineRef.current.clear();
    },
    []
  );

  useEffect(() => {
    if (authReady && !token) {
      router.replace("/login");
    }
  }, [authReady, token, router]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const loadUsers = async () => {
      setSidebarLoading(true);

      try {
        const { data } = await api.get("/users");

        if (!active) {
          return;
        }

        setUsers(data);
        setSelectedUser((prev) => {
          if (prev) {
            return data.find((item) => item._id === prev._id) || data[0] || null;
          }

          return data[0] || null;
        });
      } catch (error) {
        if (active) {
          setChatError(error.response?.data?.message || "Unable to load users");
        }
      } finally {
        if (active) {
          setSidebarLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !user?._id) {
      return undefined;
    }

    const socket = connectSocket();

    const handleConnect = () => {
      socket.emit("user_online", user._id);
    };

    const handleReceiveMessage = async (message) => {
      const senderId = getParticipantId(message.sender);
      const receiverId = getParticipantId(message.receiver);
      const chatPartnerId = senderId === user._id ? receiverId : senderId;
      const activeChat = selectedUserRef.current;

      setLastMessages((prev) => ({ ...prev, [chatPartnerId]: message }));

      if (
        activeChat &&
        ((senderId === activeChat._id && receiverId === user._id) ||
          (senderId === user._id && receiverId === activeChat._id))
      ) {
        setMessages((prev) => {
          const exists = prev.some((item) => item._id && item._id === message._id);
          return exists ? prev : [...prev, message];
        });
      }

      if (senderId === activeChat?._id && receiverId === user._id) {
        try {
          await api.patch(`/messages/read/${activeChat._id}`);
          socket.emit("messages_read", {
            senderId: user._id,
            receiverId: activeChat._id
          });
        } catch (error) {
          console.error("Failed to sync read receipt", error);
        }
      }
    };

    const applyPresenceState = (userId, status, lastSeen) => {
      setUsers((prev) =>
        prev.map((item) => {
          if (item._id !== userId) {
            return item;
          }

          const nextLastSeen = lastSeen || item.lastSeen;
          if (item.status === status && item.lastSeen === nextLastSeen) {
            return item;
          }

          return {
            ...item,
            status,
            lastSeen: nextLastSeen
          };
        })
      );

      if (selectedUserRef.current?._id === userId) {
        selectedUserRef.current = {
          ...selectedUserRef.current,
          status,
          lastSeen: lastSeen || selectedUserRef.current.lastSeen
        };
      }

      if (userId === user._id) {
        updateCurrentUser((prev) => {
          const nextLastSeen = lastSeen || new Date().toISOString();
          if (prev.status === status && prev.lastSeen === nextLastSeen) {
            return prev;
          }

          return {
            status,
            lastSeen: nextLastSeen
          };
        });
      }
    };

    const handlePresence = ({ userId, status, lastSeen }) => {
      const pendingOffline = pendingOfflineRef.current.get(userId);

      if (pendingOffline) {
        clearTimeout(pendingOffline);
        pendingOfflineRef.current.delete(userId);
      }

      if (status === "online") {
        applyPresenceState(userId, "online", lastSeen);
        return;
      }

      const timeoutId = setTimeout(() => {
        applyPresenceState(userId, "offline", lastSeen);
        pendingOfflineRef.current.delete(userId);
      }, 2500);

      pendingOfflineRef.current.set(userId, timeoutId);
    };

    const handleTyping = ({ senderId, receiverId }) => {
      if (receiverId !== user._id) {
        return;
      }

      setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
    };

    const handleStopTyping = ({ senderId, receiverId }) => {
      if (receiverId !== user._id) {
        return;
      }

      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[senderId];
        return next;
      });
    };

    const handleMessagesRead = ({ senderId, receiverId, byUserId, userId }) => {
      const currentChatId = selectedUserRef.current?._id;
      const readById = byUserId || senderId;
      const relatedUserId = userId || receiverId;

      if (!currentChatId || (readById !== currentChatId && relatedUserId !== currentChatId)) {
        return;
      }

      setMessages((prev) =>
        prev.map((item) => {
          const itemReceiverId = getParticipantId(item.receiver);
          if (itemReceiverId === currentChatId) {
            return { ...item, read: true };
          }

          return item;
        })
      );
    };

    socket.on("connect", handleConnect);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_presence", handlePresence);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("messages_read", handleMessagesRead);

    socket.emit("user_online", user._id);

    return () => {
      const currentSocket = getSocket();
      currentSocket?.off("connect", handleConnect);
      currentSocket?.off("receive_message", handleReceiveMessage);
      currentSocket?.off("user_presence", handlePresence);
      currentSocket?.off("typing", handleTyping);
      currentSocket?.off("stop_typing", handleStopTyping);
      currentSocket?.off("messages_read", handleMessagesRead);
      disconnectSocket();
    };
  }, [token, user, updateCurrentUser]);

  useEffect(() => {
    if (!token || !selectedUserId) {
      return;
    }

    let active = true;

    const loadMessages = async () => {
      setChatLoading(true);
      setChatError("");

      try {
        const { data } = await api.get(`/messages/${selectedUserId}`);

        if (!active) {
          return;
        }

        setMessages(data);

        if (data.length > 0) {
          setLastMessages((prev) => ({
            ...prev,
            [selectedUserId]: data[data.length - 1]
          }));
        }

        await api.patch(`/messages/read/${selectedUserId}`);
        getSocket()?.emit("messages_read", {
          senderId: user._id,
          receiverId: selectedUserId
        });
      } catch (error) {
        if (active) {
          setChatError(error.response?.data?.message || "Unable to load conversation");
        }
      } finally {
        if (active) {
          setChatLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [token, selectedUserId, user?._id]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const delay = setTimeout(async () => {
      if (lastSearchRef.current === search) {
        return;
      }

      lastSearchRef.current = search;

      try {
        setSidebarLoading(true);

        if (!search.trim()) {
          const { data } = await api.get("/users");
          setUsers(data);
          return;
        }

        const { data } = await api.get(`/users/search?query=${encodeURIComponent(search)}`);
        setUsers(data);
      } catch (error) {
        setChatError(error.response?.data?.message || "Search failed");
      } finally {
        setSidebarLoading(false);
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [search, token]);

  const selectedTypingState = activeSelectedUser
    ? Boolean(typingUsers[activeSelectedUser._id])
    : false;

  const userWithPreview = useMemo(
    () =>
      users.map((item) => ({
        ...item,
        lastMessage: lastMessages[item._id] || null
      })),
    [users, lastMessages]
  );

  const activeProfileUser = useMemo(() => {
    if (!profileTarget) {
      return null;
    }

    if (profileTarget.type === "self") {
      return user;
    }

    if (profileTarget.userId === activeSelectedUser?._id) {
      return activeSelectedUser;
    }

    return users.find((item) => item._id === profileTarget.userId) || null;
  }, [activeSelectedUser, profileTarget, user, users]);

  const handleSendMessage = async (content) => {
    if (!activeSelectedUser || !user) {
      return;
    }

    try {
      const { data } = await api.post("/messages/send", {
        receiverId: activeSelectedUser._id,
        content
      });

      setMessages((prev) => {
        const exists = prev.some((item) => item._id === data._id);
        return exists ? prev : [...prev, data];
      });
      setLastMessages((prev) => ({ ...prev, [activeSelectedUser._id]: data }));

      const socket = getSocket();
      socket?.emit("stop_typing", {
        senderId: user._id,
        receiverId: activeSelectedUser._id
      });
    } catch (error) {
      setChatError(error.response?.data?.message || "Unable to send message");
    }
  };

  const handleTyping = (isTyping) => {
    if (!activeSelectedUser || !user) {
      return;
    }

    const socket = getSocket();
    socket?.emit(isTyping ? "typing" : "stop_typing", {
      senderId: user._id,
      receiverId: activeSelectedUser._id
    });
  };

  const handleUserSelect = async (nextUser) => {
    setSelectedUser(nextUser);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileChatOpen(true);
    }
    setTypingUsers((prev) => {
      const next = { ...prev };
      delete next[nextUser._id];
      return next;
    });
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    router.replace("/login");
  };

  const handleOpenOwnProfile = () => {
    setProfileTarget({ type: "self", userId: user._id });
    setProfilePanelOpen(true);
  };

  const handleOpenUserProfile = (targetUser = activeSelectedUser) => {
    if (!targetUser?._id) {
      return;
    }

    setProfileTarget({ type: "user", userId: targetUser._id });
    setProfilePanelOpen(true);
  };

  const handleCloseProfilePanel = () => {
    setProfilePanelOpen(false);
  };

  const handleBackToList = () => {
    setMobileChatOpen(false);
  };

  const handleProfileUpdated = (updatedUser) => {
    updateCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((item) => (item._id === updatedUser._id ? { ...item, ...updatedUser } : item))
    );
    setSelectedUser((prev) =>
      prev?._id === updatedUser._id ? { ...prev, ...updatedUser } : prev
    );
  };

  if (!authReady || !token || !user) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-500 dark:text-slate-300">
        Loading your dashboard...
      </main>
    );
  }

  return (
    <main className="h-[100svh] overflow-hidden px-3 py-2 md:h-screen md:px-5 md:py-4">
      <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col">
        <Navbar
          user={user}
          onLogout={handleLogout}
          onOpenProfile={handleOpenOwnProfile}
        />
        <div className="grid min-h-0 flex-1 gap-3 overflow-hidden lg:grid-cols-[380px_1fr] lg:gap-4">
          <div
            className={`min-h-0 overflow-hidden ${
              mobileChatOpen ? "hidden lg:block" : "block"
            }`}
          >
            <Sidebar
              users={userWithPreview}
              currentUser={user}
              selectedUser={activeSelectedUser}
              search={search}
              onSearchChange={setSearch}
              onSelectUser={handleUserSelect}
              loading={sidebarLoading}
              mobileChatOpen={mobileChatOpen}
            />
          </div>
          <div
            className={`min-h-0 overflow-hidden ${mobileChatOpen ? "block" : "hidden lg:block"}`}
          >
            <ChatWindow
              currentUser={user}
              selectedUser={activeSelectedUser}
              messages={messages}
              isTyping={selectedTypingState}
              loading={chatLoading}
              error={chatError}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onOpenProfile={handleOpenUserProfile}
              onBackToList={handleBackToList}
              mobileChatOpen={mobileChatOpen}
            />
          </div>
        </div>
      </div>
      <ProfilePanel
        open={profilePanelOpen}
        profileUser={activeProfileUser}
        isOwnProfile={profileTarget?.type === "self"}
        loading={false}
        onClose={handleCloseProfilePanel}
        onProfileUpdated={handleProfileUpdated}
      />
    </main>
  );
}
