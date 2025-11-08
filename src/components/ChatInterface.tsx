import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useConvexAuth } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface ChatInterfaceProps {
    conversationId: Id<"chatConversations">;
    onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId, onClose }) => {
    const { isAuthenticated } = useConvexAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get current user info
    const currentUser = useQuery(api.profiles.getMyProfile);

    // Get conversation details and messages
    const conversation = useQuery(api.chat.getConversation, { conversationId });
    const messages = useQuery(api.chat.getMessages, { conversationId });
    const sendMessage = useMutation(api.chat.sendMessage);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !isAuthenticated) return;

        try {
            await sendMessage({
                conversationId,
                content: newMessage.trim(),
                messageType: "text",
            });
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    if (!conversation || !messages || !currentUser) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading chat...</div>
            </div>
        );
    }

    const otherParticipant = conversation.participants.find(p => p && p._id !== currentUser.userId);

    return (
        <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-lg shadow-lg">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center space-x-3">
                    <img
                        src={otherParticipant?.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}
                        alt={otherParticipant?.name || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-medium text-gray-900">
                            {otherParticipant?.name || otherParticipant?.username || "User"}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {otherParticipant?.username && `@${otherParticipant.username}`}
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Debug info */}
                <div className="text-xs bg-yellow-100 p-2 rounded mb-2">
                    <div>Current User ID: {currentUser?.userId}</div>
                    <div>Messages Count: {messages?.length || 0}</div>
                    <div>Conversation ID: {conversationId}</div>
                </div>

                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwnMessage = message.senderId === currentUser.userId;
                        console.log('Message Debug:', {
                            messageId: message._id,
                            senderId: message.senderId,
                            currentUserId: currentUser.userId,
                            isOwnMessage,
                            content: message.content,
                            contentLength: message.content?.length,
                            contentType: typeof message.content,
                            messageType: message.messageType,
                            createdAt: message.createdAt
                        });
                        return (
                            <div
                                key={message._id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm"
                                    style={{
                                        backgroundColor: isOwnMessage ? '#2563eb' : '#e5e7eb',
                                        color: isOwnMessage ? '#ffffff' : '#111827'
                                    }}
                                >
                                    <div
                                        className="text-sm break-words whitespace-pre-wrap"
                                        style={{
                                            color: isOwnMessage ? '#ffffff' : '#111827',
                                            minHeight: '20px'
                                        }}
                                    >
                                        {message.content || '[No content]'}
                                    </div>
                                    <div
                                        className="text-xs mt-1"
                                        style={{ color: isOwnMessage ? '#bfdbfe' : '#6b7280' }}
                                    >
                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    {/* Debug info - remove this later */}
                                    <div
                                        className="text-xs mt-1 border-t pt-1"
                                        style={{
                                            color: isOwnMessage ? '#93c5fd' : '#9ca3af',
                                            fontSize: '10px'
                                        }}
                                    >
                                        <div>ID: {message._id}</div>
                                        <div>Sender: {message.senderId}</div>
                                        <div>Current: {currentUser.userId}</div>
                                        <div>Own: {isOwnMessage ? 'YES' : 'NO'}</div>
                                        <div>Content: "{message.content}"</div>
                                        <div>Length: {message.content?.length || 0}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!isAuthenticated}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !isAuthenticated}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;