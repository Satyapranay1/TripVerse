import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "@/components/TopNavbar";
import BottomNavBar from "@/components/BottomNavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Star, MessageSquare, Users } from "lucide-react";
import ChatList from "@/components/ChatList";
import ChatThread from "@/components/ChatThread";
import GroupInfoDrawer from "@/components/GroupInfoDrawer";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";

interface CommunityProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  isFavorite: boolean;
  unread: number;
  timestamp: string;
  members: any[];
  messages: Message[];
  type?: "GROUP" | "USER"; // ✅ Added to fix TS error
}

const API_BASE = "https://travel-app1-p0m8.onrender.com";

const Community = ({ theme, toggleTheme }: CommunityProps) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "favorites" | "groups" | "users"
  >("all");
  const [selectedChatId, setSelectedChatId] = useState<string>();
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  /** 🔐 Verify JWT and fetch data */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchConversations();
        fetchAllUsers();
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  /** 🗨️ Fetch user's conversations */
  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.conversations || [];

      const formattedChats: Chat[] = data.map((conv: any) => ({
        id: conv.id.toString(),
        name: conv.name || conv.dmName || "Conversation",
        isGroup: conv.type === "GROUP",
        isFavorite: false,
        unread: 0,
        timestamp: new Date(conv.updatedAt || Date.now()).toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        members: conv.members || [],
        messages: [],
        type: "GROUP", // ✅ Mark all conversations as GROUP
      }));

      setChats(formattedChats);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  /** 👤 Fetch all registered users (for DMs list) */
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  /** 💬 Fetch messages when chat is opened */
  useEffect(() => {
    if (!selectedChatId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/messages/${selectedChatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChatId
              ? {
                  ...chat,
                  messages: res.data.messages.map((m: any) => ({
                    id: m.id.toString(),
                    sender: m.sender?.name || "Unknown",
                    content: m.content,
                    timestamp: new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    isOwn: m.sender?.isMe || false,
                  })),
                }
              : chat
          )
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedChatId]);

  /** 💌 Send message */
  const handleSendMessage = async (chatId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE}/api/messages`,
        { conversationId: chatId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMessage = {
        id: res.data.data.id.toString(),
        sender: "You",
        content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, messages: [...c.messages, newMessage] } : c
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  /** 👥 Create new group */
  const handleCreateGroup = async (newGroup: {
    name: string;
    memberIds: number[];
  }) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/conversations/group`,
        newGroup,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const group = res.data.group;
      setChats((prev) => [
        {
          id: group.id.toString(),
          name: group.name,
          isGroup: true,
          isFavorite: false,
          unread: 0,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          members: group.members || [],
          messages: [],
          type: "GROUP",
        },
        ...prev,
      ]);

      setShowCreateGroup(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  /** 🤝 Start or open DM */
  const handleOpenDm = async (user: User) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/conversations/dm?userId=${user.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const conversation = res.data.conversation;
      const chatId = conversation.id.toString();

      if (!chats.some((c) => c.id === chatId)) {
        setChats((prev) => [
          {
            id: chatId,
            name: user.name,
            isGroup: false,
            isFavorite: false,
            unread: 0,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            members: [user],
            messages: [],
            type: "USER",
          },
          ...prev,
        ]);
      }

      setSelectedChatId(chatId);
    } catch (error) {
      console.error("Error opening DM:", error);
      toast.error("Failed to open DM");
    }
  };

  /** ⭐ Toggle favorite chat locally */
  const handleToggleFavorite = (chatId?: string) => {
    if (!chatId) return;
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, isFavorite: !c.isFavorite } : c
      )
    );
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  /** 🧩 Combine chats + users for "All" tab */
  const combinedAll: Chat[] = [
    ...filteredChats,
    ...users.map((u) => ({
      id: `user-${u.id}`,
      name: u.name,
      isGroup: false,
      isFavorite: false,
      unread: 0,
      timestamp: "",
      members: [u],
      messages: [],
      type: "USER" as const, // ✅ force literal type
    })),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Community
          </h1>
          <Button
            onClick={() => setShowCreateGroup(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Group
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
          {/* Chat List */}
          <div
            className={`border rounded-xl bg-card overflow-hidden ${
              selectedChatId ? "hidden md:block" : ""
            }`}
          >
            <Tabs
              value={activeFilter}
              onValueChange={(v) =>
                setActiveFilter(v as "all" | "favorites" | "groups" | "users")
              }
              className="h-full flex flex-col"
            >
              <div className="p-4 border-b space-y-3">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                <Input
                  placeholder="Search chats or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* All tab (Users + Groups) */}
              <TabsContent value="all" className="flex-1 overflow-y-auto p-4">
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
                  All Groups & Users
                </h4>
                {combinedAll
                  .filter((item) =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary cursor-pointer transition"
                      onClick={() =>
                        item.type === "USER"
                          ? handleOpenDm(item.members[0])
                          : setSelectedChatId(item.id)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {item.type === "USER" ? (
                            <MessageSquare className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Users className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.type === "USER" ? "User" : "Group Chat"}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(item.id);
                        }}
                        title="Add to favorites"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </TabsContent>

              {/* Favorites */}
              <TabsContent
                value="favorites"
                className="flex-1 overflow-y-auto p-4"
              >
                <ChatList
                  chats={filteredChats.filter((c) => c.isFavorite)}
                  activeFilter="favorites"
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                />
              </TabsContent>

              {/* Groups */}
              <TabsContent
                value="groups"
                className="flex-1 overflow-y-auto p-4"
              >
                <ChatList
                  chats={filteredChats.filter((c) => c.isGroup)}
                  activeFilter="groups"
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                />
              </TabsContent>

              {/* Users */}
              <TabsContent value="users" className="flex-1 overflow-y-auto p-4">
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
                  Registered Users
                </h4>
                {users
                  .filter((u) =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary cursor-pointer transition"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDm(user)}
                          title="Start Chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(user.id)}
                          title="Add to favorites"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Thread */}
          <div
            className={`md:col-span-2 border rounded-xl bg-card overflow-hidden ${
              !selectedChatId ? "hidden md:flex" : "flex"
            } h-full flex flex-col`}
          >
            {selectedChat ? (
              <ChatThread
                chat={selectedChat}
                onToggleFavorite={() => handleToggleFavorite(selectedChat.id)}
                onOpenInfo={() => setShowGroupInfo(true)}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="flex items-center justify-center w-full text-muted-foreground">
                Select a chat or open a user DM
              </div>
            )}
          </div>
        </div>
      </div>

      <GroupInfoDrawer
        open={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        group={selectedChat}
      />

      <CreateGroupDialog
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
      />

      <BottomNavBar />
    </div>
  );
};

export default Community;
