
# NevaSEA Catering 🍱

NevaSEA Catering is a web-based meal subscription platform that allows users to subscribe to meal plans and receive personalized catering recommendations powered by AI. The platform also supports seamless online payments via MidTrans.

## 🧰 Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Go (Golang)
- **Database**: PostgreSQL
- **Deployment**: Docker + Docker Compose
- **Payment Gateway**: MidTrans
- **AI Recommendation**: Gemini API (Google)

## 🌐 Deployment

This web app **has been deployed publicly** and could be accessed in:

🔗 [https://nevabcc-lapar.bccdev.id](https://nevabcc-lapar.bccdev.id)

### 🔑 Accounts for Testing the Web App

#### 👑 Admin
- **Email**: `adminAccount@test.com`  
- **Password**: `Admin123123!`

#### 👤 Normal Accounts
- **Email**: `nepa@gmail.com`  
- **Password**: `Admin123123!`
  
*(If u want to make a new one, u could use the register form)*




## 🚀 Getting Started

### 📦 Dependencies

Make sure you have the following installed:
- Go
- Node.js & npm
- Docker & Docker Compose
- PostgreSQL

> Note: Frontend dependencies are managed via `npm`, and backend via `go mod`.

## ⚙️ Project Structure

```
NevaSEA-Catering/
├── backend/
├── frontend/
├── db_docker_DDL.sql
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx/
├── .env
├── .gitignore
└── README.md
```

## 🔐 Environment Variables

You must create the following `.env` files before running the project.

### 📁 Root `.env`

```
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_db
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sea_catering_db
DB_SSLMODE=disable
JWT_SECRET=rahasiajwt13982
GEMINI_API_KEY=your_gemini_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### 📁 backend/.env

```
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=13982
DB_NAME=sea_catering_db
DB_SSLMODE=disable
GEMINI_API_KEY=your_gemini_key
VITE_DEPLOY_API_URL=http://localhost:8080
```

### 📁 frontend/.env

```
VITE_DEPLOY_API_URL=http://localhost:8080
```

## 🐳 Running with Docker

```
docker compose up --build
```

## 🧑‍💻 Running Locally (Optional)

### Frontend

```
cd frontend
npm install
npm run dev
```

### Backend

```
cd backend
go mod tidy
go run main.go
```

## 🧠 AI Recommendations

Ensure that the `GEMINI_API_KEY` is set to enable AI-based meal recommendations powered by **Gemini (Google AI)**.

### 🔑 How to Get a Gemini API Key

1. Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account.
3. Click **"Create API Key"**.
4. Copy the generated API key.
5. Paste it into your `.env` files under `GEMINI_API_KEY`.

> ⚠️ Note: Ensure your API key has access to the Gemini Pro model, and usage is within the [free tier](https://aistudio.google.com/app) limits or your billing setup.


## 💳 Payment Integration

Payments are handled via **MidTrans** using sandbox mode for testing.

To test transactions using **credit card**, you can use the following test card details:

- **Card Number**: `4811 1111 1111 1114`
- **Expiry Date**: Any future date (e.g., 12/30)
- **CVV**: `123`

> 💡 You can find more test payment options in the official [MidTrans Sandbox Documentation](https://docs.midtrans.com/docs/sandbox-overview).


## 🛠 Database Initialization
Use the file called db_docker_DDL to make the database structure.
```
psql -U postgres -d sea_catering_db -f db_docker_DDL.sql
```

### Alternative Database Init

```
CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE public.testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    review TEXT NOT NULL,
    rating INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE public.subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id),
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    meal_types TEXT[] NOT NULL,
    delivery_days TEXT[] NOT NULL,
    allergies TEXT,
    total_price NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 👑 Admin Setup

### Option 1: Register and Promote

```
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Option 2: Create Admin via SQL

```
INSERT INTO users (email, password, role) VALUES ('admin@example.com', 'hashed_password', 'admin');
```

## 📄 License

For educational and prototype use only.
