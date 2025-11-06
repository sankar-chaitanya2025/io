# IO - Environment Setup Guide

## 🔧 **Required Environment Variables**

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/io_chat"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email Service
EMAIL_SERVICE="resend" # or "sendgrid", "ses"
EMAIL_API_KEY="re_xxxxxxxxxxxx"
FROM_EMAIL="noreply@yourdomain.com"
FROM_NAME="IO Chat"

# WebSocket
WEBSOCKET_PORT="3001"
WEBSOCKET_URL="ws://localhost:3001"

# External Services
SENTRY_DSN="https://your-sentry-dsn"
ANALYTICS_ID="your-analytics-id"

# Development
NODE_ENV="development"
LOG_LEVEL="debug"
```

## 🗄️ **Database Setup**

### PostgreSQL Setup
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt-get install postgresql  # Ubuntu

# Start PostgreSQL service
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Ubuntu

# Create database
sudo -u postgres createdb io_chat

# Create user
sudo -u postgres psql
CREATE USER io_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE io_chat TO io_user;
\q
```

### Redis Setup
```bash
# Install Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Ubuntu
```

## 📧 **Email Service Setup**

### Option 1: Resend (Recommended)
```bash
# Install Resend
npm install resend

# Configure
EMAIL_SERVICE="resend"
EMAIL_API_KEY="re_xxxxxxxxxxxx"
FROM_EMAIL="noreply@yourdomain.com"
```

### Option 2: SendGrid
```bash
# Install SendGrid
npm install @sendgrid/mail

# Configure
EMAIL_SERVICE="sendgrid"
EMAIL_API_KEY="SG.xxxxxxxxxxxx"
FROM_EMAIL="noreply@yourdomain.com"
```

### Option 3: AWS SES
```bash
# Install AWS SDK
npm install @aws-sdk/client-ses

# Configure
EMAIL_SERVICE="ses"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
FROM_EMAIL="noreply@yourdomain.com"
```

## 🔐 **Security Configuration**

### JWT Configuration
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env.local
JWT_SECRET="generated-secret-here"
JWT_EXPIRES_IN="7d"
```

### NextAuth Configuration
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## 🚀 **Development Setup**

### 1. Clone and Install
```bash
git clone <repository-url>
cd io-chat
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### 3. Database Migration
```bash
# Run database migrations
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### 4. Start Development Servers
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:server

# Terminal 3: WebSocket Server
npm run dev:websocket
```

## 🐳 **Docker Setup**

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: io_chat
      POSTGRES_USER: io_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://io_user:your_password@postgres:5432/io_chat
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build
```

## 🌐 **Production Environment**

### Environment Variables
```env
# Production (.env.production)
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@prod-host:5432/io_chat"
REDIS_URL="redis://prod-host:6379"
JWT_SECRET="production-jwt-secret"
NEXTAUTH_URL="https://yourdomain.com"
WEBSOCKET_URL="wss://yourdomain.com"
LOG_LEVEL="info"
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Or with PM2
pm2 start ecosystem.config.js
```

## 🔍 **Environment-Specific Configurations**

### Development (.env.local)
```env
NODE_ENV="development"
LOG_LEVEL="debug"
DATABASE_URL="postgresql://io_user:dev_password@localhost:5432/io_chat_dev"
REDIS_URL="redis://localhost:6379"
```

### Staging (.env.staging)
```env
NODE_ENV="staging"
LOG_LEVEL="info"
DATABASE_URL="postgresql://io_user:staging_password@staging-host:5432/io_chat_staging"
REDIS_URL="redis://staging-host:6379"
```

### Production (.env.production)
```env
NODE_ENV="production"
LOG_LEVEL="warn"
DATABASE_URL="postgresql://io_user:prod_password@prod-host:5432/io_chat"
REDIS_URL="redis://prod-host:6379"
```

## 🧪 **Testing Environment**

### Test Database Setup
```bash
# Create test database
createdb io_chat_test

# Test environment variables
NODE_ENV="test"
DATABASE_URL="postgresql://io_user:password@localhost:5432/io_chat_test"
REDIS_URL="redis://localhost:6379/1"
```

### Test Commands
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 📊 **Monitoring Setup**

### Sentry Configuration
```env
SENTRY_DSN="https://your-sentry-dsn"
SENTRY_ENVIRONMENT="development"
```

### Analytics Configuration
```env
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
HOTJAR_ID="XXXXXXXXX"
```

## 🔧 **Troubleshooting**

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL status
   brew services list | grep postgresql
   
   # Restart PostgreSQL
   brew services restart postgresql
   ```

2. **Redis Connection Error**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Restart Redis
   brew services restart redis
   ```

3. **Port Conflicts**
   ```bash
   # Check port usage
   lsof -i :3000
   lsof -i :3001
   
   # Kill process
   kill -9 <PID>
   ```

4. **Environment Variables Not Loading**
   ```bash
   # Verify .env.local exists
   ls -la .env.local
   
   # Check syntax
   cat .env.local
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Database debug
DEBUG=prisma:* npm run dev

# WebSocket debug
DEBUG=socket.io:* npm run dev:websocket
```

---

**Important**: Never commit `.env.local` to version control. Always use environment-specific configuration files and secure secret management in production.