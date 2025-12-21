# خطوات رفع الكود إلى GitHub

## ✅ الخطوات المكتملة:
1. تم إعداد Git config
2. تم تغيير remote إلى HTTPS

## 📝 الخطوات التالية (قم بتنفيذها في Terminal):

### 1. تأكد من أنك في مجلد Frontend:
```bash
cd D:\DR.Low\Frontend
```

### 2. تحقق من remote:
```bash
git remote -v
```
يجب أن يظهر: `https://github.com/Mohammad-abdo/DR_LOW.git`

### 3. أضف جميع الملفات:
```bash
git add .
```

### 4. قم بعمل commit:
```bash
git commit -m "Initial commit: D.Low LMS Frontend - Ready for Vercel deployment"
```

### 5. ارفع الكود:
```bash
git push -u origin main
```

## ⚠️ إذا ظهرت رسالة طلب كلمة المرور:

### الطريقة 1: استخدام Personal Access Token (موصى به)
1. اذهب إلى: https://github.com/settings/tokens
2. انقر على "Generate new token (classic)"
3. اختر الصلاحيات: `repo` (كل الصلاحيات)
4. انسخ الـ Token
5. عند طلب كلمة المرور، استخدم الـ Token بدلاً من كلمة المرور

### الطريقة 2: استخدام GitHub CLI
```bash
# تثبيت GitHub CLI
winget install GitHub.cli

# تسجيل الدخول
gh auth login
```

## 🔍 التحقق من النجاح:
بعد الرفع، اذهب إلى: https://github.com/Mohammad-abdo/DR_LOW
يجب أن ترى جميع الملفات



























