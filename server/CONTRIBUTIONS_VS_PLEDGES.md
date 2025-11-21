# Contributions (Unified Model)

## Overview

In the FundRaiser platform, **all contributions are pledges** - they represent promises to pay later. There is no distinction between "immediate payments" and "future pledges". Every contribution requires:
- A phone number (required for identity verification and future token generation)
- A pledge date (can be today or a future date)
- Identity verification when the payment is processed

## Key Characteristics

### **All Contributions Are Pledges**
- **Purpose**: Promise to pay later (commitment to donate)
- **Payment Timing**: Paid later, on or after the `pledgeDate` (can be today)
- **Event Amount Impact**: Event progress is derived from completed payments (no direct writes to the event record)
- **Required Fields**:
  - `donorName` (required)
  - `donorPhone` (required) - Used for verification when fulfilling and for future token generation
  - `amount` (required)
  - `pledgeDate` (required) - Can be today or a future date (YYYY-MM-DD format)
- **Optional Fields**:
  - `donorEmail` (optional, but recommended for better verification)
  - `message` (optional)
  - `isAnonymous` (default: false)
- **Status Flow**: `pending` → `confirmed` (when fulfilled via payment)
- **Use Case**: User commits to donating and pays later (even if "later" is today)

## Technical Implementation

### Storage
All contributions are stored in the **Contributions** sheet with:
- `isPledge: true` (for backward compatibility, but all contributions are treated as pledges)
- `pledgeDate` field (required)
- `donorPhone` field (required)

**Note**: The separate "Pledges" sheet has been removed. All pledge data is now stored in the Contributions sheet.

### Creating a Contribution
```javascript
POST /api/events/:eventId/contributions
{
  "donorName": "John Doe",
  "donorEmail": "john@example.com", // Optional
  "donorPhone": "0712345678", // Required
  "amount": 100,
  "pledgeDate": "2024-12-20", // Required - can be today or future date (YYYY-MM-DD)
  "isAnonymous": false, // Optional
  "message": "Happy to help!", // Optional
  "status": "pending" // Optional, defaults to "pending"
}
```

### Legacy Pledge Endpoint (Deprecated)
The `/api/events/:eventId/pledges` endpoint still works for backward compatibility but now just calls the contribution endpoint internally.

```javascript
POST /api/events/:eventId/pledges
// Same request body as above - kept for backward compatibility
```

## Payment Processing

### Identity Verification
- **All payments require identity verification** - the payer must match the contribution creator
- **Pledge Ownership Verification**: The payer must match the contribution creator
  - At least one of these must match:
    - `payerName` matches `donorName`
    - `payerEmail` matches `donorEmail` (if provided)
    - `payerPhone` matches `donorPhone`
- If verification fails, payment is rejected with a 403 error
- Event progress is recalculated from completed payments when pledge is fulfilled

### Processing Payment
```javascript
POST /api/payments/process
{
  "contributionId": "contribution-id",
  "amount": 100,
  "payerName": "John Doe", // Required - must match contribution creator
  "payerEmail": "john@example.com", // Optional but helps verification
  "payerPhone": "0712345678", // Optional but helps verification
  "paymentMethod": "mobile_money", // Optional: card, mobile_money, bank_transfer, cash, other
  "paymentProvider": "mtn", // Optional: mock, stripe, paypal, mtn, airtel, etc.
  "metadata": {} // Optional additional payment metadata
}
```

**Security**: If payer information doesn't match the contribution creator, the payment will be rejected with a 403 error.

## Event Amount Calculation

### Contribution Creation
```javascript
// When contribution is created
// NO update to event.currentAmount (contribution is a pledge, not yet paid)
```

### Payment Processing (Pledge Fulfillment)
```javascript
// When payment is processed and pledge is fulfilled
// Event totals are recalculated from all completed payments
contribution.status = 'confirmed'
```

## Status Management

### Contribution Statuses
- `pending`: Contribution created, awaiting payment fulfillment
- `confirmed`: Contribution has been fulfilled (payment processed successfully)

## Best Practices

1. **Phone Numbers**: Always require and validate phone numbers (format: `07XXXXXXXX` - 10 digits starting with 07)
2. **Pledge Dates**: Can be today or any future date (validated to be today or later)
3. **Identity Verification**: Always provide `payerName`, and preferably `payerEmail` or `payerPhone` when processing payments
4. **Email**: While optional, it's recommended to collect email for better identity verification
5. **Token Generation**: Phone numbers are required for future token-based payment processing

## API Endpoints

### Contribution Endpoints
- `POST /api/events/:eventId/contributions` - Create contribution (all are pledges)
- `GET /api/events/:eventId/contributions` - Get contributions for event
- `PUT /api/contributions/:id` - Update contribution status

### Legacy Pledge Endpoints (Deprecated but still functional)
- `POST /api/events/:eventId/pledges` - Create pledge (now just calls contribution endpoint internally, all data stored in Contributions sheet)

### Payment Endpoints
- `POST /api/payments/process` - Process payment (fulfill pledge)
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments/contribution/:contributionId` - Get payments for a contribution
- `PUT /api/payments/:id/status` - Update payment status

## Migration Notes

### For Existing Code
- All contributions should now include `donorPhone` and `pledgeDate`
- The `isPledge` field is kept for backward compatibility but is always `true` for new contributions
- Payment processing now always requires identity verification
- Event amount is derived from completed payments, not direct field updates

### Breaking Changes
- `donorPhone` is now **required** (was optional for regular contributions)
- `pledgeDate` is now **required** (was only for pledges)
- `donorEmail` is now **optional** (was required for regular contributions)
- Payment processing now **always requires identity verification**

## Summary

| Feature | Unified Contribution Model |
|---------|---------------------------|
| **Type** | All are pledges (promises to pay later) |
| **Phone Required** | ✅ Yes (for verification and token generation) |
| **Email Required** | ⚠️ Optional (but recommended) |
| **Pledge Date** | ✅ Required (can be today or future) |
| **Immediate Payment** | ❌ No - all payments happen later |
| **Event Amount Update** | Only when payment is processed |
| **Identity Verification** | ✅ Always required when paying |
| **Use Case** | Commit to donate, pay later (even if "later" is today) |
