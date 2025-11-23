# FundRaiser API Endpoints - Development TODO

This document contains all the API endpoints that need to be implemented for the FundRaiser platform. Check off each endpoint as you complete it.

## 🔐 Authentication & User Management

### User Registration & Authentication
- [x] `POST /api/auth/register` - User registration
- [x] `POST /api/auth/login` - User login
- [x] `POST /api/auth/logout` - User logout
- [x] `POST /api/auth/invalidate-all-sessions` - Invalidate all sessions
- [x] `POST /api/auth/refresh` - Refresh JWT token *(Already implemented)*
- [x] `POST /api/auth/forgot-password` - Request password reset *(Already implemented)*
- [x] `POST /api/auth/reset-password` - Reset password with token *(Already implemented)*
- [x] `POST /api/auth/verify-email` - Verify email address *(Already implemented)*
- [x] `POST /api/auth/resend-verification` - Resend verification email *(Already implemented)*

### User Profile Management
- [x] `GET /api/users/profile` - Get current user profile
- [x] `PUT /api/users/profile` - Update user profile
- [ ] `POST /api/users/upload-avatar` - Upload profile image
- [ ] `DELETE /api/users/account` - Delete user account
- [ ] `PUT /api/users/change-password` - Change password

### User Administration
- [ ] `GET /api/admin/users` - Get all users (admin only)
- [ ] `GET /api/admin/users/:id` - Get specific user (admin only)
- [ ] `PUT /api/admin/users/:id/status` - Update user status (admin only)
- [ ] `PUT /api/admin/users/:id/role` - Update user role (admin only)

## 🎯 Events Management

### Event CRUD Operations
- [x] `GET /api/events` - Get all events for logged-in user (authenticated) *(Modified - currentAmount computed from Payments table)*
- [x] `GET /api/events/:id` - Get specific event *(Already implemented - currentAmount computed from Payments table)*
- [x] `POST /api/events` - Create new event (authenticated) *(Already implemented)*
- [x] `PUT /api/events/:id` - Update event (organizer/admin only) *(Modified - Added authorization, returns currentAmount computed from Payments table)*
- [x] `DELETE /api/events/:id` - Delete event (organizer/admin only) *(Modified - Added authorization)*
- [x] `GET /api/events/user/:userId` - Get events by user (admin only) *(Modified - Admin only, currentAmount computed from Payments table)*
- [x] `GET /api/events/search` - Search events with filters (authenticated - organizers: own events, admins: all events) *(Modified - currentAmount computed from Payments table)*

### Event Updates & Announcements
- [x] `GET /api/events/:id/updates` - Get event updates *(Just implemented)*
- [x] `POST /api/events/:id/updates` - Create event update (organizer only) *(Just implemented)*
- [x] `PUT /api/events/:id/updates/:updateId` - Update event update (organizer only) *(Just implemented)*
- [x] `DELETE /api/events/:id/updates/:updateId` - Delete event update (organizer only) *(Just implemented)*

## 💰 Contributions & Payments

### Contribution Management
- [x] `GET /api/events/:eventId/contributions` - Get contributions for event *(Already implemented)*
- [x] `POST /api/events/:eventId/contributions` - Create contribution *(Already implemented)*
- [x] `POST /api/events/:eventId/pledges` - Create pledge *(Deprecated - use contributions endpoint instead, kept for backward compatibility. All data stored in Contributions sheet - Pledges sheet has been removed)*
- [x] `PUT /api/contributions/:id` - Update contribution status *(Already implemented)*
- [x] `POST /api/contributions/verify-phone` - Verify phone and generate JWT token for viewing contributions *(Already implemented - generates 5-minute phone verification token)*
- [x] `GET /api/contributions/:id` - Get specific contribution *(Just implemented - includes event context with computed currentAmount)*
- [x] `GET /api/contributions/user/:phone` - Get user's contributions by phone *(Just implemented - returns all contributions across events with event details)*
- [x] `POST /api/contributions/:id/reminder` - Send reminder for unpaid contribution *(Just implemented - organizer only, sends email if available)*

### Payment Processing
- [x] `POST /api/payments/process` - Process payment *(Supports direct payments with eventId using FIFO allocation, partial payments, excess handling, auto-creates contributions for excess; supports direct contribution payment when contributionId provided)*
- [x] `POST /api/payments/create-and-pay` - Create contribution and process payment *(Always creates a new contribution first, then processes payment for it with the same amount)*
- [x] `GET /api/payments/:id` - Get payment details *(Just implemented)*
- [x] `PUT /api/payments/:id/status` - Update payment status *(Just implemented)*
- [ ] `POST /api/payments/:id/refund` - Process refund
- [x] `GET /api/payments/contribution/:contributionId` - Get payments for contribution *(Just implemented)*

## 💳 Payment Methods

### Payment Method Management
- [ ] `GET /api/payment-methods` - Get user's payment methods
- [ ] `POST /api/payment-methods` - Add payment method
- [ ] `PUT /api/payment-methods/:id` - Update payment method
- [ ] `DELETE /api/payment-methods/:id` - Remove payment method
- [ ] `PUT /api/payment-methods/:id/set-default` - Set as default payment method
- [ ] `POST /api/payment-methods/:id/verify` - Verify payment method

## 🔔 Notifications

### Notification Management
- [ ] `GET /api/notifications` - Get user notifications
- [ ] `PUT /api/notifications/:id/read` - Mark notification as read
- [ ] `PUT /api/notifications/read-all` - Mark all notifications as read
- [ ] `DELETE /api/notifications/:id` - Delete notification
- [ ] `GET /api/notifications/unread-count` - Get unread count
- [ ] `PUT /api/notifications/preferences` - Update notification preferences

