# TypeScript Interview Questions — Freshers (0–2 Years)

100 fundamental questions with detailed answers. Use this for revision and mock interviews.

---

## 1. What is TypeScript, and how does it differ from JavaScript?

TypeScript is a statically typed superset of JavaScript developed by Microsoft. Every valid JavaScript file is also valid TypeScript, but TypeScript adds an optional type system and compile-time checking that JavaScript lacks. The TypeScript compiler (`tsc`) transpiles `.ts` files into plain `.js` so they run in any JavaScript environment. The key difference is that TypeScript catches type-related bugs at compile time rather than at runtime, resulting in more predictable, self-documenting, and maintainable code—especially in large codebases.

```typescript
// JavaScript — no type safety
function add(a, b) {
  return a + b;
}
add("5", 3); // "53" — silent bug

// TypeScript — compiler catches the error
function add(a: number, b: number): number {
  return a + b;
}
add("5", 3); // ✘ Argument of type 'string' is not assignable to parameter of type 'number'
```

---

## 2. What are the benefits of using TypeScript?

TypeScript provides several advantages over plain JavaScript. First, **static type checking** catches errors during development rather than at runtime. Second, **enhanced IDE support** with autocompletion, inline documentation, and refactoring tools makes developers more productive. Third, **self-documenting code** through type annotations makes it easier for teams to understand function contracts. Fourth, **easier refactoring** because the compiler highlights every location affected by a change. Fifth, **access to latest ECMAScript features** with the ability to compile down to older JavaScript versions for browser compatibility. Finally, it has a **gradual adoption model** so teams can incrementally introduce types into existing JavaScript projects.

---

## 3. How do you install TypeScript?

TypeScript is installed via npm (Node Package Manager). You can install it globally for system-wide use or locally within a project as a dev dependency, which is the recommended approach for team projects.

```bash
# Global install
npm install -g typescript

# Local project install (recommended)
npm install --save-dev typescript

# Verify installation
npx tsc --version
```

After installation, you use `tsc` to compile `.ts` files into `.js` files. For a project-level setup, you also generate a `tsconfig.json` file using `npx tsc --init`.

---

## 4. What is `tsconfig.json`, and why is it important?

`tsconfig.json` is the configuration file for the TypeScript compiler. It lives in the project root and defines compiler options, which files to include or exclude, and how the output should be generated. Without it, you would need to pass flags to `tsc` on every invocation. It makes builds reproducible and consistent across team members.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 5. What are the basic data types in TypeScript?

TypeScript's primitive types mirror JavaScript's runtime types but add compile-time enforcement. The core primitives are `number` (all numeric values, including floats), `string` (textual data), `boolean` (`true` or `false`), `null`, `undefined`, `bigint` (arbitrarily large integers), and `symbol` (unique identifiers). TypeScript also provides the special types `any` (opts out of type checking), `unknown` (type-safe counterpart of `any`), `void` (absence of a return value), and `never` (a function that never returns).

```typescript
let age: number = 25;
let name: string = "Alice";
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;
let big: bigint = 100n;
let id: symbol = Symbol("id");
```

---

## 6. What is type annotation in TypeScript?

Type annotation is the explicit syntax for telling the compiler what type a variable, parameter, or return value should hold. You place a colon followed by the type after the identifier. While TypeScript can often infer types automatically, explicit annotations serve as documentation and enforce contracts at API boundaries.

```typescript
let count: number = 10;
let greeting: string = "Hello";

function multiply(x: number, y: number): number {
  return x * y;
}
```

---

## 7. What is type inference in TypeScript?

Type inference is the compiler's ability to automatically determine the type of a variable or expression without an explicit annotation. When you assign a value at the point of declaration, TypeScript infers the type from that value. This keeps code concise while retaining full type safety. Inference also applies to return types of functions, array literals, and more.

```typescript
let score = 100;        // inferred as number
let label = "total";    // inferred as string
let items = [1, 2, 3];  // inferred as number[]

function double(n: number) {
  return n * 2;          // return type inferred as number
}
```

---

## 8. What is the `any` type, and when should you use it?

The `any` type disables all type checking for a value. A variable of type `any` can hold any value and be used in any way without compiler errors. While it provides maximum flexibility, it defeats the purpose of TypeScript because bugs slip through undetected. Use `any` only as a last resort—for example, when migrating a large JavaScript codebase incrementally or when dealing with truly dynamic data where you plan to add proper types later. Prefer `unknown` when you need a flexible type but still want safety.

```typescript
let data: any = 42;
data = "hello";       // no error
data.nonExistent();   // no error at compile time — runtime crash

// Better: use unknown
let safeData: unknown = 42;
// safeData.toFixed();  // ✘ Error — must narrow first
if (typeof safeData === "number") {
  safeData.toFixed(); // ✔ works after narrowing
}
```

---

## 9. What is the `unknown` type, and how does it differ from `any`?

`unknown` is the type-safe counterpart of `any`. Like `any`, it accepts every value, but unlike `any`, you cannot perform operations on an `unknown` value until you narrow it to a specific type via type guards. This forces you to validate the data before using it, preventing accidental runtime errors. Use `unknown` for data whose type you do not know at compile time—such as API responses or user input—and narrow it before use.

```typescript
function processInput(input: unknown): string {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  if (typeof input === "number") {
    return input.toFixed(2);
  }
  return String(input);
}
```

---

## 10. What is the `void` type?

`void` represents the absence of a return value. It is most commonly used as the return type of functions that perform side effects (like logging or DOM manipulation) and do not return anything. In strict mode, a `void` function may only return `undefined` or have no return statement at all. Do not confuse `void` with `undefined`—they are similar in practice but semantically different: `void` means "the return value should not be used," while `undefined` is a concrete value.

```typescript
function logMessage(message: string): void {
  console.log(message);
}
```

---

## 11. What is the `never` type?

`never` represents a value that never occurs. It is the return type of functions that always throw an error or contain infinite loops—they never produce a return value. `never` is also the result of exhaustiveness checks in narrowed unions. A variable of type `never` cannot hold any value, making it useful for compile-time guarantees that certain code paths are unreachable.

```typescript
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

type Shape = "circle" | "square";
function getArea(shape: Shape): number {
  switch (shape) {
    case "circle": return Math.PI * 10;
    case "square": return 100;
    default:
      const _exhaustive: never = shape; // compile error if a case is missed
      return _exhaustive;
  }
}
```

---

## 12. What are arrays in TypeScript, and how do you type them?

Arrays in TypeScript can be typed in two equivalent ways: using bracket notation (`type[]`) or generic notation (`Array<type>`). Both enforce that all elements in the array conform to the specified type. You can also create arrays of union types when mixed elements are needed.

