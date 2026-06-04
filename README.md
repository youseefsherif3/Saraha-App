# 🔐 Saraha App Backend API

A secure and scalable RESTful API inspired by the Saraha platform, allowing users to receive anonymous messages while maintaining robust authentication and authorization mechanisms.

Built using **Node.js**, **Express.js**, and **MongoDB**.

---

## 🚀 Features

### Authentication & Authorization

* User Registration
* User Login
* JWT Authentication
* Email Verification
* Protected Routes
* Password Hashing with bcrypt

### Anonymous Messaging

* Send Anonymous Messages
* Receive Messages Securely
* View Personal Messages

### User Management

* User Profile Management
* Account Verification
* Update User Information

### Security

* JWT-based Authentication
* Password Encryption
* Input Validation
* Error Handling Middleware
* Environment Variables Protection

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT
* bcrypt

### Additional Tools

* Nodemailer
* Postman
* dotenv

---

## 📁 Project Structure

```bash
src/
├── modules/
│   ├── auth/
│   ├── user/
│   └── message/
│
├── middleware/
├── utils/
├── database/
├── app.js
└── server.js
```

---

## 🔄 API Workflow

```text
User Registration
      ↓
Email Verification
      ↓
Login
      ↓
JWT Token
      ↓
Protected Endpoints
      ↓
Receive Anonymous Messages
```

---

## 📡 API Endpoints

### Auth

```http
POST /auth/signup
POST /auth/signin
PATCH /auth/verify-email
```

### Users

```http
GET /users/profile
PATCH /users/update-profile
```

### Messages

```http
POST /messages/send/:userId
GET /messages
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/youseefsherif3/Saraha-App.git
cd Saraha-App
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

DB_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

EMAIL=your_email

EMAIL_PASSWORD=your_password
```

### Run Server

```bash
npm run dev
```

---

## 📬 Postman Collection

Import the Postman collection and test:

* Authentication Endpoints
* User Endpoints
* Message Endpoints

---

## 🔒 Security Features

* JWT Authentication
* Password Hashing (bcrypt)
* Email Verification
* Protected Routes
* Request Validation
* Environment Variables

---

## 🎯 Future Improvements

* Refresh Tokens
* Rate Limiting
* Two-Factor Authentication
* Docker Support
* Real-Time Messaging

---

## 👨‍💻 Author

### Yousef Sherif

* GitHub: https://github.com/youseefsherif3
* Portfolio: https://youseef-sherif-portfolio.vercel.app

---

⭐ If you found this project useful, consider giving it a star.
