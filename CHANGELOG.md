# Changelog

All notable changes to the 19 JHR BN NCC Portal will be documented in this file.

## [2.0.0] - 2026-08-03

### Added
- **Cadet Dashboard Integration**: Complete Cadet portal featuring personal profile, attendance tracking, uniform sizes, leave applications, ID card generation, practice quizzes, and verified certificate downloads.
- **Officer Administration Dashboard**: Batch Cadet enrollment verification, status management, attendance log entry, and CSV / Excel report generation.
- **AI Cadre Assistant**: Server-proxied Gemini AI integration for instant NCC drill manual and weapon training lookups.
- **Interactive Syllabus & Materials**: Detailed 'A', 'B', and 'C' Certificate syllabus guides with downloadable PDFs.
- **Digital ID Card Generator**: Printable cadet ID card with QR code and battalion credentials.

### Fixed
- Fixed Cadet dashboard logout action binding in App.tsx.
- Optimized bundle build with esbuild single CommonJS output (`dist/server.cjs`).
- Hardened server-side API proxy routes for Gemini AI requests.
