# Firebase Storage Setup Guide

## ภาพรวม

ระบบอัพโหลดหลักฐานการชำระเงินใช้ Firebase Storage เพื่อจัดเก็บไฟล์รูปภาพอย่างปลอดภัยและมีประสิทธิภาพ

## การตั้งค่า Firebase Storage

### 1. เปิดใช้งาน Firebase Storage

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจคของคุณ
3. ไปที่ **Storage** ในเมนูด้านซ้าย
4. คลิก **Get started**
5. เลือก **Start in test mode** หรือ **Start in production mode**

### 2. ตั้งค่า Security Rules

อัปโหลดไฟล์ `storage.rules` ไปยัง Firebase Storage:

```bash
firebase deploy --only storage
```

หรือคัดลอกเนื้อหาจากไฟล์ `storage.rules` ไปยัง Firebase Console > Storage > Rules

### 3. การตั้งค่า CORS (ถ้าจำเป็น)

หากมีปัญหา CORS ให้ตั้งค่าใน Firebase Console > Storage > Rules:

```
// Add CORS configuration
cors: {
  origin: ['*'],
  method: ['GET', 'POST', 'PUT', 'DELETE'],
  maxAgeSeconds: 3600
}
```

## โครงสร้างไฟล์

```
evidence/
├── {billKey}/
│   ├── {timestamp}_{userId}_{filename}.jpg
│   ├── {timestamp}_{userId}_{filename}.png
│   └── ...
└── test/
    └── {userId}/
        └── test.txt
```

## Metadata ที่บันทึก

ทุกไฟล์จะบันทึก metadata ต่อไปนี้:

```javascript
{
  contentType: 'image/jpeg',
  cacheControl: 'public, max-age=31536000',
  customMetadata: {
    originalName: 'receipt.jpg',
    uploadedBy: 'user123',
    uploadedAt: '2024-01-01T00:00:00.000Z',
    billKey: 'bill123',
    room: '101',
    compressed: 'true',
    originalSize: '2048576',
    deviceInfo: 'mobile',
    userAgent: 'Mozilla/5.0...'
  }
}
```

## ฟีเจอร์หลัก

### 1. การอัพโหลดไฟล์

- **การบีบอัดอัตโนมัติ**: ภาพจะถูกบีบอัดเป็น 1024x1024 pixels สูงสุด
- **การตรวจสอบประเภทไฟล์**: รับเฉพาะไฟล์รูปภาพ (JPG, PNG, GIF)
- **การจำกัดขนาด**: ไฟล์ต้นฉบับไม่เกิน 10MB, หลังบีบอัดไม่เกิน 5MB
- **การตรวจสอบสิทธิ์**: ตรวจสอบสิทธิ์การอัพโหลดตามห้อง

### 2. การลบไฟล์

- **การลบจาก Storage**: ลบไฟล์จาก Firebase Storage
- **การอัปเดตฐานข้อมูล**: ลบข้อมูลอ้างอิงจาก Realtime Database
- **การตรวจสอบสิทธิ์**: เฉพาะผู้อัพโหลดหรือผู้มีสิทธิ์เท่านั้นที่ลบได้

### 3. การตรวจสอบและ Logging

- **การตรวจสอบ Storage**: ทดสอบการเชื่อมต่อก่อนอัพโหลด
- **การบันทึก Log**: บันทึกทุกขั้นตอนการอัพโหลด
- **การแสดง Logs**: ปุ่ม Debug สำหรับดู logs

## การจัดการข้อผิดพลาด

### ข้อผิดพลาดทั่วไป

| Error Code | ความหมาย | การแก้ไข |
|------------|----------|----------|
| `storage/unauthorized` | ไม่มีสิทธิ์ | ตรวจสอบการเข้าสู่ระบบ |
| `storage/quota-exceeded` | พื้นที่เต็ม | ลบไฟล์เก่าหรือติดต่อผู้ดูแล |
| `storage/unauthenticated` | ไม่ได้เข้าสู่ระบบ | เข้าสู่ระบบใหม่ |
| `storage/retry-limit-exceeded` | ล้มเหลวหลายครั้ง | ลองใหม่อีกครั้ง |

