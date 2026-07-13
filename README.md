# NyaySetu

NyaySetu is a next-generation court case management system designed to streamline legal proceedings, improve transparency, and tackle case pendency. It provides a secure, role-based dashboard for Court Staff, Admins, and Parties to track case statuses, hearings, and documents.

## Features

- **Role-Based Dashboards**: Tailored interfaces for Admins, Court Staff, and Parties/Lawyers.
- **Pendency Tracking Engine**: Automatically scores cases based on age, inactivity, and adjournments to prioritize delayed cases.
- **Groq AI Integration**: Explains complex legal case facts and status updates in plain English for citizens.
- **Secure Authentication**: JWT-based authentication with role-based access control and strict password hashing.
- **Timeline Ledger**: A detailed, immutable ledger of all case activities, hearings, and status changes.
- **Modern UI**: A premium, highly interactive interface featuring subtle animations (GSAP) and a responsive design.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, GSAP, Lucide React
- **Backend**: Next.js API Routes (Node.js & Edge Runtimes)
- **Database**: MongoDB & Mongoose
- **AI Integration**: Groq API (LLaMA3)
- **Authentication**: JWT (jose & jsonwebtoken), bcryptjs

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Configure your `.env.local` variables (`MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GROQ_API_KEY`)
4. Run `npm run dev` to start the development server.

## License

This project is open-source and available under the MIT License.