```typescript
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];
let mixed: (string | number)[] = [1, "two", 3];
```

---

## 13. What are tuples in TypeScript?

Tuples are fixed-length arrays where each position has a defined type. Unlike regular arrays, tuples enforce both the number and type of elements at each index. They are useful for returning multiple values from a function or representing structured data without creating a full interface.

```typescript
let user: [string, number] = ["Alice", 30];

// Destructuring
let [userName, userAge] = user;

// Named tuples (TypeScript 4.0+)
type Point = [x: number, y: number, z: number];
let origin: Point = [0, 0, 0];

// Function returning a tuple
function useState<T>(initial: T): [T, (v: T) => void] {
  let value = initial;
  return [value, (v: T) => { value = v; }];
}
```

---

## 14. What are enums in TypeScript?

Enums define a set of named constants. They come in three varieties: numeric enums (default, auto-incrementing from 0), string enums (each member has an explicit string value), and heterogeneous enums (mixed—generally avoided). Enums produce real JavaScript objects at runtime, so you can use them as both types and values. They improve code readability by replacing magic numbers or strings with meaningful names.

```typescript
// Numeric enum
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right    // 3
}

// String enum
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

let currentDirection: Direction = Direction.Up;
let userStatus: Status = Status.Active;
```

---

## 15. What is the difference between `interface` and `type` in TypeScript?

Both `interface` and `type` can describe the shape of objects, but they have different capabilities. Interfaces support declaration merging (multiple declarations with the same name are combined), making them ideal for library APIs and extensible contracts. Type aliases support unions, intersections, mapped types, conditional types, and primitives—making them more versatile for complex type compositions. A common convention is to use `interface` for object shapes and `type` for unions, intersections, and computed types.

```typescript
// Interface — extendable and mergeable
interface User {
  name: string;
  age: number;
}

interface User {
  email: string; // merged with above
}

// Type alias — supports unions and intersections
type ID = string | number;

type Admin = User & {
  role: "admin";
};
```

---

## 16. How do you define an interface in TypeScript?

An interface defines a contract that objects must satisfy. It specifies property names and types, optional properties (with `?`), readonly properties, method signatures, and index signatures. Interfaces can extend other interfaces using `extends`.

```typescript
interface Product {
  readonly id: number;
  name: string;
  price: number;
  description?: string;
  getTotal(quantity: number): number;
}

const laptop: Product = {
  id: 1,
  name: "Laptop",
  price: 999,
  getTotal(quantity) {
    return this.price * quantity;
  }
};
```

---

## 17. What are optional properties in TypeScript?

Optional properties are marked with a `?` after the property name. They indicate that the property may or may not be present on the object. When accessed, an optional property's type includes `undefined`, so you must check for its existence before using it.

```typescript
interface Config {
  host: string;
  port?: number;
  ssl?: boolean;
}

function connect(config: Config) {
  const port = config.port ?? 3000; // default to 3000
  const ssl = config.ssl ?? false;
  console.log(`Connecting to ${config.host}:${port} (SSL: ${ssl})`);
}

connect({ host: "localhost" }); // port and ssl are optional
```

---

## 18. What are readonly properties?

The `readonly` modifier prevents a property from being reassigned after the object is created. It enforces immutability at the type level, catching accidental mutations at compile time. Note that `readonly` is shallow—nested objects can still be mutated unless they are also marked `readonly`.

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

const origin: Point = { x: 0, y: 0 };
// origin.x = 5; // ✘ Error: Cannot assign to 'x' because it is a read-only property

// ReadonlyArray
const numbers: ReadonlyArray<number> = [1, 2, 3];
// numbers.push(4); // ✘ Error
```

---

## 19. What are union types?

Union types allow a variable to hold one of several types. You use the pipe (`|`) operator to combine types. When working with a union, you can only access members that are common to all constituent types unless you narrow the type first using type guards.

```typescript
type StringOrNumber = string | number;

function format(value: StringOrNumber): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

format("hello"); // "HELLO"
format(3.14159); // "3.14"
```

---

## 20. What are intersection types?

Intersection types combine multiple types into one using the `&` operator. The resulting type has all properties from every constituent type. They are commonly used to merge interfaces or compose complex object shapes from simpler ones.

```typescript
interface HasName {
  name: string;
}

interface HasAge {
  age: number;
}

type Person = HasName & HasAge;

const person: Person = {
  name: "Alice",
  age: 30
};
```

---

## 21. What are literal types in TypeScript?

Literal types restrict a variable to one specific value rather than a broad category. You can have string literals, number literals, and boolean literals. They are most powerful when combined with union types to create a set of allowed values, functioning like lightweight enums.

```typescript
type Direction = "north" | "south" | "east" | "west";
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

function move(direction: Direction): void {
  console.log(`Moving ${direction}`);
}

move("north"); // ✔
// move("up"); // ✘ Error
```

---

## 22. What is type narrowing?

Type narrowing is the process by which TypeScript refines a broad type to a more specific one within a code block, based on runtime checks. After a narrowing check, the compiler knows the exact type and allows access to type-specific properties and methods. Common narrowing techniques include `typeof`, `instanceof`, `in` operator, equality checks, and truthiness checks.

```typescript
function printLength(value: string | string[]) {
  if (typeof value === "string") {
    console.log(value.length);   // value is string here
  } else {
    console.log(value.length);   // value is string[] here
  }
}

function processDate(value: string | Date) {
  if (value instanceof Date) {
    console.log(value.getFullYear()); // value is Date
  } else {
    console.log(value.toUpperCase()); // value is string
  }
}
```

---

## 23. What are type guards?

Type guards are expressions that perform runtime checks and inform the compiler about the type within a conditional block. Built-in type guards include `typeof` (for primitives), `instanceof` (for class instances), and the `in` operator (for property existence). You can also create custom type guards using type predicate functions.

```typescript
// Custom type guard with type predicate
interface Cat {
  meow(): void;
}

interface Dog {
  bark(): void;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return "meow" in animal;
}

function handleAnimal(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // TypeScript knows it's Cat
  } else {
    animal.bark(); // TypeScript knows it's Dog
  }
}
```

---

## 24. What are functions in TypeScript, and how do you type them?

Functions in TypeScript can have typed parameters and return types. You can type function declarations, function expressions, and arrow functions. TypeScript also allows you to define function type aliases for reusable function signatures.

```typescript
// Function declaration
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Arrow function
const square = (n: number): number => n * n;

