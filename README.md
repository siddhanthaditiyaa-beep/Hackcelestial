<div align="center">
  <h1>🌌 Recoup: Travel Disruption Recovery Engine</h1>
  <p><strong>Hackcelestial PS-2 | Intelligent Travel Resilience</strong></p>
  <p>Recoup is an AI-powered travel disruption cascade resolution engine. It leverages graph-based buffer monitoring and Gemini 2.5 Flash to automatically detect, assess, and resolve multi-booking travel disruptions in real time.</p>
</div>

<br/>

## 🚀 Live Demos
- **Frontend (Vercel)**: [https://hackcelestial-seven.vercel.app/](https://hackcelestial-seven.vercel.app/)
- **Backend API (Render)**: [https://hackcelestial-svqi.onrender.com/api/health](https://hackcelestial-svqi.onrender.com/api/health)

## 📖 The Problem (PS-2)
Modern travel involves tightly interconnected bookings (flights, transfers, hotels, tours). A single delay can cause a massive ripple effect, breaking downstream connections. Travelers are forced to manually scramble to calculate buffer times, review cancellation policies, and find alternatives across multiple disparate providers while in a state of panic.

## 💡 Our Solution
Recoup acts as an **autonomous incident copilot**. It automatically maps a traveler's itinerary into a dependency graph, actively monitors connection buffers, and steps in the moment a disruption occurs. 

### Key Features
✨ **Jaw-Dropping Glassmorphic UI**: A premium, futuristic, and responsive Dark Mode interface designed for high-stress situations. Features interactive glowing nodes, dynamic topology graphs, and smooth micro-animations.
🧠 **Gemini AI Integration**: Uses Google's **Gemini 2.5 Flash** to instantly generate creative, preference-tailored recovery plans (Budget, Speed, Comfort, Balanced).
📊 **Graph-based Cascade Detection**: Employs Breadth-First Search (BFS) to instantly identify downstream dependencies that will break due to a delay.
🛡️ **Proactive Risk Radar**: Identifies thin connection buffers *before* they break.
🤖 **Automated Incident Briefs**: The AI synthesizes executive summaries and automatically drafts professional notifications for impacted vendors (e.g., late check-in emails for hotels).

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Custom CSS (Glassmorphism design system)
- **Backend**: Node.js, Express
- **AI/ML Engine**: `@google/genai` (Gemini 2.5 Flash)
- **Hosting**: Vercel (Client), Render (API)

## 💻 Local Setup & Installation

To run this project locally on your machine:

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/siddhanthaditiyaa-beep/Hackcelestial.git
cd Hackcelestial
```

### 2. Backend Setup
```bash
cd hackcelestial-backend
npm install

# Create a .env file and add your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start the server
npm run dev
```
*(The backend will run on http://localhost:3000)*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd hackcelestial-frontend
npm install

# Start the frontend client
npm run dev
```
*(The frontend will run on http://localhost:5173)*

## 🧪 Testing
The backend includes a comprehensive integration test suite to verify the graph logic, cost metrics, and AI recovery algorithms.
```bash
cd hackcelestial-backend
npm test
```

---
<div align="center">
  <i>Built with ❤️ for Hackcelestial 2026</i>
</div>
