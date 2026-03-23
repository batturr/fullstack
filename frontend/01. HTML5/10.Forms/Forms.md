# 10. Forms

## Basic Form Structure

```html
<form action="/submit" method="POST">
  <label for="name">Name:</label>
  <input type="text" id="name" name="name" required>
  
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  
  <button type="submit">Submit</button>
</form>
```

---

## `<form>` Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `action` | URL where form data is sent | `action="/api/submit"` |
| `method` | HTTP method | `method="GET"` or `method="POST"` |
| `enctype` | Encoding type for POST | `enctype="multipart/form-data"` |
| `target` | Where to show response | `target="_blank"` |
| `autocomplete` | Browser autofill | `autocomplete="on"` or `"off"` |
| `novalidate` | Disable browser validation | `<form novalidate>` |
| `name` | Form name for scripting | `name="loginForm"` |

### GET vs POST

| GET | POST |
|-----|------|
| Data in URL query string | Data in request body |
| Visible in URL bar | Hidden from URL |
| Bookmarkable | Not bookmarkable |
| Limited data size (~2KB) | No size limit |
| Use for: search, filters | Use for: login, signup, file upload |

### `enctype` Values

| Value | When to Use |
|-------|------------|
| `application/x-www-form-urlencoded` | Default — works for most forms |
| `multipart/form-data` | **Required** for file uploads |
| `text/plain` | Rarely used |

---

## Input Types

### Text Inputs

```html
<input type="text" name="username" placeholder="Enter username" maxlength="50">
<input type="password" name="pass" placeholder="Enter password" minlength="8">
<input type="email" name="email" placeholder="you@example.com">
<input type="url" name="website" placeholder="https://example.com">
<input type="tel" name="phone" placeholder="+1 (234) 567-890">
<input type="search" name="q" placeholder="Search...">
```

### Number Inputs

```html
<input type="number" name="qty" min="1" max="100" step="1" value="1">
<input type="range" name="volume" min="0" max="100" value="50">
```

### Date & Time Inputs

```html
<input type="date" name="date">                   <!-- 2025-02-08 -->
<input type="time" name="time">                    <!-- 14:30 -->
<input type="datetime-local" name="datetime">      <!-- 2025-02-08T14:30 -->
<input type="month" name="month">                  <!-- 2025-02 -->
<input type="week" name="week">                    <!-- 2025-W06 -->
```

### Selection Inputs

```html
<input type="checkbox" name="agree" id="agree" value="yes">
<label for="agree">I agree to terms</label>

<input type="radio" name="gender" id="male" value="male">
<label for="male">Male</label>
<input type="radio" name="gender" id="female" value="female">
<label for="female">Female</label>
```

### Other Inputs

```html
<input type="color" name="color" value="#3b82f6">
<input type="file" name="attachment" accept=".pdf,.doc,.docx">
<input type="file" name="photos" accept="image/*" multiple>
<input type="hidden" name="userId" value="12345">
```

### Button Inputs

```html
<input type="submit" value="Submit Form">
<input type="reset" value="Reset Form">
<input type="button" value="Click Me" onclick="alert('Clicked!')">
<input type="image" src="submit-btn.png" alt="Submit" width="100">
```

---

## Complete Input Types Reference

| Type | Purpose | Validation |
|------|---------|-----------|
| `text` | Single-line text | — |
| `password` | Masked text | — |
| `email` | Email address | Requires `@` |
| `url` | Web address | Requires protocol |
| `tel` | Phone number | No built-in validation |
| `search` | Search box (with clear X) | — |
| `number` | Numeric input | Only numbers, min/max/step |
| `range` | Slider | min/max/step |
| `date` | Date picker | Valid date |
| `time` | Time picker | Valid time |
| `datetime-local` | Date + time | Valid datetime |
| `month` | Month + year | Valid month |
| `week` | Week + year | Valid week |
| `color` | Color picker | Valid hex color |
| `file` | File upload | accept filter |
| `checkbox` | Multiple selections | — |
| `radio` | Single selection (group) | — |
| `hidden` | Hidden data | — |
| `submit` | Submit button | — |
| `reset` | Reset button | — |
| `button` | Generic button | — |
| `image` | Image submit button | — |

---