// Function type alias
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
```

---

## 25. What are optional and default parameters?

Optional parameters are marked with `?` and must come after required parameters. Default parameters have a default value assigned with `=` and do not need `?` because they are implicitly optional. If omitted, they use the default value; if passed `undefined`, they also use the default.

```typescript
function createUser(
  name: string,
  age?: number,
  role: string = "viewer"
): string {
  return `${name}, Age: ${age ?? "N/A"}, Role: ${role}`;
}

createUser("Alice");              // "Alice, Age: N/A, Role: viewer"
createUser("Bob", 25);            // "Bob, Age: 25, Role: viewer"
createUser("Carol", 30, "admin"); // "Carol, Age: 30, Role: admin"
```

---

## 26. What are rest parameters in TypeScript?

Rest parameters collect an indefinite number of arguments into a typed array. They use the spread operator (`...`) and must be the last parameter in the function signature. They are useful when a function should accept a variable number of arguments.

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3);       // 6
sum(10, 20, 30, 40); // 100
```

---

## 27. What is function overloading in TypeScript?

Function overloading lets you define multiple call signatures for a single function. You write overload signatures (without bodies) followed by a single implementation signature (with a body) that handles all overloads. This gives callers precise return types based on which argument types they pass. The implementation must be compatible with all overload signatures.

```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  if (typeof value === "string") {
    return value.trim();
  }
  return value.toFixed(2);
}

const a: string = format("  hello  "); // "hello"
const b: string = format(3.14159);     // "3.14"
```

---

## 28. What are classes in TypeScript?

TypeScript classes extend JavaScript classes with type annotations, access modifiers, abstract classes, and interfaces. They provide a blueprint for creating objects with properties and methods, with compile-time enforcement of contracts.

```typescript
class Animal {
  name: string;
  protected sound: string;

  constructor(name: string, sound: string) {
    this.name = name;
    this.sound = sound;
  }

  speak(): string {
    return `${this.name} says ${this.sound}`;
  }
}

class Dog extends Animal {
  breed: string;

  constructor(name: string, breed: string) {
    super(name, "Woof");
    this.breed = breed;
  }
}

const dog = new Dog("Rex", "Labrador");
dog.speak(); // "Rex says Woof"
```

---

## 29. What are access modifiers in TypeScript?

Access modifiers control the visibility of class members. TypeScript has three: `public` (accessible from anywhere—the default), `private` (accessible only within the declaring class), and `protected` (accessible within the declaring class and its subclasses). These modifiers exist only at compile time; JavaScript has no equivalent enforcement except for the `#` private field syntax.

```typescript
class BankAccount {
  public owner: string;
  private balance: number;
  protected accountType: string;

  constructor(owner: string, balance: number) {
    this.owner = owner;
    this.balance = balance;
    this.accountType = "checking";
  }

  public getBalance(): number {
    return this.balance;
  }

  private validateAmount(amount: number): boolean {
    return amount > 0;
  }
}

const account = new BankAccount("Alice", 1000);
account.owner;       // ✔ public
// account.balance;  // ✘ private
// account.accountType; // ✘ protected
```

---

## 30. What is the shorthand constructor syntax (parameter properties)?

TypeScript allows you to declare and initialize class properties directly in the constructor parameters by prefixing them with an access modifier (`public`, `private`, `protected`, or `readonly`). This eliminates boilerplate property declarations and assignments.

```typescript
// Without shorthand
class UserVerbose {
  public name: string;
  private age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// With shorthand — equivalent
class User {
  constructor(
    public name: string,
    private age: number,
    readonly id: number = Math.random()
  ) {}
}
```

---

## 31. What are abstract classes in TypeScript?

Abstract classes are base classes that cannot be instantiated directly. They may contain abstract methods (signatures without implementations) that subclasses must implement, as well as concrete methods with full implementations. Abstract classes provide a template pattern—they define the structure that derived classes must follow while optionally sharing common logic.

```typescript
abstract class Shape {
  abstract area(): number;
  abstract perimeter(): number;

  describe(): string {
    return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

// const shape = new Shape(); // ✘ Cannot create an instance of an abstract class
const circle = new Circle(5);
circle.describe(); // "Area: 78.54, Perimeter: 31.42"
```

---

## 32. How do classes implement interfaces?

A class can implement one or more interfaces using the `implements` keyword. The class must provide concrete implementations for all properties and methods declared in the interface. This ensures the class adheres to a contract, enabling polymorphism and dependency injection patterns.

```typescript
interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

class UserRecord implements Serializable, Loggable {
  constructor(public name: string, public email: string) {}

  serialize(): string {
    return JSON.stringify({ name: this.name, email: this.email });
  }

  log(): void {
    console.log(`User: ${this.name} (${this.email})`);
  }
}
```

---

## 33. What are generics in TypeScript?

Generics allow you to write reusable code that works with multiple types while retaining type safety. Instead of using `any`, you define a type parameter (often `T`) that acts as a placeholder. The actual type is provided when the generic is used. Generics are used in functions, classes, interfaces, and type aliases.

```typescript
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);    // T is number
const str = identity("hello");       // T inferred as string

// Generic interface
interface Box<T> {
  content: T;
  label: string;
}

const stringBox: Box<string> = { content: "gift", label: "Present" };
const numberBox: Box<number> = { content: 100, label: "Score" };
```

---

## 34. What are generic constraints?

Generic constraints restrict the types that a type parameter can accept by using the `extends` keyword. This ensures the generic type has certain properties or methods, allowing you to safely access them within the generic function or class.

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): void {
  console.log(`Length: ${item.length}`);
}

logLength("hello");      // ✔ string has length
logLength([1, 2, 3]);    // ✔ array has length
// logLength(42);         // ✘ number doesn't have length

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };
getProperty(user, "name"); // "Alice"
// getProperty(user, "email"); // ✘ 'email' is not a key of user
```

---

## 35. What is the `keyof` operator?

The `keyof` operator takes an object type and produces a union of its keys as string literal types. It is commonly used with generics to create type-safe property access patterns and to build mapped or conditional types.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKeys = keyof User; // "id" | "name" | "email"

function getValue(user: User, key: keyof User) {
  return user[key];
}

const user: User = { id: 1, name: "Alice", email: "alice@example.com" };
getValue(user, "name");   // ✔
// getValue(user, "phone"); // ✘ Error
```

---

## 36. What is the `typeof` operator in TypeScript's type system?

In TypeScript, `typeof` has two uses. At runtime, it returns a string like `"string"` or `"number"` (JavaScript behavior). At the type level, `typeof` extracts the type of a variable or property, allowing you to derive types from existing values without manually rewriting them.

```typescript
const config = {
  host: "localhost",
  port: 3000,
  debug: true
};

type Config = typeof config;
// Equivalent to:
// { host: string; port: number; debug: boolean }

function cloneConfig(c: typeof config): typeof config {
  return { ...c };
}
```

