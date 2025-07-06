import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit, Trash2, Users, Search, X, Check } from 'lucide-react';


const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [wishlists, setWishlists] = useState([]);
  const [currentWishlist, setCurrentWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('login');

  // Auth state
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Wishlist creation state
  const [newWishlist, setNewWishlist] = useState({
    title: '',
    description: ''
  });

  // Item management state
  const [newItem, setNewItem] = useState({
    name: '',
    imageUrl: '',
    price: '',
    notes: ''
  });
  const [editingItem, setEditingItem] = useState(null);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
      fetchWishlists();
    }
  }, []);

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  };

  // Auth functions
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(authForm)
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setCurrentView('dashboard');
      fetchWishlists();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password
        })
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setCurrentView('dashboard');
      fetchWishlists();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setWishlists([]);
    setCurrentWishlist(null);
    setCurrentView('login');
  };

  // Wishlist functions
  const fetchWishlists = async () => {
    try {
      const data = await apiCall('/wishlists');
      setWishlists(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const createWishlist = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiCall('/wishlists', {
        method: 'POST',
        body: JSON.stringify(newWishlist)
      });

      setWishlists([data, ...wishlists]);
      setNewWishlist({ title: '', description: '' });
      setCurrentView('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistDetails = async (wishlistId) => {
    try {
      const data = await apiCall(`/wishlists/${wishlistId}`);
      setCurrentWishlist(data);
      setCurrentView('wishlist');
    } catch (err) {
      setError(err.message);
    }
  };

  // Item functions
  const addItem = async (e) => {
    e.preventDefault();
    if (!currentWishlist) return;

    setLoading(true);
    try {
      const data = await apiCall(`/wishlists/${currentWishlist._id}/items`, {
        method: 'POST',
        body: JSON.stringify({
          ...newItem,
          price: newItem.price ? parseFloat(newItem.price) : 0
        })
      });

      setCurrentWishlist(data);
      setNewItem({ name: '', imageUrl: '', price: '', notes: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (e) => {
    e.preventDefault();
    if (!currentWishlist || !editingItem) return;

    setLoading(true);
    try {
      const data = await apiCall(`/wishlists/${currentWishlist._id}/items/${editingItem._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editingItem,
          price: editingItem.price ? parseFloat(editingItem.price) : 0
        })
      });

      setCurrentWishlist(data);
      setEditingItem(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (!currentWishlist || !window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const data = await apiCall(`/wishlists/${currentWishlist._id}/items/${itemId}`, {
        method: 'DELETE'
      });

      setCurrentWishlist(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Invite function
  const inviteUser = async (e) => {
    e.preventDefault();
    if (!currentWishlist) return;

    setLoading(true);
    try {
      const data = await apiCall(`/wishlists/${currentWishlist._id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail })
      });

      setCurrentWishlist(data.wishlist);
      setInviteEmail('');
      setSearchResults([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await apiCall(`/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Render functions
  const renderAuth = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <ShoppingCart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Shared Wishlist</h1>
          <p className="text-gray-600 mt-2">Create and share wishlists with friends</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex mb-6">
          <button
            onClick={() => setCurrentView('login')}
            className={`flex-1 py-2 px-4 rounded-l-lg font-semibold ${
              currentView === 'login'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setCurrentView('signup')}
            className={`flex-1 py-2 px-4 rounded-r-lg font-semibold ${
              currentView === 'signup'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={currentView === 'login' ? handleLogin : handleSignup}>
          {currentView === 'signup' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Please wait...' : currentView === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">My Wishlists</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.username}!</span>
              <button
                onClick={() => setCurrentView('create-wishlist')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Wishlist
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {wishlists.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No wishlists yet</h2>
            <p className="text-gray-500 mb-6">Create your first wishlist to get started!</p>
            <button
              onClick={() => setCurrentView('create-wishlist')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Wishlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <div
                key={wishlist._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => fetchWishlistDetails(wishlist._id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 truncate">
                      {wishlist.title}
                    </h3>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">{wishlist.collaborators.length}</span>
                    </div>
                  </div>
                  
                  {wishlist.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{wishlist.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {wishlist.items.length} items
                    </div>
                    <div className="text-sm text-gray-500">
                      Created by {wishlist.creator.username}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <span className="text-xs text-gray-400">
                      Updated {new Date(wishlist.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  const renderCreateWishlist = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-600 hover:text-gray-800 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Create New Wishlist</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={createWishlist}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Wishlist Title *
              </label>
              <input
                type="text"
                value={newWishlist.title}
                onChange={(e) => setNewWishlist({ ...newWishlist, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Birthday Gift Ideas"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                value={newWishlist.description}
                onChange={(e) => setNewWishlist({ ...newWishlist, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Optional description..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Wishlist'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );

  const renderWishlist = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-600 hover:text-gray-800 mr-4"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {currentWishlist?.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Created by {currentWishlist?.creator.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{currentWishlist?.collaborators.length} collaborators</span>
              </div>
              <button
                onClick={() => setCurrentView('invite-users')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Invite
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Collaborators */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Collaborators</h2>
          <div className="flex flex-wrap gap-2">
            {currentWishlist?.collaborators.map((collab) => (
              <div key={collab._id} className="bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{collab.username}</span>
                <span className="text-xs text-gray-500 ml-1">({collab.email})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Item Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
          <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Wireless Headphones"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={newItem.imageUrl}
                onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Notes
              </label>
              <input
                type="text"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Any additional notes..."
              />
            </div>
            
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Items ({currentWishlist?.items.length || 0})
          </h2>
          
          {currentWishlist?.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No items yet. Add your first item above!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentWishlist?.items.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <div className="flex space-x-2">
                      {item.addedBy._id === user?.id && (
                        <>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {item.price > 0 && (
                    <p className="text-green-600 font-semibold mb-2">
                      ${item.price.toFixed(2)}
                    </p>
                  )}
                  
                  {item.notes && (
                    <p className="text-gray-600 text-sm mb-2">{item.notes}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Added by {item.addedBy.username}</span>
                    <span>{new Date(item.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Item</h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={updateItem}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={editingItem.imageUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderInviteUsers = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentView('wishlist')}
                className="text-gray-600 hover:text-gray-800 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Invite Users</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Invite by Email</h2>
          <form onSubmit={inviteUser}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="user@example.com"
                required
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Or select from existing users:
                </label>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setInviteEmail(user.email)}
                    >
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInviteEmail(user.email);
                        }}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentView('wishlist')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );

  // Main render
  if (!user) {
    return renderAuth();
  }

  switch (currentView) {
    case 'dashboard':
      return renderDashboard();
    case 'create-wishlist':
      return renderCreateWishlist();
    case 'wishlist':
      return renderWishlist();
    case 'invite-users':
      return renderInviteUsers();
    default:
      return renderDashboard();
  }
};

export default App;