### Notification Administration
- [ ] `POST /api/admin/notifications/send` - Send notification (admin only)
- [ ] `GET /api/admin/notifications` - Get all notifications (admin only)
- [ ] `GET /api/admin/notifications/stats` - Get notification statistics (admin only)

## 🔒 Security & Logging

### Session Management
- [ ] `GET /api/sessions` - Get active sessions
- [ ] `DELETE /api/sessions/:id` - Terminate session
- [ ] `DELETE /api/sessions/all` - Terminate all sessions

### Login Logs
- [ ] `GET /api/logs/login` - Get login logs
- [ ] `GET /api/logs/login/user/:userId` - Get user's login logs
- [ ] `GET /api/logs/login/stats` - Get login statistics

## 📊 Analytics & Reporting

### Event Analytics
- [ ] `GET /api/analytics/events/:id` - Get event analytics
- [ ] `GET /api/analytics/events/:id/contributions` - Get contribution analytics
- [ ] `GET /api/analytics/events/:id/trends` - Get event trends

### User Analytics
- [ ] `GET /api/analytics/users/:id` - Get user analytics
- [ ] `GET /api/analytics/users/:id/contributions` - Get user contribution analytics

### Platform Analytics (Admin)
- [ ] `GET /api/admin/analytics/overview` - Get platform overview
- [ ] `GET /api/admin/analytics/events` - Get events analytics
- [ ] `GET /api/admin/analytics/users` - Get users analytics
- [ ] `GET /api/admin/analytics/payments` - Get payments analytics
- [ ] `GET /api/admin/analytics/revenue` - Get revenue analytics

## 🔧 System & Utility

### Health & Status
- [x] `GET /api/health` - Health check *(Already implemented)*
- [x] `GET /api/init` - Initialize services (Google Sheets) *(Already implemented - with auto-initialization on startup and lazy initialization in service methods)*
- [ ] `GET /api/status` - System status
- [ ] `GET /api/version` - API version

### File Management
- [ ] `POST /api/upload/image` - Upload image
- [ ] `POST /api/upload/document` - Upload document
- [ ] `DELETE /api/files/:id` - Delete file

### Search & Discovery
- [ ] `GET /api/search/events` - Search events
- [ ] `GET /api/search/users` - Search users
- [ ] `GET /api/categories` - Get event categories
- [ ] `GET /api/tags` - Get popular tags

## 📱 Mobile Money Integration

### USSD & Mobile Payments
- [ ] `POST /api/mobile-money/initiate` - Initiate mobile money payment
- [ ] `POST /api/mobile-money/callback` - Mobile money callback
- [ ] `GET /api/mobile-money/status/:transactionId` - Check payment status
- [ ] `POST /api/mobile-money/verify` - Verify mobile money payment

## 🎨 Content Management

### Media Management
- [ ] `POST /api/media/upload` - Upload media files
- [ ] `GET /api/media/:id` - Get media file
- [ ] `DELETE /api/media/:id` - Delete media file
- [ ] `GET /api/media/event/:eventId` - Get event media

## 🛡️ Admin & Moderation

### Content Moderation
- [ ] `GET /api/admin/events/pending` - Get pending events
- [ ] `PUT /api/admin/events/:id/approve` - Approve event
- [ ] `PUT /api/admin/events/:id/reject` - Reject event
- [ ] `GET /api/admin/contributions/flagged` - Get flagged contributions

### System Administration
- [ ] `GET /api/admin/stats` - Get system statistics
- [ ] `GET /api/admin/logs` - Get system logs
- [ ] `POST /api/admin/maintenance` - Toggle maintenance mode
- [ ] `GET /api/admin/backup` - Create system backup

---

## 📈 Progress Tracking

### Overall Progress
- **Total Endpoints**: 81
- **Completed**: 35 (43%)
- **Remaining**: 46 (57%)

### By Category Progress
- **Authentication & Users**: 11/17 (65%)
  - User Registration & Authentication: 9/9 (100%)
  - User Profile Management: 2/5 (40%)
  - User Administration: 0/4 (0%)
- **Events**: 10/10 (100%)
  - Event CRUD Operations: 6/6 (100%)
  - Event Updates & Announcements: 4/4 (100%)
- **Contributions & Payments**: 12/12 (100%)
  - Contribution Management: 8/8 (100%)
  - Payment Processing: 4/4 (100%)
- **Payment Methods**: 0/6 (0%)
- **Notifications**: 0/8 (0%)
- **Security & Logging**: 0/5 (0%)
- **Analytics**: 0/10 (0%)
- **System & Utility**: 2/9 (22%)
- **Mobile Money**: 0/4 (0%)
- **Content Management**: 0/4 (0%)
- **Admin & Moderation**: 0/8 (0%)

### Priority Levels

#### 🔴 High Priority (Core Functionality)
- Authentication endpoints
- Enhanced contribution management
- Payment processing
- User profile management

#### 🟡 Medium Priority (Enhanced Features)
- Notifications system
- Analytics and reporting
- Payment methods management
- Event updates

#### 🟢 Low Priority (Advanced Features)
- Admin moderation tools
- Advanced analytics
- Content management
- System administration

---

## 📝 Notes

- Endpoints marked with *(Already implemented)* are already working in the current system
- Focus on high-priority endpoints first to establish core functionality
- Each endpoint should include proper validation, error handling, and documentation
- Consider implementing rate limiting for public endpoints
- Ensure all endpoints follow RESTful conventions
- Add proper authentication middleware where required
- **Service Initialization**: Google Sheets service now has automatic initialization on startup and lazy initialization in all service methods, ensuring the service is always available without UI dependency

---

*Last Updated: $(date)*
*Total Development Time Estimated: 4-6 weeks*
