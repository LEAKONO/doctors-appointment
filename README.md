# 🏥 Doctors Appointment System - Full Documentation

## 🌐 Live Demo
[Doctors Appointment System](https://doctors-appointment-rjn9.vercel.app/)

## 📌 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [User Roles & Workflows](#user-roles--workflows)
- [Technology Stack](#technology-stack)
- [API Documentation](#api-documentation)
- [Installation Guide](#installation-guide)
- [Demo Accounts](#demo-accounts)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## 🏥 Project Overview
A comprehensive Healthcare Management System built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring:

- Role-based access control (Admin, Doctor, Patient)
- Appointment scheduling system
- Doctor availability management
- Automated email notifications
- Secure authentication with JWT

## ✨ Key Features
### 👨‍⚕️ Doctor Features
- Profile management with image upload
- Availability scheduling calendar
- Appointment confirmation/rejection
- Patient communication tools

### 🏥 Patient Features
- Doctor discovery and search
- Online appointment booking
- Appointment history tracking
- Email notifications

### 👑 Admin Features
- User management dashboard
- Patient-to-doctor upgrades
- System monitoring
- Content management

## 👥 User Roles & Workflows
### 🔄 Role Assignment Flow
1. User signs up → Defaults to Patient role
2. Admin logs in → Accesses User Management
3. Admin upgrades patient → Provides doctor details
4. System sends confirmation email to new doctor
5. Doctor completes profile → Sets availability

### 📧 Email Notifications
| Trigger | Recipient | Content |
|---------|----------|---------|
| Role upgrade | New Doctor | "Welcome to Doctor Portal" |
| Appointment request | Patient | "Appointment pending" |
| Appointment confirmed | Patient | "Appointment confirmed" |
| Appointment rejected | Patient | "Please choose another time" |

## 🛠 Technology Stack
### Backend
- Node.js (v16+)
- Express.js (REST API)
- MongoDB (Atlas Cloud)
- Mongoose (ODM)
- JWT (Authentication)
- Bcrypt (Password hashing)
- Nodemailer (Email service)

### Frontend
- React (v18)
- React Router (v6)
- Context API (State management)
- Tailwind CSS (Styling)
- Axios (HTTP client)
- React Icons (Icon library)

## 🛡 API Documentation
### Authentication
#### `POST /api/user/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

### Doctor Endpoints
#### `GET /api/doctors/all-doctors`
**Headers:**
```
Authorization: Bearer <token>
```

#### `POST /api/doctors/set-availability`
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
  "slots": ["2023-10-15T09:00:00", "2023-10-15T10:00:00"]
}
```

### Appointment Endpoints
#### `POST /api/appointments/book`
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
  "doctorId": "64c8a1f2e8a7b612a3e4f5a6",
  "date": "2023-10-15T09:00:00"
}
```

## 🚀 Installation Guide
### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- SMTP email service credentials

### Backend Setup
1. Clone repository:
   ```bash
   git clone https://github.com/LEAKONO/doctors-appointment.git
   cd doctors-appointment/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
4. Start server:
   ```bash
   node server.js
   ```

### Frontend Setup
1. Navigate to frontend:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure API base URL:
   ```bash
   cp .env.example .env
   # Set REACT_APP_API_BASE_URL
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 🔒 Demo Accounts
| Role  | Email | Password |
|-------|--------------------------|-----------|
| Admin | leakonoemmanuel@gmail.com | leakono |
| Doctor | cole@gmail.com| palmer1 |
| Patient | zaire@gmail.com | 123456|

## 🛠️ Future Enhancements
- Video consultation integration
- Electronic medical records
- Prescription management
- Payment gateway
- Multilingual support

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
Distributed under the MIT License. See LICENSE for more information.

## ✍️ Author
**Emmanuel Leakono**

- **GitHub:** [@LEAKONO](https://github.com/LEAKONO)
- **Email:** leakonoemmanuel3@gmail.com

