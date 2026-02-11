# React Native Mobile App - README

## Overview
Production-grade React Native mobile app built with Expo that connects to the backend API.

## Tech Stack
- React Native with Expo
- Redux Toolkit for state management
- Axios for API calls
- Socket.io-client for real-time updates
- Expo Secure Store for token storage
- React Navigation for routing

## Installation

```bash
cd frontend
npm install
```

## Configuration

Create a `.env` file:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Running the App

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Scan QR code with Expo Go app

## Project Structure

```
src/
 ├── app/           # Redux store
 ├── services/      # API & Socket.io services
 ├── features/      # Redux slices
 ├── screens/       # Screen components
 ├── navigation/    # Navigation config
 ├── components/    # Reusable components
 ├── hooks/         # Custom hooks
 └── utils/         # Utilities
```

## Features

- ✅ JWT Authentication with Expo Secure Store
- ✅ Real-time updates via Socket.io
- ✅ Ticket management (create, redeem, resolve)
- ✅ Solution search and reuse
- ✅ Clean architecture (services layer, thin UI)
