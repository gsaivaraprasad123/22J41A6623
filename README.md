# URL Shortener Microservice with Logging Middleware

## Project Overview

This project consists of two main components:

1. **URL Shortener Microservice**  
   A RESTful API service built with Node.js and Express that allows users to create shortened URLs with optional custom shortcodes and expiration times. The service supports URL redirection and retrieval of detailed click statistics including timestamps, referrers, and geolocation data.  
   The service enforces shortcode uniqueness and handles errors gracefully, providing meaningful HTTP status codes and JSON responses.

2. **Logging Middleware Package**  
   A reusable logging utility implemented as a standalone Node.js package. This middleware sends structured log messages asynchronously to a centralized evaluation server via an authenticated API. It supports multiple log levels (debug, info, warn, error, fatal) and allows specification of the application stack and package source for each log.  
   The logging middleware is designed for easy integration with both backend and frontend applications.

## Key Features

- **URL Shortening** with optional custom shortcodes and default 30-minute expiration
- **Global uniqueness** of shortcodes enforced
- **Redirect handling** with expiry checks
- **Comprehensive statistics** tracking clicks with metadata (timestamp, referrer, geo)
- **Robust error handling** with descriptive JSON responses and HTTP status codes
- **Centralized logging** of all significant events including successes, warnings, and errors
- **Authentication-secured logging API** integration using Bearer tokens
- **Modular codebase** with separation of concerns for easy maintenance and extensibility

## API Endpoints (URL Shortener)

- `POST /shorturls`  
  Create a new shortened URL  
  Request body parameters:  
  - `url` (string, required)  
  - `validity` (integer, optional, minutes, defaults to 30)  
  - `shortcode` (string, optional)  
  Response includes shortened URL and expiry timestamp.

- `GET /:shortcode`  
  Redirect to the original URL if valid and not expired.

- `GET /shorturls/:shortcode`  
  Retrieve usage statistics for a given shortcode.

## Logging Middleware Usage

- Import the `Log` function from the logging middleware package.
- Invoke `Log(stack, level, package, message)` with appropriate parameters to send logs.
- All logs are sent to the evaluation server with authorization using a Bearer token configured via environment variables.

## Environment Configuration

Both projects use environment variables to configure critical settings:

- `LOGGING_API_URL` — Logging server endpoint URL  
- `ACCESS_TOKEN` — Bearer token for logging API authentication

## Running the Projects

1. **Logger Middleware**  
   No server to run; this is a reusable package imported by the URL Shortener project.

2. **URL Shortener Microservice**  
   - Ensure environment variables are set properly in `.env`.  
   - Run the service with `npm run dev` or equivalent.  
   - Use provided API endpoints to create short URLs and access analytics.

## Notes

- The logging middleware ensures all application events are traceable and helps in troubleshooting.  
- The microservice assumes pre-authorized access and does not implement user authentication.  
- The project uses in-memory or configured persistent storage abstracted behind a global `db` interface.

