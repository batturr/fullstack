# 01. Fundamentals of Web Development

## What is a Web Application?

A **web application** is a program that runs in a browser and interacts with users over the internet.

- **Program** — A collection of instructions (statements) for the computer
- **Application** — A program that runs on an operating system (e.g., Chrome, VS Code, WhatsApp)
- **Web application** — An application accessed through a web browser (e.g., Gmail, YouTube, Amazon)

---

## Client-Server Architecture

```
┌──────────┐     HTTP Request      ┌──────────┐
│          │  ─────────────────►   │          │
│  Client  │                       │  Server  │
│ (Browser)│  ◄─────────────────   │          │
│          │     HTTP Response     │          │
└──────────┘                       └──────────┘
```

### Client
- A device (desktop, laptop, tablet, phone, Smart TV) used by the end user
- Runs a browser to view and interact with web pages
- Sends **requests** to the server

### Server
- A powerful computer that stores and serves web pages, files, databases
- Receives requests from clients and sends back **responses**
- Types: Web server, application server, database server

### Browser
- Software installed on the client to render web pages
- Parses HTML, CSS, and JavaScript to display output
- Sends HTTP requests and receives HTTP responses

**Major Browsers:**

| Browser | Engine | Developer |
|---------|--------|-----------|
| Chrome | Blink + V8 | Google |
| Firefox | Gecko + SpiderMonkey | Mozilla |
| Safari | WebKit + JavaScriptCore | Apple |
| Edge | Blink + V8 | Microsoft |
| Opera | Blink + V8 | Opera Software |

---

## How the Web Works

### URL (Uniform Resource Locator)

```
https://www.example.com:443/path/page.html?key=value#section
└─┬──┘ └──────┬──────┘└┬─┘└─────┬────────┘└───┬────┘└──┬───┘
scheme      host     port     path          query    fragment
```

| Part | Description |
|------|-------------|
| **Scheme** | Protocol (`http`, `https`, `ftp`) |
| **Host** | Domain name or IP (`www.example.com`) |
| **Port** | Server port (`:443` for HTTPS, `:80` for HTTP — usually hidden) |
| **Path** | Location of the resource on the server |
| **Query** | Key-value parameters (`?key=value&key2=value2`) |
| **Fragment** | Scroll-to section in the page (`#section`) |

### DNS (Domain Name System)

Translates domain names to IP addresses:

```
www.google.com  →  DNS  →  142.250.190.4
```

### HTTP (HyperText Transfer Protocol)

- Protocol that defines rules for client-server communication
- Defines **request format** and **response format**
- HTTPS = HTTP + SSL/TLS encryption (secure)

### HTTP Request

```
GET /index.html HTTP/1.1
Host: www.example.com
Accept: text/html
```

| Part | Description |
|------|-------------|
| Method | `GET`, `POST`, `PUT`, `DELETE`, `PATCH` |
| Path | Resource being requested |
| Headers | Metadata (host, content type, auth) |
| Body | Data sent with POST/PUT requests |

### HTTP Response

```
HTTP/1.1 200 OK
Content-Type: text/html

<html>...</html>
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | OK | Successful request |
| `201` | Created | Resource created |
| `301` | Moved Permanently | Redirect |
| `304` | Not Modified | Cached version is fine |
| `400` | Bad Request | Invalid request |
| `401` | Unauthorized | Not logged in |
| `403` | Forbidden | No permission |
| `404` | Not Found | Page doesn't exist |
| `500` | Internal Server Error | Server-side error |

---

## Web Technologies

| Layer | Purpose | Technologies |
|-------|---------|-------------|
| **Structure** | Page content & layout | HTML |
| **Presentation** | Styling & design | CSS |
| **Behavior** | Interactivity & logic | JavaScript |
| **Backend** | Server-side processing | Node.js, Python, Java, PHP |
| **Database** | Data storage | MySQL, MongoDB, PostgreSQL |

### Frontend vs Backend

| Frontend (Client-side) | Backend (Server-side) |
|----------------------|---------------------|
| Runs in browser | Runs on server |
| HTML, CSS, JavaScript | Node.js, Python, Java |
| User sees and interacts | Handles logic, DB, auth |
| React, Angular, Vue | Express, Django, Spring |

---

## Browser Rendering Pipeline

```
HTML  →  DOM Tree
                  ↘
                    Render Tree  →  Layout  →  Paint  →  Composite  →  Screen
                  ↗
CSS   →  CSSOM
```

1. **Parse HTML** → Build DOM (Document Object Model) tree
2. **Parse CSS** → Build CSSOM (CSS Object Model)
3. **Render Tree** — Combine DOM + CSSOM (only visible elements)
4. **Layout** — Calculate position and size of each element
5. **Paint** — Fill in pixels (color, borders, shadows)
6. **Composite** — Combine layers and display on screen

---

## Developer Tools

Open in any browser: **F12** or **Ctrl+Shift+I** / **Cmd+Option+I**

| Tab | Purpose |
|-----|---------|
| **Elements** | Inspect and edit HTML/CSS live |
| **Console** | Run JavaScript, view errors |
| **Network** | See all HTTP requests/responses |
| **Sources** | View and debug source code |
| **Application** | Storage, cookies, service workers |
| **Performance** | Record and analyze page load |
| **Lighthouse** | Audit performance, accessibility, SEO |