---

## 37. What are type assertions?

Type assertions tell the compiler to treat a value as a specific type. They do not perform runtime conversion—they are purely a compile-time directive. Use them when you have more information about a type than TypeScript can infer. There are two syntaxes: the `as` keyword (preferred, especially in JSX) and the angle-bracket syntax.

```typescript
const input = document.getElementById("username") as HTMLInputElement;
input.value = "Alice";

// Angle bracket syntax (not usable in .tsx files)
const el = <HTMLDivElement>document.getElementById("container");

// Double assertion for unrelated types (use with extreme caution)
const value = "hello" as unknown as number;
```

---

## 38. What is the difference between type assertions and type casting?

Type assertions and type casting are fundamentally different. Type assertions are a compile-time-only mechanism in TypeScript—they tell the compiler to treat a value as a certain type but produce no runtime code. The actual value in memory does not change. True type casting (as in languages like C or Java) involves runtime conversion of a value from one type to another (e.g., converting an integer to a float). TypeScript does not perform type casting; if you need runtime conversion, you must do it explicitly with functions like `Number()`, `String()`, or `parseInt()`.

---

## 39. What are string template literal types?

Template literal types use the same syntax as JavaScript template literals but operate at the type level. They allow you to construct new string literal types by interpolating other types within backtick strings. They are powerful for creating type-safe string patterns.

```typescript
type Color = "red" | "blue";
type Size = "small" | "large";

type Style = `${Size}-${Color}`;
// "small-red" | "small-blue" | "large-red" | "large-blue"

type EventName = `on${Capitalize<"click" | "focus">}`;
// "onClick" | "onFocus"
```

---

## 40. What is the `in` operator for type narrowing?

The `in` operator checks if a property exists in an object and narrows the type accordingly. It is useful for discriminating between interfaces that have different properties.

```typescript
interface Car {
  drive(): void;
  fuelType: string;
}

interface Bicycle {
  pedal(): void;
  gearCount: number;
}

function useVehicle(vehicle: Car | Bicycle) {
  if ("drive" in vehicle) {
    vehicle.drive();         // TypeScript knows it's Car
    console.log(vehicle.fuelType);
  } else {
    vehicle.pedal();         // TypeScript knows it's Bicycle
    console.log(vehicle.gearCount);
  }
}
```

---

## 41. What are modules in TypeScript?

Modules are files that use `import` and `export` statements to share code between files. Each file with a top-level `import` or `export` is treated as a module with its own scope. TypeScript supports ES modules (`import`/`export`) and CommonJS (`require`/`module.exports`), with ES modules being the modern standard.

```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export const PI = 3.14159;

export default class Calculator {
  multiply(a: number, b: number): number {
    return a * b;
  }
}

// app.ts
import Calculator, { add, PI } from "./math";

const calc = new Calculator();
console.log(add(2, 3));       // 5
console.log(calc.multiply(4, 5)); // 20
```

---

## 42. What are namespaces in TypeScript?

Namespaces (formerly called "internal modules") organize code into named containers to avoid naming collisions. They use the `namespace` keyword and can be nested. While namespaces were important before ES modules became standard, modern TypeScript projects should prefer modules. Namespaces are still seen in declaration files and legacy codebases.

```typescript
namespace Validation {
  export interface Validator {
    isValid(value: string): boolean;
  }

  export class EmailValidator implements Validator {
    isValid(value: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
  }
}

const validator = new Validation.EmailValidator();
validator.isValid("test@example.com"); // true
```

---

## 43. What is the difference between `==` and `===` in TypeScript?

`==` (loose equality) performs type coercion before comparison, while `===` (strict equality) compares both value and type without coercion. TypeScript inherits this behavior from JavaScript. Always prefer `===` to avoid unexpected coercion bugs. TypeScript's type system helps catch mismatches, but using `===` is still a best practice.

```typescript
console.log(5 == "5");   // true  (coerces string to number)
console.log(5 === "5");  // compile error in TS (different types)
console.log(5 === 5);    // true
console.log(null == undefined);  // true
console.log(null === undefined); // false
```

---

## 44. What is a discriminated union?

A discriminated union (also called a tagged union) is a pattern where each member of a union has a common literal property (the "discriminant") that uniquely identifies it. TypeScript uses this property to narrow the union in switch statements or conditionals, providing exhaustive type checking.

```typescript
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
  }
}
```

---

## 45. What is the nullish coalescing operator (`??`)?

The `??` operator returns the right-hand operand when the left-hand operand is `null` or `undefined`, and the left-hand operand otherwise. Unlike `||`, it does not treat `0`, `""`, or `false` as falsy. This makes it ideal for providing default values where `0` or empty string are valid.

```typescript
const port = undefined;
const actualPort = port ?? 3000; // 3000

const count = 0;
console.log(count || 10);  // 10 — wrong, treats 0 as falsy
console.log(count ?? 10);  // 0  — correct, 0 is a valid value
```

---

## 46. What is optional chaining (`?.`)?

Optional chaining allows you to safely access nested properties on potentially `null` or `undefined` objects without causing a runtime error. If the value before `?.` is `null` or `undefined`, the expression short-circuits and returns `undefined` instead of throwing.

```typescript
interface Company {
  name: string;
  address?: {
    city?: string;
    zip?: string;
  };
}

function getCity(company: Company): string | undefined {
  return company.address?.city;
}

// Also works with methods and array access
const result = someArray?.[0]?.method?.();
```

---

## 47. What is the non-null assertion operator (`!`)?

The non-null assertion operator (`!`) tells the compiler that a value is definitely not `null` or `undefined`, even if the type says it could be. It is a compile-time-only assertion and performs no runtime check. Use it sparingly and only when you are absolutely certain the value exists, because misuse hides potential `null` reference bugs.

```typescript
function getElement(id: string): HTMLElement {
  const el = document.getElementById(id)!; // assert non-null
  return el;
}

// Preferred: explicit check instead
function getElementSafe(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}
```

---

## 48. What are type aliases?

Type aliases create a new name for any type using the `type` keyword. They can represent primitives, unions, tuples, functions, objects, and complex computed types. Unlike interfaces, they cannot be reopened for declaration merging, but they are more flexible for composing types.

```typescript
type UserID = string | number;
type Coordinate = [number, number];
type Callback = (data: string) => void;

type User = {
  id: UserID;
  name: string;
  location: Coordinate;
  onUpdate: Callback;
};
```

---

## 49. What is the `Readonly` utility type?

`Readonly<T>` constructs a type with all properties of `T` set to `readonly`. It prevents reassignment of any property, enforcing immutability at the type level. It is shallow—nested objects are not made readonly.

