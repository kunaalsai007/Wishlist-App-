const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const {
  getAllWishlists,
  getWishlist,
  createWishlist,
  addItem,
  updateItem,
  deleteItem,
  inviteUser,
  searchUsers,
  deleteWishlist
} = require('../controllers/wishlistController');

router.get('/', authenticateToken, getAllWishlists);
router.get('/:id', authenticateToken, getWishlist);
router.post('/', authenticateToken, createWishlist);
router.post('/:id/items', authenticateToken, addItem);
router.put('/:id/items/:itemId', authenticateToken, updateItem);
router.delete('/:id/items/:itemId', authenticateToken, deleteItem);
router.post('/:id/invite', authenticateToken, inviteUser);
router.get('/users/search', authenticateToken, searchUsers);
router.delete('/:id', authenticateToken, deleteWishlist);

module.exports = router;
