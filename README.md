# Security & Safety System

This repository contains the initial foundation for a safety and attendance management system for employees, with:
- attendance and geofence validation
- shifts and working schedules
- leave requests
- violations
- incidents and safety reports
- announcements and push notifications
- role-based access control
- audit logs

## Current status

This first phase establishes the backend API foundation and database schema.

## Structure

- apps/api: NestJS backend API
- apps/mobile: mobile app placeholder
- apps/web-admin: admin web placeholder

## Getting started

### Backend API

```bash
cd apps/api
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```

Then login via:

POST /auth/login

Example body:

```json
{
  "username": "hassan",
  "password": "StrongPass!123"
}
```

## Main roles

- super_admin
- admin
- supervisor
- hr
- safety_officer
- employee

## Notes

- The super admin is the primary system owner.
- Only the primary system manager can send announcements and manage system-level roles.
- Additional admin accounts can be added later with scoped permissions.