```typescript
interface User {
  name: string;
  age: number;
}

const user: Readonly<User> = { name: "Alice", age: 30 };
// user.name = "Bob"; // ✘ Cannot assign to 'name' because it is a read-only property
```

---

## 50. What is the `Partial` utility type?

`Partial<T>` constructs a type with all properties of `T` set to optional. It is commonly used for update functions where only a subset of fields may be provided.

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}

const user: User = { name: "Alice", age: 30, email: "alice@example.com" };
const updated = updateUser(user, { age: 31 }); // only update age
```

---

## 51. What is the `Required` utility type?

`Required<T>` constructs a type with all properties of `T` set to required, removing any optional `?` modifiers. It is the opposite of `Partial`.

```typescript
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

function startServer(config: Required<Config>) {
  console.log(`${config.host}:${config.port} debug=${config.debug}`);
}

// startServer({ host: "localhost" }); // ✘ missing port and debug
startServer({ host: "localhost", port: 3000, debug: false }); // ✔
```

---

## 52. What is the `Pick` utility type?

`Pick<T, K>` constructs a type by selecting a subset of properties `K` from type `T`. It creates a narrower type with only the specified keys.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PublicUser = Pick<User, "id" | "name" | "email">;

const publicUser: PublicUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
  // password is excluded
};
```

---

## 53. What is the `Omit` utility type?

`Omit<T, K>` constructs a type by excluding specified properties `K` from type `T`. It is the complement of `Pick`—instead of choosing what to keep, you choose what to remove.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type SafeUser = Omit<User, "password">;

const safeUser: SafeUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};
```

---

## 54. What is the `Record` utility type?

`Record<K, V>` constructs an object type whose keys are of type `K` and values are of type `V`. It is useful for dictionaries, lookup tables, and mapping known keys to a consistent value type.

```typescript
type Role = "admin" | "editor" | "viewer";

interface Permissions {
  read: boolean;
  write: boolean;
  delete: boolean;
}

const rolePermissions: Record<Role, Permissions> = {
  admin:  { read: true,  write: true,  delete: true },
  editor: { read: true,  write: true,  delete: false },
  viewer: { read: true,  write: false, delete: false }
};
```

---

## 55. What is the `Exclude` utility type?

`Exclude<T, U>` removes from union `T` all members that are assignable to `U`. It is used to filter out specific types from a union.

```typescript
type AllColors = "red" | "green" | "blue" | "yellow";
type WarmColors = Exclude<AllColors, "blue" | "green">; // "red" | "yellow"

type Primitive = string | number | boolean | null | undefined;
type NonNullPrimitive = Exclude<Primitive, null | undefined>;
// string | number | boolean
```

---

## 56. What is the `Extract` utility type?

`Extract<T, U>` keeps only the members of union `T` that are assignable to `U`. It is the opposite of `Exclude`.

```typescript
type AllTypes = string | number | boolean | object;
type Stringish = Extract<AllTypes, string | number>; // string | number
```

---

## 57. What is the `NonNullable` utility type?

`NonNullable<T>` removes `null` and `undefined` from a type, ensuring the resulting type always represents a definite value.

```typescript
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

function process(value: NonNullable<string | null>): string {
  return value.toUpperCase(); // safe — null has been excluded
}
```

---

## 58. What is the `ReturnType` utility type?

`ReturnType<T>` extracts the return type of a function type `T`. It is useful when you need to reference a function's return type without manually redefining it.

```typescript
function createUser() {
  return {
    id: 1,
    name: "Alice",
    createdAt: new Date()
  };
}

type User = ReturnType<typeof createUser>;
// { id: number; name: string; createdAt: Date }
```

---

## 59. What is the `Parameters` utility type?

`Parameters<T>` extracts the parameter types of a function type as a tuple. This is useful for wrapping or decorating functions while preserving their parameter types.

```typescript
function greet(name: string, age: number): string {
  return `${name} is ${age}`;
}

type GreetParams = Parameters<typeof greet>; // [string, number]

function wrappedGreet(...args: Parameters<typeof greet>): string {
  console.log("Calling greet...");
  return greet(...args);
}
```

---

## 60. What is the difference between `null` and `undefined` in TypeScript?

`undefined` means a variable has been declared but not assigned a value. `null` means a variable has been explicitly assigned the absence of a value. With `strictNullChecks` enabled (recommended), they are distinct types, and you must explicitly handle both. Without `strictNullChecks`, they are assignable to any type, which hides potential bugs.

```typescript
let a: undefined = undefined; // declared, no value
let b: null = null;           // explicitly no value

let name: string | null = null;     // intentionally empty
let age: number | undefined;        // not yet set

// Checking both
function display(value: string | null | undefined) {
  if (value != null) {  // checks both null and undefined
    console.log(value);
  }
}
```

---

## 61. What is the `strict` flag in `tsconfig.json`?

The `strict` flag is a master switch that enables a family of strict type-checking options all at once: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `useUnknownInCatchVariables`, and `alwaysStrict`. Enabling it provides the strongest type safety and is recommended for all new projects.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

---

## 62. What is the `as const` assertion?

`as const` is a const assertion that makes TypeScript infer the narrowest possible literal types. Arrays become readonly tuples, objects get readonly literal-typed properties, and all values are treated as immutable literals rather than their widened types.

```typescript
const colors = ["red", "green", "blue"] as const;
// Type: readonly ["red", "green", "blue"]
// Without as const: string[]

const config = {
  host: "localhost",
  port: 3000
} as const;
// Type: { readonly host: "localhost"; readonly port: 3000 }
// Without as const: { host: string; port: number }

type Color = (typeof colors)[number]; // "red" | "green" | "blue"
```

---

## 63. What are index signatures?

Index signatures allow you to describe objects with dynamic keys that conform to a consistent value type. They use the syntax `[key: string]: ValueType` or `[key: number]: ValueType` within an interface or type.

```typescript
interface StringMap {
  [key: string]: string;
}

const translations: StringMap = {
  hello: "hola",
  goodbye: "adiós"
};

interface NumberDictionary {
  [index: number]: string;
  length: number;    // OK, number is compatible
  // name: number;   // ✘ string is not assignable to string
}
```

---

## 64. What is the `satisfies` operator?

Introduced in TypeScript 4.9, `satisfies` lets you validate that a value conforms to a type without widening or narrowing the inferred type. It provides the safety of type annotation while preserving the narrow inferred type for downstream use.

```typescript
type Colors = Record<string, string | string[]>;

const palette = {
  red: "#ff0000",
  green: "#00ff00",
  blue: ["#0000ff", "#0000cc"]
} satisfies Colors;

