# Pet Hostel Backend API

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-3178C6)

Backend API for pet boarding management with booking services and hostel administration features.

## ✨ Features

- **Pet Booking Service Management** - Complete reservation system
- **RESTful API** - Built with Express.js
- **MySQL Database** - Relational data storage
- **TypeScript** - Type-safe development
- **CORS Enabled** - Secure frontend communication
- **Environment Config** - Via `.env` files
- **Password Security** - Bcryptjs hashing

## 📦 Prerequisites

Before installation, ensure you have:
- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://www.mysql.com/) 8.0+
- [npm](https://www.npmjs.com/) 9+

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Irminsul-Devs/pet-hostel-backend.git
   cd pet-hostel-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials:
   ```ini
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_password
   DB_NAME=pet_hostel
   PORT=5000
   ```

## Database Setup

**Option 1: Command Line**
```bash
mysql -u root -p pet_hostel < schema.sql
```

**Option 2: phpMyAdmin**
1. Login to phpMyAdmin
2. Create `pet_hostel` database
3. Import `schema.sql` file

## 🚀 Running the Server

**Development mode (with hot-reload):**
```bash
npm run dev
```

**Production build:**
```bash
npm run build && npm start
```

## 📂 Project Structure

```
pet-hostel-backend/
├── src/
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   ├── utils/          # Helper functions
│   └── index.ts        # Server entry point
├── schema.sql          # Database schema
├── .env.example        # Environment template
├── package.json        # Project configuration
└── tsconfig.json       # TypeScript settings
```

## 🔌 API Endpoints

### Authentication
| Endpoint            | Method | Description          |
|---------------------|--------|----------------------|
| `/api/auth/signup`  | POST   | Register new user    |
| `/api/auth/login`   | POST   | User login           |

> More endpoints will be added as development progresses.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request

## 📜 License

This project is licensed under the **ISC License** © 2025 Irminsul Devs
