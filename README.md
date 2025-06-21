# Electricity Bill Calculator (คำนวณค่าไฟ)

เว็บแอปพลิเคชันสำหรับคำนวณค่าไฟฟ้าแบบละเอียด พัฒนาด้วย HTML, CSS (Tailwind), และ JavaScript

## คุณสมบัติ

- คำนวณค่าไฟจากหน่วยที่ใช้
- บันทึกประวัติการคำนวณ
- แสดงผลการคำนวณแบบละเอียด
- ส่งผลการคำนวณผ่าน LINE
- รองรับการแก้ไขข้อมูล
- UI/UX ที่ใช้งานง่าย สวยงาม

## การติดตั้งและใช้งาน

### 1. การตั้งค่า Firebase

1. สร้างโปรเจค Firebase ใหม่
2. เปิดใช้งาน Firebase Realtime Database
3. เปิดใช้งาน Firebase Storage
4. ตั้งค่า Firebase Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### 2. การแก้ปัญหา CORS

หากเกิดปัญหา CORS ในการอัปโหลดรูปภาพ ให้ทำตามขั้นตอนนี้:

#### วิธีที่ 1: ใช้ Firebase CLI

1. ติดตั้ง Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login เข้า Firebase:
```bash
firebase login
```

3. ตั้งค่า CORS สำหรับ Firebase Storage:
```bash
gsutil cors set cors.json gs://YOUR_BUCKET_NAME
```

โดยแทนที่ `YOUR_BUCKET_NAME` ด้วยชื่อ bucket ของคุณ (เช่น `electricity-bill-calcula-ea4a2.appspot.com`)

#### วิธีที่ 2: ใช้ Google Cloud Console

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือกโปรเจค Firebase ของคุณ
3. ไปที่ Cloud Storage > Browser
4. เลือก bucket ของคุณ
5. ไปที่ Settings > CORS
6. อัปโหลดไฟล์ `cors.json` ที่มีอยู่ในโปรเจคนี้

### 3. การใช้งาน

1. เปิดไฟล์ `index.html` ในเว็บเบราว์เซอร์
2. เลือกห้องที่ต้องการบันทึกข้อมูล
3. กรอกข้อมูลค่าไฟ
4. คำนวณและบันทึกข้อมูล
5. สามารถแนบรูปภาพหลักฐานได้

### 4. ฟีเจอร์หลัก

- ✅ คำนวณค่าไฟอัตโนมัติ
- ✅ บันทึกข้อมูลลง Firebase Realtime Database
- ✅ แนบรูปภาพหลักฐานลง Firebase Storage
- ✅ ดูประวัติการคำนวณ
- ✅ แก้ไขและลบข้อมูล
- ✅ สร้าง QR Code สำหรับชำระเงิน
- ✅ รองรับหลายห้อง

### 5. การแก้ไขปัญหา

#### ปัญหา CORS
หากยังเกิดปัญหา CORS ให้ตรวจสอบ:
1. Firebase Storage Rules อนุญาตให้เขียนไฟล์
2. CORS configuration ถูกตั้งค่าอย่างถูกต้อง
3. Firebase Storage SDK ถูกโหลดในหน้าเว็บ

#### ปัญหาการอัปโหลดรูปภาพ
1. ตรวจสอบ Console ใน Developer Tools
2. ดู error message ที่แสดง
3. ตรวจสอบขนาดไฟล์ (ไม่ควรเกิน 5MB)
4. ตรวจสอบประเภทไฟล์ (ต้องเป็นรูปภาพ)

### 6. โครงสร้างไฟล์

```
electricity-bill-calculator/
├── index.html          # หน้าหลัก
├── home.html           # หน้าเลือกห้อง
├── script.js           # JavaScript หลัก
├── styles.css          # CSS
├── storage.rules       # Firebase Storage Rules
├── cors.json           # CORS Configuration
└── README.md           # คู่มือการใช้งาน
```

## การพัฒนา

### การเพิ่มฟีเจอร์ใหม่

1. แก้ไขไฟล์ `script.js` เพื่อเพิ่มฟังก์ชันใหม่
2. อัปเดต HTML เพื่อเพิ่ม UI elements
3. ทดสอบการทำงาน
4. อัปเดตเอกสาร

### การปรับปรุง UI

1. แก้ไขไฟล์ `styles.css` หรือใช้ Tailwind CSS classes
2. ปรับปรุง responsive design
3. ทดสอบบนอุปกรณ์ต่างๆ

## การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ กรุณาเปิด Issue ใน GitHub repository นี้ 