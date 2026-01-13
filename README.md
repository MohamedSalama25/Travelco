# 🌍 FLYZO - Travel & Management System

A comprehensive Travel Management System built with a modern tech stack, designed to handle travelers, expenses, treasury, and team management efficiently.

## 🚀 Features

- **📊 Advanced Dashboard**: Overview of statistics and business performance.
- **👥 Traveler Management**: Detailed tracking of traveler profiles and bookings.
- **💰 Financial Management**:
  - **Treasury**: Real-time tracking of cash flow and balances.
  - **Expenses**: Comprehensive expense logging and categorization.
- **🏢 Enterprise Features**:
  - **Team Management**: Role-based access control and team coordination.
  - **Customer CRM**: Maintain relationships with corporate clients and regular customers.
  - **Airline Partners Management**: Integration and management for airline partners.
- **🌐 Localization**: Full support for **Arabic (RTL)** and **English (LTR)** with seamless switching.
- **📱 Responsive Design**: Optimized for a premium experience on all devices.
- **🗺 Interactive Maps**: Integrated Leaflet maps for location tracking.

---

## 🛠 Tech Stack

### Frontend

| Technology         | Usage                                    |
| :----------------- | :--------------------------------------- |
| **Next.js 15**     | React Framework (App Router, Turbopack)  |
| **React 19**       | Component-based UI Library               |
| **TypeScript**     | Static Type Checking                     |
| **Tailwind CSS 4** | Modern Utility-first Styling             |
| **TanStack Query** | Server-state Management & Caching        |
| **Zustand**        | Lightweight Client-side State Management |
| **Shadcn UI**      | High-quality Accessible Components       |
| **Leaflet**        | Open-source Interactive Maps             |
| **next-intl**      | Professional Internationalization (i18n) |

### Backend

| Technology   | Usage                                  |
| :----------- | :------------------------------------- |
| **Node.js**  | JavaScript Runtime                     |
| **Express**  | Fast, Unopinionated Web Framework      |
| **MongoDB**  | Flexible NoSQL Database (via Mongoose) |
| **JWT**      | Secure JSON Web Token Authentication   |
| **Bcryptjs** | Industrial-strength Password Hashing   |
| **ExcelJS**  | Powerful Excel Report Generation       |

---

## 🏗 Project Structure

```text
FLYZO/
├── frontend/           # Next.js Application
│   ├── app/            # Routes, Layouts & Pages
│   ├── components/     # Atomic UI Components (Shadcn)
│   ├── features/       # Modular Business Logic (Expenses, Auth, etc.)
│   ├── messages/       # Translation Dictionaries (AR/EN)
│   ├── lib/            # Shared Utilities & API Config
│   └── hooks/          # Custom React Hooks
└── backend/            # Express API
    ├── src/
    │   ├── controllers/# Request Handlers
    │   ├── models/     # Database Schemas
    │   ├── routes/     # API Routing
    │   ├── middlewares/# Auth, Logging & Validation
    │   └── utils/      # Helper Functions
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **MongoDB**: Active instance (Local or Cloud)
- **Package Manager**: NPM or Bun

### Backend Setup

1. **Navigate to backend**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=3200
   MONGO_URI=mongodb://localhost:27017/FLYZO
   JWT_SECRET=your_secure_secret_here
   ```
4. **Start the server**:
   ```bash
   npm run start
   ```

### Frontend Setup

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000)

---

## 🔒 Security & Optimization

- **IP Access Control**: Backend includes IP-based security middleware.
- **Secure Auth**: JWT-based stateless authentication.
- **Data Validation**: Client and Server-side validation using Zod and custom middlewares.
- **SEO Ready**: Optimized meta tags and semantic HTML for search engines.

---

## 👤 Author

Developed with Mohamed Salamma for **FLYZO Management**.

---

## 📝 License

© 2024-2026 FLYZO. All rights reserved.