// palette.red is still inferred as string (not string | string[])
palette.red.toUpperCase(); // ✔ works
palette.blue.map(b => b.toUpperCase()); // ✔ works — blue is string[]
```

---

## 65. What are decorators in TypeScript?

Decorators are special declarations (using `@` syntax) that can be attached to classes, methods, properties, accessors, or parameters to add metadata or modify behavior. They are a Stage 3 ECMAScript proposal and require `experimentalDecorators` in `tsconfig.json` (or the TC39 decorator syntax with TypeScript 5.0+). Decorators are widely used in frameworks like Angular and NestJS.

```typescript
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    return original.apply(this, args);
  };
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }
}

new Calculator().add(2, 3); // logs "Calling add with [2, 3]" then returns 5
```

---

## 66. What is the difference between `interface extends` and intersection (`&`)?

`extends` creates a subtype relationship where an interface inherits all properties from the parent and can add new ones. Intersection (`&`) combines multiple types into one with all properties from all constituent types. The key difference is in conflict handling: `extends` produces a compile error if the child declares an incompatible property, while `&` creates an impossible (`never`) property type for conflicting fields.

```typescript
interface Base {
  id: number;
}

// extends — clear hierarchy, error on conflicts
interface User extends Base {
  name: string;
}

// Intersection — flat combination
type Admin = Base & {
  name: string;
  role: "admin";
};
```

---

## 67. What is declaration merging?

Declaration merging is a TypeScript feature where the compiler combines multiple declarations with the same name into a single definition. This works with interfaces, namespaces, and enums but not type aliases. It is commonly used by libraries to allow consumers to extend types.

```typescript
interface Window {
  myCustomProperty: string;
}

// Both declarations merge into one Window interface
// Now window.myCustomProperty is recognized

interface Box {
  width: number;
}

interface Box {
  height: number;
}

// Box is { width: number; height: number; }
const box: Box = { width: 10, height: 20 };
```

---

## 68. What is the `implements` keyword, and how is it different from `extends`?

`extends` creates an inheritance relationship where a class inherits both the type and the implementation from a parent class. `implements` creates a contract where a class promises to provide all members defined in an interface—it inherits no implementation, only the type signature.

```typescript
interface Printable {
  print(): void;
}

class BasePrinter {
  protected format(content: string): string {
    return `[${new Date().toISOString()}] ${content}`;
  }
}

class DocumentPrinter extends BasePrinter implements Printable {
  print(): void {
    console.log(this.format("Printing document..."));
  }
}
```

---

## 69. What are mapped types?

Mapped types create new types by transforming each property of an existing type. They iterate over the keys of a type and apply transformations like making properties optional, readonly, or changing value types. Built-in utilities like `Partial`, `Readonly`, `Required`, and `Record` are all mapped types.

```typescript
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type ReadonlyStrings<T> = {
  readonly [K in keyof T]: string;
};

interface User {
  name: string;
  age: number;
}

type OptionalUser = Optional<User>;       // { name?: string; age?: number }
type StringUser = ReadonlyStrings<User>;   // { readonly name: string; readonly age: string }
```

---

## 70. What are conditional types?

Conditional types select one of two types based on a condition, using the syntax `T extends U ? X : Y`. If `T` is assignable to `U`, the type resolves to `X`; otherwise, it resolves to `Y`. They enable powerful type-level logic.

```typescript
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;  // "yes"
type B = IsString<number>;  // "no"

type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>;  // string
type Num = Flatten<number>;    // number
```

---

## 71. What is the `infer` keyword?

`infer` is used within conditional types to introduce a type variable that TypeScript infers from the context. It allows you to extract types from complex structures like function return types, promise resolutions, or array elements.

```typescript
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnpackPromise<Promise<string>>; // string
type B = UnpackPromise<number>;          // number

type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

type F = FirstArg<(name: string, age: number) => void>; // string
```

---

## 72. What are ambient declarations?

Ambient declarations tell TypeScript about types that exist at runtime but are not defined in TypeScript source files. They use the `declare` keyword and produce no JavaScript output. They are used to describe global variables, functions, or modules from third-party libraries that do not have TypeScript definitions.

```typescript
// In a .d.ts file or at the top of a .ts file
declare const API_URL: string;
declare function trackEvent(name: string, data: object): void;

// Declaring a module without type definitions
declare module "legacy-library" {
  export function init(config: object): void;
}
```

---

## 73. What are `.d.ts` files?

Declaration files (`.d.ts`) contain only type declarations—no executable code. They describe the shape of JavaScript libraries so TypeScript can type-check code that uses those libraries. The `@types` scope on npm hosts community-maintained declaration files for popular packages (e.g., `@types/react`, `@types/node`). You never import `.d.ts` files directly; TypeScript finds and uses them automatically.

```typescript
// types.d.ts
declare module "config" {
  interface AppConfig {
    apiUrl: string;
    debug: boolean;
  }
  const config: AppConfig;
  export default config;
}
```

---

## 74. What is the `Awaited` utility type?

`Awaited<T>` (introduced in TypeScript 4.5) unwraps nested `Promise` types to get the resolved value type. It recursively unpacks `Promise<Promise<...>>` chains and handles `PromiseLike` types as well.

```typescript
type A = Awaited<Promise<string>>;              // string
type B = Awaited<Promise<Promise<number>>>;     // number
type C = Awaited<boolean | Promise<string>>;    // boolean | string
```

---

## 75. What is the difference between `let`, `const`, and `var`?

While this is a JavaScript concept, TypeScript adds type-level implications. `var` is function-scoped and hoisted—avoid it. `let` is block-scoped and can be reassigned. `const` is block-scoped and cannot be reassigned. In TypeScript, `const` with primitive values infers literal types, while `let` infers the wider type.

```typescript
const x = "hello"; // type: "hello" (literal)
let y = "hello";   // type: string (widened)

const arr = [1, 2, 3];     // type: number[] (mutable)
const tuple = [1, 2] as const; // type: readonly [1, 2]
```

---

## 76. What are assertion functions?

Assertion functions are functions that throw an error if a condition is not met and narrow the type for subsequent code. They use the `asserts` return type annotation. Unlike regular type guards that return a boolean, assertion functions either succeed (allowing code to continue) or throw.

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function processInput(input: unknown) {
  assertIsString(input);
  console.log(input.toUpperCase()); // TypeScript knows input is string
}
```

---

## 77. What is an `enum` with computed values?

Enum members can be initialized with computed values (expressions evaluated at runtime). Constant members are evaluated at compile time, while computed members are evaluated at runtime. An enum can mix both, but computed members must come after constant members unless explicitly initialized.

