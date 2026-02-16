# Aero Graph V.1: Live Air-Writing Alphabet Recognition System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Solutions-blue?style=for-the-badge&logo=google)](https://developers.google.com/mediapipe)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Aero Graph V.1** is a cutting-edge, real-time alphabet recognition system that allows users to write in the air using their index finger. Powered by MediaPipe's high-fidelity hand tracking and a custom rule-based neural interpretation engine, it translates physical gestures into digital characters instantly.

---

## ✨ Key Features

- **🚀 Real-Time Gesture Tracking**: Low-latency index finger tracking using MediaPipe Hands.
- **🧠 Neural Engine (EMNIST)**: Integrated TensorFlow.js model recognizing **62 classes** (0-9, A-Z, a-z).
- **👁️ Natural Unmirrored View**: Explicitly unmirrored camera and drawing for a more intuitive user experience.
- **📱 Android/Mobile Optimized**: Fully responsive layout with touch-friendly controls.
- **⚡ Dual-Mode Predictions**: Fast rule-based guesses followed by high-accuracy ML "Final Predictions".
- **🎨 Futuristic UI**: Dark-themed, neon-accented interface with backdrop blur and glow effects.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Tracking**: [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: React Hooks (useState, useRef, useEffect)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- A working webcam

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aero-graph.git
   cd aero-graph
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How to Use

1. **Permissions**: Grant camera access when prompted by the browser.
2. **Setup**: Position yourself so your upper body and hands are clearly visible to the webcam.
3. **Writing**: Use your **index finger** to "draw" letters in the air.
4. **Recognition**: The system will highlight your path and display the predicted letter in the "Neural Interpretation" panel.
5. **Clear**: Use the on-screen "Clear" button (if available) or wait for the system to auto-reset to start a new letter.
---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
