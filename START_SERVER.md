# Starting the Dashboard Server

## Quick Start

1. **Navigate to dashboard directory:**
   ```bash
   cd dashbaord
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the dashboard:**
   - Open your browser and go to: `http://localhost:5173`
   - The server should automatically open in your default browser

## Configuration

### API Backend URL
The API URL is configured in `src/lib/api.js`:
- **Current:** `http://localhost:5005/api`
- Make sure your backend server is running on port 5005

### Backend Server
Make sure the backend is running:
```bash
cd backend
npm run dev
```

Backend should be accessible at: `http://localhost:5005`

## Troubleshooting

### Port 5173 Already in Use
If you get an error that port 5173 is already in use:
1. Kill the process using the port:
   ```bash
   # Windows PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
   ```
2. Or change the port in `vite.config.js`:
   ```js
   export default defineConfig({
     server: {
       port: 5174
     },
     // ... rest of config
   });
   ```

### 404 Error
If you see a 404 error:
1. Make sure the dev server is running
2. Check the terminal for any error messages
3. Try accessing `http://localhost:5173/login` directly
4. Clear browser cache and reload

### API Connection Issues
If API calls are failing:
1. Verify backend is running: `http://localhost:5005/health`
2. Check CORS settings in backend
3. Verify API URL in `src/lib/api.js` matches your backend port

## Default Login

After starting both servers, you can login with:
- **Email:** `admin@lms.edu.kw`
- **Password:** `admin123`
- **Role:** `ADMIN`



