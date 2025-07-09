# URL Shortener Microservice & Centralized Logging Middleware

## 1. Logging Middleware (Reusable Logging Package)

### Overview

This is a reusable and framework-agnostic **logging middleware** written in JavaScript. It is designed to capture key application lifecycle events (info, warnings, errors, debug details) and forward them to a **centralized logging server** via a secured HTTP API.

It supports:

* `stack`: backend or frontend
* `level`: debug, info, warn, error, fatal
* `package`: origin of log (e.g., `service`, `middleware`, `controller`, etc.)

The logging middleware is intended to be reused across multiple projects, including this URL shortener microservice, and can be seamlessly integrated into any Node.js app.

### Usage Example

```js
import { Log } from 'logger-middleware';

await Log("backend", "info", "service", "Short URL created successfully");
await Log("backend", "error", "handler", "Failed to redirect: shortcode expired");
```

### Environment Configuration

The middleware requires the following `.env` variables in your consuming app:

```bash
LOGGING_API_URL=http://20.244.56.144/evaluation-service/logs
ACCESS_TOKEN=<your-access-token>
```

These values are used to make secure API calls to the logging service.

---

## 2. URL Shortener Microservice

### Overview

A RESTful microservice built with **Node.js (Express)** that enables:

* Shortening long URLs with optional **custom shortcodes**
* **Automatic expiration** (default 30 mins)
* **Click analytics** with referrer, timestamp, and geolocation (coarse-grained)
* **Redirection** with expiry enforcement
* **Comprehensive logging** of all operations through the logging middleware

This service is suitable for single-instance usage, developer assessments, or as a base for scalable backend services.

---

### API Endpoints

#### `POST /shorturls`

Creates a shortened URL.

##### Request Body (JSON)

```json
{
  "url": "https://example.com/very/long/link",
  "validity": 60,
  "shortcode": "custom123"
}
```

* `url` (string, required): Original long URL (must be valid format)
* `validity` (integer, optional): Expiry time in minutes (defaults to 30)
* `shortcode` (string, optional): Custom shortcode (must be unique and alphanumeric)

##### Response (201 Created)

```json
{
  "shortLink": "http://localhost:3000/custom123",
  "expiry": "2025-01-01T00:30:00.000Z"
}
```

---

#### `GET /:shortcode`

Redirects to the original long URL if not expired.

##### Example Request

```http
GET http://localhost:3000/custom123
```

* If valid and not expired, responds with `302 Found` and redirects.
* If expired or invalid, responds with error status (e.g., `404` or `410`).

---

#### `GET /shorturls/:shortcode`

Retrieves statistics for a shortened URL.

##### Example Request

```http
GET http://localhost:3000/shorturls/custom123
```

##### Response (200 OK)

```json
{
  "originalUrl": "https://example.com/very/long/link",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "expiry": "2025-01-01T00:30:00.000Z",
  "totalClicks": 3,
  "clickData": [
    {
      "timestamp": "2025-01-01T00:05:00.000Z",
      "referrer": "https://twitter.com",
      "geo": "IN"
    },
    {
      "timestamp": "2025-01-01T00:10:00.000Z",
      "referrer": "Direct",
      "geo": "US"
    }
  ]
}
```

---

### Project Structure

```
├── index.js                # Entry point
├── routes/shorten.js       # Route definitions
├── services/shortener.js   # Core business logic
├── utils/validators.js     # Input validation functions
├── middleware/             # Integration with external logger
│   └── logger.js
├── .env                    # Environment variables
├── Dockerfile              # Containerization config
└── README.md               # Project documentation
```

---

### Running Locally

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root of your project:

```env
LOGGING_API_URL=http://20.244.56.144/evaluation-service/logs
ACCESS_TOKEN=<your-access-token>
```

3. Start the server:

```bash
npm run dev
```

---

### Running with Docker

1. Build the image:

```bash
docker build -t url-shortener .
```

2. Run the container:

```bash
docker run -p 3000:3000 \
  -e LOGGING_API_URL=http://20.244.56.144/evaluation-service/logs \
  -e ACCESS_TOKEN=<your-access-token> \
  url-shortener
```

---

### Logging Examples (via middleware)

| Scenario                       | Stack   | Level | Package | Message                                        |
| ------------------------------ | ------- | ----- | ------- | ---------------------------------------------- |
| On successful short URL create | backend | info  | service | `Short URL created for https://example.com`    |
| On shortcode conflict          | backend | error | handler | `Shortcode already in use: custom123`          |
| On DB failure                  | backend | fatal | db      | `Failed to retrieve shortcode due to DB issue` |
| On redirect                    | backend | info  | route   | `Redirected to original URL successfully`      |
| On expiry                      | backend | warn  | handler | `Shortcode custom123 has expired`              |

---

### Notes

* No user authentication is required — assume requests come from pre-authorized sources.
* The service is stateless and designed for in-memory or pluggable persistent storage.
* Logging is a core feature and should be integrated across **routes, services, handlers, and DB access**.

