# MAFFENG Work Order Management Dashboard

## Overview
The MAFFENG Work Order Management Dashboard is an intelligent system designed for engineering teams. Its primary purpose is to streamline maintenance tracking, facilitate advanced data import, and provide comprehensive reporting capabilities. The project aims to enhance collaboration within engineering teams by offering a robust and intuitive platform for managing work orders and related activities.

## User Preferences
- Language: Portuguese (BR) for UI text
- Communication: Clear, concise technical explanations
- Code Style: TypeScript with strict typing
- Development Approach: Incremental improvements with working demos

## System Architecture
The project is built with a clear separation of concerns, featuring a React/TypeScript frontend and an Express.js/TypeScript backend. UI/UX decisions prioritize a modern, clean, responsive, and professional aesthetic, utilizing Shadcn/ui and Tailwind CSS for components and styling. The design incorporates a harmonized color palette, modern CSS components with gradients and subtle shadows, and responsive layouts that adapt to various screen sizes. Key visual elements include redesigned KPI cards with rounded corners and modern typography, enhanced technician performance displays, and a redesigned recent activity timeline. Technical implementations leverage TanStack Query for state management and Drizzle ORM for database interactions. Core features include comprehensive CMMS functionalities such as asset management, preventive maintenance scheduling, and inventory control, all integrated with a unified navigation system and real-time WebSocket support.

## External Dependencies
- **Frontend**: React, TypeScript, Vite, Shadcn/ui, Tailwind CSS, TanStack Query
- **Backend**: Express.js, TypeScript, Drizzle ORM, Zod (for input validation)
- **Database**: PostgreSQL
- **Real-time**: WebSockets
- **Authentication**: Mock implementation (to be replaced with JWT-based system)