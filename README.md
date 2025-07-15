# Realtime Chat Application

A modern, full-featured real-time chat application built with React and Socket.io, featuring secure authentication, media sharing, and responsive design.

## 🚀 How to Use This App

### 1. **Sign In**
- Visit the application URL
- Click "Sign In" to authenticate using Clerk
- Complete the authentication process

### 2. **Join a Chat Room**
- After signing in, you'll see the "Join Chat Room" interface
- Enter a Room ID (create your own or use one shared by friends)
- Click "Join Room" to enter the chat

### 3. **Start Chatting**
- Type messages in the input field at the bottom
- Press Enter or click the send button to send messages
- Click the attachment icon to share photos or videos
- Your messages appear on the right (dark), others' on the left (light)

### 4. **Share the Experience**
- Share your Room ID with friends so they can join the same chat
- Leave the room anytime by clicking the "Leave" button in the header

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework for styling
- **Socket.io Client** - Real-time bidirectional event-based communication
- **Clerk** - Complete authentication and user management
- **React Scroll to Bottom** - Automatic scrolling for chat messages

### Backend Features
- **Real-time messaging** with Socket.io
- **Media sharing** (photos and videos)
- **Message persistence** with timestamp formatting
- **Room-based chat** system
- **Responsive design** for mobile and desktop

### Key Dependencies
```json
{
  "@clerk/clerk-react": "^5.34.0",
  "@tailwindcss/vite": "^4.1.11",
  "react": "^19.1.0",
  "react-scroll-to-bottom": "^4.2.0",
  "socket.io-client": "^4.8.1",
  "tailwindcss": "^4.1.11"
}
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatHeader.jsx      # Room info and controls
│   │   ├── ChatInput.jsx       # Message input and media upload
│   │   ├── Chats.jsx          # Main chat container
│   │   ├── JoinRoom.jsx       # Room joining interface
│   │   ├── MessageBubble.jsx  # Individual message component
│   │   └── MessageList.jsx    # Messages container with loading states
│   ├── hooks/
│   │   ├── useAutoScroll.js   # Auto-scroll to latest messages
│   │   └── useChatLogic.js    # Core chat functionality
│   ├── assets/
│   │   └── chat.png          # App icon
│   ├── App.jsx               # Main application component
│   ├── main.jsx             # React app entry point
│   ├── App.css              # Custom styles and animations
│   └── index.css            # Tailwind CSS imports
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── eslint.config.js        # ESLint configuration
```

## ✨ Features

### 🔐 **Authentication**
- Secure authentication powered by Clerk
- User profile management
- Persistent login sessions

### 💬 **Real-time Messaging**
- Instant message delivery using Socket.io
- Message persistence across sessions
- Timestamp formatting (12-hour format with AM/PM)

### 📱 **Media Sharing**
- Photo upload and display
- Video upload with playback controls
- File type validation
- Base64 encoding for media transmission

### 🎨 **Modern UI/UX**
- Responsive design for all screen sizes
- Clean, modern interface with neutral color scheme
- Loading states and empty state handling
- Smooth scrolling and animations
- Message bubbles with sender identification

### 🏠 **Room System**
- Create and join custom chat rooms
- Room ID sharing for group conversations
- Room persistence with localStorage
- Easy room switching

### 📱 **Mobile Optimized**
- Touch-friendly interface
- Responsive breakpoints for different screen sizes
- Optimized media handling for mobile devices

## 🔧 Development Tools

- **ESLint** - Code linting with React-specific rules
- **Vite** - Fast development server with HMR
- **Environment Variables** - Secure configuration management

## 🌐 Frontend

The application is connected to a frontend at `https://chat-app-frontend-93hn.vercel.app/`

---

*Built with ❤️ using modern web technologies for seamless real-time communication.*
