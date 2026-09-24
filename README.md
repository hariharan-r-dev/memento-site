# Memento

> **Little things worth keeping.**  
> A desktop companion application bringing physical-feeling digital charms to your workspace.

---

## Overview

**Memento** is a digital desktop companion designed to make digital workspaces feel tactile and personal. Users can collect, customize, and hang physical-feeling charms (Mementos) directly on their desktop screen. Each charm reacts to drag and motion through realistic Verlet rope physics, inertia, and momentum.

This repository contains the complete web application, landing page, interactive desktop simulator, legal portals, and update release logs.

---

## Features

- **Interactive Verlet Physics Engine**: Real-time rope dynamics, tension constraints, velocity damping, and natural settling.
- **Desktop Simulator**: In-browser macOS workspace simulator allowing visitors to interactively test hanging charms, adjust rope lengths, and scale sizes.
- **Curated Collections**: Explore curated collections spanning Devotional, Automotive, Marvel, DC, and more.
- **Custom Memento Creation**: Workflow to turn personal vehicles, pets, symbols, or memories into custom digital mementos.
- **Update Release Log (`/updates`)**: Platform-filtered changelogs for Windows and macOS builds.
- **Editorial Legal Pages (`/privacy` & `/terms`)**: Clean, comprehensive policy and service agreements.
- **Refined Flat Dark UI**: Consistent typography, sentence-case hierarchy, and pure border-and-contrast aesthetics without artificial drop shadows.

---

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript 5.7
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS v4 & Modern Vanilla CSS Design Tokens
- **Physics & Graphics**: HTML5 Canvas 2D image processing, SVG cord rendering, and Verlet integration physics engine
- **Typography**: Google Fonts (*Plus Jakarta Sans*)

---

## Project Structure

```
├── public/
│   ├── assets/             # Wallpapers, artwork backdrops, charm imagery
│   └── fonts/              # Custom typography assets
├── src/
│   ├── components/         # InteractiveMemento, CharmArt, Navigation, Layout
│   ├── data/               # Charms catalog, collections, update release logs
│   ├── pages/              # HomePage, UpdatesPage, PrivacyPage, TermsPage
│   ├── index.css           # Global Tailwind CSS v4 tokens and theme variables
│   ├── App.tsx             # Route management and layout provider
│   └── main.tsx            # React application entrypoint
└── vite.config.ts          # Vite configuration
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm / npm / yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start Vite development server
npm run dev
```

### Build

```bash
# Create production build
npm run build
```

---

## License

All rights reserved © Memento.
