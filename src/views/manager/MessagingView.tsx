import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';

const QUICK_REPLIES = [
  'Your order is ready! Walk to the counter to collect.',
  'Chef has started preparing your gourmet burger',
  'We have a slight delay due to high order volume, apologies!',
  'Rider is on the way! Arriving shortly',
];

type ThreadMessage = { sender: 'staff' | 'customer'; text: string; time: string };

function groupMessages(messages: ThreadMessage[]) {
  return messages.map((msg, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const isGroupedWithPrev = prev?.sender === msg.sender;
    const isGroupedWithNext = next?.sender === msg.sender;
    return {
      ...msg,
      isGroupedWithPrev,
      isGroupedWithNext,
      isFirstInGroup: !isGroupedWithPrev,
      isLastInGroup: !isGroupedWithNext,
    };
  });
}

type MessagingViewProps = { onExit?: () => void };

export default function MessagingView({ onExit }: MessagingViewProps) {
  const { messages, sendMessage } = useStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastMenuOpen, setBroadcastMenuOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const broadcastRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  const activeThread = messages.find(m => m.customerId === selectedCustomerId);

  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      t =>
        t.customerName.toLowerCase().includes(q) ||
        t.messages.some(m => m.text.toLowerCase().includes(q))
    );
  }, [messages, searchQuery]);

  const groupedFeed = useMemo(
    () => (activeThread ? groupMessages(activeThread.messages) : []),
    [activeThread]
  );

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [groupedFeed.length, selectedCustomerId, chatOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (broadcastRef.current && !broadcastRef.current.contains(e.target as Node)) {
        setBroadcastMenuOpen(false);
      }
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target as Node)) {
        setChatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectThread = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setChatOpen(true);
    setChatMenuOpen(false);
  };

  const handleBackToList = () => {
    setChatOpen(false);
    setSelectedCustomerId(null);
    setChatMenuOpen(false);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedCustomerId || !replyText.trim()) return;
    sendMessage(selectedCustomerId, replyText, 'staff');
    setReplyText('');
  };

  const handleSendQuickReply = (reply: string) => {
    if (!selectedCustomerId) return;
    sendMessage(selectedCustomerId, reply, 'staff');
    setChatMenuOpen(false);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    messages.forEach(thread => {
      if (!thread.customerId) return;
      sendMessage(thread.customerId, `[Broadcast] ${broadcastText}`, 'staff');
    });
    setBroadcastText('');
    setBroadcastSent(true);
    setBroadcastMenuOpen(false);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  const activeInitial = activeThread?.customerName.charAt(0).toUpperCase() ?? '';
  const hasText = replyText.trim().length > 0;

  return (
    <div
      className={[
        'messaging-view fade-in-up',
        chatOpen ? 'messaging-view--chat-open' : 'messaging-view--list',
      ].join(' ')}
    >
      <div className={`messaging-layout ${chatOpen ? 'messaging-layout--chat-open' : ''}`}>
        {/* Left pane: Chats list */}
        <aside className="messaging-inbox">
          <header className="messaging-chats-header">
            {onExit && (
              <button
                type="button"
                className="messaging-chats-header__back ripple-btn"
                onClick={onExit}
                aria-label="Back to dashboard"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
            <h2 className="messaging-chats-header__title">Chats</h2>
            <div className="messaging-chats-header__actions">
              <div className="messaging-chats-header__menu-wrap" ref={broadcastRef}>
                <button
                  type="button"
                  className="messaging-chats-header__btn ripple-btn"
                  onClick={() => setBroadcastMenuOpen(v => !v)}
                  aria-label="Broadcast to all"
                >
                  <span className="material-symbols-outlined">campaign</span>
                </button>
                {broadcastMenuOpen && (
                  <div className="messaging-dropdown">
                    <p className="messaging-dropdown__title">Broadcast to all chats</p>
                    <form onSubmit={handleBroadcast} className="messaging-broadcast-form">
                      <input
                        type="text"
                        placeholder="Type announcement..."
                        value={broadcastText}
                        onChange={e => setBroadcastText(e.target.value)}
                        className="messaging-broadcast-form__input"
                      />
                      <button type="submit" className="ripple-btn messaging-broadcast-form__btn">Send</button>
                    </form>
                    {broadcastSent && (
                      <p className="messaging-broadcast__success">Sent to all chats</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="messaging-inbox__search-row">
            <span className="material-symbols-outlined messaging-inbox__search-icon">search</span>
            <input
              type="search"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="messaging-inbox__search-input"
            />
          </div>

          <ul className="messaging-threads">
            {filteredMessages.length > 0 ? filteredMessages.map(thread => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              const preview = lastMsg?.text || 'No messages yet';
              const time = lastMsg?.time ?? '';
              const initial = thread.customerName.charAt(0).toUpperCase();
              const isStaffLast = lastMsg?.sender === 'staff';
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (thread.customerId) handleSelectThread(thread.customerId);
                    }}
                    className={`messaging-thread ripple-btn ${selectedCustomerId === thread.customerId ? 'messaging-thread--active' : ''}`}
                  >
                    <span className="messaging-thread__avatar">{initial}</span>
                    <span className="messaging-thread__body">
                      <span className="messaging-thread__top">
                        <span className="messaging-thread__name">{thread.customerName}</span>
                        {time && <span className="messaging-thread__time">{time}</span>}
                      </span>
                      <span className="messaging-thread__preview">
                        {isStaffLast && (
                          <span className="material-symbols-outlined messaging-thread__check">done_all</span>
                        )}
                        {preview}
                      </span>
                    </span>
                  </button>
                </li>
              );
            }) : (
              <li className="messaging-threads__empty">No conversations found</li>
            )}
          </ul>
        </aside>

        {/* Right pane: Conversation */}
        <section className="messaging-chat">
          {activeThread ? (
            <>
              <header className="messaging-chat__header">
                <button
                  type="button"
                  className="messaging-chat__back ripple-btn"
                  onClick={handleBackToList}
                  aria-label="Back to chats"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <span className="messaging-chat__header-avatar">{activeInitial}</span>
                <div className="messaging-chat__header-info">
                  <h4 className="messaging-chat__name">{activeThread.customerName}</h4>
                  <span className="messaging-chat__status">
                    {activeThread.orderId ? `Order ${activeThread.orderId}` : 'online'}
                  </span>
                </div>
                <div className="messaging-chat__header-menu" ref={chatMenuRef}>
                  <button
                    type="button"
                    className="messaging-chats-header__btn ripple-btn"
                    onClick={() => setChatMenuOpen(v => !v)}
                    aria-label="More options"
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                  {chatMenuOpen && (
                    <div className="messaging-dropdown messaging-dropdown--chat">
                      <p className="messaging-dropdown__title">Quick replies</p>
                      <ul className="messaging-dropdown__list">
                        {QUICK_REPLIES.map((reply, i) => (
                          <li key={i}>
                            <button
                              type="button"
                              className="messaging-dropdown__item ripple-btn"
                              onClick={() => handleSendQuickReply(reply)}
                            >
                              {reply}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </header>

              <div className="messaging-chat__feed" ref={feedRef}>
                {groupedFeed.map((m, i) => (
                  <div
                    key={i}
                    className={[
                      'messaging-bubble',
                      `messaging-bubble--${m.sender}`,
                      m.isFirstInGroup ? 'messaging-bubble--first' : '',
                      m.isLastInGroup ? 'messaging-bubble--last' : '',
                      m.isGroupedWithPrev ? 'messaging-bubble--continued' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <p className="messaging-bubble__text">{m.text}</p>
                    <span className="messaging-bubble__meta">
                      <span className="messaging-bubble__time">{m.time}</span>
                      {m.sender === 'staff' && (
                        <span className="material-symbols-outlined messaging-bubble__tick">done_all</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="messaging-chat__composer">
                <button type="button" className="messaging-chat__emoji ripple-btn" aria-label="Emoji">
                  <span className="material-symbols-outlined">sentiment_satisfied</span>
                </button>
                <input
                  type="text"
                  placeholder="Type a message"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="messaging-chat__input"
                />
                <button
                  type={hasText ? 'submit' : 'button'}
                  className={`ripple-btn messaging-chat__action ${hasText ? 'messaging-chat__action--send' : ''}`}
                  aria-label={hasText ? 'Send message' : 'Voice message'}
                  onClick={hasText ? undefined : (e) => e.preventDefault()}
                >
                  <span className="material-symbols-outlined">{hasText ? 'send' : 'mic'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="messaging-chat__empty">
              <span className="material-symbols-outlined messaging-chat__empty-icon">lock</span>
              <p className="messaging-chat__empty-title">Kwa Gavo Manager</p>
              <p className="messaging-chat__empty-text">
                Select a chat to view the conversation. Messages are secured for your guests.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