## Input Attributes

### Validation Attributes

```html
<input type="text" required>                          <!-- Must be filled -->
<input type="text" minlength="3" maxlength="50">     <!-- Length limits -->
<input type="number" min="1" max="100">               <!-- Value range -->
<input type="number" step="0.01">                     <!-- Value increment -->
<input type="text" pattern="[A-Za-z]{3,}">            <!-- Regex pattern -->
<input type="email" multiple>                          <!-- Multiple emails -->
```

### Display & Behavior Attributes

```html
<input type="text" placeholder="Enter name">          <!-- Hint text -->
<input type="text" value="Default value">             <!-- Pre-filled value -->
<input type="text" readonly>                           <!-- Read-only (submitted) -->
<input type="text" disabled>                           <!-- Disabled (NOT submitted) -->
<input type="text" autofocus>                          <!-- Auto-focus on page load -->
<input type="text" autocomplete="given-name">         <!-- Autocomplete hint -->
<input type="text" tabindex="2">                       <!-- Tab order -->
<input type="text" name="field" id="field">            <!-- Name + ID -->
<input type="text" size="30">                          <!-- Visible width (chars) -->
<input type="text" list="suggestions">                 <!-- Connect to datalist -->
<input type="text" spellcheck="true">                  <!-- Enable spellcheck -->
<input type="text" inputmode="numeric">                <!-- Mobile keyboard hint -->
```

### `readonly` vs `disabled`

| Feature | `readonly` | `disabled` |
|---------|-----------|-----------|
| User can edit | ❌ | ❌ |
| Can receive focus | ✅ | ❌ |
| Included in form data | ✅ | ❌ |
| Visual appearance | Normal | Grayed out |

### `autocomplete` Values

```html
<input type="text" name="name" autocomplete="name">
<input type="email" name="email" autocomplete="email">
<input type="tel" name="phone" autocomplete="tel">
<input type="text" name="address" autocomplete="street-address">
<input type="text" name="city" autocomplete="address-level2">
<input type="text" name="zip" autocomplete="postal-code">
<input type="text" name="cc" autocomplete="cc-number">
```

---

## `<label>`

```html
<!-- Method 1: for/id association (recommended) -->
<label for="email">Email:</label>
<input type="email" id="email" name="email">

<!-- Method 2: Wrapping -->
<label>
  Email:
  <input type="email" name="email">
</label>
```

- Clicking the label focuses its associated input
- **Essential for accessibility** — screen readers read the label
- Always use labels for every form control

---

## `<select>` — Dropdown

```html
<label for="country">Country:</label>
<select id="country" name="country">
  <option value="">-- Select --</option>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="in" selected>India</option>
</select>
```

### Option Groups

```html
<select name="car">
  <optgroup label="European">
    <option value="bmw">BMW</option>
    <option value="audi">Audi</option>
  </optgroup>
  <optgroup label="Japanese">
    <option value="toyota">Toyota</option>
    <option value="honda">Honda</option>
  </optgroup>
</select>
```

### Multi-Select (Listbox)

```html
<select name="languages" multiple size="5">
  <option value="html">HTML</option>
  <option value="css">CSS</option>
  <option value="js" selected>JavaScript</option>
  <option value="py">Python</option>
  <option value="java">Java</option>
</select>
```

---

## `<textarea>`

```html
<label for="message">Message:</label>
<textarea id="message" name="message" rows="5" cols="40" 
  placeholder="Enter your message..." maxlength="500"></textarea>
```

| Attribute | Purpose |
|-----------|---------|
| `rows` | Visible height (lines) |
| `cols` | Visible width (characters) |
| `maxlength` | Max character count |
| `minlength` | Min character count |
| `wrap` | `soft` (default) or `hard` |
| `resize` | CSS: `none`, `vertical`, `horizontal`, `both` |

---

## `<datalist>` — Autocomplete Suggestions

```html
<label for="browser">Browser:</label>
<input type="text" id="browser" name="browser" list="browsers">

<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
  <option value="Edge">
  <option value="Opera">
</datalist>
```

- User can type freely OR select from suggestions
- Connected via `list` attribute on `<input>` matching `id` on `<datalist>`

---

## `<fieldset>` and `<legend>`

