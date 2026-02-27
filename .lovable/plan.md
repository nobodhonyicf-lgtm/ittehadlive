

# সিপ্যানেলে প্রজেক্ট ডিপ্লয় করার ধাপসমূহ

এই প্রজেক্টটি সিপ্যানেলে হোস্ট করতে এবং অটো-আপডেট পেতে আমরা **GitHub** কে মাঝখানে ব্রিজ হিসেবে ব্যবহার করব।

## প্রবাহ (Flow)

```text
Lovable এ পরিবর্তন
      |
      v
GitHub রিপোজিটরি (অটো সিংক)
      |
      v
cPanel Git Deployment (অটো পুল)
      |
      v
আপনার ডোমেইনে লাইভ
```

---

## ধাপ ১: Lovable থেকে GitHub এ কানেক্ট করুন

1. Lovable এডিটরে উপরে বাম দিকে **প্রজেক্টের নাম** এ ক্লিক করুন
2. **Settings** এ যান
3. **GitHub** ট্যাবে ক্লিক করুন
4. **Connect project** বাটনে ক্লিক করুন
5. GitHub অ্যাকাউন্ট অথোরাইজ করুন
6. **Create Repository** ক্লিক করুন -- একটি নতুন রিপো তৈরি হবে

এরপর থেকে Lovable এ যেকোনো পরিবর্তন অটোমেটিক GitHub এ পুশ হবে।

---

## ধাপ ২: সিপ্যানেলে Git Repository সেটআপ করুন

1. সিপ্যানেলে লগইন করুন
2. **Git Version Control** অপশনে যান
3. **Clone a Repository** ক্লিক করুন
4. GitHub রিপোর URL দিন (যেমন: `https://github.com/your-username/your-repo.git`)
5. Repository Path সেট করুন (যেমন: `/home/username/repositories/my-site`)
6. **Create** ক্লিক করুন

---

## ধাপ ৩: সিপ্যানেলে Node.js অ্যাপ সেটআপ করুন

এই প্রজেক্টটি React + Vite, তাই আমাদের বিল্ড করতে হবে:

1. সিপ্যানেলে **Setup Node.js App** এ যান
2. **Create Application** ক্লিক করুন
3. সেটিংস:
   - **Node.js version**: 18 বা তার উপরে
   - **Application mode**: Production
   - **Application root**: আপনার রিপো ফোল্ডার (যেমন: `repositories/my-site`)
   - **Application URL**: আপনার ডোমেইন
4. **Environment Variables** যোগ করুন:
   - `VITE_SUPABASE_URL` = আপনার Supabase URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = আপনার Supabase Anon Key
5. **Create** ক্লিক করুন
6. টার্মিনালে (বা Run Script এ) চালান:
   ```
   npm install
   npm run build
   ```
7. বিল্ড হলে `dist` ফোল্ডারের ভেতরের সব ফাইল আপনার ডোমেইনের **public_html** (বা সাবডোমেইন ফোল্ডার) এ কপি করুন

---

## ধাপ ৪: .htaccess ফাইল সেট করুন

আপনার প্রজেক্টে ইতিমধ্যে `public/.htaccess` আছে। বিল্ডের পর `dist` ফোল্ডারে এটি থাকবে। এটি নিশ্চিত করে যে সব রাউট সঠিকভাবে কাজ করবে (React SPA routing)।

---

## ধাপ ৫: অটো-আপডেট সেটআপ করুন (GitHub Webhook)

প্রতিবার Lovable থেকে পরিবর্তন হলে অটো ডিপ্লয় হওয়ার জন্য:

**পদ্ধতি ক: সিপ্যানেলের Git Auto-Deploy (সহজ)**

1. সিপ্যানেলে **Git Version Control** এ যান
2. আপনার রিপো সিলেক্ট করুন
3. **Pull or Deploy** ট্যাবে যান
4. **Deploy HEAD Commit** এ ক্লিক করলে লেটেস্ট কোড আসবে

**পদ্ধতি খ: Webhook দিয়ে সম্পূর্ণ অটো (রিকমেন্ডেড)**

1. সিপ্যানেলে একটি ছোট PHP স্ক্রিপ্ট তৈরি করুন (`deploy.php`):
   ```php
   <?php
   shell_exec('cd /home/username/repositories/my-site && git pull origin main 2>&1');
   shell_exec('cd /home/username/repositories/my-site && npm install && npm run build 2>&1');
   shell_exec('cp -r /home/username/repositories/my-site/dist/* /home/username/public_html/ 2>&1');
   ?>
   ```
2. GitHub রিপোতে যান -> **Settings** -> **Webhooks** -> **Add webhook**
3. Payload URL: `https://yourdomain.com/deploy.php`
4. Content type: `application/json`
5. Secret: একটি সিক্রেট কী দিন
6. Events: **Just the push event** সিলেক্ট করুন
7. **Add webhook** ক্লিক করুন

এখন Lovable এ পরিবর্তন -> GitHub এ অটো পুশ -> Webhook ট্রিগার -> সিপ্যানেলে অটো বিল্ড ও ডিপ্লয়।

---

## গুরুত্বপূর্ণ নোট

- **Environment Variables**: সিপ্যানেলে বিল্ড করার সময় `VITE_SUPABASE_URL` এবং `VITE_SUPABASE_PUBLISHABLE_KEY` সেট করা জরুরি, নাহলে ব্যাকএন্ড কানেকশন কাজ করবে না।
- **ডোমেইন**: আপনার কাস্টম ডোমেইন (যেমন ittehad.bd) সিপ্যানেলে পয়েন্ট করতে হবে DNS সেটিংস থেকে।
- এই প্রজেক্টটি একটি **স্ট্যাটিক SPA** (Single Page Application) -- বিল্ড করলে `dist` ফোল্ডারে শুধু HTML/CSS/JS ফাইল তৈরি হয়, তাই সিপ্যানেলে হোস্ট করা সহজ।

