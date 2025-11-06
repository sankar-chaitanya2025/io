# Email OTP Authentication Requirements

This document outlines the requirements and implementation details for adding Email OTP (One-Time Password) authentication to the IO anonymous campus chat platform.

## Overview

The IO platform currently has a mock email verification flow. This document specifies the requirements to implement a production-ready Email OTP authentication system for RGUKTN college students.

## Current State Analysis

### Existing Mock Implementation
- **Location**: `/src/app/onboarding/email/page.tsx`
- **Domain Restriction**: Only accepts `@rguktn.ac.in` email addresses
- **Current Flow**: Simple form submission that shows a success message
- **Missing**: Actual email sending, OTP generation, verification logic

### Technical Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Current Dependencies**: Framer Motion, Lucide React
- **Missing**: Backend auth dependencies, database, email service

## Authentication Requirements

### 1. Email Service Integration

#### Required Email Provider Features
- **SMTP API Access**: For sending OTP emails
- **Template Support**: Customizable email templates
- **Delivery Tracking**: Success/failure monitoring
- **Rate Limiting**: Prevent email spam

#### Recommended Providers
- **SendGrid**: Reliable, good templates, decent free tier
- **Resend**: Modern API, excellent for transactional emails
- **AWS SES**: Cost-effective for high volume
- **Postmark**: High deliverability for transactional emails

#### Required Configuration
```
EMAIL_SERVICE_API_KEY=your_api_key_here
EMAIL_FROM_ADDRESS=noreply@rguktn.ac.in
EMAIL_FROM_NAME=IO Chat Platform
```

### 2. OTP Generation & Security

#### OTP Specifications
- **Length**: 6 digits (industry standard)
- **Format**: Numeric only (easier to type on mobile)
- **Expiration**: 10 minutes (balance between security and UX)
- **Character Set**: 0-9 only
- **Generation**: Cryptographically secure random

#### Security Requirements
- **Storage**: Hash OTPs using bcrypt/scrypt (never store plain)
- **Rate Limiting**: 
  - Max 3 OTP requests per email per 5 minutes
  - Max 5 verification attempts per OTP
- **Brute Force Protection**: Exponential backoff on failed attempts
- **Replay Attack Prevention**: One-time use OTPs

### 3. Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### OTP Table
```sql
CREATE TABLE email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Sessions Table
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. API Endpoints

#### Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

Request:
{
  "email": "student@rguktn.ac.in"
}

Response:
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

Request:
{
  "email": "student@rguktn.ac.in",
  "otp": "123456"
}

Response:
{
  "success": true,
  "token": "jwt_session_token",
  "user": {
    "id": "uuid",
    "email": "student@rguktn.ac.in",
    "emailVerified": true
  }
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Frontend Implementation

#### Required Components
- **OTP Input Component**: 6-digit input with auto-focus
- **Email Verification Page**: Enhanced version of current page
- **OTP Verification Page**: New page for entering OTP
- **Loading States**: For API calls
- **Error Handling**: User-friendly error messages

#### User Flow
1. User enters `@rguktn.ac.in` email
2. System generates and sends OTP
3. User redirected to OTP verification page
4. User enters 6-digit OTP
5. System verifies and creates session
6. User redirected to dashboard/onboarding flow

### 6. Email Templates

#### OTP Email Template
```
Subject: Your IO Chat Verification Code

Hello! 👋

Your verification code for IO Chat is: {{OTP}}

This code will expire in 10 minutes.

If you didn't request this code, you can safely ignore this email.

Stay anonymous,
The IO Team
```

### 7. Environment Variables

#### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/io_chat

# Email Service
EMAIL_SERVICE_API_KEY=your_email_service_key
EMAIL_FROM_ADDRESS=noreply@rguktn.ac.in
EMAIL_FROM_NAME=IO Chat Platform

# Security
JWT_SECRET=your_jwt_secret_key
OTP_SECRET=your_otp_generation_secret

# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 8. Dependencies to Add

#### Backend Dependencies
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "nodemailer": "^6.9.7",
  "@types/bcryptjs": "^2.4.6",
  "@types/jsonwebtoken": "^9.0.5",
  "@types/nodemailer": "^6.4.14",
  "prisma": "^5.6.0",
  "@prisma/client": "^5.6.0"
}
```

#### Auth Libraries (Optional)
```json
{
  "next-auth": "^4.24.5",
  "lucia-auth": "^2.7.6"
}
```

## Implementation Steps

### Phase 1: Backend Setup
1. Set up database with Prisma/Drizzle
2. Create API routes for OTP send/verify
3. Implement OTP generation and validation
4. Add email service integration
5. Add security measures (rate limiting, hashing)

### Phase 2: Frontend Integration
1. Create OTP input component
2. Build OTP verification page
3. Enhance existing email page
4. Add loading and error states
5. Integrate with backend APIs

### Phase 3: Session Management
1. Implement JWT token handling
2. Add session middleware
3. Create protected routes
4. Add logout functionality
5. Update dashboard to require auth

### Phase 4: Security & Testing
1. Add comprehensive error handling
2. Implement rate limiting
3. Add security headers
4. Write unit and integration tests
5. Security audit and penetration testing

## Security Considerations

### Critical Security Points
- **Never store plain OTPs** in database
- **Use HTTPS** for all API calls
- **Implement rate limiting** on all endpoints
- **Validate email domain** strictly (`@rguktn.ac.in` only)
- **Use secure HTTP headers** (HSTS, CSP, etc.)
- **Sanitize all inputs** to prevent XSS
- **Implement CORS** properly
- **Log security events** for monitoring

### Data Privacy
- **Minimal data collection**: Only email required
- **No personal information**: Maintain anonymity
- **Data retention**: Clear expired OTPs regularly
- **GDPR compliance**: Right to delete user data

## Monitoring & Analytics

### Metrics to Track
- OTP delivery success rate
- OTP verification success rate
- Authentication attempt patterns
- Rate limiting triggers
- Email service performance
- Failed login attempts

### Alerts to Set Up
- High failed OTP verification rates
- Email service failures
- Unusual authentication patterns
- Rate limiting threshold breaches

## Testing Strategy

### Unit Tests
- OTP generation and validation
- Email validation logic
- Security hashing functions
- Rate limiting logic

### Integration Tests
- API endpoint functionality
- Email service integration
- Database operations
- Session management

### Security Tests
- Brute force attempts
- Rate limiting effectiveness
- Input validation
- XSS prevention

## Future Enhancements

### Potential Features
- **Multiple Email Providers**: Fallback support
- **SMS OTP**: Alternative verification method
- **Social Login**: Google/GitHub OAuth
- **Two-Factor Auth**: Additional security layer
- **Device Management**: Session management across devices
- **Email Whitelist**: Admin-controlled domain access

### Scalability Considerations
- **Redis Caching**: For OTP storage and rate limiting
- **Queue System**: For email sending (Bull/Agenda)
- **Load Balancing**: For high traffic scenarios
- **Database Optimization**: Indexing and query optimization

---

## Conclusion

This document provides a comprehensive roadmap for implementing Email OTP authentication in the IO chat platform. The implementation should prioritize security, user experience, and maintaining the anonymous nature of the platform while ensuring only verified RGUKTN students can access the system.

The phased approach allows for incremental development and testing, ensuring a robust and secure authentication system that scales with the platform's growth.