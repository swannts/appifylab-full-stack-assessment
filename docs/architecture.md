# System Architecture

This document describes the design principles and structure of the application.

## System Overview

The system is split into three main parts:

1.  **Frontend**: A Next.js (React) application configured with the App Router and Tailwind CSS, utilizing SSR (Server-Side Rendering) and CSR (Client-Side Rendering) for optimal user experience.
2.  **Backend**: A NestJS TypeScript framework for building efficient and scalable server-side applications.
3.  **Database**: PostgreSQL managed using Prisma ORM.

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Next.js    │◄───────►│    NestJS    │◄───────►│  PostgreSQL  │
│  (Frontend)  │   HTTP  │   (Backend)  │ Prisma  │  (Database)  │
└──────────────┘         └──────────────┘         └──────────────┘
```
