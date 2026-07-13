# ServEase Home Service Platform 

ServEase is a comprehensive, full-stack home service booking platform designed to connect customers with verified service professionals seamlessly. 

The platform features a premium glassmorphic UI, a dual-portal system for both customers and professionals, secure PIN-based job completions, and robust relational database architecture.

##  Tech Stack

### Frontend
- **Next.js 16 (App Router)** - React framework for production
- **React 19 & TypeScript**
- **Tailwind CSS v4** - For modern, highly-responsive styling
- **Animations** - Custom CSS micro-animations and hover effects

### Backend
- **Node.js & Express.js** - Robust REST API
- **PostgreSQL** - Relational database for transactional integrity
- **JWT (JSON Web Tokens)** - Stateless, secure authentication
- **Bcrypt.js** - Secure password hashing

## Core Features

### For Customers
* **Dynamic Service Catalog:** Browse services with a rich, animated UI.
* **Provider Selection:** View detailed professional profiles, transparent pricing, and past customer reviews.
* **Smart Cart Checkout:** Add granular subservices (e.g., "AC Gas Refill") and book specific time slots across multiple providers in one go.
* **Secure Verification:** Receive a unique 6-digit PIN upon booking to ensure work is actually completed before handing it over to the provider.
* **Ratings & Reviews:** Leave 1-5 star ratings and comments to help the community.

### For Service Professionals
* **Dedicated Dashboard:** A separate secure login portal for providers.
* **Job Management:** Track incoming requests, view customer locations, and manage schedules.
* **Secure Job Completion:** Providers MUST input the 6-digit PIN provided by the customer to mark a job as "Completed", preventing fraudulent status updates.
* **Menu Configuration:** Providers can easily set their specific service offerings and custom base prices.

## ⚙️ Setup & Installation

Follow these steps to run the project locally on your machine.

### 1. Database Setup
1. Ensure you have **PostgreSQL** installed and running.
2. Create a new database named `home_service_db`.
3. Run the `schema.sql` file provided in the root directory to generate all necessary tables and relations.

### 2. Backend Setup
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` directory by duplicating the provided `.env.example` file and filling in your local database credentials:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=home_service_db
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your_super_secret_key
   ```
3. Start the backend server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Next.js development server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

*(Alternatively, you can run `npm install` in both folders and simply use `npm run dev` from the root directory to start both servers concurrently!)*

##  Architecture Notes
The system utilizes a heavily normalized PostgreSQL schema (13 distinct tables) to ensure strong relational mapping. For example, bookings cannot be made for invalid providers or subservices, and cart checkouts utilize transactional queries to seamlessly map multiple services into singular booking tickets.

---
*If you find this project helpful, please consider leaving a ⭐!*
