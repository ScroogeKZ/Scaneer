# Retail Product Data Collection Application

## Overview

This is a mobile-first retail product data collection web application designed for Russian-speaking users. The application enables users to scan product barcodes using their mobile device camera, input product details through an optimized form interface, and maintain a searchable history of scanned products. Built with a React frontend and Express backend, it leverages PostgreSQL for persistent data storage and follows Material Design principles for an efficient mobile scanning workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing

**UI Component System:**
- Shadcn/ui components built on Radix UI primitives providing accessible, customizable components
- Tailwind CSS for utility-first styling with custom theme configuration
- Material Design principles adapted for mobile-first retail scanning workflow

**State Management:**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- React Hook Form with Zod validation for complex form state and validation logic
- Local component state using React hooks for UI-specific concerns

**Key Design Decisions:**
- **Mobile-First Approach:** All interactions optimized for single-hand phone operation with large touch targets and clear visual hierarchy
- **Component Library Choice:** Shadcn/ui chosen over pre-built libraries for flexibility and customization while maintaining accessibility through Radix UI
- **Russian Localization:** Full Cyrillic character support with Russian-language labels, error messages, and interface text

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server with middleware-based request processing
- TypeScript for type safety across server codebase
- ESM module system for modern JavaScript practices

**Database Layer:**
- PostgreSQL as the relational database (via Neon serverless)
- Drizzle ORM for type-safe database queries and schema management
- Connection pooling through @neondatabase/serverless for efficient resource usage

**API Design:**
- RESTful API endpoints following standard HTTP methods
- JSON request/response format for all API communications
- Zod schema validation for request payload validation before database operations

**Data Storage Pattern:**
- Repository pattern implemented through `DatabaseStorage` class abstracting database operations
- Single `products` table storing barcode, name, price, category, unit of measure, and timestamp
- UUID primary keys generated server-side for unique product identification

**Key Architectural Choices:**
- **Serverless PostgreSQL:** Neon database chosen for zero-config scaling and connection pooling, reducing infrastructure management overhead
- **Type-Safe ORM:** Drizzle selected for its TypeScript-first approach and lightweight runtime, generating types directly from schema
- **Schema-Driven Validation:** Shared schema definitions between client and server using drizzle-zod ensuring consistent validation rules

### External Dependencies

**Database:**
- Neon Serverless PostgreSQL - managed database service with WebSocket-based connections
- Connection pooling configured for efficient resource utilization in serverless environment

**Third-Party Libraries:**
- **html5-qrcode:** Browser-based barcode/QR code scanning using device camera with support for flashlight control on supported devices
- **date-fns:** Date formatting and manipulation for timestamp display
- **nanoid:** Unique ID generation for client-side operations

**Development Tools:**
- **Replit Plugins:** Development environment integration including error overlay, cartographer, and dev banner for enhanced DX
- **TSX:** TypeScript execution for development server with watch mode

**UI Component Dependencies:**
- **Radix UI:** Headless component primitives (@radix-ui/react-*) for accessible UI foundations
- **Lucide React:** Icon library providing consistent iconography throughout the application
- **class-variance-authority:** Type-safe component variant management
- **tailwind-merge & clsx:** Utility for merging Tailwind classes with conflict resolution

**Key Integration Points:**
- Camera API accessed through html5-qrcode for barcode scanning with fallback to manual entry
- WebSocket connections for PostgreSQL via Neon's serverless driver enabling connection pooling
- Google Fonts CDN for Roboto font family supporting Cyrillic character sets