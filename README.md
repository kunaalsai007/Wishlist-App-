# Collaborative Product Wishlist App

A real-time collaborative wishlist application where multiple users can create, manage, and interact with shared wishlists together. Perfect for group shopping planning, gift coordination, or team product research.

## 🚀 Features

- **User Authentication**: Sign up and log in with dummy authentication
- **Wishlist Management**: Create, edit, and delete wishlists
- **Product Management**: Add, edit, and remove products with name, image URL, and price
- **Collaboration**: Invite others to join wishlists (mocked for demo)
- **User Tracking**: See who added which items with username/email attribution
- **Real-time Updates**: Collaborative features for seamless group interaction

## 🛠️ Tech Stack

### Frontend
- **React** - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Hooks** - State management and side effects
- **Fetch API** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **REST API** - RESTful API architecture
- **CORS** - Cross-origin resource sharing middleware
- **JSON** - Data interchange format

### Database
- **JSON Files** - Simple file-based storage (for demo purposes)
- **In-memory storage** - Session-based data persistence


## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collaborative-wishlist-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```
   The app will run on `http://localhost:3000`

### Environment Variables

Create a `.env` file in the backend directory:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Wishlists
- `GET /api/wishlists` - Get all user wishlists
- `POST /api/wishlists` - Create new wishlist
- `GET /api/wishlists/:id` - Get specific wishlist
- `PUT /api/wishlists/:id` - Update wishlist
- `DELETE /api/wishlists/:id` - Delete wishlist
- `POST /api/wishlists/:id/invite` - Invite user to wishlist

### Products
- `GET /api/wishlists/:id/products` - Get all products in wishlist
- `POST /api/wishlists/:id/products` - Add product to wishlist
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

---

*Built with ❤️ using React, Tailwind CSS, Node.js, and Express*
