# 19 JHR BN NCC • Sarala Birla University (SBU) Company Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com)

Official digital management platform for **19 Jharkhand Battalion NCC (Ranchi, Bihar & Jharkhand Directorate)** at **Sarala Birla University, Ranchi**.

---

## 🎖️ Overview

This web portal modernizes battalion operations, cadet enrollment, parade attendance tracking, training syllabus delivery, leave management, and officer administration for the SBU Company.

### Key Capabilities

- **Cadet Portal**:
  - Live attendance overview & percentage tracker
  - Printable NCC Cadet Digital Identity Card with QR verification
  - Leave application workflow with officer review status
  - Uniform sizes & DBT bank verification manager
  - Interactive training syllabus & 0.22 Rifle practice quizzes
  - Event calendar & parade preparation checklists
  - Official Certificate verification & PDF export

- **Officer & Administration Dashboard**:
  - Cadet enrollment request review & verification engine
  - Automated status management (Approved, Under Review, Verified)
  - Full CSV / Excel batch export for battalion records
  - Attendance log entry & drill performance tracker
  - Announcement broadcasting system

- **AI Cadre Assistant**:
  - Server-side Gemini AI integration for drill manual lookups, weapon specs, and NCC syllabus guidance.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Motion (`motion/react`), Lucide Icons
- **Backend / API**: Express.js server running in Node.js environment
- **AI Integration**: Google Gen AI SDK (`@google/genai`) via server-side `/api/ai-cadre` endpoint
- **PDF & Certificate Generation**: Client-side dynamic DOM rendering with html2canvas and jspdf

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Gemini API Key (optional, for AI Cadre Assistant features)

### Installation

```bash
# Clone repository
git clone https://github.com/organization/ncc-sbu-portal.git
cd ncc-sbu-portal

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 📜 Available Scripts

- `npm run dev`: Starts the Express + Vite dev server.
- `npm run build`: Compiles client assets with Vite and bundles the server with esbuild.
- `npm run start`: Runs the production CommonJS server (`node dist/server.cjs`).
- `npm run lint`: Runs TypeScript type checking (`tsc --noEmit`).

---

## 🛡️ Security & Privacy

All API keys (such as `GEMINI_API_KEY`) remain strictly on the server-side and are never exposed to client browsers. See [SECURITY.md](SECURITY.md) for details.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