### การแก้ไขปัญหา

1. **ไฟล์ไม่อัพโหลด**
   - ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
   - ตรวจสอบสิทธิ์การอัพโหลด
   - ดู logs ผ่านปุ่ม Debug

2. **ไฟล์ไม่แสดง**
   - ตรวจสอบ URL ในฐานข้อมูล
   - ตรวจสอบสิทธิ์การเข้าถึง
   - ตรวจสอบ CORS settings

3. **การลบไฟล์ไม่สำเร็จ**
   - ตรวจสอบสิทธิ์การลบ
   - ตรวจสอบว่าไฟล์ยังมีอยู่หรือไม่
   - ดู logs สำหรับรายละเอียด

## การตรวจสอบการใช้งาน

### ดู Storage Usage

```javascript
// เรียกใช้ฟังก์ชันเพื่อดูการใช้งาน
const usage = await getStorageUsageInfo();
console.log('Storage usage:', usage);
```

### ตรวจสอบไฟล์

```javascript
// ดู metadata ของไฟล์
const metadata = await getEvidenceMetadata(evidenceUrl);
console.log('File metadata:', metadata);
```

## การตั้งค่าความปลอดภัย

### 1. Security Rules

ไฟล์ `storage.rules` กำหนด:
- เฉพาะผู้ใช้ที่เข้าสู่ระบบเท่านั้นที่อัพโหลดได้
- จำกัดขนาดไฟล์ไม่เกิน 5MB
- รับเฉพาะไฟล์รูปภาพ
- ตรวจสอบสิทธิ์ตามห้อง

### 2. การเข้ารหัส

- ไฟล์ถูกเข้ารหัสในขณะพัก (at rest)
- การส่งข้อมูลใช้ HTTPS
- Metadata ถูกเข้ารหัส

### 3. การเข้าถึง

- ตรวจสอบสิทธิ์ก่อนการเข้าถึง
- บันทึกการเข้าถึงทุกครั้ง
- จำกัดการเข้าถึงตามห้อง

## การบำรุงรักษา

### 1. การลบไฟล์เก่า

```javascript
// ลบไฟล์ที่ไม่ได้ใช้แล้ว
async function cleanupOldFiles() {
  // Implementation for cleaning up old files
}
```

### 2. การสำรองข้อมูล

- Firebase Storage มีการสำรองข้อมูลอัตโนมัติ
- สามารถดาวน์โหลดไฟล์ทั้งหมดได้ผ่าน Firebase Console

### 3. การติดตามการใช้งาน

- ดู logs ใน Firebase Console > Storage > Usage
- ตรวจสอบการใช้งานผ่าน Analytics

## การทดสอบ

### 1. ทดสอบการอัพโหลด

```javascript
// ทดสอบการอัพโหลดไฟล์
const testResult = await validateFirebaseStorage();
console.log('Test result:', testResult);
```

### 2. ทดสอบการลบ

```javascript
// ทดสอบการลบไฟล์
const deleteResult = await deleteEvidenceFromStorage(url, billKey);
console.log('Delete result:', deleteResult);
```

## การอัปเดต

### 1. อัปเดต Security Rules

```bash
firebase deploy --only storage
```

### 2. อัปเดตโค้ด

- อัปเดตไฟล์ `script.js`
- ทดสอบการทำงาน
- ตรวจสอบ logs

## สรุป

Firebase Storage ให้ระบบที่ปลอดภัยและมีประสิทธิภาพสำหรับการจัดเก็บหลักฐานการชำระเงิน โดยมีฟีเจอร์:

- ✅ การบีบอัดอัตโนมัติ
- ✅ การตรวจสอบสิทธิ์
- ✅ การบันทึก logs
- ✅ การจัดการข้อผิดพลาด
- ✅ ความปลอดภัยสูง
- ✅ การสำรองข้อมูลอัตโนมัติ 