import { useState } from "react";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { Id } from "../../convex/_generated/dataModel";

export function ChatScreen() {
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"chatConversations"> | null>(null);

  const handleSelectConversation = (conversationId: Id<"chatConversations">) => {
    setSelectedConversationId(conversationId);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  return (
    <div className="h-screen bg-white">
      {selectedConversationId ? (
        <ChatWindow
          conversationId={selectedConversationId}
          onBack={handleBackToList}
        />
      ) : (
        <ChatList onSelectConversation={handleSelectConversation} />
      )}
    </div>
  );
}