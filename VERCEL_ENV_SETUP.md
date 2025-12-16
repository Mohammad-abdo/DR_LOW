# إعداد Environment Variables في Vercel
# Vercel Environment Variables Setup

## ⚠️ مهم جداً / Very Important

يجب إضافة Environment Variables في Vercel Dashboard:

You must add Environment Variables in Vercel Dashboard:

### الخطوات / Steps:

1. اذهب إلى Vercel Dashboard
   Go to Vercel Dashboard

2. اختر المشروع (dr-low)
   Select your project (dr-low)

3. اذهب إلى Settings → Environment Variables
   Go to Settings → Environment Variables

4. أضف المتغيرات التالية:
   Add the following variables:

```
VITE_API_URL = https://dr-law.developteam.site/api
VITE_API_BASE_URL = https://dr-law.developteam.site
```

5. تأكد من اختيار:
   Make sure to select:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. بعد إضافة المتغيرات، قم بإعادة Deploy للمشروع
   After adding variables, redeploy the project

## 🔍 التحقق / Verification

بعد الـ deploy، افتح Console في المتصفح وتحقق من:
After deployment, open browser Console and check:

```
🔗 API URL: https://dr-law.developteam.site/api (Mode: production)
```

إذا رأيت `localhost:5005`، هذا يعني أن:
If you see `localhost:5005`, it means:

1. Environment Variables لم يتم إضافتها في Vercel
   Environment Variables were not added in Vercel

2. أو الـ build القديم ما زال مستخدماً
   Or the old build is still being used

**الحل:** أعد Deploy بعد إضافة Environment Variables
**Solution:** Redeploy after adding Environment Variables

## 📝 ملاحظات / Notes

- الـ code الآن مجهز لاستخدام production URL تلقائياً
- The code is now configured to use production URL automatically
- لكن Environment Variables في Vercel مهمة للتأكد
- But Vercel Environment Variables are important to ensure


