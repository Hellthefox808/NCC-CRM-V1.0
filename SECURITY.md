# Security Policy

## Reporting Security Vulnerabilities

If you discover a potential security vulnerability within the 19 JHR BN NCC Portal, please do NOT create a public issue. Instead, report it directly to the system administrators or the Associate NCC Officer (ANO) at Sarala Birla University.

### Security Principles Applied

1. **Server-Side API Keys**: Third-party keys and AI credentials (including `GEMINI_API_KEY`) are kept exclusively on the server in `process.env`.
2. **Input Sanitization**: All incoming payload parameters are validated and sanitized server-side.
3. **No Key Exposure**: The client application does not embed or leak runtime environment credentials into Vite builds.
4. **Data Isolation**: Personnel and cadet data endpoints require verified sessions.
