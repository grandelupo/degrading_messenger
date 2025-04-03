## Tech Stack

- Frontend: React Native with TypeScript, Expo and Expo router
- Backend/Database: Supabase
- UI Framework: React Native Paper

## Core Features

### Authentication
- User Login (email & password)
- Registration (email, password, username)
- Register using Google OAuth
- Persistent authentication via secure storage
- Logout

### Friend Management
- Search for users by username
- Send & accept friend requests
- Remove/block users from friend list

### Messaging System
- Instant Sending: Messages are sent immediately when typed (no backspace/delete). The interlocutor can see each keystore being typed in.
- Self-Destruction: Messages degrade over time (10% removed per minute after 5 minutes)
- Support for text-only messages (no media)
- Show last active status
- Realtime updates with WebSockets

### User Interface
- Simple and minimalistic chat UI
- List of active chats
- Basic settings page (logout, change password, etc.)
- Light & dark mode

## Page Breakdown

### 1. Authentication Flow
#### Login Screen
- Inputs: Email, Password
- "Forgot Password?" link
- "Sign Up" link
- "Login with Google" link

#### Register Screen
- Inputs: Email, Password, Confirm Password, Username
- "Already have an account?" link
- "Register with Google" link

### 2. Main App
#### Home (Friends List)
- Displays a list of friends
- Option to search/add new friends
- Clicking on a friend opens chat

#### Chat Screen
- Live conversation view
- Input field (pressing any key sends the keystoroke and adds it to the last message)
- Messages start degrading after 5 minutes (10% per minute)
- Last seen status

#### Search/Add Friends Screen
- Search users by username
- Send friend requests
- View pending requests

#### Settings
- Change password
- Logout