# MGIT Knowledge Navigator

A mobile-friendly web application for accessing MGIT's digital library resources.

## Features

- Mobile-first responsive design
- Student authentication with roll number
- Password reset functionality
- Book categories with horizontal scrolling
- Offline access capability (PWA)
- SQLite database for data storage
- Email notifications for password reset

## Setup Instructions

### Prerequisites

1. Node.js (v14 or higher)
2. npm (Node Package Manager)
3. Gmail account for sending emails

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mgit-knowledge-navigator
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
- Generate a JWT secret key
- Add your Gmail credentials
- Adjust port if needed

5. Initialize the database:
```bash
node server.js
```

6. Seed the database with initial book data:
```bash
node seed.js
```

### Running the Application

1. Start the server:
```bash
npm start
```

2. For development with auto-reload:
```bash
npm run dev
```

3. Access the application:
- Local: http://localhost:3000
- Mobile: http://<your-ip-address>:3000

## Hosting Instructions

### Option 1: Local Network Hosting

1. Find your local IP address:
```bash
# On Windows
ipconfig

# On Mac/Linux
ifconfig
```

2. Update the `.env` file with your IP address
3. Start the server
4. Access from other devices on the same network using your IP address

### Option 2: Cloud Hosting (Heroku)

1. Install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create mgit-knowledge-navigator
```

4. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASS=your_password
```

5. Deploy to Heroku:
```bash
git push heroku main
```

### Option 3: VPS Hosting (DigitalOcean/AWS)

1. Set up a VPS with Node.js
2. Clone the repository
3. Install PM2 for process management:
```bash
npm install -g pm2
```

4. Start the application:
```bash
pm2 start server.js
```

5. Set up Nginx as reverse proxy
6. Configure SSL with Let's Encrypt

## Database Structure

### Users Table
- id (PRIMARY KEY)
- roll_number (UNIQUE)
- password (hashed)
- email
- created_at

### Books Table
- id (PRIMARY KEY)
- title
- author
- category
- cover_url
- pdf_url

### Reset Tokens Table
- id (PRIMARY KEY)
- roll_number
- token
- expires_at

## API Endpoints

### Authentication
- POST /api/signup - Create new user
- POST /api/signin - User login
- POST /api/reset-password-request - Request password reset
- POST /api/reset-password - Reset password

### Books
- GET /api/books/:category - Get books by category

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Email verification for password reset
- Token expiration
- SQL injection prevention
- CORS protection

## Mobile Features

- Progressive Web App (PWA)
- Offline capability
- Add to home screen
- Mobile-optimized UI
- Touch-friendly interface

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 