# Promises and Async/Await in JavaScript

## Overview
Promises and async/await provide ways to handle asynchronous operations in JavaScript, making it easier to work with operations that take time to complete.

## Purpose
- Handle asynchronous operations
- Avoid callback hell
- Write cleaner async code
- Handle errors in async operations
- Coordinate multiple async tasks

## Callbacks (Traditional Approach)

```javascript
function fetchData(callback) {
    setTimeout(() => {
        callback('Data loaded');
    }, 1000);
}

fetchData((data) => {
    console.log(data);
});
```

**Callback Hell:**
```javascript
getData(function(a) {
    getMoreData(a, function(b) {
        getMoreData(b, function(c) {
            getMoreData(c, function(d) {
                console.log(d);
            });
        });
    });
});
```

## Promises

A Promise represents a value that may not be available yet but will be resolved at some point in the future.

### Creating a Promise
```javascript
const promise = new Promise((resolve, reject) => {
    // Asynchronous operation
    setTimeout(() => {
        const success = true;
        
        if (success) {
            resolve('Operation successful');
        } else {
            reject('Operation failed');
        }
    }, 1000);
});
```

### Promise States
1. **Pending**: Initial state
2. **Fulfilled**: Operation completed successfully
3. **Rejected**: Operation failed

### Using Promises

#### then()
Handles successful resolution:
```javascript
promise.then((result) => {
    console.log(result);
});
```

#### catch()
Handles rejection:
```javascript
promise.catch((error) => {
    console.error(error);
});
```

#### finally()
Executes regardless of outcome:
```javascript
promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log('Done'));
```

### Chaining Promises

```javascript
fetchUser()
    .then(user => fetchPosts(user.id))
    .then(posts => fetchComments(posts[0].id))
    .then(comments => console.log(comments))
    .catch(error => console.error(error));
```

### Promise.all()

Wait for all promises to resolve:
```javascript
const promise1 = fetch('/api/users');
const promise2 = fetch('/api/posts');
const promise3 = fetch('/api/comments');

Promise.all([promise1, promise2, promise3])
    .then(([users, posts, comments]) => {
        console.log('All data loaded');
    })
    .catch(error => {
        console.error('One or more requests failed');
    });
```

### Promise.allSettled()

Wait for all promises to settle (resolve or reject):
```javascript
Promise.allSettled([promise1, promise2, promise3])
    .then(results => {
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                console.log('Success:', result.value);
            } else {
                console.log('Failed:', result.reason);
            }
        });
    });
```

### Promise.race()

Resolves/rejects with the first promise that settles:
```javascript
Promise.race([promise1, promise2, promise3])
    .then(result => console.log('First finished:', result))
    .catch(error => console.error('First failed:', error));
```

### Promise.any()

Resolves with the first fulfilled promise:
```javascript
Promise.any([promise1, promise2, promise3])
    .then(result => console.log('First success:', result))
    .catch(errors => console.error('All failed:', errors));
```

## Async/Await

Syntactic sugar over promises that makes async code look synchronous.

### async Function

```javascript
async function fetchData() {
    return 'Data loaded';
}

// Equivalent to:
function fetchData() {
    return Promise.resolve('Data loaded');
}
```

### await Keyword

```javascript
async function getData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### Error Handling

#### try/catch
```javascript
async function fetchUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw error;
    }
}
```

#### catch on promise
```javascript
async function loadData() {
    const data = await fetchData().catch(error => {
        console.error('Error:', error);
        return null;
    });
    
    return data;
}
```

### Sequential vs Parallel Execution

#### Sequential (await in sequence)
```javascript
async function sequential() {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    
    return { user, posts, comments };
}
// Total time: time1 + time2 + time3
```

#### Parallel (Promise.all)
```javascript
async function parallel() {
    const [users, posts, comments] = await Promise.all([
        fetchUsers(),
        fetchPosts(),
        fetchComments()
    ]);
    
    return { users, posts, comments };
}
// Total time: max(time1, time2, time3)
```

## Real-Time Examples

### Example 1: API Client
```javascript
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.headers = {
            'Content-Type': 'application/json'
        };
    }
    
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    }
    
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            throw error;
        }
    }
    
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            console.error(`PUT ${endpoint} failed:`, error);
            throw error;
        }
    }
    
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.headers
            });
            
            return await response.json();
        } catch (error) {
            console.error(`DELETE ${endpoint} failed:`, error);
            throw error;
        }
    }
}

// Usage
const api = new APIClient('https://api.example.com');

