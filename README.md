# Jotter - Cloud Storage API

A Node.js backend API for a cloud storage system similar to Google Drive, built with Express.js and MongoDB.

## Features

- User Authentication (JWT-based)
- File Upload and Management
- Folder Organization
- Storage Limit Management (15GB per user)
- Dashboard Statistics
- Email-based Password Reset

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for Authentication
- Multer for File Uploads
- Nodemailer for Emails

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd jotter-apis
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jotter
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# File Upload Limits
MAX_FILE_SIZE=15000000000 # 15GB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

4. Create required directories:
```bash
mkdir uploads
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Authentication

#### Register User
- **POST** `/api/auth/register`
- Body: `{ "name": "string", "email": "string", "password": "string" }`

#### Login User
- **POST** `/api/auth/login`
- Body: `{ "email": "string", "password": "string" }`

#### Forgot Password
- **POST** `/api/auth/forgotpassword`
- Body: `{ "email": "string" }`

#### Reset Password
- **PUT** `/api/auth/resetpassword/:resettoken`
- Body: `{ "password": "string" }`

### Files

#### Upload File
- **POST** `/api/files`
- Headers: `Authorization: Bearer <token>`
- Body: `form-data { "file": <file>, "folderId": "string" (optional) }`

#### Get All Files
- **GET** `/api/files`
- Query: `?folderId=<folder-id>` (optional)
- Headers: `Authorization: Bearer <token>`

#### Get Single File
- **GET** `/api/files/:id`
- Headers: `Authorization: Bearer <token>`

#### Download File
- **GET** `/api/files/:id/download`
- Headers: `Authorization: Bearer <token>`

#### Update File
- **PUT** `/api/files/:id`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "string", "isPublic": boolean, "folderId": "string" }`

#### Delete File
- **DELETE** `/api/files/:id`
- Headers: `Authorization: Bearer <token>`

### Folders

#### Create Folder
- **POST** `/api/folders`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "string", "parentId": "string" (optional) }`

#### Get All Folders
- **GET** `/api/folders`
- Query: `?parentId=<parent-id>` (optional)
- Headers: `Authorization: Bearer <token>`

#### Get Single Folder
- **GET** `/api/folders/:id`
- Headers: `Authorization: Bearer <token>`

#### Update Folder
- **PUT** `/api/folders/:id`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "string", "isPublic": boolean }`

#### Delete Folder
- **DELETE** `/api/folders/:id`
- Headers: `Authorization: Bearer <token>`

### Dashboard

#### Get Dashboard Statistics
- **GET** `/api/dashboard`
- Headers: `Authorization: Bearer <token>`
- Returns:
  - Storage usage statistics
  - File type counts and sizes
  - Recent files

## Error Handling

The API uses a consistent error response format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Security Features

- JWT-based authentication
- Password hashing
- File type validation
- Storage limit enforcement
- Route protection
- Input validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 