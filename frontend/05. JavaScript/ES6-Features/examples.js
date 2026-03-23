// ==========================================
// JavaScript ES6+ Features - Examples
// ==========================================

// Example 1: let and const
console.log('=== Example 1: let and const ===');

// var vs let
function varTest() {
    var x = 1;
    if (true) {
        var x = 2; // Same variable
        console.log('Inside block (var):', x); // 2
    }
    console.log('Outside block (var):', x); // 2
}

function letTest() {
    let x = 1;
    if (true) {
        let x = 2; // Different variable
        console.log('Inside block (let):', x); // 2
    }
    console.log('Outside block (let):', x); // 1
}

varTest();
letTest();

// const
const PI = 3.14159;
const user = { name: 'John', age: 30 };
user.age = 31; // OK: Modifying property
console.log('Modified user:', user);

// Example 2: Arrow Functions
console.log('\n=== Example 2: Arrow Functions ===');

// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const addArrow = (a, b) => a + b;

// Single parameter
const square = x => x * x;

// No parameters
const greet = () => 'Hello!';

// With block
const multiply = (a, b) => {
    const result = a * b;
    return result;
};

console.log('add(2, 3):', add(2, 3));
console.log('addArrow(2, 3):', addArrow(2, 3));
console.log('square(5):', square(5));
console.log('greet():', greet());

// Lexical this
const person = {
    name: 'John',
    hobbies: ['reading', 'coding'],
    showHobbies() {
        this.hobbies.forEach(hobby => {
            console.log(`${this.name} likes ${hobby}`);
        });
    }
};
person.showHobbies();

// Example 3: Template Literals
console.log('\n=== Example 3: Template Literals ===');

const name = 'John';
const age = 30;

// String interpolation
const message = `My name is ${name} and I'm ${age} years old`;
console.log(message);

// Multi-line
const html = `
    <div class="card">
        <h2>${name}</h2>
        <p>Age: ${age}</p>
    </div>
`;
console.log(html);

// Expressions
console.log(`Sum: ${10 + 20}`);
console.log(`Is adult: ${age >= 18}`);

// Example 4: Destructuring Arrays
console.log('\n=== Example 4: Array Destructuring ===');

const numbers = [1, 2, 3, 4, 5];

const [first, second] = numbers;
console.log('first:', first, 'second:', second);

const [, , third] = numbers;
console.log('third:', third);

// Rest operator
const [head, ...tail] = numbers;
console.log('head:', head, 'tail:', tail);

// Default values
const [a = 0, b = 0, c = 0] = [1, 2];
console.log('a:', a, 'b:', b, 'c:', c);

// Swapping variables
let x = 1, y = 2;
[x, y] = [y, x];
console.log('Swapped - x:', x, 'y:', y);

// Example 5: Destructuring Objects
console.log('\n=== Example 5: Object Destructuring ===');

const user = {
    username: 'johndoe',
    email: 'john@example.com',
    age: 30,
    location: {
        city: 'NYC',
        state: 'NY'
    }
};

const { username, email } = user;
console.log('username:', username, 'email:', email);

// Rename variables
const { username: name, age: userAge } = user;
console.log('name:', name, 'userAge:', userAge);

// Default values
const { phone = 'N/A' } = user;
console.log('phone:', phone);

// Nested destructuring
const { location: { city, state } } = user;
console.log('city:', city, 'state:', state);

// Function parameters
function displayUser({ username, age }) {
    console.log(`User: ${username}, Age: ${age}`);
}
displayUser(user);

// Example 6: Spread Operator
console.log('\n=== Example 6: Spread Operator ===');

// Array spread
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

const combined = [...arr1, ...arr2];
console.log('Combined arrays:', combined);

const copy = [...arr1];
console.log('Array copy:', copy);

const withExtra = [0, ...arr1, 4];
console.log('With extra:', withExtra);

// Object spread
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };

const combinedObj = { ...obj1, ...obj2 };
console.log('Combined objects:', combinedObj);

const objCopy = { ...obj1 };
console.log('Object copy:', objCopy);

const updated = { ...obj1, b: 10, e: 5 };
console.log('Updated object:', updated);

// Example 7: Rest Parameters
console.log('\n=== Example 7: Rest Parameters ===');

