import { ai, generateWithRetry } from "./engine.js";

// Tool declarations for Gemini function-calling. Every one of these tools is
// executed on the FRONTEND (bookings/inventory live client-side — see
// chatTools.js there), never here. This module only runs the reasoning turn.
const TOOLS = [
  {
    name: "search_destinations",
    description:
      "Search the bookable travel inventory (flights, trains, hotels, hostels, activities) by destination name, city, or country. Use this whenever the user mentions a place, or before booking anything, to find the exact item id.",
    parametersJsonSchema: {
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
  {
    name: "get_my_bookings",
    description: "List the signed-in traveler's currently confirmed bookings, with status and price.",
    parametersJsonSchema: { type: "object", properties: {} },
  },
  {
    name: "book_item",
    description:
      "Book a specific inventory item for the traveler. Only call this once you know the exact category and itemId (from a prior search_destinations call in this conversation) — never guess an id.",
    parametersJsonSchema: {
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
  {
    name: "cancel_booking",
    description: "Cancel one of the traveler's confirmed bookings by its booking id.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        bookingId: { type: "string", description: "The booking id, from get_my_bookings." },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "simulate_disruption",
    description:
      "Run a real disruption simulation against one of the traveler's bookings (e.g. a flight delay or a hotel cancellation) and compute the cascade impact on any dependent bookings in the same trip bundle, plus AI-generated recovery options. Use this when the traveler asks a 'what if' question about a delay/cancellation/disruption to one of their bookings.",
    parametersJsonSchema: {
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
  {
    name: "apply_recovery_plan",
    description:
      "Apply one of the recovery options returned by a prior simulate_disruption call for the same booking. Must be called with a planId that came from that simulate_disruption result.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        bookingId: { type: "string" },
        planId: { type: "string", description: "A plan id from the recoveryOptions of a prior simulate_disruption call." },
      },
      required: ["bookingId", "planId"],
    },
  },
];

const SYSTEM_INSTRUCTION = `You are Recoup's AI travel concierge, embedded as a chat agent inside the Recoup travel booking app.

You can have normal conversations AND take real actions for the signed-in traveler via the tools provided: searching the live inventory, checking their bookings, booking items, canceling bookings, simulating disruptions, and applying recovery plans.

Rules:
- Never invent booking ids, item ids, prices, or recovery plan ids. Only ever reference ones that came back from a tool result earlier in this conversation.
- If the traveler wants to book something but hasn't named a specific item precisely, call search_destinations first and ask them to pick one (or pick the best match yourself if they said "book the cheapest one" or similar).
- If the traveler wants to book/cancel/simulate/apply something but you don't have its id yet, call the appropriate lookup tool (search_destinations or get_my_bookings) first.
- After any action tool runs, briefly and plainly summarize what happened (what was booked, what the cascade impact was, what plan was applied, etc.) in your reply — the traveler cannot see the raw tool output, only your words.
- All prices are in INR (₹).
- Keep replies conversational and concise — this is a chat widget, not a report.
- You do not have access to the internal demo/showcase itinerary dashboard — only the traveler's own real bookings made through this app.`;

const MODEL = "gemini-3.6-flash";

/**
 * Runs one reasoning turn of the chat agent. `contents` is the full
 * conversation so far as Gemini Content objects ({role, parts}) — the
 * frontend owns and replays this history verbatim, so this function is
 * stateless.
 *
 * Returns { modelTurn, calls, text }:
 * - modelTurn: the model's own Content turn, to be appended to history.
 * - calls: [] when the model is done, or [{id?, name, args}] when it wants
 *   tools executed (by the frontend) before it can continue.
 * - text: any text the model produced this turn (may be "" alongside calls).
 */
export async function runChatTurn(contents) {
  if (!ai) {
    return {
      modelTurn: { role: "model", parts: [{ text: "The AI concierge isn't configured right now — please try again later." }] },
      calls: [],
      text: "The AI concierge isn't configured right now — please try again later.",
    };
  }

  const response = await generateWithRetry({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: TOOLS }],
    },
  });

  const calls = (response.functionCalls || []).map((c) => ({ id: c.id, name: c.name, args: c.args || {} }));
  const text = response.text || "";

  const modelTurn = response.candidates?.[0]?.content || {
    role: "model",
    parts: [
      ...(text ? [{ text }] : []),
      ...calls.map((c) => ({ functionCall: { id: c.id, name: c.name, args: c.args } })),
    ],
  };

  return { modelTurn, calls, text };
}
