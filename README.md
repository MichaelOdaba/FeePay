# FeePay — School Fee Payment Management System

> A web-based platform designed to simplify and modernize school fee payment and management at Father Adasu University Makurdi (FAUM).

---

## 📌 Overview

FeePay provides a centralized, secure, and user-friendly system for students, parents, and bursary staff to manage school fee payments digitally — eliminating long queues, manual processing, and lack of payment transparency.

---

## 🚩 Problem Statement

Students and parents at FAUM face the following challenges:

- Long queues at the bursary
- Manual receipt processing
- Delays in payment verification
- Lack of transparency in payment status

This leads to penalties, registration holds, and unnecessary administrative stress.

---

## 🎯 Objectives

- Digitize and streamline fee payment processes
- Provide real-time payment tracking and verification
- Reduce administrative workload and errors
- Improve transparency and accessibility

---

## 👥 User Roles

| Role                | Description                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| **Student**         | Views fee structure, checks balance, makes payments, downloads receipts |
| **Parent/Guardian** | Monitors linked student's payment status and history                    |
| **Admin/Bursary**   | Manages fees, approves/rejects payments, monitors all transactions      |

---

## ✨ Features

### Authentication

- Role-based registration and login (Student, Parent, Admin)
- Secure session management via Supabase Auth
- Automatic redirect to role-specific dashboard on login

### Student Dashboard

- View fee structure uploaded by admin
- Check total fees, amount paid, and outstanding balance
- Simulated card payment flow with duplicate payment prevention
- View full payment history with status badges and receipt numbers
- In-app notification bell with unread count

### Parent Dashboard

- Linked to student account via parent email at registration
- View all linked students and their payment history
- Real-time payment status tracking

### Admin Panel

- Add and manage fee schedules (name, amount, semester, academic year)
- View all student payments across the system
- Confirm or reject pending payments
- Automatic student notification on status change

### Notifications

- In-app bell icon with unread count badge
- Triggered on payment submission and status updates
- Auto-marked as read when dropdown is opened

### Payment Flow

- Simulated card payment form (no real gateway)
- 2-second processing simulation for realism
- Duplicate payment prevention per fee per student
- Auto-generated unique receipt number per payment

---

## 🛠️ Tech Stack

| Layer              | Technology            |
| ------------------ | --------------------- |
| Frontend           | React 19 + Vite 7     |
| Styling            | Tailwind CSS v4       |
| Icons              | Lucide React          |
| Backend & Database | Supabase (PostgreSQL) |
| Authentication     | Supabase Auth         |
| Package Manager    | pnpm                  |
| Hosting            | Localhost (demo)      |

---

## 🗄️ Database Schema

| Table           | Key Fields                                                                |
| --------------- | ------------------------------------------------------------------------- |
| `profiles`      | id, full_name, email, role, student_id, linked_parent_id                  |
| `fees`          | id, name, amount, semester, academic_year                                 |
| `payments`      | id, student_id, fee_id, amount_paid, status, receipt_number, payment_date |
| `notifications` | id, user_id, message, is_read, created_at                                 |

---

## 📁 Project Structure

```
feepay/
├── src/
│   ├── components/
│   │   └── NotificationBell.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── PayFee.jsx
│   │   ├── parent/
│   │   │   └── ParentDashboard.jsx
│   │   └── admin/
│   │       └── AdminDashboard.jsx
│   ├── supabaseClient.js
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- Supabase account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/feepay.git

# Navigate into the project
cd feepay

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

### Environment Setup

Create a `.env` file in the root of the project:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

---

## 🔐 Demo Accounts

To test the app, register accounts with the following roles:

| Role    | How to Register                                   |
| ------- | ------------------------------------------------- |
| Student | Select "Student" on register, enter matric number |
| Parent  | Select "Parent/Guardian" on register              |
| Admin   | Select "Admin/Bursary" on register                |

To link a parent to a student, enter the parent's email in the **Parent/Guardian Email** field during student registration.

---

## 📋 How to Demo

1. Register an **Admin** account and log in
2. Add a fee (e.g. Tuition Fee — ₦150,000 — First Semester — 2024/2025)
3. Register a **Parent** account
4. Register a **Student** account, entering the parent's email to link them
5. Log in as Student → click **Pay Now** → fill in card details → submit
6. Log in as Admin → confirm the payment
7. Log back in as Student → check notification bell and payment history
8. Log in as Parent → view the student's confirmed payment

---

## 👨‍💻 Author

**Michael Odaba**
Father Adasu University Makurdi (FAUM)

---

## 📄 License

This project was developed as an academic submission for FAUM.
