# 🍔 CampusCravings – Full-Stack Food Delivery Platform

A full-stack food delivery web application designed for a university environment, enabling seamless interaction between **customers** and **eateries**.

The platform supports authentication, menu management, order placement, real-time tracking, feedback systems, and personalized recommendations — all built with scalable architecture and modular design principles.

---

## 🚀 Overview

CampusCravings solves the inefficiency of manual and fragmented food ordering systems within campus environments by providing:

- A centralized ordering platform  
- Real-time order updates  
- Dual-role functionality (Customer & Eatery Worker)  
- Structured backend APIs  
- Intelligent filtering and search  
- Feedback-driven rating system  
- AI-powered chatbot recommendations  

---

## 🛠 Tech Stack

### Frontend
- React.js
- CSS
- Axios
- Context API (State Management)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- RESTful APIs
- Socket.IO (Real-Time Updates)

---

## 🔐 Core Features

### 👤 Authentication System
- Secure Sign Up / Login
- Role-based access (Customer / Eatery Worker)
- Protected routes

### 🍽 Customer Features
- Browse eateries & personalized recommendations
- Search & filter menu items
- Add to cart functionality
- Checkout (delivery/pickup)
- Real-time order tracking
- Order history
- Ratings & reviews
- AI chatbot recommendations

### 🏪 Eatery Features
- Menu management (add/edit/delete items)
- Order management dashboard
- Update order status (Pending → In Progress → Delivered)
- View customer feedback & average ratings

---

## 🧠 System Design Highlights

- Modular REST API structure
- Role-based authentication & authorization
- Centralized frontend state management
- Real-time synchronization using Socket.IO
- Structured MongoDB schemas:
  - Users
  - Eateries
  - Menu Items
  - Orders
  - Reviews

---

## 📂 Project Structure

```
food-delivery-app/
│
├── client/                 # React Frontend
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── services/
│
├── server/                 # Express Backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── sockets/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/food-delivery-app.git
cd food-delivery-app
```

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside `/server`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start backend:

```bash
npm start
```

Backend runs at:
```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend runs at:
```
http://localhost:3000
```

---

## 📌 Use Case Coverage

The system supports:

- User registration & authentication  
- Browse & filter eateries  
- Order placement & checkout  
- Real-time order tracking  
- Menu & order management (Eatery dashboard)  
- Ratings & feedback system  
- AI-powered chatbot recommendations  

---

## 📈 Key Engineering Decisions

- Designed scalable REST endpoints for efficient order handling
- Implemented real-time updates using WebSockets
- Optimized frontend re-render cycles via controlled state management
- Maintained clean separation between controller, route, and model layers
- Structured MongoDB relations for consistent data integrity

---

## 🔮 Future Improvements

- Payment gateway integration
- Admin analytics dashboard
- Deployment (AWS / Docker)
- Unit & integration testing
- Advanced recommendation algorithm
- Performance optimization & caching

---

⭐ If you found this project interesting, consider giving it a star!
