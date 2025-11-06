# IO - Quick Start Development Guide

## 🚀 **Immediate Development Setup**

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Visit: `http://localhost:3000`

### 3. Current Application Flow
1. **Landing Page** (`/`) - Introduction to IO
2. **Email Verification** (`/onboarding/email`) - Mock email entry
3. **Gender Selection** (`/onboarding/gender`) - Choose gender
4. **Username Generation** (`/onboarding/username`) - Get random alias
5. **Dashboard** (`/dashboard`) - Main chat interface

## 📁 **Project Structure**

```
src/
├── app/
│   ├── dashboard/page.tsx          # Main chat interface
│   ├── onboarding/
│   │   ├── email/page.tsx         # Email verification (mock)
│   │   ├── gender/page.tsx        # Gender selection
│   │   └── username/page.tsx      # Username generation
│   ├── globals.css                # Global styles & Tailwind
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   └── landing/
│       └── landing-content.tsx    # Landing page component
└── lib/
    └── names.ts                   # Random name generation utilities
```

## 🎨 **Current Features (Working)**

### ✅ **Frontend Features**
- Beautiful landing page with animations
- Complete onboarding flow
- Mock email verification UI
- Gender selection with animations
- Random username/alias generation
- Dashboard with mock chat functionality
- Simulated chat responses
- Mock identity reveal system
- Rating system UI
- Responsive design
- Dark theme with neon accents

### ❌ **Backend Features (Missing)**
- Real email verification
- User authentication
- Database persistence
- Real-time messaging
- Actual matchmaking
- User data storage

## 🛠️ **Development Commands**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🎯 **Current Limitations**

1. **No Real Backend** - All data is client-side mock data
2. **No Persistence** - Data resets on page refresh
3. **Mock Authentication** - Email verification is just UI
4. **Simulated Chat** - Responses come from predefined array
5. **Hardcoded Identities** - User profiles are templates

## 🚨 **Critical Missing Components**

### Immediate Needs for Production:
1. **Backend Server** (Node.js/Express/Fastify)
2. **Database** (PostgreSQL/MongoDB)
3. **Authentication System** (JWT)
4. **Real-time Communication** (WebSockets)
5. **Email Service** (SendGrid/Resend)

### Environment Variables Needed:
```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"

# Email Service
EMAIL_API_KEY="your-email-service-key"
FROM_EMAIL="noreply@yourdomain.com"

# WebSocket
WEBSOCKET_PORT=3001

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

## 🔧 **Quick Development Tips**

### Adding New Features:
1. Components go in `src/components/`
2. Pages go in `src/app/`
3. Utilities go in `src/lib/`
4. Use TypeScript for type safety
5. Follow existing animation patterns with Framer Motion

### Styling Guidelines:
- Use Tailwind CSS classes
- Custom colors defined in `globals.css`
- Maintain dark theme consistency
- Use existing animation patterns

### State Management:
- Currently using React hooks
- Consider Context API for global state
- For production, consider Zustand/Redux

## 📝 **Next Development Steps**

1. **Set up Backend Server**
   ```bash
   mkdir server && cd server
   npm init -y
   npm install express cors dotenv jsonwebtoken
   ```

2. **Database Setup**
   ```bash
   # Install PostgreSQL or use Supabase
   # Create tables for users, chats, messages
   ```

3. **Authentication Implementation**
   ```bash
   npm install bcryptjs jsonwebtoken
   ```

4. **Real-time Communication**
   ```bash
   npm install socket.io
   ```

## 🐛 **Common Issues**

1. **Fonts not loading** - Check Google Fonts imports in `layout.tsx`
2. **Animations not working** - Ensure Framer Motion is properly installed
3. **Tailwind styles not applying** - Check `tailwind.config.js` and `globals.css`
4. **TypeScript errors** - Check `tsconfig.json` paths configuration

## 📞 **Support**

For development questions:
1. Check the console for errors
2. Verify all dependencies are installed
3. Ensure proper file structure
4. Review TypeScript configuration

---

**Note:** This is currently a frontend prototype. All backend functionality needs to be implemented for production use.