# Tech Stack & Concepts 🛠️

This document explains the key technologies used in the frontend, **Where** they are used, **Why** we chose them, and **How** we implemented them.

---

## 🚀 Core Framework

### 1. Expo (Managed Workflow)
> **Simple Word**: The "Easy Mode" for building apps. It handles all the complex setup (like Java/Swift code) so we can just write JavaScript/TypeScript.

-   **What**: A framework on top of React Native.
-   **Why**:
    -   Simplifies testing: You can run the app on your phone using the "Expo Go" app without installing Android Studio.
    -   Updates: Allows Over-the-Air (OTA) updates for some changes.
-   **How We Use It**:
    -   We configured `app.json` with our app name ("Knowledge App") and package ID.
    -   We use `npx expo start` to run the development server.

### 2. Expo Router (`expo-router`)
> **Simple Word**: The "Map" of the app. It turns files into screens automatically. If you create a file, it becomes a page.

-   **What**: File-based navigation logic.
-   **Why**:
    -   **Deep Linking**: If you send a link `myapp://tickets/123`, it opens that specific ticket page automatically.
    -   **Layouts**: The `_layout.tsx` files let us create "Wrappers" (like adding a Header or Tab Bar) that persist across screens.
-   **How We Use It**:
    -   `src/app/index.tsx`: This is the entry point. It checks if you are logged in.
    -   `src/app/(tabs)/_layout.tsx`: Creates the bottom menu (Home, Profile, etc.).

---

## 🧠 State Management

### 3. Redux Toolkit (`@reduxjs/toolkit`)
> **Simple Word**: The "Shared Brain". It remembers data (like User Info) so every screen can see it without asking the server again.

-   **What**: Global state management.
-   **Why**:
    -   **Predictable**: We know exactly when data changes because only "Actions" can change functionality.
    -   **Async Logic**: It has `createAsyncThunk` which is perfect for API calls (Loading -> Success -> Error).
-   **How We Use It**:
    -   We created "Slices" in `src/features/`.
    -   **Example**: The `ticketSlice` has an array `list: []`. When you pull down to refresh, we dispatch `fetchTickets( )`. The API replies, and Redux updates `list`. Now the Home Screen automatically shows the new tickets.

### 4. Expo Secure Store (`expo-secure-store`)
> **Simple Word**: A "Digital Safe". We lock important secrets (like the login token) here.

-   **What**: Encrypted storage on the device.
-   **Why**:
    -   **Security**: Regular storage (`AsyncStorage`) is just a text file. If a hacker got the phone, they could read it. Secure Store uses the phone's hardware encryption (FaceID/Passcode logic).
-   **How We Use It**:
    -   When you log in, the server sends a `token`. We run `SecureStore.setItemAsync('token', 'xyz...')`.
    -   When you open the app next time, we read this token to log you in automatically.

---

## 📡 Communication

### 5. Axios (`axios`)
> **Simple Word**: The "Mailman". He takes our messages (requests) to the server and brings back the replies.

-   **What**: HTTP Client.
-   **Why**:
    -   **Interceptors**: This is the superpower. We set up a "Rule" in `src/services/api/axiosInstance.ts`: *"Before sending ANY letter, stamp it with the User's Token"*.
    -   This means we don't have to manually write `headers: { Authorization... }` in every single API call.
-   **How We Use It**:
    -   `axiosInstance.get('/tickets')` automatically becomes `GET https://api.com/tickets` with the correct security headers.

### 6. Socket.io Client (`socket.io-client`)
> **Simple Word**: The "Live Chat". It keeps a connection open so the server can shout "New Ticket!" instantly.

-   **What**: Real-time bidirectional communication.
-   **Why**:
    -   Without this, you would have to "Refresh" the page to see new tickets.
    -   With Sockets, the server "pushes" data to us.
-   **How We Use It**:
    -   We connect in `socketClient.ts` after login.
    -   We listen for events like `'ticket_created'`. When we hear it, we tell Redux to add the new ticket to the top of the list immediately.

### 7. Expo Notifications (`expo-notifications`)
> **Simple Word**: The "Pager". It listens for alerts even when the app is in your pocket.

-   **What**: Push Notification handler.
-   **Why**:
    -   To alert admins when a ticket is created, even if their phone is locked.
-   **How We Use It**:
    -   1. We ask the user for permission ("Allow Notifications?").
    -   2. We get a token address (`ExpoPushToken[123]`).
    -   3. We send this to our Backend.
    -   4. The Backend uses this address to send alerts via Google/Apple servers.

---

## 🎨 UI & Media

### 8. Expo Image Picker (`expo-image-picker`)
> **Simple Word**: The "Camera Operator". It lets the app see through the phone's camera or look at photos.

-   **What**: Camera/Gallery access.
-   **Why**:
    -   Native capabilities (permissions, file access) are hard to write from scratch. This library does it for us.
-   **How We Use It**:
    -   In `write-solution.tsx`, when you click "Attach Image", we call `launchImageLibraryAsync`. It returns the file path, and we upload it to the server.

### 9. Expo Status Bar (`expo-status-bar`)
> **Simple Word**: The "Top Bar Controller". It changes the battery/clock text to white or black so you can read it.

-   **What**: UI control for the system bar.
-   **Why**:
    -   Good UX. If our app background is dark, we need white text. If light, black text.
-   **How We Use It**:
    -   We place `<StatusBar style="auto" />` in our main layout to let the OS decide the best color.

---

## 📱 Native Features

### 10. React Native Android Widget (`react-native-android-widget`)
> **Simple Word**: The "Home Screen Sticker". A mini-version of the app that lives on your wallpaper.

-   **What**: Tool to build Android Widgets using React code.
-   **Why**:
    -   Normally, you need to write Kotlin/Java for widgets. This allows us to use what we know (JavaScript).
-   **How We Use It**:
    -   We define a layout in `TicketStatsWidget.tsx` (using Flexbox).
    -   We use a background task to update the numbers (Open: 5, Resolved: 10) whenever the main app data changes.

### 11. Expo Device (`expo-device`)
> **Simple Word**: The "Detective". It figures out if the app is running on a real phone or a computer simulator.

-   **What**: Device information.
-   **Why**:
    -   Push Notifications **do not work** on Simulators. We need to know if we are on a simulator so we don't try to register for notifications and crash.
-   **How We Use It**:
    -   We check `Device.isDevice`. If `true`, we proceed with notification setup. If `false`, we log "Must use physical device".
