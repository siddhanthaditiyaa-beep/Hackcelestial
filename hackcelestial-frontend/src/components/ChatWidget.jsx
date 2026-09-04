import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X, Loader2, Sparkles, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { sendChatTurn } from "../data/api";
import { createChatTools } from "../utils/chatTools";

const QUICK_PROMPTS = [
  "Find me hotels in Bali",
  "Show my bookings",
  "What if my flight gets delayed?",
  "Find cheap flights to Goa",
];

const TOOL_LABELS = {
  search_destinations: "Searching destinations",
  get_my_bookings: "Checking your bookings",
  book_item: "Booking that for you",
  cancel_booking: "Cancelling that booking",
  simulate_disruption: "Simulating the disruption",
  apply_recovery_plan: "Applying the recovery plan",
};

const MAX_ROUNDS = 6;

export default function ChatWidget() {
  const { user } = useAuth();
  const { addBooking, removeBooking, updateBooking } = useBooking();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); // [{id, role: 'user'|'assistant', text}]
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [statusText, setStatusText] = useState(null);

  const contentsRef = useRef([]); // full Gemini conversation history
  const planStashRef = useRef(new Map()); // bookingId -> recoveryOptions, from simulate_disruption
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, statusText]);

  if (!user) return null;

  const pushMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, role, text }]);
  };

  const runTurn = async (userText) => {
    contentsRef.current = [...contentsRef.current, { role: "user", parts: [{ text: userText }] }];
    pushMessage("user", userText);
    setSending(true);

    const tools = createChatTools({ addBooking, removeBooking, updateBooking, planStash: planStashRef.current });

    try {
      for (let round = 0; round < MAX_ROUNDS; round++) {
        setStatusText(round === 0 ? "Thinking…" : "Working on it…");

        let res;
        try {
          res = await sendChatTurn(contentsRef.current);
        } catch (err) {
          pushMessage("assistant", err.message || "Sorry, I'm having trouble connecting right now. Please try again in a moment.");
          return;
        }

        contentsRef.current = [...contentsRef.current, res.modelTurn];

        if (res.text) pushMessage("assistant", res.text);

        if (!res.calls || res.calls.length === 0) return;

        const responseParts = [];
        for (const call of res.calls) {
          setStatusText(`${TOOL_LABELS[call.name] || "Working"}…`);
          let result;
          try {
            const fn = tools[call.name];
            result = fn ? await fn(call.args || {}) : { success: false, error: `Unknown tool "${call.name}"` };
          } catch (err) {
            result = { success: false, error: err.message || "Tool execution failed" };
          }
          responseParts.push({ functionResponse: { id: call.id, name: call.name, response: result } });
        }
        contentsRef.current = [...contentsRef.current, { role: "user", parts: responseParts }];
      }

      pushMessage("assistant", "That's taking longer than expected — mind trying that again?");
    } finally {
      setSending(false);
      setStatusText(null);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    runTurn(text);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-brand text-brand-ink shadow-md flex items-center justify-center hover:brightness-105 transition"
            title="Chat with Recoup Concierge"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-40 w-full sm:w-[380px] h-full sm:h-[600px] sm:max-h-[calc(100vh-2.5rem)] bg-surface border border-border sm:rounded-lg shadow-md flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-2.5 bg-surface-sunk shrink-0">
              <div className="h-9 w-9 rounded-sm bg-brand-dim flex items-center justify-center text-brand shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-medium text-sm text-ink">Recoup Concierge</h3>
                <p className="text-[11px] text-ink-dim truncate">Ask me anything, or ask me to handle it</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-border flex items-center justify-center text-ink-dim transition shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-brand-dim text-brand flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-surface-sunk border border-border rounded-lg rounded-tl-sm px-3.5 py-2.5 text-sm text-ink-dim max-w-[85%]">
                      Hi! I can search destinations, book things, check your bookings, and handle disruptions for you — just ask.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-9">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => runTurn(p)}
                        disabled={sending}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface-sunk text-ink-dim hover:text-ink transition disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      m.role === "user" ? "bg-ink text-page" : "bg-brand-dim text-brand"
                    }`}
                  >
                    {m.role === "user" ? <UserIcon className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={`px-3.5 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-ink text-page rounded-lg rounded-tr-sm"
                        : "bg-surface-sunk border border-border text-ink-dim rounded-lg rounded-tl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {statusText && (
                <div className="flex items-center gap-2 text-xs text-ink-faint pl-9">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {statusText}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border shrink-0 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask or tell me what to do…"
                disabled={sending}
                className="flex-1 bg-surface-sunk border border-border rounded-full px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/10 transition disabled:opacity-60"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="h-10 w-10 rounded-full bg-brand text-brand-ink flex items-center justify-center shrink-0 hover:brightness-105 transition disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
