# 📌 MERN MediaHub

A **MERN stack web application** that allows **video streaming, PDF viewing, audio recording, and WebGL hosting** using **MongoDB GridFS**.

## 🚀 Features
✅ Upload and stream **videos** directly  
✅ Upload and view **PDFs** (with multi-page support)  
✅ **Record, play, rename, and delete** audio files  
✅ Host and serve **WebGL files**  
✅ Uses **MongoDB GridFS** for media storage  

---

## 📌 Installation & Setup

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/yourusername/mern-mediahub.git
cd mern-mediahub
```

### **2️⃣ Install Dependencies**
#### **Backend**
```bash
cd backend
npm install
```

#### **Frontend**
```bash
cd frontend
npm install
```

---

## 🔧 **Backend Setup (Node.js + Express + MongoDB)**
### **1️⃣ Environment Variables**
Create a **.env** file in the `backend` folder with the following:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern_mediahub
```

### **2️⃣ Start the Backend Server**
```bash
npm run dev
```
Server will run on **http://localhost:5000/**.

---

## 🌐 **Frontend Setup (React)**
### **1️⃣ Start the Frontend**
```bash
npm start
```
Frontend will run on **http://localhost:3000/**.

---

## 📂 API Endpoints

### **1️⃣ Video Streaming API** 🎥  
- **Upload Video:** `POST /api/videos/upload`  
- **Stream Video:** `GET /api/videos/:filename`  

### **2️⃣ PDF Viewer API** 📄  
- **Upload PDF:** `POST /api/pdfs/upload`  
- **View PDF:** `GET /api/pdfs/:filename`  

### **3️⃣ Audio Recording API** 🎤  
- **Upload Audio:** `POST /api/audios/upload`  
- **Play Audio:** `GET /api/audios/:filename`  
- **List All Audio:** `GET /api/audios`  
- **Rename Audio:** `PUT /api/audios/rename/:oldFilename`  
- **Delete Audio:** `DELETE /api/audios/:filename`  

### **4️⃣ WebGL Hosting API** 🌐  
- **Upload WebGL File:** `POST /api/webgl/upload`  
- **Fetch WebGL File:** `GET /api/webgl/:filename`  

---

## 🛠 **Technologies Used**
- **Backend:** Node.js, Express.js, MongoDB, GridFS  
- **Frontend:** React.js  
- **Storage:** MongoDB GridFS  

---

## 📌 **Deployment**
- You can deploy the backend on **Heroku, Render, or AWS**.  
- The frontend can be hosted on **Vercel or Netlify**.  

---

## 🤝 **Contributing**
1. **Fork the repo**  
2. **Create a new branch:** `git checkout -b feature-branch`  
3. **Commit your changes:** `git commit -m "Added new feature"`  
4. **Push to the branch:** `git push origin feature-branch`  
5. **Create a pull request**  

---

## 📞 Contact
📧 Email: `iemsandip@gmail.com`  
🚀 GitHub: [sandip040401](https://github.com/sandip040401)  

---

## 📜 License
This project is licensed under the **MIT License**.
