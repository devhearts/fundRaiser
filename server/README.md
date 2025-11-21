# FundRaiser Backend Server

This is a **professional, scalable** Node.js Express backend server for the FundRaiser application. It follows industry best practices with a clean, modular architecture and can be deployed independently to Vercel as serverless functions.

## 🏗️ **Professional Project Structure**

```
server/
├── src/
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   │
│   ├── config/                   # Configuration files
│   │   ├── config.js             # Main configuration
│   │   └── db.js                 # Database configuration
│   │
│   ├── routes/                   # Route definitions
│   │   └── index.js              # Main router
│   │
│   ├── controllers/              # Route handlers / business logic
│   │   ├── event.controller.js   # Event operations
│   │   └── contribution.controller.js # Contribution operations
│   │
│   ├── middlewares/              # Express middleware
│   │   ├── auth.middleware.js    # Authentication middleware
│   │   └── error.middleware.js   # Error handling middleware
│   │
│   ├── validations/              # Input validation schemas
│   │   └── event.validation.js   # Zod validation schemas
│   │
│   ├── services/                 # Reusable service logic
│   │   └── email.service.js      # Email service
│   │
│   ├── utils/                    # Utility/helper functions
│   │   └── logger.js             # Logging utility
│   │
│   ├── constants/                # Constants / enums
│   │   └── index.js              # Application constants
│   │
│   └── tests/                    # Unit and integration tests
│       └── api.test.js           # API tests
│
├── index.js                      # Vercel entry point
├── package.json                  # Dependencies and scripts
├── vercel.json                   # Vercel deployment config
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## ✨ **Key Features**

- **🏗️ Modular Architecture**: Clean separation of concerns
- **🔒 Input Validation**: Zod schema validation
- **🛡️ Error Handling**: Comprehensive error middleware
- **📝 Logging**: Structured logging system
- **🧪 Testing**: Jest test framework setup
- **📧 Email Service**: Ready for notifications
- **🔐 Authentication Ready**: JWT middleware prepared
- **📊 Database Ready**: Easy database integration
- **🚀 Vercel Optimized**: Serverless deployment ready

## 🚀 **Quick Start**

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 📚 **API Documentation**

### Events Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all public events |
| GET | `/api/events/:id` | Get specific event |
| POST | `/api/events` | Create new event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

### Contributions Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/:eventId/contributions` | Get contributions for event |
| POST | `/api/events/:eventId/contributions` | Create contribution |
| PUT | `/api/contributions/:id` | Update contribution status |

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## 📋 **Data Models**

### Event Model
```javascript
{
  id: string,
  title: string,
  description: string,
  goalAmount: number,
  currentAmount: number, // computed from completed payments
  coverImage: string | null,
  location: string | null,
  deadline: Date | null,
  isPublic: boolean,
  organizerName: string,
  organizerEmail: string,
  status: string,
  createdAt: Date
}
```

### Contribution Model
```javascript
{
  id: string,
  eventId: string,
  donorName: string,
  donorEmail: string,
  amount: number,
  isAnonymous: boolean,
  isPledge: boolean,
  message: string | null,
  status: string,
  createdAt: Date
}
```

## 🧪 **Testing**

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The test suite includes:
- API endpoint testing
- Data validation testing
- Error handling testing

## 🚀 **Deployment**

### Vercel Deployment

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install Vercel CLI:**
```bash
npm i -g vercel
```

3. **Deploy:**
```bash
vercel
```

4. **Production deployment:**
```bash
vercel --prod
```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Environment Configuration
NODE_ENV=development
PORT=3000

# CORS Configuration
CORS_ORIGIN=*

# Database Configuration (for future use)
DATABASE_URL=mongodb://localhost:27017/fundraiser

# JWT Configuration (for future authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (for future notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Logging
LOG_LEVEL=INFO
```

## 📊 **Database: Google Sheets Integration**

This application uses **Google Sheets** as the database through the `googleapis` package. This provides:

- ✅ **No database setup required** - Uses Google Sheets
- ✅ **Visual data management** - View/edit data directly in Sheets
- ✅ **Automatic backup** - Google's built-in backup system
- ✅ **Real-time collaboration** - Multiple users can view data
- ✅ **Cost-effective** - No database hosting costs
- ✅ **Easy deployment** - No database connection strings needed

### Quick Setup

1. **Follow the detailed setup guide**: [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)
2. **Create a Google Cloud project** and enable Sheets API
3. **Create a service account** and download credentials
4. **Create a Google Spreadsheet** and share with service account
5. **Set environment variables** with your credentials
6. **Start the server** - sheets will be created automatically

### Environment Variables Required

```bash
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 📦 **Dependencies**

### Production Dependencies
- `express` - Web framework
- `cors` - Cross-origin requests
- `uuid` - ID generation
- `zod` - Schema validation
- `dotenv` - Environment variables
- `nodemailer` - Email service
- `googleapis` - Google Sheets API integration

### Development Dependencies
- `nodemon` - Development server
- `jest` - Testing framework
- `supertest` - HTTP testing
- `eslint` - Code linting

## 🔮 **Future Enhancements**

The architecture is ready for:

1. **Database Integration**: MongoDB/PostgreSQL
2. **Authentication**: JWT-based auth system
3. **File Upload**: Image handling for events
4. **Payment Processing**: Stripe/PayPal integration
5. **Email Notifications**: Automated emails
6. **Rate Limiting**: API protection
7. **Caching**: Redis integration
8. **Monitoring**: Logging and metrics

## 🛠️ **Development Workflow**

1. **Work in the server directory:**
```bash
cd server
```

2. **Install new dependencies:**
```bash
npm install package-name
```

3. **Run tests:**
```bash
npm test
```

4. **Lint code:**
```bash
npm run lint:fix
```

5. **Deploy independently:**
```bash
vercel
```

## 🔗 **Integration with Frontend**

The frontend can connect to this server by:

1. **Development:** `http://localhost:3000/api/...`
2. **Production:** `https://your-server.vercel.app/api/...`

Update your frontend's API base URL accordingly.

## 📖 **Architecture Benefits**

- **Scalable**: Easy to add new features
- **Maintainable**: Clear code organization
- **Testable**: Comprehensive test coverage
- **Deployable**: Ready for production
- **Extensible**: Easy to integrate new services
- **Professional**: Industry-standard structure
