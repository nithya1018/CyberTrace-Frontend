# 🔐 CyberTrace – Digital Forensics Case Management System

A full-stack cybersecurity application designed to streamline digital forensic investigations through centralized case management, investigator coordination, investigation notes, findings management, and audit tracking.

CyberTrace provides a role-based interface for administrators and investigators, helping organize investigation workflows and manage case-related information through a centralized platform.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Backend Configuration](#-backend-configuration)
- [Demo Login](#-demo-login)
- [Security Considerations](#-security-considerations)
- [Future Enhancements](#-future-enhancements)
- [Developer](#-developer)

---

## 🎯 Overview

Digital forensic investigations involve organizing cases, managing investigation activities, documenting findings, and maintaining records of relevant actions.

CyberTrace aims to simplify this workflow by providing a centralized web application for managing forensic investigation cases and coordinating investigators.

The application combines a React-based frontend, a Spring Boot backend, and a MySQL database to support communication between the user interface, application services, and persistent data storage.

The system uses role-based access to separate administrative functions from investigator activities.

## ✨ Key Features

### 🔑 Authentication
- User login and authentication.
- Role-based access to application features.
- Protected application pages according to user permissions.

### 📁 Case Management
- View and manage investigation cases.
- Organize case-related information.
- Support investigation workflow management.

### 👥 Investigator Management
- Create and manage investigator accounts through administrative functionality.
- View registered users.
- Enable or disable user accounts, subject to permissions.

### 🔎 Investigation Findings
- Record and manage findings associated with investigation cases.
- Organize investigation-related information.

### 📝 Investigation Notes
- Maintain notes associated with cases.
- Support documentation of investigation activities.

### 📋 Audit Tracking
- Record relevant application activities.
- Support monitoring of user actions and administrative operations.

### 🛡️ Administrative Dashboard
- Access user management features.
- Manage investigator accounts.
- Access administrative functions according to assigned permissions.

---

## 👤 User Roles

CyberTrace supports different user roles with distinct responsibilities.

| Role | Responsibilities |
|---|---|
| Administrator | User management, investigator management, and administrative operations. |
| Investigator | Access assigned cases and perform permitted investigation activities. |

Access to individual features depends on the permissions enforced by the backend.

---

## 🛠️ Technology Stack

### Frontend
- **React.js** – Component-based user interface.
- **JavaScript** – Application functionality.
- **Vite** – Development server and build tooling.
- **Axios** – HTTP communication with backend APIs.
- **HTML5** – Application structure.
- **CSS3** – Styling and layout.

### Backend
- **Java** – Backend programming language.
- **Spring Boot** – REST API development.
- **Spring Security** – Authentication and authorization.
- **Maven** – Dependency management and build automation.

### Database
- **MySQL** – Persistent storage for application data.

---

## 🏗️ Project Architecture

CyberTrace follows a frontend–backend architecture.

```text
┌─────────────────────────────┐
│          User               │
│   Administrator /           │
│       Investigator          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       React Frontend        │
│                             │
│   Components and Pages      │
│   Forms and Dashboards      │
│   Axios API Requests        │
└──────────────┬──────────────┘
               │
               │ HTTP / REST API
               ▼
┌─────────────────────────────┐
│      Spring Boot Backend    │
│                             │
│   Authentication            │
│   Authorization             │
│   Business Logic            │
│   Case and User Management  │
└──────────────┬──────────────┘
               │
               │ Database Operations
               ▼
┌─────────────────────────────┐
│          MySQL              │
│                             │
│   Users and Roles           │
│   Cases and Findings        │
│   Investigation Records     │
└─────────────────────────────┘
```

The frontend sends HTTP requests to the Spring Boot backend. The backend processes requests, applies authorization rules, and interacts with the MySQL database when required.

---

## 📂 Project Structure

The frontend repository follows a structure similar to the one below. The exact files may vary depending on the current implementation.

```text
CyberTrace-Frontend/
│
├── public/
│
├── src/
│   ├── api/
│   │   └── axios.js
│   │
│   ├── assets/
│   │
│   ├── components/
│   │
│   ├── pages/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

### Repository Links

- **Frontend:** [CyberTrace-Frontend](https://github.com/nithya1018/CyberTrace-Frontend)
- **Backend:** [CyberTrace-Backend](https://github.com/nithya1018/CyberTrace-Backend)

---

## 🚀 Getting Started

Follow these instructions to run the frontend locally.

### Prerequisites

Install the following software:

- Node.js
- npm
- Git

The Spring Boot backend and MySQL database must also be configured and running for features that require server communication.

### Step 1: Clone the Repository

```bash
git clone https://github.com/nithya1018/CyberTrace-Frontend.git
```

### Step 2: Navigate to the Project Directory

```bash
cd CyberTrace-Frontend
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs the frontend dependencies defined in `package.json`.

### Step 4: Configure the Backend API URL

Ensure that the Axios configuration points to the correct backend address.

For local development, the backend may use:

```text
http://localhost:8080
```

The actual API base URL depends on your backend configuration.

If the project uses environment variables for API configuration, create a local `.env` file using the variable name expected by the existing frontend code.

This project reads `VITE_API_URL` from the Vite build environment. Set it to the backend URL ending in `/api`. For example:

```env
VITE_API_URL=http://localhost:8080/api
```

For Vercel, add `VITE_API_URL` under the project's Environment Variables, then redeploy so the value is included in the frontend build. The repository includes a Vercel rewrite so client-side routes such as `/login` continue to load on refresh.

### Step 5: Start the Frontend

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

The default URL is usually:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

### Step 6: Log In

Once the frontend, backend, and database are running, open the application and log in using a valid account.

The available pages and actions depend on the authenticated user's role and permissions.

---

## ⚙️ Backend Configuration

CyberTrace requires its backend for authentication, case management, user management, and database operations.

### Backend Repository

https://github.com/nithya1018/CyberTrace-Backend

### Backend Prerequisites

- Java JDK
- Maven or the included Maven Wrapper
- MySQL

### General Setup

1. Clone the backend repository.
2. Configure the MySQL database.
3. Set the required database connection properties.
4. Configure authentication-related secrets and environment variables.
5. Start the Spring Boot application using the project's Maven configuration.
6. Ensure the frontend API URL matches the running backend address.

The backend must be configured according to its actual application properties and environment variables.

**Security note:** Never commit database passwords, JWT signing secrets, private keys, or other sensitive configuration values to a public repository.

---

## 🔐 Demo Login

CyberTrace provides role-based access for administrative and investigation workflows.

### Administrator Account

The administrator account is intended for evaluating features such as:

- User management.
- Investigator account management.
- Case management.
- Administrative operations.

### Faculty Evaluation Instructions

1. Open the deployed application, if available.
2. Navigate to the login page.
3. Enter the administrator credentials shared privately for evaluation.
4. Click **Login**.
5. Explore the available administrative features.

**Demo credentials will be shared separately with the evaluating faculty.**

The administrator account must exist in the database used by the running application. A local account will not automatically exist in a separately deployed database.

---

## 🛡️ Security Considerations

CyberTrace is developed as an academic cybersecurity project.

Security considerations include:

- Authentication and role-based authorization.
- Restricted access to administrative functionality.
- Separation of frontend presentation and backend business logic.
- Server-side validation and authorization for protected operations.
- Careful handling of investigation records and user information.
- Protection of database credentials and authentication secrets.

The frontend alone must not be treated as a security boundary. Access restrictions must also be enforced by the backend.

Before production use, additional security testing, deployment hardening, secure secret management, and forensic evidence integrity controls should be reviewed.

---

## 🔮 Future Enhancements

Potential future improvements include:

- Cryptographic hash verification for digital evidence.
- Evidence chain-of-custody tracking.
- Advanced forensic investigation reports.
- Improved audit monitoring and reporting.
- Automated alerts for suspicious activities.
- Enhanced dashboard analytics.
- More detailed investigation timelines.
- Additional security validation and testing.

These are potential enhancements and may not be implemented in the current version.

---

## 🎓 Project Purpose

CyberTrace demonstrates the development of a full-stack cybersecurity application integrating a modern web interface, REST APIs, backend authentication, role-based authorization, and relational database management.

The project focuses on organizing digital forensic case information and supporting structured investigation workflows.

---

## 👩‍💻 Developer

**GitHub:** [nithya1018](https://github.com/nithya1018)

**LinkedIn:** [LinkedIn Profile](https://linkedin.com/in/nithya1018)

---

**CyberTrace — Organizing Investigations. Supporting Digital Forensics.**
