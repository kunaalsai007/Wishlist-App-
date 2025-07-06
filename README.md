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

## 🔧 Usage

1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Create Wishlist**: Click "Create New Wishlist" and give it a name
3. **Add Products**: Add items with name, image URL, and price
4. **Invite Collaborators**: Share wishlist with others (mocked for demo)
5. **Collaborate**: See real-time updates as team members add/edit items
6. **Track Changes**: View who added which items with user attribution

## 🎯 Key Features Implementation

### User Authentication
- Dummy authentication system with localStorage for demo
- JWT token-based authentication (ready for production)
- Protected routes and middleware

### Wishlist Management
- CRUD operations for wishlists
- User ownership and permissions
- Collaborative access control

### Product Management
- Full CRUD for products within wishlists
- Image URL support for product photos
- Price tracking and display

### Real-time Collaboration
- User attribution for all actions
- Timestamp tracking for changes
- Mock invitation system

## 🔮 Assumptions and Limitations

### Assumptions
- Users have valid email addresses for authentication
- Product images are provided as URLs (not file uploads)
- Network connectivity is stable for real-time features
- Users understand basic wishlist/shopping concepts

### Current Limitations
- **Authentication**: Uses dummy/mock authentication (not production-ready)
- **Database**: File-based storage instead of persistent database
- **Real-time**: No WebSocket implementation (would need Socket.io)
- **Image Upload**: Only supports URLs, not direct file uploads
- **Invitation System**: Mocked functionality, not fully implemented
- **Error Handling**: Basic error handling, needs enhancement for production
- **Validation**: Minimal input validation on frontend and backend
- **Security**: No advanced security measures (rate limiting, input sanitization)
- **Scalability**: Not optimized for large numbers of users or items

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🛠️ Development Notes

- The app uses React functional components with hooks
- Tailwind CSS is configured for responsive design
- Express.js follows RESTful API conventions
- CORS is enabled for frontend-backend communication
- Basic error handling is implemented throughout


---

*Built with ❤️ using React, Tailwind CSS, Node.js, and Express*