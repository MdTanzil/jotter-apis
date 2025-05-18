# Jotter API

A cloud storage REST API similar to Google Drive, built with Node.js, Express, and MongoDB.

## Features

- 🔐 User Authentication
  - Register/Login with JWT
  - Password reset via email
  - Account deletion
  - Logout functionality

- 📁 File Management
  - Upload/download files
  - Create/update/delete files
  - 15GB storage limit per user
  - File sharing (public/private)
  - Favorite files system
  - Calendar-based file view

- 📂 Folder Management
  - Create/update/delete folders
  - Nested folder structure
  - Move files between folders

- 📊 Dashboard
  - Storage usage statistics
  - File type distribution
  - Recent files

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jotter-apis.git
cd jotter-apis
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
FRONTEND_URL=http://localhost:3000
```

4. Create uploads directory:
```bash
mkdir uploads
```

5. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `DELETE /api/auth/account/delete` - Delete account

### Files
- `POST /api/files` - Upload file
- `GET /api/files` - Get all files
- `GET /api/files/:id` - Get single file
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/by-date` - Get files by date
- `POST /api/files/:id/favorite` - Toggle favorite
- `GET /api/files/favorites` - Get favorite files

### Folders
- `POST /api/folders` - Create folder
- `GET /api/folders` - Get all folders
- `GET /api/folders/:id` - Get single folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Dashboard
- `GET /api/dashboard/stats` - Get user statistics

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Features

- JWT Authentication
- Password hashing
- File type validation
- Storage limit enforcement
- Rate limiting
- CORS enabled

## Testing

Import the Postman collection (`Jotter.postman_collection.json`) to test all endpoints.

## License

MIT 