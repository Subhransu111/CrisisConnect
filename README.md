# CrisisConnect

A real-time disaster relief coordination platform connecting victims with verified nearby volunteers during emergencies.

Not a replacement for emergency services. For life-threatening emergencies call 112 immediately.

---

## Live Demo

Frontend: https://crisis-connect-nine.vercel.app  
Backend: https://3.110.168.223.nip.io

---

## Tech Stack

Frontend — React, Tailwind CSS, React Router, Framer Motion, React Three Fiber, React Leaflet, Socket.io Client, Axios, Recharts, React Hook Form, Sonner

Backend — Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Socket.io, Nominatim

Hosting — Vercel (frontend), AWS EC2 + Nginx + PM2 (backend), MongoDB Atlas (database)

---


##  Features

###  For Victims / Citizens
- **Quick Emergency Report** — No login required. Report in under 60 seconds
- **Detailed Incident Reporting** — For registered users with full tracking
- **Live Volunteer Tracking** — Track volunteer location in real time like Swiggy/Zomato
- **Emergency Message Generator** — One-click copy/SMS emergency alert with location
- **Case ID Tracking** — Track your reported incident status

###  For Volunteers
- **Nearby Cases Feed** — Cases sorted by severity, proximity, and skill match
- **Multi-Category Accept** — Accept specific help categories (rescue, medical, food, etc.)
- **Live Status Updates** — Update status: Accepted → On the Way → Reached → Completed
- **Live Location Sharing** — Share real-time location with victims via Socket.io
- **Availability Toggle** — Set yourself as Available / Busy / Offline

###  For Admins / Coordinators
- **Live Dashboard** — Real-time incident and volunteer overview
- **Incident Verification** — Verify, reject, or mark duplicate incidents
- **Analytics Charts** — Incidents by type, severity, and status
- **Live Map** — See all active incidents on an interactive map
- **Volunteer Management** — Monitor all volunteers and their availability

---

## Run Locally

Clone the repo:
```bash
git clone https://github.com/Subhransu111/CrisisConnect.git
cd crisisconnect
```

Setup backend:
```bash
cd Backend
npm install
```

Create `Backend/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

Setup frontend:
```bash
cd Frontend
npm install
```

Create `Frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Frontend runs on http://localhost:5173  
Backend runs on http://localhost:5000

---
