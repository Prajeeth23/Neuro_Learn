# NeuroLearn Tech Stack

A detailed overview of the technologies, frameworks, and libraries used in the NeuroLearn platform.

---

## 🏗️ Core Architecture
- **Monorepo Structure**: Separate handles for `client` (Frontend) and `server` (Backend).
- **Environment Management**: Centralized `.env` for API keys and configuration.

---

## 🎨 Frontend (Client)
The frontend is a modern Single Page Application (SPA) built for performance and visual excellence.

### **Frameworks & Core Libraries**
- **React.js (v18.2.0)**: The core UI library.
- **Vite (v5.0.0)**: High-speed build tool and dev server.
- **React Router Dom (v7.13.1)**: Handles all client-side navigation.

### **Styling & UI Components**
- **Tailwind CSS (v3.4.19)**: Atomic CSS framework for rapid UI development and "Prism Luxe" aesthetics.
- **Framer Motion (v12.38.0)**: Powerful animation engine for smooth transitions and hover effects.
- **Lucide React**: Beautifully crafted icons for all dashboard elements.
- **clsx & tailwind-merge**: Utilities for dynamic class management.

### **Data Visualization**
- **Recharts (v3.8.0)**: Composable charting library for the Analytics and Progress dashboards.

---

## ⚙️ Backend (Server)
A robust RESTful API built on the Node.js ecosystem.

### **Frameworks & Middleware**
- **Express.js (v5.2.1)**: The backbone web framework for API routing.
- **CORS**: Cross-Origin Resource Sharing middleware.
- **Morgan**: HTTP request logger for development and debugging.
- **Dotenv**: Secure environment variable management.

### **Security & Auth**
- **JSON Web Tokens (JWT)**: Secure stateless authentication.
- **Supabase Auth Integration**: Managed authentication bridge.

---

## 🗄️ Database & Cloud Services
- **Supabase**: 
  - **PostgreSQL**: Relational database for storing user progress, courses, and quiz results.
  - **Supabase Storage**: Managed file storage for learning materials.
  - **Supabase Client**: Direct database interaction via `@supabase/supabase-js`.

---

## 🧠 AI & Logic Engines
- **Groq SDK**: High-speed inference for AI Tutor and Content Analysis (Llama-3/Mixtral).
- **Gemini Vision**: Used for Advanced OCR (extracting text from images and layouts).
- **Adaptive Learning Engine**: Proprietary logic in `adaptiveEngine.js` for dynamic leveling and content filtering.

---

## 📄 File Processing
Specialized libraries for parsing user-uploaded materials in the **Personalized Study Node**:
- **Mammoth**: DOCX to HTML/Text conversion.
- **PDF-parse**: Extracting raw content from PDF documents.
- **Multer**: Middleware for handling `multipart/form-data` uploads.

---

## 🚀 Deployment
- **Vercel**: Edge-optimized hosting for both the React frontend and Node.js serverless functions.
