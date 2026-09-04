import { ai, generateWithRetry, MODEL } from "./engine.js";

// Tool declarations for the chat agent's function-calling (OpenAI-style,
// which Groq's API speaks natively). Every one of these tools is executed
// on the FRONTEND (bookings/inventory live client-side — see chatTools.js
// there), never here. This module only runs the reasoning turn.
const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_destinations",
      description:
        "Search the bookable travel inventory (flights, trains, hotels, hostels, activities) by destination name, city, or country. Use this whenever the user mentions a place, or before booking anything, to find the exact item id.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Destination, city, or country to search for, e.g. \"Bali\", \"Goa\", \"Paris\".",
          },
          category: {
            type: "string",
            enum: ["flights", "trains", "hotels", "hostels", "activities"],
            description: "Optional: restrict results to one category.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_my_bookings",
      description: "List the signed-in traveler's currently confirmed bookings, with status and price.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "book_item",
      description:
        "Book a specific inventory item for the traveler. Only call this once you know the exact category and itemId (from a prior search_destinations call in this conversation) — never guess an id.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["flights", "trains", "hotels", "hostels", "activities"],
          },
          itemId: { type: "string", description: "The id field of the item, from search_destinations results." },
          guests: { type: "number", description: "Number of guests/travelers. Defaults to 1." },
        },
        required: ["category", "itemId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_booking",
      description: "Cancel one of the traveler's confirmed bookings by its booking id.",
      parameters: {
        type: "object",
        properties: {
          bookingId: { type: "string", description: "The booking id, from get_my_bookings." },
        },
        required: ["bookingId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "simulate_disruption",
      description:
        "Run a real disruption simulation against one of the traveler's bookings (e.g. a flight delay or a hotel cancellation) and compute the cascade impact on any dependent bookings in the same trip bundle, plus AI-generated recovery options. Use this when the traveler asks a 'what if' question about a delay/cancellation/disruption to one of their bookings.",
      parameters: {
        type: "object",
        properties: {
          bookingId: { type: "string", description: "The booking id, from get_my_bookings." },
          disruptionType: {
            type: "string",
            enum: ["delay", "cancellation_hotel_activity"],
            description: "Defaults sensibly based on the booking's category if omitted.",
          },
          delayMinutes: { type: "number", description: "Delay length in minutes, for transport delays. Defaults to a realistic random value." },
        },
        required: ["bookingId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "apply_recovery_plan",
      description:
        "Apply one of the recovery options returned by a prior simulate_disruption call for the same booking. Must be called with a planId that came from that simulate_disruption result.",
      parameters: {
        type: "object",
        properties: {
          bookingId: { type: "string" },
          planId: { type: "string", description: "A plan id from the recoveryOptions of a prior simulate_disruption call." },
        },
        required: ["bookingId", "planId"],
      },
    },
  },
];

const SYSTEM_INSTRUCTION = `You are Recoup's AI travel concierge, embedded as a chat agent inside the Recoup travel booking app.

You can have normal conversations AND take real actions for the signed-in traveler via the tools provided: searching the live inventory, checking their bookings, booking items, canceling bookings, simulating disruptions, and applying recovery plans.

Rules:
- Never invent booking ids, item ids, prices, or recovery plan ids. Only ever reference ones that came back from a tool result earlier in this conversation.
- If the traveler wants to book something but hasn't named a specific item precisely, call search_destinations first and let them pick (or pick the best match yourself if they said "book the cheapest one" or similar).
- If the traveler wants to book/cancel/simulate/apply something but you don't have its id yet, call the appropriate lookup tool (search_destinations or get_my_bookings) first.
- IMPORTANT — formatting: whenever you call search_destinations, get_my_bookings, or simulate_disruption, the app automatically renders the results as visual cards with images, prices, and one-tap action buttons right below your reply. Do NOT restate that data as a markdown table, bullet list, or numbered list — that would just duplicate the cards. Instead keep your reply to 1-2 short, warm sentences (e.g. "Found a couple of great options in Bali — take a look below!" or "Here's the damage if that flight slips — a few ways to recover, your call."). Let the cards carry the details.
- After a booking/cancel/apply action actually runs, briefly and plainly confirm what happened in plain prose (what was booked, what plan was applied, etc.) — no table needed there either, that data has no cards.
- Act as a knowledgeable local guide, not just a booking engine: when you confirm a booked activity (or when asked generally), add one specific, genuinely useful local-guide detail — best time of day to go, what's nearby worth combining it with, a practical tip a first-timer wouldn't know — using your own travel knowledge. Keep it to a sentence or two, woven into the confirmation, not a separate essay.
- You may use **bold** for light emphasis in prose, but nothing fancier (no tables, no headers, no code blocks).
- All prices are in INR (₹).
- Keep replies conversational and concise — this is a chat widget, not a report.
- You do not have access to the internal demo/showcase itinerary dashboard — only the traveler's own real bookings made through this app.`;

/**
 * Runs one reasoning turn of the chat agent. `messages` is the full
 * conversation so far as OpenAI-style chat messages ({role, content,
 * tool_calls?, tool_call_id?}) — the frontend owns and replays this history,
 * so this function is stateless.
 *
 * Returns { assistantMessage, calls, text }:
 * - assistantMessage: the model's own message, to be appended to history.
 * - calls: [] when the model is done, or [{id, name, args}] when it wants
 *   tools executed (by the frontend) before it can continue.
 * - text: any text the model produced this turn (may be "" alongside calls).
 */
export async function runChatTurn(messages) {
  if (!ai) {
    const text = "The AI concierge isn't configured right now — please try again later.";
    return { assistantMessage: { role: "assistant", content: text }, calls: [], text };
  }

  const response = await generateWithRetry({
    model: MODEL,
    messages: [{ role: "system", content: SYSTEM_INSTRUCTION }, ...messages],
    tools: TOOLS,
    tool_choice: "auto",
  });

  const assistantMessage = response.choices[0].message;
  const calls = (assistantMessage.tool_calls || []).map((tc) => ({
    id: tc.id,
    name: tc.function.name,
    args: JSON.parse(tc.function.arguments || "{}"),
  }));
  const text = assistantMessage.content || "";

  return { assistantMessage, calls, text };
}
