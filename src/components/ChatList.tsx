import { Avatar, AvatarFallback } from "./ui/avatar";
import { Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  isFavorite: boolean;
  unread: number;
  timestamp: string;
  members?: any[];
  messages: {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isOwn: boolean;
  }[];
}

interface ChatListProps {
  chats: Chat[];
  activeFilter: "all" | "favorites" | "groups";
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

const ChatList = ({
  chats,
  activeFilter,
  selectedChatId,
  onSelectChat,
}: ChatListProps) => {
  const filteredChats = chats.filter((chat) => {
    if (activeFilter === "favorites") return chat.isFavorite;
    if (activeFilter === "groups") return chat.isGroup;
    return true;
  });

  if (filteredChats.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No {activeFilter === "all" ? "" : activeFilter} chats found.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredChats.map((chat) => {
        const lastMessage = chat.messages?.length
          ? chat.messages[chat.messages.length - 1]
          : null;

        return (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors border border-transparent",
              selectedChatId === chat.id &&
                "bg-accent border-primary/30 shadow-sm"
            )}
          >
            {/* Avatar */}
            <Avatar className="w-10 h-10">
              <AvatarFallback
                className={cn(
                  "bg-gradient-primary text-primary-foreground font-medium",
                  chat.isGroup && "bg-muted text-muted-foreground"
                )}
              >
                {chat.isGroup ? (
                  <Users className="w-4 h-4" />
                ) : (
                  chat.name?.charAt(0)?.toUpperCase() || "?"
                )}
              </AvatarFallback>
            </Avatar>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              {/* Top Row: Name + timestamp */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold truncate">{chat.name || "Unnamed Chat"}</h4>
                  {chat.isFavorite && (
                    <Star className="w-3 h-3 fill-primary text-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {chat.timestamp || ""}
                </span>
              </div>

              {/* Bottom Row: Last message + unread badge */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {lastMessage
                    ? `${lastMessage.isOwn ? "You: " : ""}${lastMessage.content}`
                    : chat.isGroup
                    ? `${chat.members?.length || 0} members`
                    : "No messages yet"}
                </p>

                {chat.unread > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-primary-foreground bg-primary rounded-full">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
