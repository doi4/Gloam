# 🌇 Gloam

**Gloam** is a beautifully designed, universal social application built with Expo and React Native, dedicated entirely to tracking, capturing, and sharing stunning sunsets. Built with modern, stylistic UI elements, Gloam allows users to anticipate the golden hour, capture the perfect dusk moments, and share them with friends or the world.

## ✨ Features

- **🌅 Dusk Capture:** A custom in-app camera experience optimized for sunset photography. Features a stylized 3:4 rounded viewfinder that seamlessly stretches edge-to-edge during the composition phase.
- **📸 Seamless Post Composition:** After capturing or selecting a photo, users are immersed in an edge-to-edge preview screen where they can add captions, select location tags, and choose their audience (Friends & Local, Friends Only, or Global).
- **📱 True-Black Glass Tab Bar:** A custom-engineered, floating true-black (`#000000`) capsule navigation bar. Engineered with `expo-blur` to provide a frosted glass translucent effect that floats beautifully above content while taking up minimal width.
- **🌦️ Sunset Forecasting:** Built-in tools for tracking upcoming sunset quality and golden hour timing (accessible via the Forecast tab).
- **🌍 Social Feed:** A home feed to discover and view gorgeous sunsets captured by the community and friends.
- **🚀 Universal Platform Support:** Built with Expo Router, running seamlessly across iOS, Android, and the Web.

## 🛠 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) (v0.86)
- **Toolchain:** [Expo SDK 57](https://expo.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **UI & Animations:** React Native Reanimated, Expo Blur, Expo Symbols, Expo UI
- **Camera & Media:** `expo-camera`, `expo-image-picker`
- **Language:** TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo Go app on your physical device, or an iOS Simulator / Android Emulator

### Installation

1. **Clone the repository** (if hosted remotely) or navigate to the project directory:
   ```bash
   cd Gloam
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   *Alternatively, you can run explicitly for a platform:*
   ```bash
   npm run ios      # Starts the iOS simulator
   npm run android  # Starts the Android emulator
   npm run web      # Starts the web version
   ```

## 🏗️ Project Structure

- `src/app/`: File-based routing for the application via Expo Router.
  - `(tabs)/_layout.tsx`: Contains the custom frosted glass floating tab bar implementation.
  - `(tabs)/capture.tsx`: The primary camera, photo picking, and post-composition screen.
  - `(tabs)/index.tsx`: The main feed.
  - `(tabs)/forecast.tsx`: The sunset forecasting view.
- `src/components/`: Reusable UI components (Themed text, icons, gauges, feed cards).
- `src/constants/theme.ts`: Global theme variables (colors, spacing, tab bar dimensions).
- `src/services/`: Mock data and core services handling location and social post management.
- `assets/`: App icons, splash screens, and local images.

## 🎨 Design System

Gloam features a dark-themed, highly stylized OLED-friendly aesthetic (`#000000` backgrounds). It utilizes specific spacing (`Spacing` constants), true-black frosted glass elements, and rounded pills/buttons to create a modern and immersive media consumption and creation experience.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
