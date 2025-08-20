# 🏢 Asset Management Backend

A **backend-only Asset Management API** built with **Node.js, Express, Prisma, and PostgreSQL**.  
This service provides secure and scalable endpoints for managing organizational assets, departments, and request logs, complete with **role-based access control (RBAC)** and **audit logging**.

---

## 🚀 Features
- 🔑 **Authentication & Authorization** (JWT-based with RBAC)  
- 📦 **Asset Management** (create, update, delete, assign, move)  
- 🏬 **Department Management** (track assets per department)  
- 📝 **Request & Audit Logs** (asset lifecycle history)  
- ☁️ **Cloud Image Uploads** (via Multer/Cloudinary)  
- ⚡ **Error Handling & Validation** (Yup + Express middleware)  
- 📊 **Pagination & Filtering** for logs and assets  

---

## 🛠️ Tech Stack
- **Node.js** + **Express** – REST API framework  
- **Prisma ORM** – type-safe database access  
- **PostgreSQL** – relational database  
- **JWT** – authentication & authorization  
- **Multer / Cloudinary** – asset image uploads  

---

## 📌 Setup
```bash
# Clone repo
[git clone https://github.com/yourusername/asset-management-backend.git
# Install dependencies
npm install

# Run development server
npm run dev