```html
<fieldset>
  <legend>Personal Information</legend>
  <label for="fname">First Name:</label>
  <input type="text" id="fname" name="fname"><br><br>
  <label for="lname">Last Name:</label>
  <input type="text" id="lname" name="lname">
</fieldset>

<fieldset>
  <legend>Contact Details</legend>
  <label for="email2">Email:</label>
  <input type="email" id="email2" name="email">
</fieldset>

<!-- Disabled fieldset disables ALL children -->
<fieldset disabled>
  <legend>Locked Section</legend>
  <input type="text" name="locked">
</fieldset>
```

- `<fieldset>` groups related form controls (draws a border)
- `<legend>` provides a caption for the group
- **Accessibility:** Screen readers announce the legend with each control in the group

---

## `<button>` Tag

```html
<button type="submit">Submit</button>
<button type="reset">Reset</button>
<button type="button" onclick="doSomething()">Click Me</button>

<!-- Button with icon -->
<button type="submit">
  <img src="icon.svg" alt="" width="16" height="16"> Submit
</button>
```

### `<button>` vs `<input type="submit">`

| Feature | `<button>` | `<input type="submit">` |
|---------|-----------|------------------------|
| Can contain HTML | ✅ (images, icons, spans) | ❌ (text only) |
| `type` attribute | `submit` (default), `reset`, `button` | Fixed to its type |
| Flexibility | More versatile | Limited |

---

## Form Validation

### Built-in Validation

```html
<form>
  <input type="text" required>                                <!-- Required field -->
  <input type="email" required>                               <!-- Must be valid email -->
  <input type="text" minlength="3" maxlength="20">           <!-- Length constraint -->
  <input type="number" min="18" max="100">                    <!-- Range constraint -->
  <input type="text" pattern="[0-9]{5}" title="5-digit ZIP">  <!-- Regex pattern -->
  <button type="submit">Submit</button>
</form>
```

### Custom Validation Messages

```html
<input type="text" required 
  oninvalid="this.setCustomValidity('Please enter your name')"
  oninput="this.setCustomValidity('')">
```

### CSS Validation States

```css
input:valid { border-color: green; }
input:invalid { border-color: red; }
input:required { border-left: 3px solid blue; }
input:optional { border-left: 3px solid gray; }
input::placeholder { color: #999; }
```

---

## Complete Login Form Example

```html
<form action="/login" method="POST" autocomplete="on">
  <fieldset>
    <legend>Login</legend>
    
    <label for="user">Username:</label>
    <input type="text" id="user" name="username" required 
      autocomplete="username" placeholder="Enter username">
    
    <label for="pwd">Password:</label>
    <input type="password" id="pwd" name="password" required 
      autocomplete="current-password" minlength="8" placeholder="Enter password">
    
    <label>
      <input type="checkbox" name="remember" value="yes"> Remember me
    </label>
    
    <button type="submit">Login</button>
    <button type="reset">Clear</button>
  </fieldset>
</form>
```

---

## Registration Form Example

```html
<form action="/register" method="POST" enctype="multipart/form-data">
  <fieldset>
    <legend>Registration</legend>
    
    <label for="fullname">Full Name:</label>
    <input type="text" id="fullname" name="fullname" required autocomplete="name">
    
    <label for="reg-email">Email:</label>
    <input type="email" id="reg-email" name="email" required autocomplete="email">
    
    <label for="reg-pass">Password:</label>
    <input type="password" id="reg-pass" name="password" required minlength="8"
      pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" 
      title="Must contain 8+ chars with uppercase, lowercase, and number">
    
    <label for="dob">Date of Birth:</label>
    <input type="date" id="dob" name="dob" required max="2010-12-31">
    
    <label>Gender:</label>
    <label><input type="radio" name="gender" value="male" required> Male</label>
    <label><input type="radio" name="gender" value="female"> Female</label>
    <label><input type="radio" name="gender" value="other"> Other</label>
    
    <label for="avatar">Profile Photo:</label>
    <input type="file" id="avatar" name="avatar" accept="image/*">
    
    <label>
      <input type="checkbox" name="terms" required> I agree to the terms
    </label>
    
    <button type="submit">Register</button>
  </fieldset>
</form>
```