function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log('sum(1, 2, 3):', sum(1, 2, 3));
console.log('sum(1, 2, 3, 4, 5):', sum(1, 2, 3, 4, 5));

function greetAll(greeting, ...names) {
    return `${greeting} ${names.join(', ')}!`;
}

console.log(greetAll('Hello', 'John', 'Jane', 'Bob'));

// Example 8: Default Parameters
console.log('\n=== Example 8: Default Parameters ===');

function greetPerson(name = 'Guest', greeting = 'Hello') {
    return `${greeting}, ${name}!`;
}

console.log(greetPerson()); // Uses defaults
console.log(greetPerson('John')); // Uses default greeting
console.log(greetPerson('John', 'Hi')); // No defaults

function createUser(name, age = 18, role = 'user') {
    return { name, age, role };
}

console.log(createUser('John'));
console.log(createUser('Jane', 25, 'admin'));

// Example 9: Enhanced Object Literals
console.log('\n=== Example 9: Enhanced Object Literals ===');

const firstName = 'John';
const lastName = 'Doe';
const userAge = 30;

// Property shorthand
const newUser = { firstName, lastName, age: userAge };
console.log('User with shorthand:', newUser);

// Method shorthand
const calculator = {
    add(a, b) {
        return a + b;
    },
    subtract(a, b) {
        return a - b;
    }
};

console.log('calculator.add(5, 3):', calculator.add(5, 3));

// Computed property names
const key = 'score';
const gameData = {
    [key]: 100,
    ['level' + '1']: 'completed'
};
console.log('Game data:', gameData);

// Example 10: Classes
console.log('\n=== Example 10: Classes ===');

class Animal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
    }
    
    makeSound() {
        return `${this.name} makes a sound`;
    }
    
    static info() {
        return 'Animals are living organisms';
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name, 'Dog');
        this.breed = breed;
    }
    
    makeSound() {
        return `${this.name} barks`;
    }
    
    wagTail() {
        return `${this.name} is wagging its tail`;
    }
}

const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.makeSound());
console.log(dog.wagTail());
console.log('Static method:', Animal.info());

// Example 11: Map
console.log('\n=== Example 11: Map ===');

const userMap = new Map();

userMap.set('id', 1);
userMap.set('name', 'John');
userMap.set('age', 30);

console.log('Get name:', userMap.get('name'));
console.log('Has age:', userMap.has('age'));
console.log('Size:', userMap.size);

// Iterate
console.log('Map entries:');
for (let [key, value] of userMap) {
    console.log(`  ${key}: ${value}`);
}

// From array
const map2 = new Map([
    ['a', 1],
    ['b', 2],
    ['c', 3]
]);

console.log('Map from array:', [...map2.entries()]);

// Example 12: Set
console.log('\n=== Example 12: Set ===');

const numberSet = new Set();

numberSet.add(1);
numberSet.add(2);
numberSet.add(2); // Duplicate, ignored
numberSet.add(3);

console.log('Set values:', [...numberSet]);
console.log('Has 2:', numberSet.has(2));
console.log('Size:', numberSet.size);

// Remove duplicates from array
const arrWithDupes = [1, 2, 2, 3, 3, 3, 4, 5, 5];
const unique = [...new Set(arrWithDupes)];
console.log('Unique values:', unique);

// Example 13: Optional Chaining
console.log('\n=== Example 13: Optional Chaining ===');

const data = {
    user: {
        name: 'John',
        address: {
            city: 'NYC'
        }
    }
};

console.log('Safe access:', data?.user?.address?.city);
console.log('Non-existent:', data?.user?.phone?.number);

// With methods
console.log('Safe method call:', data?.user?.getName?.() || 'Method not found');

// With arrays
const users = [
    { name: 'John', profile: { age: 30 } },
    { name: 'Jane' }
];

console.log('Array element:', users[0]?.profile?.age);
console.log('Missing property:', users[1]?.profile?.age);

// Example 14: Nullish Coalescing
console.log('\n=== Example 14: Nullish Coalescing ===');

const val1 = null ?? 'default';
const val2 = undefined ?? 'default';
const val3 = 0 ?? 'default';
const val4 = '' ?? 'default';
const val5 = false ?? 'default';

