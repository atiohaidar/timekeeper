# ⏱️ Timekeeper Dashboard

A beautiful, hand-drawn "Notebook Style" real-time event runner dashboard built with **Nuxt 4** and **Pinia**.

## ✨ Features

- **📖 Notebook Aesthetic**: Authentic hand-drawn UI with line paper, sketchy buttons, and handwritten fonts.
- **⏱️ Real-time Tracking**: Start, stop, and track agenda items with live timers.
- **⚡ Dynamic Scheduling**: Automatically adjusts estimated start times for all remaining agendas based on current progress.
- **📌 Smart Reminders**: Division-specific reminders tied to agenda timing (e.g., -5m for MC, +10m for Sound).
- **🔄 Drag & Drop**: Easy reordering of agenda items in "Edit Mode".
- **📔 Change Log**: Automated logging of all timing changes, cancellations, and reorders.
- **🎯 Time Navigation**: Quick jump buttons to "Now", "Next", and "Previous" agendas.
- **🔔 Interactive Toasts**: Beautiful notifications for all major actions.

## 🚀 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: Emoji & Custom CSS sketchy elements
- **Fonts**: Google Fonts (Handlee, Patrick Hand, etc.)

## 🛠️ Setup

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📐 Architecture

- **Stores**: `app/stores/timekeeper.ts` - Centralized logic for agenda state, timer, and scheduling.
- **Components**: Modularized sketchy components in `app/components/timekeeper/`.
- **Layouts**: Custom notebook layout with margin and lines.

## 📝 License

MIT