```typescript
enum FileAccess {
  None = 0,
  Read = 1 << 0,       // 1
  Write = 1 << 1,      // 2
  ReadWrite = Read | Write, // 3 — computed from other members
  Generated = "prefix_".length // 7 — computed at runtime
}
```

---

## 78. What is a `const enum`?

A `const enum` is fully erased at compile time. Instead of generating a runtime object, the compiler inlines the literal values wherever the enum members are used. This reduces runtime overhead and bundle size but prevents iterating over the enum at runtime.

```typescript
const enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

const dir = Direction.Up;
// Compiled JS: const dir = "UP"; — no enum object in output
```

---

## 79. What are template literal types?

Template literal types combine literal types with template string syntax to create new string literal types. They can use intrinsic string manipulation types like `Uppercase`, `Lowercase`, `Capitalize`, and `Uncapitalize`.

```typescript
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type Endpoint = "/users" | "/posts";

type Route = `${HTTPMethod} ${Endpoint}`;
// "GET /users" | "GET /posts" | "POST /users" | ... (8 combinations)

type UpperMethod = Uppercase<HTTPMethod>;
// "GET" | "POST" | "PUT" | "DELETE" (already upper)
```

---

## 80. What is an `object` vs `Object` vs `{}` in TypeScript?

These three look similar but behave differently. `object` (lowercase) represents any non-primitive value (no `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`). `Object` (uppercase) is the interface for JavaScript's `Object` constructor and is too broad—almost everything is assignable to it. `{}` represents an empty object type, which also accepts any non-null, non-undefined value. For typing non-primitive values, use `object` (lowercase) or a specific interface.

```typescript
let a: object = { key: "value" }; // ✔
// let b: object = "string";      // ✘

let c: Object = "string";         // ✔ — too permissive, avoid
let d: {} = 42;                   // ✔ — too permissive, avoid
```

---

## 81. What is the `Exclude` vs `Omit` difference?

`Exclude<T, U>` operates on unions—it removes union members from `T` that are assignable to `U`. `Omit<T, K>` operates on object types—it creates a new type by removing specified keys `K` from object type `T`. They work at different levels: `Exclude` filters union members, while `Omit` filters object properties.

```typescript
// Exclude — works on unions
type Colors = "red" | "green" | "blue";
type Warm = Exclude<Colors, "blue">; // "red" | "green"

// Omit — works on object types
interface User { id: number; name: string; password: string; }
type PublicUser = Omit<User, "password">; // { id: number; name: string }
```

---

## 82. How do you handle errors in TypeScript?

Error handling in TypeScript uses try/catch like JavaScript, but with `strictNullChecks` and `useUnknownInCatchVariables`, the caught error is typed as `unknown` (not `any`), requiring you to narrow it before accessing properties. You can also create custom error classes.

```typescript
class AppError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.name = "AppError";
  }
}

async function fetchData(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new AppError("Fetch failed", response.status);
    }
    return await response.text();
  } catch (error: unknown) {
    if (error instanceof AppError) {
      console.error(`App Error ${error.code}: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    throw error;
  }
}
```

---

## 83. What is the `extends` keyword in generics?

In generic contexts, `extends` acts as a constraint, not inheritance. It limits the types that a type parameter can accept by saying "T must be assignable to this shape." This is different from class inheritance, even though the keyword is the same.

```typescript
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("hello", "world");     // ✔ string has .length
longest([1, 2], [1, 2, 3]);   // ✔ array has .length
// longest(10, 20);            // ✘ number has no .length
```

---

## 84. What are index access types (lookup types)?

Index access types let you look up the type of a specific property on another type using bracket notation, similar to property access on objects but at the type level.

```typescript
interface User {
  id: number;
  name: string;
  address: {
    city: string;
    zip: string;
  };
}

type UserName = User["name"];           // string
type City = User["address"]["city"];    // string
type IdOrName = User["id" | "name"];   // number | string
```

---

## 85. What is the difference between `interface` and `abstract class`?

An interface defines a pure contract with no implementation—it exists only at compile time and is erased in JavaScript output. An abstract class can contain both abstract (unimplemented) and concrete (implemented) methods and exists at runtime as a JavaScript class. Use interfaces for defining shapes and contracts; use abstract classes when you need to share implementation logic among subclasses.

```typescript
interface Drawable {
  draw(): void;
}

abstract class Widget {
  abstract render(): void;
  show(): void {
    this.render();
    console.log("Widget shown");
  }
}
```

---

## 86. What are `this` types in TypeScript?

The special `this` type refers to the type of the current class or interface, enabling fluent API patterns (method chaining) where the return type adapts to the actual subclass. Each subclass automatically gets its own `this` type.

```typescript
class QueryBuilder {
  private conditions: string[] = [];

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  build(): string {
    return this.conditions.join(" AND ");
  }
}

class AdvancedQueryBuilder extends QueryBuilder {
  orderBy(field: string): this {
    return this.where(`ORDER BY ${field}`);
  }
}

new AdvancedQueryBuilder()
  .where("age > 18")
  .orderBy("name")
  .build();
```

---

## 87. What are type-only imports and exports?

TypeScript allows importing and exporting types specifically with `import type` and `export type`. These are fully erased at compile time and produce no JavaScript output. They make it explicit that an import is used only for type information, which helps bundlers with tree-shaking and avoids circular dependency issues.

```typescript
// user.ts
export interface User {
  id: number;
  name: string;
}

export type UserId = number;

// app.ts
import type { User, UserId } from "./user";

function greet(user: User): string {
  return `Hello, ${user.name}`;
}
```

---

## 88. What are string enums vs numeric enums?

Numeric enums auto-increment from 0 (or a specified start value) and support reverse mapping (value → name). String enums require explicit values for every member and do not support reverse mapping. String enums provide clearer debugging output since the values are readable strings.

```typescript
// Numeric — supports reverse mapping
enum StatusCode {
  OK = 200,
  NotFound = 404,
  ServerError = 500
}
StatusCode[200]; // "OK"

// String — more readable, no reverse mapping
enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Error = "ERROR"
}
// LogLevel["DEBUG"] — does not work
```

---

## 89. What is the `globalThis` in TypeScript?

`globalThis` is a standard way to access the global object across all JavaScript environments (browser, Node.js, web workers). In TypeScript, you can augment its type using declaration merging to add custom global properties with type safety.

```typescript
declare global {
  var appVersion: string;
}

globalThis.appVersion = "1.0.0";
console.log(globalThis.appVersion); // "1.0.0"
```

---

## 90. What is structural typing (duck typing)?

TypeScript uses structural typing: two types are compatible if they have the same shape (properties and methods), regardless of their declared name or where they were defined. If it looks like a duck and quacks like a duck, TypeScript treats it as a duck. This is different from nominal typing (used in Java/C#) where types must be explicitly related.

```typescript
interface Point {
  x: number;
  y: number;
}

