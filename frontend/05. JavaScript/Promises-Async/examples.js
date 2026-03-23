// ==========================================
// JavaScript Promises and Async/Await - Examples
// ==========================================

// Example 1: Basic Promise
console.log('=== Example 1: Basic Promise ===');

const simplePromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        const success = true;
        
        if (success) {
            resolve('Promise resolved successfully');
        } else {
            reject('Promise rejected');
        }
    }, 1000);
});

simplePromise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log('Promise completed'));

// Example 2: Promise States
console.log('\n=== Example 2: Promise States ===');

// Pending
const pendingPromise = new Promise((resolve) => {
    setTimeout(() => resolve('Done'), 2000);
});
console.log('Promise state:', pendingPromise); // Promise { <pending> }

// Fulfilled
const fulfilledPromise = Promise.resolve('Fulfilled');
console.log('Fulfilled promise:', fulfilledPromise);

// Rejected
const rejectedPromise = Promise.reject('Rejected');
rejectedPromise.catch(error => console.log('Caught:', error));

// Example 3: Promise Chaining
console.log('\n=== Example 3: Promise Chaining ===');

function fetchUser(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id, name: 'John Doe' });
        }, 500);
    });
}

function fetchPosts(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, userId, title: 'Post 1' },
                { id: 2, userId, title: 'Post 2' }
            ]);
        }, 500);
    });
}

function fetchComments(postId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, postId, text: 'Comment 1' },
                { id: 2, postId, text: 'Comment 2' }
            ]);
        }, 500);
    });
}

fetchUser(1)
    .then(user => {
        console.log('User:', user);
        return fetchPosts(user.id);
    })
    .then(posts => {
        console.log('Posts:', posts);
        return fetchComments(posts[0].id);
    })
    .then(comments => {
        console.log('Comments:', comments);
    })
    .catch(error => console.error('Error:', error));

// Example 4: Promise.all()
console.log('\n=== Example 4: Promise.all() ===');

const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3])
    .then(results => {
        console.log('All results:', results);
    });

// With fetch simulation
function simulateFetch(url, delay) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ url, data: `Data from ${url}` });
        }, delay);
    });
}

Promise.all([
    simulateFetch('/api/users', 1000),
    simulateFetch('/api/posts', 800),
    simulateFetch('/api/comments', 600)
])
    .then(([users, posts, comments]) => {
        console.log('All data loaded:');
        console.log('  Users:', users);
        console.log('  Posts:', posts);
        console.log('  Comments:', comments);
    });

// Example 5: Promise.allSettled()
console.log('\n=== Example 5: Promise.allSettled() ===');

const mixedPromises = [
    Promise.resolve('Success 1'),
    Promise.reject('Error 1'),
    Promise.resolve('Success 2'),
    Promise.reject('Error 2')
];

