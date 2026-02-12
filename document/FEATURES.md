# Frontend Features (State Management) 🧠

This directory contains the **Redux Slices** that manage the application's global state using Redux Toolkit.
Each folder represents a distinct "Feature" or domain of the application.

> **Simple Explanation**: Think of this as the "Short-term Memory" of the app. When you load tickets from the server, we store them here so we can show them instantly on different screens without loading them again.

## 📂 Folder Structure

-   `auth/`: User authentication (Login, Register, Token).
-   `tickets/`: Support ticket management (CRUD).
-   `solutions/`: Knowledge Base (Search, Submit).
-   `admin/`: Administrative tools (Approve, Users, Stats).
-   `credits/`: User points tracking.
-   `widgets/`: Logic specific to the Android Home Screen Widget.

---

## 🛠️ Detailed Feature Breakdown

### 1. Auth Feature (`auth/`)
> **Simple Word**: Handles "Who am I?". It keeps your secret Token safe and remembers your Name and Role.

Manages the current user's session.
-   **State**: `user` (Object), `token` (JWT), `isAuthenticated` (Bool), `role` (trainee/admin).
-   **Actions (Thunks)**:
    -   `login`: specific `authService.login()` call. Upon success, stores token in `SecureStore` and connects `Socket`.
    -   `register`: specific `authService.register()` call. Similar post-login logic.
    -   `getMe`: Fetches current user details using the stored token.
-   **Reducers**:
    -   `logout`: Clears state, deletes token from storage, disconnects socket.

### 2. Tickets Feature (`tickets/`)
> **Simple Word**: Handles the "To-Do List". It keeps the list of tickets and updates it instantly when someone else adds one.

Manages the list of support tickets.
-   **State**: `list` (Array of Tickets).
-   **Actions (Thunks)**:
    -   `fetchTickets`: GET /tickets from API.
    -   `createTicket`: POST /tickets.
    -   `redeemTicket`: PATCH /tickets/:id/redeem.
    -   `resolveTicket`: PATCH /tickets/:id/resolve.
-   **Socket Reducers** (Real-time):
    -   `addTicket`: Adds a new ticket to the top of the list (triggered by `ticket_created` event).
    -   `updateTicket`: Updates an existing ticket's status (triggered by `ticket_updated` event).
    -   **Widget Update**: Automatically refreshes the Android Widget stats when tickets change.

### 3. Solutions Feature (`solutions/`)
> **Simple Word**: Handles the "Answer Key". It remembers the solutions you found during a search.

Manages the Knowledge Base logic (the "Answers").
-   **State**: `searchResults` (Array), `list` (Recent solutions).
-   **Actions (Thunks)**:
    -   `searchSolutions`: Queries the API for matching solutions.
    -   `getSolutionById`: Fetches full details of a specific solution.

### 4. Admin Feature (`admin/`)
> **Simple Word**: The "Manager's Desk". It holds the pile of papers waiting for approval and the staff performance report.

Example: Dashboard for "Managers".
-   **State**: `pendingSolutions` (Array needing review), `usersList`, `stats`.
-   **Actions (Thunks)**:
    -   `fetchPendingSolutions`: Gets solutions waiting for approval.
    -   `approveSolution`: Approves a fix -> Resolves ticket -> Awards credits.
    -   `rejectSolution`: Rejects a fix -> Reopens ticket.
    -   `fetchUserStats`: Gets overview counts for the dashboard.

### 5. Credits Feature (`credits/`)
> **Simple Word**: The "Scoreboard". Keeps track of your points.

Simple tracker for user points.
-   **State**: `totalCredits` (Number).
-   **Reducers**:
    -   `setCredits`, `addCredits`: Updates the local count (though typically synced via `auth.user`).

### 6. Widgets Feature (`widgets/`)
> **Simple Word**: The "Mini-App" on your home screen.

Logic for the Native Android Widget.
-   **`TicketStatsWidget.tsx`**: Defines the UI layout (XML-like structure) for the home screen widget.
-   **Integration**: The `tickets` slice uses `react-native-android-widget` to update this UI whenever `fetchTickets` succeeds.

---

## 🔄 How It Works (The Cycle)
> **Simple Explanation**: 
> 1. You click a button.
> 2. The App calls the "Action".
> 3. The Action talks to the Server.
> 4. The Server replies.
> 5. The App updates its "Memory" (State).
> 6. The Screen changes automatically.

1.  **Component** calls `dispatch(fetchTickets())`.
2.  **Redux Thunk** calls `api.ticketService.getTickets()`.
3.  **API** returns data.
4.  **Reducer** updates `state.list`.
5.  **UI** (React Component) re-renders automatically with new data.