class Coordinate {
  constructor(public x: number, public y: number) {}
}

function logPoint(point: Point) {
  console.log(`(${point.x}, ${point.y})`);
}

logPoint(new Coordinate(1, 2)); // ✔ — same shape, different name
logPoint({ x: 5, y: 10 });      // ✔ — plain object with matching shape
```

---

## 91. What are utility types `ConstructorParameters` and `InstanceType`?

`ConstructorParameters<T>` extracts the parameter types of a constructor function as a tuple. `InstanceType<T>` extracts the type that a constructor function creates when called with `new`. Both are useful in factory and dependency injection patterns.

```typescript
class User {
  constructor(public name: string, public age: number) {}
}

type UserParams = ConstructorParameters<typeof User>; // [string, number]
type UserInstance = InstanceType<typeof User>;          // User

function createInstance<T extends new (...args: any[]) => any>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Ctor(...args);
}

const user = createInstance(User, "Alice", 30);
```

---

## 92. What is the `this` parameter in functions?

The `this` parameter is a special first parameter in TypeScript function signatures that specifies the type of `this` inside the function body. It is erased at compile time and does not affect the function's arity. It prevents accidentally calling the function with the wrong `this` context.

```typescript
interface UIElement {
  id: string;
  onClick(this: UIElement, event: Event): void;
}

const button: UIElement = {
  id: "btn-1",
  onClick(event) {
    console.log(this.id); // TypeScript ensures `this` is UIElement
  }
};
```

---

## 93. What are getter and setter accessors in TypeScript?

Getters and setters allow you to control read and write access to class properties. They look like property access to the caller but execute custom logic behind the scenes. TypeScript enforces that the setter parameter type matches the getter return type.

```typescript
class Temperature {
  private _celsius: number;

  constructor(celsius: number) {
    this._celsius = celsius;
  }

  get fahrenheit(): number {
    return this._celsius * 9 / 5 + 32;
  }

  set fahrenheit(value: number) {
    this._celsius = (value - 32) * 5 / 9;
  }

  get celsius(): number {
    return this._celsius;
  }
}

const temp = new Temperature(100);
console.log(temp.fahrenheit); // 212
temp.fahrenheit = 32;
console.log(temp.celsius);   // 0
```

---

## 94. How do you use TypeScript with async/await?

TypeScript fully supports `async`/`await` and types async functions as returning `Promise<T>`. The compiler checks that you handle promises correctly and that the resolved type matches expectations.

```typescript
interface Post {
  id: number;
  title: string;
  body: string;
}

async function fetchPost(id: number): Promise<Post> {
  const response = await fetch(`https://api.example.com/posts/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data: Post = await response.json();
  return data;
}

async function main() {
  try {
    const post = await fetchPost(1);
    console.log(post.title);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}
```

---

## 95. What is the `Partial` vs `Required` vs `Readonly` comparison?

These three utility types are the most commonly used type transformers. `Partial<T>` makes all properties optional, `Required<T>` makes all properties required, and `Readonly<T>` makes all properties readonly. They all operate shallowly—nested objects are not affected.

```typescript
interface User {
  name: string;
  age?: number;
  email: string;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string }

type FullUser = Required<User>;
// { name: string; age: number; email: string }

type FrozenUser = Readonly<User>;
// { readonly name: string; readonly age?: number; readonly email: string }
```

---

## 96. What is a recursive type?

Recursive types reference themselves in their definition. They are used to model tree structures, nested data formats, and deeply nested JSON. TypeScript handles recursive types through lazy evaluation.

```typescript
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

const tree: TreeNode<string> = {
  value: "root",
  children: [
    { value: "child1", children: [] },
    { value: "child2", children: [
      { value: "grandchild", children: [] }
    ]}
  ]
};
```

---

## 97. What is excess property checking?

When you assign an object literal directly to a typed variable, TypeScript performs excess property checking—it flags properties that are not part of the target type. This catches typos and unintended properties. However, this check only applies to object literals; assigning via a variable or using a type assertion bypasses it.

```typescript
interface User {
  name: string;
  age: number;
}

// Direct assignment — excess check applies
// const user: User = { name: "Alice", age: 30, email: "a@b.com" }; // ✘ Error

// Via variable — no excess check
const data = { name: "Alice", age: 30, email: "a@b.com" };
const user: User = data; // ✔ — extra property ignored
```

---

## 98. What is the `Promise` type in TypeScript?

`Promise<T>` is a generic type representing an asynchronous operation that will eventually resolve to a value of type `T` or reject with an error. TypeScript checks that you handle the resolved type correctly and that async functions return the expected type.

```typescript
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchNumber(): Promise<number> {
  return new Promise((resolve, reject) => {
    const value = Math.random();
    if (value > 0.5) {
      resolve(value);
    } else {
      reject(new Error("Value too low"));
    }
  });
}
```

---

## 99. What is an `enum` vs a union type for constants?

Unions of string literals are generally preferred over enums in modern TypeScript because they have zero runtime cost (fully erased), are simpler, work naturally with type inference, and do not produce a runtime object. Enums are useful when you need runtime iteration over values or when interfacing with APIs that rely on numeric codes.

```typescript
// Union — zero runtime overhead, simpler
type Status = "active" | "inactive" | "pending";

// Enum — produces runtime object
enum StatusEnum {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending"
}

// Union is often preferred in modern codebases
function setStatus(status: Status) {}
setStatus("active");
```

---

## 100. What are the key differences between TypeScript and JavaScript summarized?

| Feature | JavaScript | TypeScript |
|---|---|---|
| Type System | Dynamic, no compile-time types | Static, optional type annotations |
| Compilation | Interpreted directly by engines | Compiled to JavaScript via `tsc` |
| Error Detection | Runtime only | Compile time + runtime |
| IDE Support | Basic | Rich autocomplete, refactoring, navigation |
| Interfaces | Not supported | Fully supported |
| Enums | Not supported | Fully supported |
| Generics | Not supported | Fully supported |
| Access Modifiers | `#` for private only | `public`, `private`, `protected` |
| Decorators | Stage 3 proposal | Supported (experimental + TC39) |
| Compatibility | Runs everywhere | Compiles to any JS version |
| Learning Curve | Lower | Higher (types add complexity) |
| Adoption | Universal | Rapidly growing, standard for large projects |

TypeScript is JavaScript with a type system bolted on top. Every JavaScript program is a valid TypeScript program, but TypeScript adds compile-time safety, tooling, and language features that make large-scale development more reliable and maintainable.

---