Promise.allSettled(mixedPromises)
    .then(results => {
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Promise ${index}: Fulfilled -`, result.value);
            } else {
                console.log(`Promise ${index}: Rejected -`, result.reason);
            }
        });
    });

// Example 6: Promise.race()
console.log('\n=== Example 6: Promise.race() ===');

const fast = new Promise(resolve => setTimeout(() => resolve('Fast'), 100));
const slow = new Promise(resolve => setTimeout(() => resolve('Slow'), 500));

Promise.race([fast, slow])
    .then(result => console.log('Winner:', result));

// Timeout implementation
function timeout(promise, ms) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), ms);
    });
    
    return Promise.race([promise, timeoutPromise]);
}

const slowOperation = new Promise(resolve => 
    setTimeout(() => resolve('Done'), 2000)
);

timeout(slowOperation, 1000)
    .then(result => console.log(result))
    .catch(error => console.log('Timed out:', error.message));

// Example 7: Promise.any()
console.log('\n=== Example 7: Promise.any() ===');

const p1 = Promise.reject('Error 1');
const p2 = new Promise(resolve => setTimeout(() => resolve('Success 1'), 200));
const p3 = new Promise(resolve => setTimeout(() => resolve('Success 2'), 100));

Promise.any([p1, p2, p3])
    .then(result => console.log('First success:', result))
    .catch(error => console.error('All failed:', error));

// Example 8: Async/Await Basics
console.log('\n=== Example 8: Async/Await Basics ===');

async function getData() {
    return 'Data loaded';
}

getData().then(data => console.log(data));

async function fetchData() {
    const data = await simulateFetch('/api/data', 500);
    console.log('Fetched:', data);
    return data;
}

fetchData();

// Example 9: Error Handling with try/catch
console.log('\n=== Example 9: Error Handling ===');

async function fetchWithError() {
    try {
        const data = await new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Network error')), 500);
        });
        console.log(data);
    } catch (error) {
        console.error('Caught error:', error.message);
    } finally {
        console.log('Cleanup done');
    }
}

fetchWithError();

// Example 10: Sequential vs Parallel
console.log('\n=== Example 10: Sequential vs Parallel ===');

// Sequential
async function sequential() {
    console.time('Sequential');
    const user = await simulateFetch('/api/user', 300);
    const posts = await simulateFetch('/api/posts', 300);
    const comments = await simulateFetch('/api/comments', 300);
    console.timeEnd('Sequential');
    
    return { user, posts, comments };
}

// Parallel
async function parallel() {
    console.time('Parallel');
    const [user, posts, comments] = await Promise.all([
        simulateFetch('/api/user', 300),
        simulateFetch('/api/posts', 300),
        simulateFetch('/api/comments', 300)
    ]);
    console.timeEnd('Parallel');
    
    return { user, posts, comments };
}

setTimeout(async () => {
    await sequential();
    await parallel();
}, 2000);

// Example 11: Real-Time - API Client
console.log('\n=== Example 11: API Client ===');

class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
    
    async get(endpoint) {
        console.log(`GET ${this.baseURL}${endpoint}`);
        
        // Simulate network request
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ data: { message: 'Success' }, status: 200 });
            }, 300);
        });
    }
    
    async post(endpoint, data) {
        console.log(`POST ${this.baseURL}${endpoint}`, data);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ data: { id: 1, ...data }, status: 201 });
            }, 300);
        });
    }
}

const api = new APIClient('https://api.example.com');

async function testAPI() {
    try {
        const response1 = await api.get('/users');
        console.log('GET response:', response1);
        
        const response2 = await api.post('/users', { name: 'John' });
        console.log('POST response:', response2);
    } catch (error) {
        console.error('API error:', error);
    }
}

testAPI();

// Example 12: Real-Time - Retry Mechanism
console.log('\n=== Example 12: Retry Mechanism ===');

async function retry(fn, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Attempt ${attempt}...`);
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }
            
            console.log(`Failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function unreliableOperation() {
    const random = Math.random();
    if (random < 0.7) {
        throw new Error('Random failure');
    }
    return 'Success!';
}

retry(unreliableOperation, 5, 500)
    .then(result => console.log('Final result:', result))
    .catch(error => console.error('All attempts failed:', error.message));

// Example 13: Real-Time - Batch Processor
console.log('\n=== Example 13: Batch Processor ===');

class BatchProcessor {
    constructor(batchSize = 3) {
        this.batchSize = batchSize;
    }
    
    async processInBatches(items, processFn) {
        const results = [];
        
        for (let i = 0; i < items.length; i += this.batchSize) {
            const batch = items.slice(i, i + this.batchSize);
            console.log(`Processing batch ${Math.floor(i / this.batchSize) + 1}...`);
            
            const batchResults = await Promise.all(
                batch.map(item => processFn(item))
            );
            
            results.push(...batchResults);
        }
        
        return results;
    }
}

const processor = new BatchProcessor(3);
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

async function processNumber(num) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return num * 2;
}

processor.processInBatches(numbers, processNumber)
    .then(results => console.log('Processed results:', results));

// Example 14: Real-Time - Promise Cache
console.log('\n=== Example 14: Promise Cache ===');

class PromiseCache {
    constructor() {
        this.cache = new Map();
    }
    
    async get(key, fetchFn) {
        if (this.cache.has(key)) {
            console.log(`Cache hit: ${key}`);
            return this.cache.get(key);
        }
        
        console.log(`Cache miss: ${key}`);
        const promise = fetchFn();
        this.cache.set(key, promise);
        
        try {
            const result = await promise;
            return result;
        } catch (error) {
            this.cache.delete(key);
            throw error;
        }
    }
    
    clear() {
        this.cache.clear();
    }
}

const cache = new PromiseCache();

async function fetchUser(id) {
    console.log(`Fetching user ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id, name: `User ${id}` };
}

