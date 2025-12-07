# Quick Start Guide

## ✅ Server Status

The dashboard development server should now be running at:
**http://localhost:5173**

## 🔧 Configuration Updates Made

1. ✅ **API URL Updated**
   - Changed from `http://127.0.0.1:8000/api` to `http://localhost:5005/api`
   - File: `src/lib/api.js`

2. ✅ **Login Page Updated**
   - Added role selector (Admin, Teacher, Student)
   - Updated to send role to backend
   - Updated default credentials display

3. ✅ **AuthContext Updated**
   - Login function now accepts role parameter
   - Sends role to backend API
   - Handles LMS roles (ADMIN, TEACHER, STUDENT)

4. ✅ **ProtectedRoute Updated**
   - Now handles LMS roles properly
   - Supports both uppercase and lowercase role names

## 🚀 How to Access

1. **Make sure backend is running:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend should be at: `http://localhost:5005`

2. **Dashboard should be running:**
   - URL: `http://localhost:5173`
   - If not running, start it:
     ```bash
     cd dashbaord
     npm run dev
     ```

3. **Login with default credentials:**
   - **Admin:**
     - Email: `admin@lms.edu.kw`
     - Password: `admin123`
     - Role: `ADMIN`
   
   - **Teacher:**
     - Email: `teacher@lms.edu.kw`
     - Password: `teacher123`
     - Role: `TEACHER`
   
   - **Student:**
     - Email: `student@lms.edu.kw`
     - Password: `student123`
     - Role: `STUDENT`

## 🔍 Troubleshooting

### 404 Error
- Make sure the dev server is running
- Check terminal for any error messages
- Try accessing `http://localhost:5173/login` directly

### API Connection Issues
- Verify backend is running: `http://localhost:5005/health`
- Check browser console for CORS errors
- Verify API URL in `src/lib/api.js` is `http://localhost:5005/api`

### Login Fails
- Make sure you select the correct role (ADMIN, TEACHER, or STUDENT)
- Check backend logs for authentication errors
- Verify backend database is seeded with default users

## 📝 Next Steps

1. Test login with all three roles
2. Navigate through the admin dashboard
3. Test the new LMS pages (Courses, Exams, Banners, Payments)
4. Continue with remaining page updates as needed



