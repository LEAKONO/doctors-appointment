# Doctors Appointment

## Overview
This project is a comprehensive Healthcare Management System built with the **MERN stack** (MongoDB, Express.js, React, Node.js). It provides a RESTful API for managing users, doctors, appointments, and related healthcare services. The system supports three main user roles: **Admin, Doctor, and Patient**, each with specific permissions and functionalities.

## 🔐 User Registration & Roles
### 👤 Default User Role: Patient
- All new users who sign up are automatically registered as patients.
- Only admins can upgrade a patient to a doctor by filling in:
  - **Specialty** (e.g., "Cardiology", "Neurology")
  - **Qualifications** (e.g., "MD, PhD")
  - **Profile Image** (optional)

## Key Features

### User Management
- **Registration & Authentication**: Secure user registration and login with JWT.
- **Role-based Access Control**: Three user roles (Admin, Doctor, Patient).
- **Profile Management**: Users can view and update their profiles.
- **Admin Functions**: User upgrades, deletions, and management.

### Doctor Functionality
- **Profile Management**: Upload profile image by drag and drop.
- **Availability Scheduling**: Set available time slots for appointments.
- **Appointment Management**: View, confirm, or reject patient appointments.
- **Patient Communication**: Automated email notifications for status changes.

### Patient Functionality
- **Doctor Discovery**: View available doctors with specialties.
- **Appointment Booking**: Book available time slots.
- **Appointment Tracking**: View all their booked appointments.

## 🔄 Role Assignment Flow
1. **User signs up** → Becomes a **patient** by default.
2. **Admin logs in** → Goes to **User Management**.
3. **Admin selects a patient** → Clicks **"Upgrade to Doctor"**.
4. **Admin fills doctor details** → Submits the form.
5. **System sends email**: "Congratulations! You are now a doctor...".
6. **User's role updates** → Next login accesses **Doctor Dashboard**.

## 📊 Dashboards Overview

### 👨‍⚕️ Doctor Dashboard
- Set availability (Choose time slots).
- Upload Profile Image.
- View & Manage Appointments.
- Receive Notifications.

### Patient-to-Doctor Transition Workflow
To understand how the system works, follow these steps:
1. **Sign up two users** (both will be **patients** by default).
2. **Login as an Admin** (credentials provided below) and **upgrade one patient to a doctor**.
3. **The upgraded user will receive an email** with a login URL to the **Doctor Dashboard**.
4. **Login as the doctor**, upload a **profile image**, and **set availability**.
5. **Logout and log in as the second user (patient)**.
6. **Book an appointment** with the newly upgraded doctor.
7. **Check your email** for confirmation of your appointment request.
8. **Login as the doctor** and either confirm or reject the appointment.
9. **The patient will receive an email notification** about the status update.

## 📧 Key Email Notifications

| Action | Recipient | Email Content |
|--------|-----------|---------------|
| New Doctor Upgrade | Upgraded User | "You are now a doctor! Log in to set profile." |
| Appointment Request | Patient | "Your request is pending confirmation." |
| Appointment Confirmed | Patient | "Your appointment with Dr. [Name] is confirmed!" |
| Appointment Rejected | Patient | "Request declined. Please book another slot." |

## Technology Stack

### Backend
- **Node.js**
- **Express.js**
- **MongoDB (Mongoose ODM)**
- **JWT Authentication**
- **Bcrypt Password Hashing**
- **Multer File Uploads**
- **Nodemailer Email Service**

### Frontend
- **React**
- **React Router**
- **Context API**
- **Axios**
- **Tailwind CSS**

## API Endpoints

### Auth Routes (`/api/user`)
- `POST /register` - Register new user
- `POST /login` - Authenticate user

### User Routes (`/api/users`)
- `GET /` - Get all users (admin)
- `GET /me` - Get current profile
- `POST /upgrade` - Upgrade to doctor (admin)
- `DELETE /:userId` - Delete user (admin)

### Doctor Routes (`/api/doctors`)
- `GET /profile` - Get doctor profile
- `POST /profile` - Update profile
- `POST /profile-image` - Upload image
- `GET /all-doctors` - List all doctors
- `POST /set-availability` - Set slots
- `GET /appointments` - Get appointments
- `PUT /appointments/:id` - Update status

### Appointment Routes (`/api/appointments`)
- `POST /book` - Book appointment
- `GET /my-appointments` - Get user appointments

## Getting Started

### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (local or Atlas)
- **NPM/Yarn**

### Installation
1. Clone repository: `git clone https://github.com/LEAKONO/doctors-appointment`
2. Navigate to the project directory: `cd PLP-Capstone`
3. Install dependencies: `npm install`
4. Create `.env` file (copy from `.env.example` and configure variables)
5. Start the backend server: `node server.js`
6. Navigate to the frontend directory: `cd frontend`
7. Install frontend dependencies: `npm install`
8. Start the frontend: `npm start`

## 🔐 Logout
- The **Logout Button** is located at the **bottom of the sidebar** in all dashboards.
- Click to securely logout and return to the **Login Page**.

## Future Enhancements
- **Patient Medical Records**
- **Prescription Management**
- **Video Consultation**
- **Payment Gateway Integration**
- **Enhanced Doctor Search & Filtering**

## 🚀 Demo Accounts
Available for testing:

| Role | Email | Password |
|------|---------------------|-----------|
| Admin | `leakonoemmanuel@gmail.com` | `leakono` |
| Doctor | `joel@gmail.com` | `saitore` |
| Patient | `kailinliberty@gmail.com` | `nashami` |

🌐 Live Demo

Check out the live version of the project here: Live Link



## 👥 Contributions
Contributions are welcome! Feel free to submit pull requests or open issues.

## 📜 License
This project is licensed under the **MIT License**.

## ✍️ Author
Developed by **Emmanuel Leakono**.

