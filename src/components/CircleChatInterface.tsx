import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface CircleChatInterfaceProps {
  circleId: Id<'circles'>;
  onBack?: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function CircleChatInterface({ circleId, onBack, onNavigate }: CircleChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<Id<'circleMessages'> | null>(null);
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const circle = useQuery(api.circles.getCircleById, { circleId });
  
  // Only fetch messages and pinned messages if user is a member
  const messages = useQuery(
    api.circleMessages.getMessages,
    circle?.isMember ? { circleId, limit: 50 } : "skip"
  );
  const pinnedMessages = useQuery(
    api.circleMessages.getPinnedMessages,
    circle?.isMember ? { circleId } : "skip"
  );

  const sendMessage = useMutation(api.circleMessages.sendMessage);
  const addReaction = useMutation(api.circleMessages.addReaction);
  const deleteMessage = useMutation(api.circleMessages.deleteMessage);
  const togglePin = useMutation(api.circleMessages.togglePinMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowEmojiPicker(null);
      setShowInputEmojiPicker(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      await sendMessage({
        circleId,
        messageType: 'text',
        content: messageInput.trim(),
      });
      setMessageInput('');
    } catch (error: any) {
      alert(error.message || 'Failed to send message');
    }
  };

  const handleReaction = async (messageId: Id<'circleMessages'>, emoji: string) => {
    try {
      await addReaction({ messageId, emoji });
    } catch (error: any) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleDeleteMessage = async (messageId: Id<'circleMessages'>) => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteMessage({ messageId });
    } catch (error: any) {
      alert(error.message || 'Failed to delete message');
    }
  };

  const handleTogglePin = async (messageId: Id<'circleMessages'>) => {
    try {
      await togglePin({ messageId });
    } catch (error: any) {
      alert(error.message || 'Failed to pin/unpin message');
    }
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];

  if (circle === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!circle || !circle.isMember) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Access Denied</h3>
        <p className="text-gray-600 mb-6">You must be a member to view this circle's chat</p>
        {onBack && (
          <button onClick={onBack} className="text-accent hover:underline">
            ← Go Back
          </button>
        )}
      </div>
    );
  }

  if (messages === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isAdmin = circle.membership && ['CREATOR', 'ADMIN', 'MODERATOR'].includes(circle.membership.role);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
        )}
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800">{circle.name}</h2>
          <p className="text-xs text-gray-500">{circle.currentMembers} members</p>
        </div>
        <button
          onClick={() => onNavigate?.('circle-detail', { circleId })}
          className="text-gray-600 hover:text-gray-800"
        >
          <i className="fas fa-info-circle text-xl"></i>
        </button>
      </div>

      {/* Pinned Messages */}
      {pinnedMessages && pinnedMessages.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-thumbtack text-yellow-600"></i>
            <span className="text-yellow-800 font-medium">Pinned:</span>
            <span className="text-yellow-700 truncate flex-1">
              {pinnedMessages[0].content}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-comments text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No messages yet</h3>
            <p className="text-gray-600">Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((message: any) => (
            <div key={message._id} className="group">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                  {message.sender.avatar ? (
                    <img
                      src={message.sender.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-gray-400"></i>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-gray-800">
                      {message.sender.name || message.sender.username}
                    </span>
                    {message.sender.role && message.sender.role !== 'MEMBER' && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        message.sender.role === 'CREATOR' ? 'bg-purple-100 text-purple-800' :
                        message.sender.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {message.sender.role}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                    {message.isPinned && (
                      <i className="fas fa-thumbtack text-yellow-600 text-xs"></i>
                    )}
                  </div>

                  {/* Reply To */}
                  {message.replyTo && (
                    <div className="mb-2 pl-3 border-l-2 border-gray-300 text-sm text-gray-600">
                      <span className="font-medium">{message.replyTo.senderName}</span>
                      <p className="truncate">{message.replyTo.content}</p>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="text-gray-700 break-words">{message.content}</p>

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.reactions.map((reaction: any) => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleReaction(message._id, reaction.emoji)}
                          className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
                            reaction.userReacted
                              ? 'bg-accent/20 border border-accent'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-xs">{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Actions */}
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmojiPicker(showEmojiPicker === message._id ? null : message._id);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                      title="Add reaction"
                    >
                      <i className="far fa-smile"></i>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleTogglePin(message._id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                        title={message.isPinned ? 'Unpin message' : 'Pin message'}
                      >
                        <i className={`fas fa-thumbtack ${message.isPinned ? 'text-yellow-600' : ''}`}></i>
                      </button>
                    )}
                    {(isAdmin || message.sender.id === circle.membership?.userId) && (
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="text-xs text-red-500 hover:text-red-700"
                        title="Delete message"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>

                  {/* Emoji Picker */}
                  {showEmojiPicker === message._id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 p-2 bg-white border rounded-lg shadow-lg flex gap-1 relative z-10"
                    >
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaction(message._id, emoji);
                            setShowEmojiPicker(null);
                          }}
                          className="text-xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {circle.canPost ? (
        <div className="bg-white border-t px-4 py-3">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInputEmojiPicker(!showInputEmojiPicker);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <i className="far fa-smile text-lg"></i>
              </button>
              
              {/* Input Emoji Picker */}
              {showInputEmojiPicker && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full mb-2 right-0 p-3 bg-white border rounded-lg shadow-xl flex gap-2 z-10"
                >
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessageInput(messageInput + emoji);
                        setShowInputEmojiPicker(false);
                      }}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="px-6 py-2 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-3 text-center text-sm text-yellow-800">
          <i className="fas fa-lock mr-2"></i>
          Only admins can post in this circle
        </div>
      )}
    </div>
  );
}
