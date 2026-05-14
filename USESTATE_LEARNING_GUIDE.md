# React useState Hook - Learning Guide with Project Examples

This guide demonstrates how `useState` is used in our NADRA-APP project with React 19.2.0. All examples are taken from actual components in this codebase.

## Table of Contents
1. [Basic useState Usage](#basic-usestate-usage)
2. [useState with Different Data Types](#usestate-with-different-data-types)
3. [Functional Updates](#functional-updates)
4. [Multiple State Variables](#multiple-state-variables)
5. [Complex State Objects](#complex-state-objects)
6. [Best Practices](#best-practices)
7. [React 19 Updates](#react-19-updates)

---

## Basic useState Usage

### What is useState?
`useState` is a React Hook that lets you add state to functional components. It returns an array with two elements:
1. The current state value
2. A function to update that state

### Syntax
```javascript
const [stateVariable, setStateVariable] = useState(initialValue);
```

### Example 1: Simple Boolean State (from Chatbot.js)
```javascript
"use client";
import { useState } from "react";

export default function Chatbot() {
  // Boolean state for toggling chatbot visibility
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}>
          Open Chatbot
        </button>
      )}
      
      {isOpen && (
        <div>
          <button onClick={() => setIsOpen(false)}>
            Close Chatbot
          </button>
          {/* Chatbot content */}
        </div>
      )}
    </>
  );
}
```

**Key Points:**
- `isOpen` starts as `false`
- `setIsOpen(true)` changes it to `true`
- `setIsOpen(false)` changes it back to `false`

---

## useState with Different Data Types

### Example 2: String State (from Chatbot.js)
```javascript
export default function Chatbot() {
  // String state for input message
  const [inputMessage, setInputMessage] = useState("");
  
  // String state for language selection
  const [language, setLanguage] = useState("en");
  
  return (
    <div>
      <input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type your message..."
      />
      
      <button onClick={() => setLanguage(language === "en" ? "ur" : "en")}>
        Toggle Language
      </button>
    </div>
  );
}
```

**Key Points:**
- Empty string `""` is the initial value
- `e.target.value` gets the input's current value
- State updates trigger re-renders

### Example 3: Array State (from Chatbot.js)
```javascript
export default function Chatbot() {
  // Array state for storing chat messages
  const [messages, setMessages] = useState([]);
  
  const addMessage = (newMessage) => {
    // Add new message to the array
    setMessages([...messages, newMessage]);
    
    // Alternative: Using functional update (recommended)
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };
  
  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index}>{msg.text}</div>
      ))}
    </div>
  );
}
```

**Key Points:**
- Arrays should be treated as immutable
- Use spread operator `...` to create a new array
- Never use `messages.push()` directly

### Example 4: Number State (from UserDashboard)
```javascript
export default function UserDashboard() {
  // Number state for selected service ID
  const [serviceId, setServiceId] = useState("");
  
  // You can also initialize with a number
  const [count, setCount] = useState(0);
  const [ticketId, setTicketId] = useState(null);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      
      <select onChange={(e) => setServiceId(e.target.value)}>
        <option value="">Select Service</option>
        <option value="1">Service 1</option>
        <option value="2">Service 2</option>
      </select>
    </div>
  );
}
```

---

## Functional Updates

When the new state depends on the previous state, use the functional update form:

### Example 5: Functional Updates (from Chatbot.js)
```javascript
export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  
  const handleSendMessage = async () => {
    const userMessage = inputMessage.trim();
    
    // ✅ GOOD: Functional update - always uses latest state
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    
    // Later in the function, add bot response
    setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    
    // ❌ BAD: Direct update - might use stale state
    // setMessages([...messages, { sender: "user", text: userMessage }]);
  };
  
  return (
    <button onClick={handleSendMessage}>Send</button>
  );
}
```

**Why Functional Updates?**
- Ensures you're working with the latest state
- Critical when multiple updates happen in quick succession
- Prevents race conditions

### Example 6: Toggle Pattern
```javascript
// ✅ GOOD: Functional update for toggle
setIsOpen((prev) => !prev);

// ❌ LESS IDEAL: Direct update
setIsOpen(!isOpen);
```

---

## Multiple State Variables

### Example 7: Multiple useState Hooks (from LoginPage.js)
```javascript
export default function LoginPage() {
  // Multiple independent state variables
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Login logic
      const result = await signIn("user-login", {
        email,
        password,
        redirect: false,
      });
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
```

**Key Points:**
- Each piece of state has its own `useState`
- Easy to read and understand
- Each state can be updated independently

---

## Complex State Objects

### Example 8: Object State (from PaymentModal.js)
```javascript
export default function PaymentModal({ ticket, onClose }) {
  // Object state for card details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cvv: '',
    expiryDate: ''
  });
  
  // Update specific property in object
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    
    // ✅ GOOD: Spread existing properties, update one
    setCardDetails({ ...cardDetails, cardNumber: value });
    
    // Alternative: Functional update for safety
    setCardDetails((prev) => ({ ...prev, cardNumber: value }));
  };
  
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardDetails((prev) => ({ ...prev, cvv: value }));
  };
  
  return (
    <form>
      <input
        type="text"
        placeholder="Card Number"
        onChange={handleCardNumberChange}
      />
      <input
        type="text"
        placeholder="CVV"
        onChange={handleCvvChange}
      />
    </form>
  );
}
```

**Key Points:**
- Use spread operator to preserve other properties
- Only update the property that changed
- Never mutate state directly

---

## Best Practices

### 1. Initialize State Appropriately
```javascript
// ✅ GOOD: Meaningful initial values
const [isLoading, setIsLoading] = useState(false);
const [items, setItems] = useState([]);
const [user, setUser] = useState(null);
const [count, setCount] = useState(0);

// ❌ BAD: Using undefined
const [data, setData] = useState();
```

### 2. Name State Variables Descriptively
```javascript
// ✅ GOOD: Clear, descriptive names
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState([]);
const [userEmail, setUserEmail] = useState("");

// ❌ BAD: Generic or unclear names
const [flag, setFlag] = useState(false);
const [arr, setArr] = useState([]);
const [x, setX] = useState("");
```

### 3. Group Related State
```javascript
// Option 1: Multiple useState for simple, independent values
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [role, setRole] = useState("USER");

// Option 2: Single useState for related values (like form data)
const [formData, setFormData] = useState({
  email: "",
  password: "",
  role: "USER"
});
```

### 4. Use Functional Updates When State Depends on Previous State
```javascript
// ✅ GOOD: Functional update
setCount((prev) => prev + 1);
setItems((prev) => [...prev, newItem]);

// ❌ RISKY: Direct update (might use stale state)
setCount(count + 1);
setItems([...items, newItem]);
```

### 5. Don't Store Derived Values in State
```javascript
// ❌ BAD: Storing derived value
const [tickets, setTickets] = useState([]);
const [ticketCount, setTicketCount] = useState(0);

// ✅ GOOD: Calculate on the fly
const [tickets, setTickets] = useState([]);
const ticketCount = tickets.length; // Just calculate it!
```

### 6. Error Handling State Pattern (from PaymentModal.js)
```javascript
export default function PaymentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true);
    
    try {
      await processPayment();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Always executed
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>
    </form>
  );
}
```

---

## React 19 Updates

### What's New in React 19?

React 19 introduced several improvements, but the `useState` API remains the same. However, there are some performance and behavior enhancements:

#### 1. Automatic Batching (Enhanced in React 19)
```javascript
// In React 19, these updates are automatically batched
// even outside of event handlers
const handleClick = async () => {
  setLoading(true);
  const data = await fetchData();
  setData(data);
  setLoading(false);
  // All three updates batched into single re-render
};
```

#### 2. Improved TypeScript Support
```javascript
// React 19 has better type inference
const [count, setCount] = useState(0); // TypeScript knows count is number
const [user, setUser] = useState<User | null>(null); // Explicit typing
const [items, setItems] = useState<string[]>([]); // Array of strings
```

#### 3. Use with Server Components (Next.js 15+)
```javascript
// ✅ Client Component (can use useState)
"use client";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ❌ Server Component (cannot use useState)
export default async function ServerComponent() {
  // const [state, setState] = useState(0); // ERROR!
  const data = await fetchData(); // Can fetch data directly
  return <div>{data}</div>;
}
```

**Important**: In Next.js 15+ (used in this project with React 19), components are Server Components by default. To use `useState`, you must add `"use client"` directive at the top of the file.

---

## Common Patterns in Our Project

### Pattern 1: Loading State
```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/data');
    const result = await response.json();
    setData(result);
  } finally {
    setLoading(false);
  }
};
```

### Pattern 2: Modal State
```javascript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

const openModal = (item) => {
  setSelectedItem(item);
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  setSelectedItem(null);
};
```

### Pattern 3: Form State
```javascript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: ''
});

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value
  }));
};

// Usage
<input
  name="email"
  value={formData.email}
  onChange={handleInputChange}
/>
```

### Pattern 4: List Management
```javascript
const [items, setItems] = useState([]);

// Add item
const addItem = (newItem) => {
  setItems((prev) => [...prev, newItem]);
};

// Remove item
const removeItem = (id) => {
  setItems((prev) => prev.filter(item => item.id !== id));
};

// Update item
const updateItem = (id, updates) => {
  setItems((prev) => 
    prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
  );
};
```

---

## Quick Reference

| Data Type | Initial Value | Update Example |
|-----------|--------------|----------------|
| Boolean | `useState(false)` | `setFlag(true)` |
| String | `useState("")` | `setText("hello")` |
| Number | `useState(0)` | `setCount(5)` |
| Array | `useState([])` | `setItems([...items, newItem])` |
| Object | `useState({})` | `setData({...data, key: value})` |
| Null | `useState(null)` | `setUser(userData)` |

### Common State Update Patterns

```javascript
// Boolean toggle
setFlag((prev) => !prev);

// Increment number
setCount((prev) => prev + 1);

// Update string
setText(e.target.value);

// Add to array
setItems((prev) => [...prev, newItem]);

// Update object property
setData((prev) => ({ ...prev, key: value }));

// Filter array
setItems((prev) => prev.filter(item => item.id !== deleteId));

// Map array (update item)
setItems((prev) => prev.map(item => 
  item.id === updateId ? { ...item, ...updates } : item
));
```

---

## Summary

1. **Always use `"use client"` directive** when using `useState` in Next.js 15+ with React 19
2. **Use functional updates** when new state depends on previous state
3. **Never mutate state directly** - always create new objects/arrays
4. **Name state variables clearly** - describe what they represent
5. **Initialize state with appropriate values** - empty string, empty array, null, etc.
6. **Group related state** when it makes sense
7. **Don't store derived values** - calculate them on the fly
8. **Use proper error handling patterns** with loading and error states

---

## Additional Resources

- [React Official Docs - useState](https://react.dev/reference/react/useState)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Next.js 15 Documentation](https://nextjs.org/docs)

---

*This guide is based on actual code from the NADRA-APP project using React 19.2.0 and Next.js 16.0.1*
