# React useState - Practical Examples from NADRA-APP

This document provides practical, copy-paste-ready examples of `useState` usage patterns found in the NADRA-APP project. Each example is complete and can be used as a reference for learning.

## Table of Contents
1. [Counter Component](#counter-component)
2. [Form Input Handling](#form-input-handling)
3. [Todo List Application](#todo-list-application)
4. [Modal Management](#modal-management)
5. [API Data Fetching](#api-data-fetching)
6. [Multi-Step Form](#multi-step-form)
7. [Search and Filter](#search-and-filter)
8. [Tab Navigation](#tab-navigation)

---

## Counter Component

### Simple Counter (Basic useState)
```javascript
"use client";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Counter: {count}</h2>
      
      <div className="space-x-2">
        <button 
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Decrease
        </button>
        
        <button 
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Reset
        </button>
        
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Increase
        </button>
      </div>
    </div>
  );
}
```

### Counter with Functional Updates (Better Practice)
```javascript
"use client";
import { useState } from "react";

export default function CounterAdvanced() {
  const [count, setCount] = useState(0);
  
  // Using functional updates - safer for async operations
  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(0);
  
  // Increment by custom amount
  const incrementBy = (amount) => {
    setCount((prev) => prev + amount);
  };
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Counter: {count}</h2>
      
      <div className="space-x-2 mb-4">
        <button onClick={decrement} className="px-4 py-2 bg-red-500 text-white rounded">
          -1
        </button>
        <button onClick={reset} className="px-4 py-2 bg-gray-500 text-white rounded">
          Reset
        </button>
        <button onClick={increment} className="px-4 py-2 bg-green-500 text-white rounded">
          +1
        </button>
      </div>
      
      <div className="space-x-2">
        <button onClick={() => incrementBy(5)} className="px-4 py-2 bg-blue-500 text-white rounded">
          +5
        </button>
        <button onClick={() => incrementBy(10)} className="px-4 py-2 bg-blue-600 text-white rounded">
          +10
        </button>
      </div>
    </div>
  );
}
```

---

## Form Input Handling

### Single Input (Pattern from LoginPage.js)
```javascript
"use client";
import { useState } from "react";

export default function SimpleForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    setError("");
    console.log("Submitted:", { email, password });
    alert(`Email: ${email}\nPassword: ${password}`);
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Login Form</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter your email"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter your password"
        />
      </div>
      
      <button 
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Login
      </button>
    </form>
  );
}
```

### Object-Based Form (Pattern from PaymentModal.js)
```javascript
"use client";
import { useState } from "react";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: ""
  });
  
  const [errors, setErrors] = useState({});
  
  // Handle input changes - updates specific field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName) newErrors.fullName = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      console.log("Form data:", formData);
      alert("Form submitted successfully!");
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: ""
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Registration Form</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          rows="3"
        />
      </div>
      
      <button 
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Register
      </button>
    </form>
  );
}
```

---

## Todo List Application

### Complete Todo App (Pattern from Chatbot.js messages array)
```javascript
"use client";
import { useState } from "react";
import { Trash2, CheckCircle, Circle } from "lucide-react";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  
  // Add new todo
  const addTodo = () => {
    if (!inputValue.trim()) return;
    
    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      createdAt: new Date()
    };
    
    setTodos((prev) => [...prev, newTodo]);
    setInputValue("");
  };
  
  // Toggle todo completion
  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  // Delete todo
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };
  
  // Clear completed todos
  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };
  
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.length - completedCount;
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Todo List</h2>
      
      {/* Input Section */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>{activeCount} active</span>
        <span>{completedCount} completed</span>
        <button
          onClick={clearCompleted}
          className="text-red-600 hover:underline"
          disabled={completedCount === 0}
        >
          Clear completed
        </button>
      </div>
      
      {/* Todo List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No todos yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="flex-shrink-0"
              >
                {todo.completed ? (
                  <CheckCircle className="text-green-600" />
                ) : (
                  <Circle className="text-gray-400" />
                )}
              </button>
              
              <span
                className={`flex-1 ${
                  todo.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {todo.text}
              </span>
              
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-600 hover:bg-red-50 p-1 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Modal Management

### Modal with Selection (Pattern from PaymentModal.js)
```javascript
"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const items = [
    { id: 1, name: "ID Card", price: 500 },
    { id: 2, name: "Passport", price: 1000 },
    { id: 3, name: "Birth Certificate", price: 300 },
  ];
  
  const openModal = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };
  
  const closeModal = () => {
    setIsOpen(false);
    setSelectedItem(null);
  };
  
  const handleConfirm = () => {
    alert(`You selected: ${selectedItem.name}`);
    closeModal();
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Services</h2>
      
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded p-4">
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-gray-600">Rs. {item.price}</p>
            <button
              onClick={() => openModal(item)}
              className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Select
            </button>
          </div>
        ))}
      </div>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Confirm Selection</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">You selected:</p>
              <p className="text-2xl font-bold mt-2">{selectedItem?.name}</p>
              <p className="text-green-600 text-xl mt-1">
                Rs. {selectedItem?.price}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## API Data Fetching

### Loading, Data, and Error States (Pattern from UserDashboard.js)
```javascript
"use client";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-green-600" size={48} />
        <span className="ml-3 text-lg">Loading users...</span>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-800">Error</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Data state
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users List ({users.length})</h2>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">{user.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Multi-Step Form

### Step-by-Step Form (Pattern combining multiple state variables)
```javascript
"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    fullName: "",
    email: "",
    phone: "",
    // Step 2
    address: "",
    city: "",
    postalCode: "",
    // Step 3
    cardNumber: "",
    cvv: "",
    expiryDate: ""
  });
  
  const totalSteps = 3;
  
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  const handleSubmit = () => {
    console.log("Final form data:", formData);
    alert("Form submitted successfully!");
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Registration Form</h2>
      
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex-1 flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > step ? <Check size={20} /> : step}
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Step 1: Personal Info */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Personal Information</h3>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => updateFormData("fullName", e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => updateFormData("phone", e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}
      
      {/* Step 2: Address */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Address Information</h3>
          <input
            type="text"
            placeholder="Street Address"
            value={formData.address}
            onChange={(e) => updateFormData("address", e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => updateFormData("city", e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={(e) => updateFormData("postalCode", e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}
      
      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Payment Information</h3>
          <input
            type="text"
            placeholder="Card Number"
            value={formData.cardNumber}
            onChange={(e) => updateFormData("cardNumber", e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={(e) => updateFormData("expiryDate", e.target.value)}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="CVV"
              value={formData.cvv}
              onChange={(e) => updateFormData("cvv", e.target.value)}
              className="px-3 py-2 border rounded"
            />
          </div>
        </div>
      )}
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        
        {currentStep < totalSteps ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            Next
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            Submit
            <Check size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Search and Filter

### Search with Filter (Pattern combining useState for filtering)
```javascript
"use client";
import { useState } from "react";
import { Search, Filter } from "lucide-react";

export default function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  
  // Sample data
  const products = [
    { id: 1, name: "ID Card", category: "documents", price: 500 },
    { id: 2, name: "Passport", category: "documents", price: 1500 },
    { id: 3, name: "Birth Certificate", category: "certificates", price: 300 },
    { id: 4, name: "Marriage Certificate", category: "certificates", price: 400 },
    { id: 5, name: "Driving License", category: "licenses", price: 800 },
  ];
  
  // Filtering logic
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    
    // Price filter
    let matchesPrice = true;
    if (priceRange === "low") matchesPrice = product.price < 500;
    if (priceRange === "medium")
      matchesPrice = product.price >= 500 && product.price < 1000;
    if (priceRange === "high") matchesPrice = product.price >= 1000;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });
  
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange("all");
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Search Products</h2>
      
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="all">All Categories</option>
            <option value="documents">Documents</option>
            <option value="certificates">Certificates</option>
            <option value="licenses">Licenses</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Price Range</label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="all">All Prices</option>
            <option value="low">Under Rs. 500</option>
            <option value="medium">Rs. 500 - 1000</option>
            <option value="high">Over Rs. 1000</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Results */}
      <div className="mb-4 text-gray-600">
        Found {filteredProducts.length} product(s)
      </div>
      
      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No products found</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {product.category}
                  </p>
                </div>
                <p className="text-green-600 font-bold">Rs. {product.price}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Tab Navigation

### Tabbed Interface (Pattern from switching views)
```javascript
"use client";
import { useState } from "react";
import { User, Settings, Bell, Shield } from "lucide-react";

export default function TabbedInterface() {
  const [activeTab, setActiveTab] = useState("profile");
  
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>
      
      {/* Tab navigation */}
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Tab content */}
      <div className="p-6 border rounded-lg">
        {activeTab === "profile" && (
          <div>
            <h3 className="text-xl font-bold mb-4">Profile Information</h3>
            <div className="space-y-3">
              <p><strong>Name:</strong> John Doe</p>
              <p><strong>Email:</strong> john@example.com</p>
              <p><strong>Phone:</strong> +92 300 1234567</p>
              <p><strong>Address:</strong> Islamabad, Pakistan</p>
            </div>
          </div>
        )}
        
        {activeTab === "settings" && (
          <div>
            <h3 className="text-xl font-bold mb-4">Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Enable email notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Enable SMS notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Two-factor authentication</span>
              </label>
            </div>
          </div>
        )}
        
        {activeTab === "notifications" && (
          <div>
            <h3 className="text-xl font-bold mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                Your ticket #123 has been approved
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                Payment received successfully
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                Document verification pending
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "security" && (
          <div>
            <h3 className="text-xl font-bold mb-4">Security Settings</h3>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Change Password
              </button>
              <button className="w-full px-4 py-2 border rounded hover:bg-gray-50">
                Manage Sessions
              </button>
              <button className="w-full px-4 py-2 border rounded hover:bg-gray-50">
                View Login History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Summary

These practical examples demonstrate:
- ✅ Basic state management with strings, numbers, booleans, arrays, and objects
- ✅ Form handling with validation
- ✅ CRUD operations on arrays
- ✅ Modal state management
- ✅ Loading and error states for API calls
- ✅ Multi-step forms with navigation
- ✅ Search and filter functionality
- ✅ Tab navigation patterns

All patterns are based on real code from the NADRA-APP project using React 19.2.0!

---

*Remember: Always use `"use client"` at the top of your component files when using useState in Next.js 15+*