async function testCache() {
    const user1 = await cache.get('user:1', () => fetchUser(1));
    console.log('First call:', user1);
    
    const user2 = await cache.get('user:1', () => fetchUser(1));
    console.log('Second call (cached):', user2);
}

testCache();

// Example 15: Delay/Sleep Function
console.log('\n=== Example 15: Delay Function ===');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function countDown() {
    for (let i = 3; i > 0; i--) {
        console.log(i);
        await delay(1000);
    }
    console.log('Go!');
}

setTimeout(() => countDown(), 3000);

// Example 16: Polling
console.log('\n=== Example 16: Polling ===');

async function poll(checkFn, interval = 1000, maxAttempts = 5) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Polling attempt ${attempt}...`);
        
        const result = await checkFn();
        
        if (result) {
            return result;
        }
        
        if (attempt < maxAttempts) {
            await delay(interval);
        }
    }
    
    throw new Error('Polling timeout');
}

let pollCount = 0;
async function checkStatus() {
    pollCount++;
    if (pollCount >= 3) {
        return { ready: true };
    }
    return null;
}

setTimeout(() => {
    poll(checkStatus, 500, 5)
        .then(result => console.log('Poll result:', result))
        .catch(error => console.error(error.message));
}, 5000);

// Example 17: Promisify Callback
console.log('\n=== Example 17: Promisify ===');

function callbackFunction(value, callback) {
    setTimeout(() => {
        if (value > 0) {
            callback(null, value * 2);
        } else {
            callback(new Error('Value must be positive'));
        }
    }, 500);
}

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

const promisifiedFn = promisify(callbackFunction);

promisifiedFn(5)
    .then(result => console.log('Promisified result:', result))
    .catch(error => console.error(error.message));

// Example 18: Async Iterator
console.log('\n=== Example 18: Async Iterator ===');

async function* asyncGenerator() {
    for (let i = 1; i <= 5; i++) {
        await delay(300);
        yield i;
    }
}

async function useAsyncIterator() {
    for await (const num of asyncGenerator()) {
        console.log('Generated:', num);
    }
}

setTimeout(() => useAsyncIterator(), 7000);

// Example 19: Race with Timeout
console.log('\n=== Example 19: Timeout Wrapper ===');

function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
    
    return Promise.race([promise, timeout]);
}

const slowTask = new Promise(resolve => 
    setTimeout(() => resolve('Task complete'), 3000)
);

withTimeout(slowTask, 1000)
    .then(result => console.log(result))
    .catch(error => console.log('Timeout error:', error.message));

// Example 20: Combining Multiple Patterns
console.log('\n=== Example 20: Combined Patterns ===');

class DataService {
    constructor() {
        this.cache = new Map();
    }
    
    async fetchWithCacheAndRetry(key, fetchFn, options = {}) {
        const {
            maxRetries = 3,
            retryDelay = 1000,
            timeout = 5000,
            useCache = true
        } = options;
        
        // Check cache
        if (useCache && this.cache.has(key)) {
            console.log('Returning cached data');
            return this.cache.get(key);
        }
        
        // Retry with timeout
        const fetchWithRetry = async () => {
            return retry(
                () => withTimeout(fetchFn(), timeout),
                maxRetries,
                retryDelay
            );
        };
        
        try {
            const data = await fetchWithRetry();
            
            if (useCache) {
                this.cache.set(key, data);
            }
            
            return data;
        } catch (error) {
            console.error('Failed after all retries:', error.message);
            throw error;
        }
    }
}

const dataService = new DataService();

async function testDataService() {
    try {
        const data = await dataService.fetchWithCacheAndRetry(
            'users',
            () => simulateFetch('/api/users', 500),
            { maxRetries: 3, timeout: 2000, useCache: true }
        );
        
        console.log('Data service result:', data);
    } catch (error) {
        console.error('Data service error:', error.message);
    }
}

setTimeout(() => testDataService(), 10000);
