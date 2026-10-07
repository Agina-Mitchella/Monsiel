# Monsiel & Nyota AI Companion Prototype

> **Workspace Notice:** Upon initial inspection, the workspace directory (`c:\Users\Mitchella Agina\Monsiel`) was completely empty with no preexisting Monsiel codebase, backend, authentication, database, or routes present. To integrate with Monsiel's production environment, the Monsiel project repository or API service endpoints are required.
>
> In accordance with the product brief, this repository contains an **independently runnable Nyota companion prototype** featuring **clearly separated integration adapters** and **visibly labeled demonstration data**. It does not invent or pretend to connect to a non-existent Monsiel backend.

---

## 1. Nyota's Role & Personality

- **Name:** Nyota
- **Subtitle:** Your AI companion in Monsiel
- **Identity:** An AI companion designed to help people notice menstrual patterns, reflect on their experiences, and discover everyday care ideas in Monsiel.
- **Tone & Style:** Warm, practical, gently curious, and concise (1–3 sentences). Uses plain language and asks one focused question when clarification is needed.
- **Initial Welcome Message:**
  > *"Hi, I’m Nyota. I can help you check in, find food ideas, explore your journal, or open a space to reflect. Where shall we start?"*

---

## 2. Structured Tools

Nyota operates through five strictly defined, server-side tools:

| Tool | Purpose | Key Constraints & Safety |
| :--- | :--- | :--- |
| `open_feature` | Resolves requests to supported Monsiel destinations (`my_rhythm`, `cycle_calendar`, `nourishment`, `nourishment_saved`, `activity_ideas`, `journal`, `mirror`, `library`, `breathing`, `moon_reflection`). | Reflection requests offer **The Mirror**, requiring explicit user confirmation before opening and before transferring any text. Period logging and check-ins route through existing forms. |
| `search_library_articles` | Searches published, expert-reviewed Monsiel Library educational articles. | Grounded strictly in reviewed content. Treated as information, never medical instructions. |
| `search_foods` | Searches curated food catalogue and saved foods (`savedOnly: true`). | Automatically respects authenticated user's dietary exclusions (e.g. gluten-free, dairy-free, nut-free, vegetarian). |
| `read_cycle_records` | Retrieves logged period history and check-ins for authenticated user. | Strictly distinguishes **logged facts** (e.g. last period start date) from **estimated phase calculations** (which carry clear disclaimers). |
| `prepare_journal_entry` | Generates an editable preview draft from user-shared reflections. | **Never automatically writes to journal.** Requires explicit user confirmation, prevents duplicate writes with idempotency keys, and records success only after backend confirmation. |

---

## 3. Architecture & Adapter Pattern

```
                       ┌─────────────────────────┐
                       │   Nyota UI (React/Vite) │
                       │    Cream surface, Teal  │
                       │    Hand-drawn Star SVG  │
                       └────────────┬────────────┘
                                    │ HTTP / REST
                       ┌────────────▼────────────┐
                       │ Express Server (Port 3001)
                       │  - Auth Context & Isolation
                       │  - Nyota Agent Controller │
                       └───────┬───────────┬─────┘
                               │           │
                 ┌─────────────┴──┐     ┌──┴─────────────────────────┐
                 │  AI Providers  │     │  MonsielAdapter Interface  │
                 │ - Gemini (API) │     └──────┬──────────────────┬──┘
                 │ - Local Engine │            │                  │
                 └────────────────┘            │                  │
                               ┌───────────────▼──┐    ┌──────────▼───────────────┐
                               │DemoMonsielAdapter│    │    RealMonsielAdapter    │
                               │(Visibly Labeled) │    │  (Ready for Production)  │
                               │  - Demo Data     │    │  - MONSIEL_API_URL       │
                               │  - User Amara    │    │  - MONSIEL_SERVICE_TOKEN │
                               │  - User Elena    │    └──────────────────────────┘
                               │  - Idempotency   │
                               └──────────────────┘
```

### Access Isolation & Ownership
- User identity is derived strictly on the server from session headers (`Authorization: Bearer <userId>` or `X-User-Id`).
- The AI model never specifies or dictates user IDs.
- Data stores are partitioned per user (e.g., testing between `user_amara` and `user_elena` proves complete isolation of cycle logs, saved foods, and journals).

---

## 4. Working vs. Missing Integrations

| Feature / Integration | Status | Details |
| :--- | :--- | :--- |
| **Conversational Interface** | ✅ Working | Warm palette (cream `#FAF7F2`, teal `#133E48`, yellow button `#F4C542`), hand-drawn star illustration, mobile-ready composer, accessible controls. |
| **5 Structured Tools** | ✅ Working | Tool executions, deep-link navigation cards, editable journal draft previews, saved foods filtering. |
| **User Access Isolation** | ✅ Working | Fully verified with automated test suite; Amara and Elena have separate cycle records and saved items. |
| **Duplicate Write Prevention** | ✅ Working | Idempotency keys prevent double-saves on network retries or repeated clicks. |
| **Offline / Local Fallback Engine** | ✅ Working | Deterministic offline agent allows 100% testability and demonstration out of the box without requiring API keys. |
| **Gemini Server-side Calling** | ✅ Working | Configured to use `@google/generative-ai` with structured `FunctionDeclaration` definitions when `GEMINI_API_KEY` is provided. |
| **Demonstration Data Labelling** | ✅ Working | Visibly labeled banner and indicators clearly declare prototype demonstration mode. |
| **Real Monsiel Production DB** | ⚠️ Missing | Monsiel repository was absent in workspace. `RealMonsielAdapter` provides the exact contract ready to link. |
| **Real Production Auth SSO** | ⚠️ Missing | Uses token session simulation with multi-user switcher until production SSO (e.g. Firebase/OAuth) is connected. |

---

## 5. Setup & Running Instructions

### Prerequisites
- Node.js `v20+` or `v26+`

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Variables:
```ini
PORT=3001
# Optional: Gemini API Key (if omitted, Local Companion Engine powers all tools)
GEMINI_API_KEY=your_gemini_key_here

# Optional: Real Monsiel backend endpoints (for production connection)
MONSIEL_API_URL=
MONSIEL_SERVICE_TOKEN=
```

### Running Tests
Execute Vitest test suite verifying isolation, safety grounding, duplicate writes, and tools:
```bash
npm test
```

### Running Development Servers
Start backend server:
```bash
npm run server
```

In a separate terminal, start Vite frontend:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
# Monsiel
