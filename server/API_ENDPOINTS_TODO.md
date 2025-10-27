# FundRaiser API Endpoints - Development TODO

This document contains all the API endpoints that need to be implemented for the FundRaiser platform. Check off each endpoint as you complete it.

## 🔐 Authentication & User Management

### User Registration & Authentication
- [x] `POST /api/auth/register` - User registration
- [x] `POST /api/auth/login` - User login
- [x] `POST /api/auth/logout` - User logout
- [x] `POST /api/auth/invalidate-all-sessions` - Invalidate all sessions
- [ ] `POST /api/auth/refresh` - Refresh JWT token
- [ ] `POST /api/auth/forgot-password` - Request password reset
- [ ] `POST /api/auth/reset-password` - Reset password with token
- [ ] `POST /api/auth/verify-email` - Verify email address
- [ ] `POST /api/auth/resend-verification` - Resend verification email

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
- [x] `GET /api/events` - Get all events for logged-in user (authenticated) *(Modified)*
- [x] `GET /api/events/:id` - Get specific event *(Already implemented)*
- [x] `POST /api/events` - Create new event (authenticated) *(Already implemented)*
- [x] `PUT /api/events/:id` - Update event (organizer/admin only) *(Modified - Added authorization)*
- [x] `DELETE /api/events/:id` - Delete event (organizer/admin only) *(Modified - Added authorization)*
- [x] `GET /api/events/user/:userId` - Get events by user (admin only) *(Modified - Admin only)*
- [x] `GET /api/events/search` - Search events with filters (authenticated - organizers: own events, admins: all events) *(Modified)*

### Event Updates & Announcements
- [x] `GET /api/events/:id/updates` - Get event updates *(Just implemented)*
- [x] `POST /api/events/:id/updates` - Create event update (organizer only) *(Just implemented)*
- [x] `PUT /api/events/:id/updates/:updateId` - Update event update (organizer only) *(Just implemented)*
- [x] `DELETE /api/events/:id/updates/:updateId` - Delete event update (organizer only) *(Just implemented)*

## 💰 Contributions & Payments

### Contribution Management
- [x] `GET /api/events/:eventId/contributions` - Get contributions for event *(Already implemented)*
- [x] `POST /api/events/:eventId/contributions` - Create contribution *(Already implemented)*
- [x] `PUT /api/contributions/:id` - Update contribution status *(Already implemented)*
- [ ] `GET /api/contributions/:id` - Get specific contribution
- [ ] `GET /api/users/:userId/contributions` - Get user's contributions

### Payment Processing
- [ ] `POST /api/payments/process` - Process payment
- [ ] `GET /api/payments/:id` - Get payment details
- [ ] `PUT /api/payments/:id/status` - Update payment status
- [ ] `POST /api/payments/:id/refund` - Process refund
- [ ] `GET /api/payments/contribution/:contributionId` - Get payments for contribution

### Pledge Management
- [ ] `GET /api/pledges` - Get all pledges
- [ ] `GET /api/pledges/:id` - Get specific pledge
- [ ] `PUT /api/pledges/:id/fulfill` - Fulfill pledge
- [ ] `PUT /api/pledges/:id/cancel` - Cancel pledge
- [ ] `GET /api/pledges/user/:userId` - Get user's pledges
- [ ] `POST /api/pledges/:id/reminder` - Send pledge reminder

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
- **Total Endpoints**: 85
- **Completed**: 11 (13%)
- **Remaining**: 74 (87%)

### By Category Progress
- **Authentication & Users**: 9/15 (60%)
- **Events**: 5/12 (42%)
- **Contributions & Payments**: 3/15 (20%)
- **Payment Methods**: 0/6 (0%)
- **Notifications**: 0/8 (0%)
- **Security & Logging**: 0/5 (0%)
- **Analytics**: 0/10 (0%)
- **System & Utility**: 1/8 (13%)
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

---

*Last Updated: $(date)*
*Total Development Time Estimated: 4-6 weeks*
