# Agatka Turbo Messaging App

A real-time messaging app with disappearing messages built with React Native, Expo, and Supabase.

## Features

- Real-time messaging with keystroke-by-keystroke updates
- Messages that degrade over time (10% per minute after 5 minutes)
- User authentication with email/password and Google OAuth
- Friend management system
- Dark mode support

## Tech Stack

- Frontend: React Native with TypeScript
- Framework: Expo with Expo Router
- UI: React Native Paper
- Backend: Supabase
- State Management: React Context
- Authentication: Supabase Auth

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Supabase account

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd agatka_turbo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key
   - Run the SQL migrations in `supabase/migrations/initial_schema.sql`

4. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add your Supabase configuration:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
agatka_turbo/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication routes
│   ├── (app)/             # Main app routes
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── contexts/              # React contexts
├── hooks/                # Custom hooks
├── utils/                # Utility functions
└── supabase/            # Supabase configurations
```

## Development

1. Authentication Flow:
   - Login screen (`app/(auth)/login.tsx`)
   - Registration screen (`app/(auth)/register.tsx`)
   - Auth context (`contexts/AuthContext.tsx`)

2. Main App Flow:
   - Friends list (`app/(app)/index.tsx`)
   - Chat screen (`app/(app)/chat/[id].tsx`)
   - Settings (`app/(app)/settings.tsx`)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