async function loadUserData(userId) {
    try {
        const user = await api.get(`/users/${userId}`);
        const posts = await api.get(`/users/${userId}/posts`);
        
        return { user, posts };
    } catch (error) {
        console.error('Failed to load user data:', error);
        return null;
    }
}
```

### Example 2: Retry Mechanism
```javascript
async function retry(fn, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }
            
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Usage
async function fetchWithRetry() {
    return await retry(
        () => fetch('https://api.example.com/data'),
        3,
        2000
    );
}
```

### Example 3: Timeout Wrapper
```javascript
function timeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Operation timed out')), ms);
        })
    ]);
}

// Usage
async function fetchWithTimeout() {
    try {
        const response = await timeout(
            fetch('https://api.example.com/data'),
            5000
        );
        return await response.json();
    } catch (error) {
        if (error.message === 'Operation timed out') {
            console.error('Request took too long');
        }
        throw error;
    }
}
```

### Example 4: Batch Processing
```javascript
class BatchProcessor {
    constructor(batchSize = 3) {
        this.batchSize = batchSize;
    }
    
    async processInBatches(items, processFn) {
        const results = [];
        
        for (let i = 0; i < items.length; i += this.batchSize) {
            const batch = items.slice(i, i + this.batchSize);
            const batchResults = await Promise.all(
                batch.map(item => processFn(item))
            );
            results.push(...batchResults);
        }
        
        return results;
    }
    
    async processSequentially(items, processFn) {
        const results = [];
        
        for (const item of items) {
            const result = await processFn(item);
            results.push(result);
        }
        
        return results;
    }
}

// Usage
const processor = new BatchProcessor(5);

async function processUsers(userIds) {
    return await processor.processInBatches(userIds, async (id) => {
        const response = await fetch(`/api/users/${id}`);
        return await response.json();
    });
}
```

### Example 5: Cache with Promises
```javascript
class PromiseCache {
    constructor() {
        this.cache = new Map();
    }
    
    async get(key, fetchFn) {
        // Return cached value if exists
        if (this.cache.has(key)) {
            const cached = this.cache.get(key);
            
            // Check if promise is still pending
            if (cached instanceof Promise) {
                return cached;
            }
            
            return cached;
        }
        
        // Create new promise and cache it
        const promise = fetchFn()
            .then(result => {
                this.cache.set(key, result);
                return result;
            })
            .catch(error => {
                this.cache.delete(key);
                throw error;
            });
        
        this.cache.set(key, promise);
        return promise;
    }
    
    clear() {
        this.cache.clear();
    }
    
    delete(key) {
        this.cache.delete(key);
    }
}

// Usage
const cache = new PromiseCache();

async function getUser(id) {
    return cache.get(`user:${id}`, async () => {
        const response = await fetch(`/api/users/${id}`);
        return response.json();
    });
}
```

## Common Patterns

### Promisify Callback Functions
```javascript
function promisify(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    };
}

// Usage
const readFile = promisify(fs.readFile);
const data = await readFile('file.txt', 'utf8');
```

### Delay/Sleep Function
```javascript
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Usage
async function example() {
    console.log('Start');
    await delay(2000);
    console.log('After 2 seconds');
}
```

### Polling
```javascript
async function poll(fn, interval = 1000, maxAttempts = 10) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result = await fn();
        
        if (result) {
            return result;
        }
        
        if (attempt < maxAttempts) {
            await delay(interval);
        }
    }
    
    throw new Error('Polling timeout');
}
```

## Best Practices

1. Always handle promise rejections with `.catch()` or `try/catch`
2. Use async/await for cleaner, more readable code
3. Avoid mixing promises and async/await unnecessarily
4. Use Promise.all() for parallel operations
5. Don't forget to `await` inside async functions
6. Use Promise.allSettled() when you need all results regardless of failures
7. Implement timeout mechanisms for network requests
8. Consider retry logic for unreliable operations
9. Cache promises to avoid duplicate requests
10. Return promises from functions, don't just resolve them

## Common Mistakes

### Forgetting to return
```javascript
// Wrong
async function getData() {
    fetch('/api/data'); // Missing return
}

// Correct
async function getData() {
    return fetch('/api/data');
}
```

### Not awaiting async calls
```javascript
// Wrong
async function example() {
    const data = api.getData(); // Missing await
    console.log(data); // Logs Promise, not data
}

// Correct
async function example() {
    const data = await api.getData();
    console.log(data);
}
```

### Sequential instead of parallel
```javascript
// Slow
async function loadData() {
    const users = await fetchUsers();
    const posts = await fetchPosts();
    return { users, posts };
}

// Fast
async function loadData() {
    const [users, posts] = await Promise.all([
        fetchUsers(),
        fetchPosts()
    ]);
    return { users, posts };
}
```
