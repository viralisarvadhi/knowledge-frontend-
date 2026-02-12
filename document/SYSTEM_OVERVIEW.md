# Frontend Mobile App - Complete Documentation

This document provides a detailed, file-by-file explanation of the Frontend (Reference: `frontend/src`).

> **Simple Explanation**: This is the manual for the Mobile App. It explains where every file is and what it does, so you don't get lost in the folders.

## ✅ Root Directory

### Configuration Files
-   **`app.json`**: Main configuration for Expo.
    -   *Simple Word*: The identity card of the app. It tells the phone "My name is Knowledge App" and "I need to use the Camera".
    -   `name`, `slug`: App identity.
    -   `plugins`: `expo-camera`, `react-native-android-widget` settings.
    -   `android.package`: "com.knowledge.app".
-   **`eas.json`**: Expo Application Services Build Config.
    -   *Simple Word*: Measurements for the factory. It tells the build server "Make a testing version" or "Make a Play Store version".
    -   `development`: Profile for building `.apk` with Dev Client.
    -   `production`: Profile for Play Store submission.
-   **`package.json`**: Dependencies.
    -   *Simple Word*: The shopping list. It lists all the external tools (libraries) we need to download for the app to work.
    -   Lists `react-native`, `expo`, `@reduxjs/toolkit`.
-   **`google-services.json`**: (Secret) Firebase credentials.
    -   *Simple Word*: The VIP pass. It allows our app to talk to Google's Notification Server securely.
-   **`babel.config.js`**: JavaScript compiler settings (plugins/presets).
    -   *Simple Word*: The translator settings. It helps convert modern code into something older phones can understand.

### Folders
-   **`src/`**: The complete source code. (The Kitchen where we cook).
-   **`assets/`**: Splash screen, icons, adaptive icons. (The Images and Logos).
-   **`.expo/`**: Auto-generated config. (Ignore this, it's automatic).
-   **`android/`**: (Generated) Native Android project files. (The Engine Room for Android).

---

## ✅ `src/` Directory (Source Code)

### 📂 `src/app/` (Screens & Navigation)
> **Simple Explanation**: These are the "Pages" of the app. The folders match the navigation (like website URLs).

-   **`_layout.tsx`**: The Root Layout for the entire app.
    -   *Simple Word*: The Master Frame. Everything else (Login, Home) is displayed *inside* this frame.
    -   Wraps app in `<Provider store={store}>` (Redux).
    -   Handles Authentication logic (redirect to login if no token).
-   **`index.tsx`**: The starting screen.
    -   *Simple Word*: The Front Door. It decides if you go to the Living Room (Home) or the Guest Room (Login).

#### Sub-folder: `(auth)`
-   **`login.tsx`**: Login Screen.
    -   *Simple Word*: The Sign-in Page.
    -   Input: Email, Password.
    -   Action: Calls `auth.service.login`.
-   **`register.tsx`**: Registration Screen.
    -   *Simple Word*: The Sign-up Page.

#### Sub-folder: `(tabs)`
> **Simple Explanation**: The pages you see when you click the bottom menu bar.

-   **`_layout.tsx`**: Configures the Bottom Tab Bar.
    -   Tabs: `tickets` (Home), `approvals` (Admin), `profile` (User), `notifications`.
-   **`tickets.tsx`**: Home Screen.
    -   Display: List of active tickets.
    -   Features: Filtering by status, Create Ticket FAB.
-   **`approvals.tsx`**: Admin Dashboard.
    -   Display: Solutions pending approval.
    -   Logic: Only visible if you are an Admin.
-   **`profile.tsx`**: User Profile.
    -   Display: Avatar, Name, Credits.
    -   Lists: "Created Tickets" and "My Work".
-   **`notifications.tsx`**: Notification Center.
    -   Display: History of alerts received.

#### Sub-folder: `(user)`
-   **`ticket-detail.tsx`**: Detailed Ticket View.
    -   *Simple Word*: The full page for a single ticket.
    -   Actions: "Redeem Ticket" (Task it), "Submit Solution" (Fix it).
-   **`write-solution.tsx`**: Form to submit a solution.

#### Sub-folder: `(admin)`
-   **`users.tsx`**: Admin User Management.
    -   *Simple Word*: The Boss's list of all employees.

### 📂 `src/features/` (Redux Slices)
> **Simple Explanation**: The App's "Brain". It remembers things (like who is logged in, or the list of tickets) so we don't have to ask the server every single time.

-   **`auth/authSlice.ts`**: Remembers User Info.
    -   State: `user`, `token`.
-   **`tickets/ticketsSlice.ts`**: Remembers the Ticket List.
    -   State: `list`, `loading`.
-   **`notifications/notificationSlice.ts`**: Remembers Alerts.
-   **`widgets/`**:
    -   **`TicketStatsWidget.tsx`**: The code that draws the mini-widget on your Android home screen.

### 📂 `src/services/` (API & Utilities)
> **Simple Explanation**: The Messengers. They take messages from the App and deliver them to the Server (Backend) or the Phone System.

-   **`api/axiosInstance.ts`**: The Postman.
    -   Automatically stamps every letter with your ID card (Token) so the server knows it's you.
-   **`api/auth.service.ts`**: Talks to Server about Login/Register.
-   **`api/ticket.service.ts`**: Talks to Server about Tickets.
-   **`pushNotification.ts`**: Talks to the Phone System to get permission for "Ding!" alerts.
-   **`socket.service.ts`**: The Walkie-Talkie. Keeps a constant line open to the server for instant updates.
-   **`widget.service.ts`**: The Note Taker. Writes down ticket counts onto a sticky note (Shared Prefs) so the Widget can read it later.

### 📂 `src/store/` (State Config)
-   **`store.ts`**: Combines all the small "Brains" (features) into one big Brain.

### 📂 `src/components/` (UI Components)
> **Simple Explanation**: The LEGO bricks. Small pieces we reuse to build pages.

-   **`common/`**: Basic bricks (Buttons, Inputs).
-   **`TicketCard.tsx`**: A rectangle showing ticket info.
-   **`SolutionCard.tsx`**: A rectangle showing a solution.
-   **`ImageViewerModal.tsx`**: A popup to see images big.

### 📂 `src/utils/` (Helpers)
-   **`formatDate.ts`**: Converts computer time ("2023-10-01T12:00:00Z") to human time ("2 hours ago").
