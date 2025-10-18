# 🧭 SubscriptionHQ: Full-Stack Subscription Management System

**SubscriptionHQ** is a comprehensive, full-stack application for managing user subscriptions using a modern and scalable tech stack.
It features a **Next.js frontend**, a **Node.js/Express backend**, and integrates with **Razorpay** for handling payments and subscription lifecycles — all managed within a **monorepo** for streamlined development.

---

## ✨ Key Features

* 🔑 **User Subscription Management** – Create and manage user subscriptions for multiple plans.
* 💳 **Razorpay Integration** – Securely process payments and manage subscription lifecycles via the Razorpay API.
* 🪝 **Secure Webhook Handling** – Receive and verify real-time Razorpay events (`subscription.charged`, `subscription.cancelled`, etc.) and sync them with your database.
* 🗃️ **Database Persistence** – Store user and subscription data using **PostgreSQL** and **Prisma ORM**.
* 🧩 **Monorepo Architecture** – Unified repository for frontend, backend, and shared database packages using **Turborepo**.
* ⚡ **Modern Tech Stack** – Built with **Next.js**, **React**, **TypeScript**, **Express**, **Prisma**, and **PostgreSQL**.

---

## 🚀 Core Technologies

| Layer        | Technologies                                    |
| ------------ | ----------------------------------------------- |
| **Frontend** | Next.js, React, Tailwind CSS, Shadcn/ui         |
| **Backend**  | Node.js, Express, TypeScript                    |
| **Database** | PostgreSQL, Prisma ORM                          |
| **Payments** | Razorpay API                                    |
| **Tooling**  | Turborepo (Monorepo), Ngrok (Webhook Tunneling) |

---

## 🛠️ Getting Started: Local Development Setup

Follow these steps to get **SubscriptionHQ** running on your local machine.

---

### 1. Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/) (v18 or later recommended)
* npm (or yarn/pnpm)
* [Docker](https://www.docker.com/) (for running PostgreSQL)
* [Razorpay Account](https://razorpay.com/) (for API keys & webhooks)
* [Ngrok](https://ngrok.com/) (for local webhook testing)

---

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/SubscriptionHQ.git
cd SubscriptionHQ
```

---

### 3. Install Dependencies

From the root directory, install all dependencies:

```bash
npm install
```

This installs dependencies for the **frontend**, **backend**, and shared packages.

---

### 4. Set Up the PostgreSQL Database

We’ll use Docker to spin up a PostgreSQL instance.

Create a file named **`docker-compose.yml`** in the project root:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: your_db_user
      POSTGRES_PASSWORD: your_db_password
      POSTGRES_DB: subscription_hq_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start the database container:

```bash
docker-compose up -d
```

---

### 5. Configure Environment Variables

Navigate to the backend app directory:

```bash
cd apps/backend
```

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit the `.env` file with your credentials:

```bash
# Database Connection
DATABASE_URL="postgresql://your_db_user:your_db_password@localhost:5432/subscription_hq_db"

# Razorpay API Keys
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"

# Razorpay Webhook Secret
RAZORPAY_WEBHOOK_SECRET="your_strong_random_secret_here"
```

---

### 6. Run Database Migrations

Apply the Prisma schema to your PostgreSQL database:

```bash
npx prisma migrate dev --name "init"
```

---

## ▶️ Running the Application

### 1. Start the Backend Server

From the project root:

```bash
npm run dev --prefix apps/backend
```

The backend will run at:
👉 **[http://localhost:4000](http://localhost:4000)**

---

### 2. Start the Frontend Application

In a new terminal:

```bash
npm run dev --prefix apps/frontend
```

The frontend will run at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🪝 Setting Up the Razorpay Webhook

To receive real-time Razorpay events (like successful payments), you’ll need to expose your local backend to the internet using **Ngrok**.

1. **Start Ngrok**

   ```bash
   ngrok http 4000
   ```

2. **Copy the Forwarding URL**

   Ngrok will output something like:

   ```
   Forwarding https://<random-string>.ngrok-free.app -> http://localhost:4000
   ```

3. **Configure Razorpay Webhook**

   * Go to your **Razorpay Dashboard → Settings → Webhooks**
   * Click **+ Add New Webhook**
   * **Webhook URL:**

     ```
     https://<random-string>.ngrok-free.app/api/webhooks/razorpay
     ```
   * **Secret:** Use the same `RAZORPAY_WEBHOOK_SECRET` from your `.env` file
   * **Active Events:**

     * `subscription.charged`
     * `subscription.cancelled`
     * `subscription.halted`

Once configured, your local server will securely receive and process Razorpay events.

---

## 🧰 Project Structure

```
SubscriptionHQ/
├── apps/
│   ├── backend/     # Express + TypeScript + Razorpay API + Prisma
│   └── frontend/    # Next.js + React + Tailwind CSS + Shadcn/ui
├── packages/
│   └── db/          # Shared Prisma schema & database client
├── docker-compose.yml
├── turbo.json       # Turborepo configuration
└── package.json
```

---

## 📜 License

This project is licensed under the **MIT License**.
Feel free to fork and modify it for your own use.

---

## 💡 Author

**SubscriptionHQ** — Built with ❤️ using **Next.js**, **Express**, and **Razorpay**.
Maintained by [Your Name](https://github.com/your-username)

---
