const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'be2f5a36e3ca01c5d423a1ac3a350bc550bdc1c46f8bf08f0fa39e0becaf2763';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (replace with your MongoDB URI)
mongoose.connect('mongodb+srv://wishlistUser:wishlistPass123@wishlist.l9hiu3d.mongodb.net/sharedWishlist?retryWrites=true&w=majority&appName=Wishlist', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  items: [{
    name: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    price: { type: Number, default: 0 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Routes

// User Registration
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all wishlists for user
app.get('/api/wishlists', authenticateToken, async (req, res) => {
  try {
    const wishlists = await Wishlist.find({
      $or: [
        { creator: req.user._id },
        { collaborators: req.user._id }
      ]
    })
    .populate('creator', 'username email')
    .populate('collaborators', 'username email')
    .populate('items.addedBy', 'username email')
    .sort({ updatedAt: -1 });

    res.json(wishlists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific wishlist
app.get('/api/wishlists/:id', authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('collaborators', 'username email')
      .populate('items.addedBy', 'username email');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.creator._id.equals(req.user._id) || 
                     wishlist.collaborators.some(collab => collab._id.equals(req.user._id));
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new wishlist
app.post('/api/wishlists', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const wishlist = new Wishlist({
      title,
      description,
      creator: req.user._id,
      collaborators: [req.user._id]
    });

    await wishlist.save();
    await wishlist.populate('creator', 'username email');
    await wishlist.populate('collaborators', 'username email');

    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add item to wishlist
app.post('/api/wishlists/:id/items', authenticateToken, async (req, res) => {
  try {
    const { name, imageUrl, price, notes } = req.body;
    
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.creator.equals(req.user._id) || 
                     wishlist.collaborators.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const newItem = {
      name,
      imageUrl: imageUrl || '',
      price: price || 0,
      notes: notes || '',
      addedBy: req.user._id
    };

    wishlist.items.push(newItem);
    wishlist.updatedAt = new Date();
    await wishlist.save();

    await wishlist.populate('creator', 'username email');
    await wishlist.populate('collaborators', 'username email');
    await wishlist.populate('items.addedBy', 'username email');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item in wishlist
app.put('/api/wishlists/:id/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { name, imageUrl, price, notes } = req.body;
    
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const item = wishlist.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only the person who added the item can edit it
    if (!item.addedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit items you added' });
    }

    item.name = name || item.name;
    item.imageUrl = imageUrl !== undefined ? imageUrl : item.imageUrl;
    item.price = price !== undefined ? price : item.price;
    item.notes = notes !== undefined ? notes : item.notes;

    wishlist.updatedAt = new Date();
    await wishlist.save();

    await wishlist.populate('creator', 'username email');
    await wishlist.populate('collaborators', 'username email');
    await wishlist.populate('items.addedBy', 'username email');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete item from wishlist
app.delete('/api/wishlists/:id/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const item = wishlist.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only the person who added the item can delete it
    if (!item.addedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete items you added' });
    }

    wishlist.items.pull({ _id: req.params.itemId });
    wishlist.updatedAt = new Date();
    await wishlist.save();

    await wishlist.populate('creator', 'username email');
    await wishlist.populate('collaborators', 'username email');
    await wishlist.populate('items.addedBy', 'username email');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mock invite user to wishlist (simplified)
app.post('/api/wishlists/:id/invite', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Only creator can invite
    if (!wishlist.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can invite users' });
    }

    // Find user to invite
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a collaborator
    if (wishlist.collaborators.includes(userToInvite._id)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    wishlist.collaborators.push(userToInvite._id);
    wishlist.updatedAt = new Date();
    await wishlist.save();

    await wishlist.populate('creator', 'username email');
    await wishlist.populate('collaborators', 'username email');

    res.json({ message: 'User invited successfully', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users (for inviting)
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user._id }
    })
    .select('username email')
    .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete wishlist
app.delete('/api/wishlists/:id', authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Only creator can delete
    if (!wishlist.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can delete the wishlist' });
    }

    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Wishlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});