console.log('null ?? default:', val1);
console.log('undefined ?? default:', val2);
console.log('0 ?? default:', val3);
console.log('"" ?? default:', val4);
console.log('false ?? default:', val5);

// Compare with OR
console.log('0 || default:', 0 || 'default');
console.log('"" || default:', '' || 'default');

// Example 15: Generator Functions
console.log('\n=== Example 15: Generators ===');

function* numberGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = numberGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Fibonacci generator
function* fibonacci() {
    let [prev, curr] = [0, 1];
    for (let i = 0; i < 10; i++) {
        yield curr;
        [prev, curr] = [curr, prev + curr];
    }
}

console.log('Fibonacci:', [...fibonacci()]);

// Example 16: Array Methods
console.log('\n=== Example 16: Modern Array Methods ===');

const items = [
    { id: 1, name: 'Item 1', price: 10 },
    { id: 2, name: 'Item 2', price: 20 },
    { id: 3, name: 'Item 3', price: 30 }
];

// find
const item = items.find(i => i.id === 2);
console.log('Found item:', item);

// findIndex
const index = items.findIndex(i => i.id === 2);
console.log('Found at index:', index);

// includes
const nums = [1, 2, 3, 4, 5];
console.log('Includes 3:', nums.includes(3));

// flat
const nested = [1, [2, 3], [4, [5, 6]]];
console.log('Flat(1):', nested.flat());
console.log('Flat(2):', nested.flat(2));

// flatMap
const doubled = [1, 2, 3].flatMap(x => [x, x * 2]);
console.log('FlatMap:', doubled);

// Example 17: Real-Time - API Client
console.log('\n=== Example 17: API Client ===');

class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
    
    async get(endpoint) {
        console.log(`GET ${this.baseURL}${endpoint}`);
        // Simulated response
        return {
            data: { message: 'Success' },
            status: 200
        };
    }
    
    async post(endpoint, data) {
        console.log(`POST ${this.baseURL}${endpoint}`, data);
        return {
            data: { id: 1, ...data },
            status: 201
        };
    }
}

const api = new APIClient('https://api.example.com');
console.log('API initialized with base URL:', api.baseURL);

// Example 18: Real-Time - Data Transformer
console.log('\n=== Example 18: Data Transformer ===');

class DataTransformer {
    static groupBy(array, key) {
        return array.reduce((groups, item) => ({
            ...groups,
            [item[key]]: [...(groups[item[key]] || []), item]
        }), {});
    }
    
    static unique(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }
    
    static pluck(array, key) {
        return array.map(item => item[key]);
    }
}

const products = [
    { id: 1, name: 'Laptop', category: 'Electronics', price: 1000 },
    { id: 2, name: 'Phone', category: 'Electronics', price: 500 },
    { id: 3, name: 'Desk', category: 'Furniture', price: 300 }
];

console.log('Grouped by category:', DataTransformer.groupBy(products, 'category'));
console.log('Product names:', DataTransformer.pluck(products, 'name'));

// Example 19: Real-Time - Modern Event Emitter
console.log('\n=== Example 19: Event Emitter ===');

class EventEmitter {
    constructor() {
        this.events = new Map();
    }
    
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }
    
    emit(event, ...args) {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(...args));
        }
    }
    
    off(event, callback) {
        const callbacks = this.events.get(event);
        if (callbacks) {
            const filtered = callbacks.filter(cb => cb !== callback);
            this.events.set(event, filtered);
        }
    }
}

const emitter = new EventEmitter();

emitter.on('user:login', ({ username }) => {
    console.log(`User logged in: ${username}`);
});

emitter.emit('user:login', { username: 'johndoe' });

// Example 20: Real-Time - Smart Cache
console.log('\n=== Example 20: Smart Cache ===');

class SmartCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    
    set(key, value, ttl = 60000) {
        // Remove oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }
    
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        // Check if expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    has(key) {
        return this.get(key) !== null;
    }
    
    clear() {
        this.cache.clear();
    }
}

const cache = new SmartCache(3);
cache.set('user:1', { name: 'John' }, 5000);
cache.set('user:2', { name: 'Jane' }, 5000);
console.log('Cached user:', cache.get('user:1'));
