# IO - API Documentation

## 🌐 **Base URL**
- Development: `http://localhost:3001/api`
- Production: `https://yourdomain.com/api`

## 🔐 **Authentication**
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📧 **Authentication Endpoints**

### Send Magic Link
```http
POST /api/auth/send-magic-link
Content-Type: application/json

{
  "email": "user@rguktn.ac.in"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent to your email"
}
```

### Verify Magic Link
```http
POST /api/auth/verify-token
Content-Type: application/json

{
  "token": "magic_link_token"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@rguktn.ac.in",
    "alias": "CosmicTaco",
    "gender": "dude",
    "is_verified": true
  },
  "token": "jwt_token"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@rguktn.ac.in",
    "alias": "CosmicTaco",
    "gender": "dude",
    "is_verified": true,
    "created_at": "2024-01-01T00:00:00Z",
    "last_active": "2024-01-01T12:00:00Z",
    "is_online": true
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 👤 **User Endpoints**

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "alias": "NewAlias",
  "gender": "dude"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@rguktn.ac.in",
    "alias": "NewAlias",
    "gender": "dude"
  }
}
```

### Get Online Count
```http
GET /api/users/online-count
```

**Response:**
```json
{
  "success": true,
  "count": 42
}
```

## 💬 **Chat Endpoints**

### Find Match
```http
POST /api/chat/find-match
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "match": {
      "id": "uuid",
      "alias": "MysticPotato",
      "gender": "girl"
    },
    "status": "active",
    "started_at": "2024-01-01T12:00:00Z"
  }
}
```

### Get Current Session
```http
GET /api/chat/current-session
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "match": {
      "id": "uuid",
      "alias": "MysticPotato",
      "gender": "girl"
    },
    "status": "active",
    "started_at": "2024-01-01T12:00:00Z",
    "messages": [
      {
        "id": "uuid",
        "sender_id": "uuid",
        "content": "Hey there!",
        "created_at": "2024-01-01T12:01:00Z",
        "is_me": false
      }
    ]
  }
}
```

### Send Message
```http
POST /api/chat/send-message
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "session_id": "uuid",
  "content": "Hello! How are you?"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "session_id": "uuid",
    "sender_id": "uuid",
    "content": "Hello! How are you?",
    "created_at": "2024-01-01T12:02:00Z",
    "is_me": true
  }
}
```

### Request Reveal
```http
POST /api/chat/reveal-request
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "session_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "reveal_request": {
    "id": "uuid",
    "session_id": "uuid",
    "status": "pending",
    "created_at": "2024-01-01T12:03:00Z"
  }
}
```

### End Session
```http
POST /api/chat/end-session
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "session_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session ended successfully"
}
```

### Rate Session
```http
POST /api/chat/rate-session
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "session_id": "uuid",
  "rating": 4
}
```

**Response:**
```json
{
  "success": true,
  "rating": {
    "id": "uuid",
    "session_id": "uuid",
    "rating": 4,
    "created_at": "2024-01-01T12:04:00Z"
  }
}
```

## 🔌 **WebSocket Events**

### Connection Events

#### Join Platform
```javascript
// Client sends
socket.emit('join', {
  userId: 'uuid',
  alias: 'CosmicTaco'
});

// Server responds
socket.emit('joined', {
  success: true,
  onlineCount: 42
});
```

#### User Online Status
```javascript
// Server broadcasts to all
socket.broadcast.emit('user_online', {
  userId: 'uuid',
  alias: 'MysticPotato'
});

socket.broadcast.emit('user_offline', {
  userId: 'uuid'
});
```

### Matchmaking Events

#### Find Match
```javascript
// Client sends
socket.emit('find_match');

// Server responds when match found
socket.emit('match_found', {
  session: {
    id: 'uuid',
    match: {
      id: 'uuid',
      alias: 'MysticPotato',
      gender: 'girl'
    }
  }
});
```

#### Cancel Search
```javascript
// Client sends
socket.emit('cancel_search');

// Server responds
socket.emit('search_cancelled');
```

### Chat Events

#### Send Message
```javascript
// Client sends
socket.emit('send_message', {
  sessionId: 'uuid',
  content: 'Hello there!'
});

// Server broadcasts to both users
socket.emit('message_received', {
  message: {
    id: 'uuid',
    sessionId: 'uuid',
    senderId: 'uuid',
    content: 'Hello there!',
    timestamp: '2024-01-01T12:00:00Z',
    isMe: false
  }
});
```

#### Typing Indicators
```javascript
// Client starts typing
socket.emit('typing_start', {
  sessionId: 'uuid'
});

// Client stops typing
socket.emit('typing_stop', {
  sessionId: 'uuid'
});

// Server broadcasts
socket.broadcast.emit('user_typing', {
  userId: 'uuid',
  sessionId: 'uuid'
});

socket.broadcast.emit('user_stopped_typing', {
  userId: 'uuid',
  sessionId: 'uuid'
});
```

#### Reveal Requests
```javascript
// Client sends reveal request
socket.emit('reveal_request', {
  sessionId: 'uuid'
});

// Server notifies other user
socket.broadcast.emit('reveal_requested', {
  sessionId: 'uuid',
  requesterAlias: 'CosmicTaco'
});

// Server broadcasts result
socket.emit('reveal_response', {
  sessionId: 'uuid',
  status: 'accepted', // or 'declined'
  identities: {
    user1: {
      alias: 'CosmicTaco',
      name: 'Rahul Verma',
      email: 'rahul.verma@rguktn.ac.in',
      details: '🎓 CSE, 3rd Year'
    },
    user2: {
      alias: 'MysticPotato',
      name: 'Priya Sharma',
      email: 'priya.sharma@rguktn.ac.in',
      details: '🎓 ECE, 2nd Year'
    }
  }
});
```

## 🚨 **Error Responses**

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid input data |
| `UNAUTHORIZED` | No or invalid JWT token |
| `FORBIDDEN` | Access denied |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

## 📊 **Rate Limiting**

| Endpoint | Limit | Window |
|----------|-------|---------|
| `/api/auth/send-magic-link` | 3 requests | 1 hour |
| `/api/auth/verify-token` | 10 requests | 1 hour |
| `/api/chat/find-match` | 10 requests | 5 minutes |
| `/api/chat/send-message` | 30 requests | 1 minute |
| All other endpoints | 100 requests | 1 hour |

## 🔄 **Status Codes**

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

## 🧪 **Testing Examples**

### Using curl
```bash
# Send magic link
curl -X POST http://localhost:3001/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@rguktn.ac.in"}'

# Get current user
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer your_jwt_token"

# Find match
curl -X POST http://localhost:3001/api/chat/find-match \
  -H "Authorization: Bearer your_jwt_token"
```

### Using JavaScript
```javascript
// Send magic link
const response = await fetch('/api/auth/send-magic-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@rguktn.ac.in'
  })
});

const data = await response.json();
console.log(data);
```

---

**Note**: This API documentation is for the planned backend implementation. The current frontend uses mock data and simulated responses.