# Product Modules

## Supported Roles

Super Admin, College Admin, Principal, HOD, Faculty, Lab Assistant, Class Teacher, Student, and Parent.

## Implemented Foundations

- Multi-college tenancy via `college_id`.
- Academic structure: academic years, courses, departments, branches, divisions, batches, subjects.
- Attendance: sessions, records, status set, locking, audit logs, QR/OTP/RFID/biometric/geolocation-ready mode field.
- Directory: students, faculty, parents, departments.
- Timetable: slots, rooms, lab flag, faculty allocation.
- Leave, holidays, documents, assignments, notifications, reports.
- Billing: subscriptions, invoices, payments.
- Operations: settings, support tickets, audit logs, activity logs, sessions.

## Next Implementation Milestones

- Add granular CRUD screens for each module.
- Add refresh-token rotation and device management.
- Add export workers for PDF, Excel, and CSV.
- Add offline attendance sync queue with Redis-backed reconciliation.
- Add storage provider adapters for Cloudinary and S3.
- Add notification providers for email, SMS, WhatsApp, and push.
