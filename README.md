# CodeClashZone

CodeClashZone is an innovative real-time coding battleground platform. It is designed to provide an engaging and competitive environment where developers can enhance their coding skills by solving algorithmic and frontend UI challenges, either solo or in multiplayer mode.

---

## Project Overview

The platform facilitates real-time coding battles that simulate competitive programming contests and frontend development tasks. Users can challenge themselves or compete against others, fostering a collaborative and competitive learning atmosphere. Key features include live chat for communication, leaderboards to track performance, and robust user authentication to ensure secure and personalized experiences.

---

## Key Features

- **Real-time Solo and Multiplayer Coding Battles:** Engage in timed challenges that test algorithmic problem-solving and frontend UI skills.
- **Automated Code Correctness Validation:** Submissions are automatically evaluated for correctness, providing immediate feedback.
- **Live Chat Integration:** Communicate seamlessly with other participants during battles to discuss strategies or socialize.
- **Dynamic Leaderboards:** Track and compare performance with other users, encouraging continuous improvement.
- **Secure User Authentication:** Implemented with JWT and cookie-based sessions, supporting role-based access control for different user permissions.
- **Scalable Architecture:** Built with modern technologies to support real-time interactions and efficient data management.

---

## Technical Architecture

- **Frontend:** Developed using React.js with TypeScript and Vite for fast development and optimized builds. TailwindCSS is used for styling, ensuring a responsive and modern UI.
- **Backend:** Node.js and Express.js power the RESTful API, handling authentication, problem management, submissions, and real-time communication.
- **Real-time Communication:** Socket.IO enables bidirectional communication between clients and the server, supporting live chat and multiplayer interactions.
- **Database:** MongoDB stores user data, coding problems, submissions, and leaderboard information.
- **Authentication:** Secure authentication is managed using JWT tokens and cookie-based sessions, with role-based access control to differentiate user capabilities.

---


## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory with the following environment variables:
   ```
   MongoDB_URI=your_mongodb_connection_string
   PORT=8000
   ```
4. Start the backend server:
   ```bash
   npm run start
   ```
   The server will start on `http://localhost:8000`.

### Frontend Setup

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.



---

## Usage

- Open the frontend URL in your browser (`http://localhost:5173`).
- Register or login to access the platform.
- Participate in solo or multiplayer coding battles.
- Use live chat to communicate with other users.
- Track your progress on the leaderboard.

---

## Folder Structure

```
/client      # React frontend application
/server      # Node.js backend server
```

---

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

---

Created by Mehek and Yasir