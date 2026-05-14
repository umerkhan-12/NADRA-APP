# React useState Quick Reference Card

A handy cheat sheet for the `useState` hook in React 19.2.0 (as used in NADRA-APP).

## 🎯 Basic Syntax

```javascript
import { useState } from "react";

const [state, setState] = useState(initialValue);
```

## 📝 Common Patterns

### 1. Boolean State
```javascript
const [isOpen, setIsOpen] = useState(false);

// Toggle
setIsOpen(!isOpen);
// Better: Functional update
setIsOpen(prev => !prev);
```

### 2. String State
```javascript
const [text, setText] = useState("");

// Update from input
onChange={(e) => setText(e.target.value)}
```

### 3. Number State
```javascript
const [count, setCount] = useState(0);

// Increment
setCount(count + 1);
// Better: Functional update
setCount(prev => prev + 1);
```

### 4. Array State
```javascript
const [items, setItems] = useState([]);

// Add item
setItems([...items, newItem]);
// Better: Functional update
setItems(prev => [...prev, newItem]);

// Remove item
setItems(items.filter(item => item.id !== deleteId));
// Better: Functional update
setItems(prev => prev.filter(item => item.id !== deleteId));

// Update item
setItems(items.map(item => 
  item.id === updateId ? { ...item, ...updates } : item
));
// Better: Functional update
setItems(prev => prev.map(item => 
  item.id === updateId ? { ...item, ...updates } : item
));
```

### 5. Object State
```javascript
const [user, setUser] = useState({
  name: "",
  email: "",
  age: 0
});

// Update single property
setUser({ ...user, name: "John" });
// Better: Functional update
setUser(prev => ({ ...prev, name: "John" }));

// Update multiple properties
setUser({ ...user, name: "John", age: 25 });
// Better: Functional update
setUser(prev => ({ ...prev, name: "John", age: 25 }));
```

## 🎨 Real Examples from NADRA-APP

### Loading State Pattern
```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState("");

const fetchData = async () => {
  setLoading(true);
  setError("");
  try {
    const response = await fetch("/api/data");
    const result = await response.json();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Form State Pattern
```javascript
const [formData, setFormData] = useState({
  email: "",
  password: "",
  remember: false
});

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value
  }));
};
```

### Modal State Pattern
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

### Chat Messages Pattern
```javascript
const [messages, setMessages] = useState([]);

const addMessage = (text, sender) => {
  setMessages(prev => [...prev, {
    id: Date.now(),
    text,
    sender,
    timestamp: new Date()
  }]);
};
```

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T: Mutate state directly
```javascript
// Bad
items.push(newItem);
setItems(items);

// Bad
user.name = "John";
setUser(user);
```

### ✅ DO: Create new references
```javascript
// Good
setItems([...items, newItem]);

// Good
setUser({ ...user, name: "John" });
```

### ❌ DON'T: Use state directly in updates when it might be stale
```javascript
// Bad (in async operations or rapid updates)
setCount(count + 1);
setCount(count + 1); // Won't increment twice!
```

### ✅ DO: Use functional updates
```javascript
// Good
setCount(prev => prev + 1);
setCount(prev => prev + 1); // Will increment twice!
```

### ❌ DON'T: Store derived values
```javascript
// Bad
const [items, setItems] = useState([]);
const [itemCount, setItemCount] = useState(0);
```

### ✅ DO: Calculate derived values
```javascript
// Good
const [items, setItems] = useState([]);
const itemCount = items.length;
```

## 🚀 React 19 Specific Features

### 1. Better TypeScript Inference
```javascript
// Type automatically inferred
const [count, setCount] = useState(0); // number
const [text, setText] = useState(""); // string
const [items, setItems] = useState<User[]>([]); // User[]
```

### 2. Automatic Batching
```javascript
// All updates batched into single re-render
const handleClick = async () => {
  setLoading(true);
  const data = await fetchData();
  setData(data);
  setLoading(false);
  // Only one re-render!
};
```

### 3. Server vs Client Components
```javascript
// ✅ Client Component - can use useState
"use client";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ❌ Server Component - cannot use useState
export default async function ServerComponent() {
  // const [state, setState] = useState(0); // ERROR!
  const data = await fetchData();
  return <div>{data}</div>;
}
```

## 📊 Quick Comparison Table

| Pattern | Old Way | New Way (Functional Update) |
|---------|---------|------------------------------|
| Toggle | `setFlag(!flag)` | `setFlag(prev => !prev)` |
| Increment | `setCount(count + 1)` | `setCount(prev => prev + 1)` |
| Add to Array | `setItems([...items, x])` | `setItems(prev => [...prev, x])` |
| Update Object | `setUser({...user, x})` | `setUser(prev => ({...prev, x}))` |
| Filter Array | `setItems(items.filter(...))` | `setItems(prev => prev.filter(...))` |

## 🎯 When to Use Functional Updates?

**Always use when:**
- ✅ New state depends on previous state
- ✅ Inside async functions
- ✅ Multiple rapid updates
- ✅ Inside loops or callbacks
- ✅ Event handlers that might fire rapidly

**Optional when:**
- Setting to a fixed value: `setCount(5)`
- Resetting state: `setItems([])`
- Setting from external source: `setData(apiResponse)`

## 💡 Pro Tips

1. **Name state descriptively**: `isLoading` not `loading`, `userEmail` not `email`
2. **Initialize properly**: Use appropriate initial values (`[]`, `{}`, `null`, `false`, `0`, `""`)
3. **Group related state**: Either multiple `useState` or single object state
4. **Don't overuse**: Not everything needs to be in state
5. **Consider derived values**: Calculate instead of storing
6. **Use useEffect wisely**: For side effects, not state updates

## 📚 Learn More

- **[Complete Learning Guide](./USESTATE_LEARNING_GUIDE.md)** - Detailed explanations with theory
- **[Practical Examples](./USESTATE_PRACTICAL_EXAMPLES.md)** - Copy-paste ready code examples
- **[React Docs](https://react.dev/reference/react/useState)** - Official documentation

## 🔗 Files in This Project Using useState

Check these files to see useState in action:
- `components/Chatbot.js` - Multiple state variables, arrays
- `components/PaymentModal.js` - Object state, form handling
- `app/USER/dashboard/page.js` - Complex state management
- `app/login/page.js` - Form state with validation
- `hooks/useAuth.js` - Custom hook with useState

---

*Quick reference card for React 19.2.0 `useState` hook as used in NADRA-APP*

**Remember**: Always add `"use client"` directive when using `useState` in Next.js 15+ !
