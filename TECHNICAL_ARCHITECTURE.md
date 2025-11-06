# IO - Technical Architecture Overview

## 🏗️ **Current Architecture**

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter + Space Grotesk (Google Fonts)

### Current State
```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Landing   │  │ Onboarding  │  │      Dashboard      │ │
│  │     Page    │  │    Flow     │  │   (Mock Chat)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Client-Side State Only                    │ │
│  │  • React Hooks (useState, useEffect)                  │ │
│  │  • URL Parameters (useSearchParams)                   │ │
│  │  • Mock Data (names.ts, hardcoded arrays)             │ │
│  │  • No Persistence                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 **Target Production Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js Application                        │ │
│  │  • Static Pages (Landing, Marketing)                  │ │
│  │  • Client-Side Auth (JWT tokens)                       │ │
│  │  • Real-time UI (WebSocket client)                    │ │
│  │  • State Management (Zustand/Context)                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 API Gateway                             │ │
│  │  • Authentication (JWT validation)                     │ │
│  │  • Rate Limiting                                       │ │
│  │  • CORS Management                                     │ │
│  │  • Request Logging                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │   Auth Service  │  │  Chat Service   │  │ User Service  │ │
│  │                 │  │                 │  │               │ │
│  │ • Email Auth    │  │ • Matchmaking   │  │ • Profiles    │ │
│  │ • JWT Tokens    │  │ • Messaging     │  │ • Settings    │ │
│  │ • Sessions      │  │ • Reveal Logic  │  │ • Ratings     │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
│                              │                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                WebSocket Server                         │ │
│  │  • Real-time Messaging                                  │ │
│  │  • User Presence                                        │ │
│  │  • Match Notification                                   │ │
│  │  • Typing Indicators                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │   PostgreSQL    │  │     Redis       │  │   S3/Cloud    │ │
│  │                 │  │                 │  │   Storage     │ │
│  │ • Users         │  │ • Sessions      │  │               │ │
│  │ • Chat Sessions │  │ • Online Users  │  │ • Avatars     │ │
│  │ • Messages      │  │ • Match Queue   │  │ • Images      │ │
│  │ • Ratings       │  │ • Cache         │  │ • Files       │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📊 **Database Schema Design**

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    alias VARCHAR(100) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('dude', 'girl')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE
);
```

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id),
    user2_id UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('active', 'ended', 'rated')),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id),
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Reveal Requests Table
```sql
CREATE TABLE reveal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id),
    requester_id UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id),
    rater_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 4),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 **API Endpoints Design**

### Authentication
```
POST /api/auth/send-magic-link
POST /api/auth/verify-token
GET  /api/auth/me
POST /api/auth/logout
```

### Users
```
GET  /api/users/profile
PUT  /api/users/profile
GET  /api/users/online-count
```

### Chat
```
POST /api/chat/find-match
GET  /api/chat/current-session
POST /api/chat/send-message
POST /api/chat/reveal-request
POST /api/chat/end-session
POST /api/chat/rate-session
```

## 🔌 **WebSocket Events**

### Client → Server
```javascript
// Connection
socket.emit('join', { userId, alias })

// Chat
socket.emit('send_message', { sessionId, content })
socket.emit('typing_start', { sessionId })
socket.emit('typing_stop', { sessionId })

// Matchmaking
socket.emit('find_match')
socket.emit('cancel_search')
```

### Server → Client
```javascript
// Connection
socket.emit('connected')
socket.emit('user_joined', { userId, alias })

// Chat
socket.emit('message_received', { message })
socket.emit('user_typing', { userId })
socket.emit('user_stopped_typing', { userId })

// Matchmaking
socket.emit('match_found', { session, user })
socket.emit('search_cancelled')
```

## 🔐 **Security Architecture**

### Authentication Flow
```
1. User enters email → /api/auth/send-magic-link
2. Server generates magic link → sends email
3. User clicks link → /api/auth/verify-token
4. Server validates token → returns JWT
5. Client stores JWT → includes in API calls
```

### Security Layers
- **Input Validation**: All API inputs validated
- **Rate Limiting**: Per-user and per-IP limits
- **CORS**: Configured for production domain
- **JWT Security**: Short-lived tokens with refresh
- **HTTPS**: All communication encrypted
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Content Security Policy

## 📈 **Scalability Considerations**

### Horizontal Scaling
- **Load Balancer**: Nginx/HAProxy for API distribution
- **Database Replication**: Read replicas for scaling reads
- **Redis Cluster**: For session storage and caching
- **WebSocket Scaling**: Socket.io adapter for multi-instance

### Performance Optimization
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Caching Strategy**: Redis for user sessions and online status
- **CDN**: Static assets served via CDN
- **Image Optimization**: WebP format with fallbacks

## 🚀 **Deployment Architecture**

### Development Environment
```
Local Machine
├── Next.js Dev Server (localhost:3000)
├── Express API Server (localhost:3001)
├── PostgreSQL (localhost:5432)
└── Redis (localhost:6379)
```

### Production Environment
```
Cloud Provider (AWS/Vercel)
├── Frontend: Vercel/Netlify
├── Backend: EC2/Container
├── Database: RDS PostgreSQL
├── Cache: ElastiCache Redis
├── Storage: S3
└── CDN: CloudFront
```

## 📊 **Monitoring & Observability**

### Application Monitoring
- **Error Tracking**: Sentry for exception monitoring
- **Performance**: New Relic/DataDog for APM
- **Logging**: Structured JSON logs to ELK stack
- **Uptime**: Pingdom/UptimeRobot for availability

### Business Metrics
- **User Analytics**: Custom dashboard for user metrics
- **Chat Analytics**: Session duration, message count
- **Performance Metrics**: Response times, error rates
- **Business KPIs**: Daily active users, retention rates

---

**Note**: This architecture is designed for scalability and maintainability. Start with the minimal viable implementation and gradually add complexity as needed.