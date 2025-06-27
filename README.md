
# NevaSEA Catering 🍱

NevaSEA Catering is a web-based meal subscription platform that allows users to subscribe to meal plans and receive personalized catering recommendations powered by AI. The platform also supports seamless online payments via MidTrans.

## 🧰 Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Go (Golang)
- **Database**: PostgreSQL
- **Deployment**: Docker + Docker Compose
- **Payment Gateway**: MidTrans
- **AI Recommendation**: Gemini API (Google)

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

Ensure `GEMINI_API_KEY` is set to use AI-based meal recommendations.

## 💳 Payment Integration

Payments are handled via MidTrans. Use sandbox mode for testing.

## 🛠 Database Initialization

```
psql -U postgres -d sea_catering_db -f db_docker_DDL.sql
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
