# User Manual - Electricity Bill Calculator

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [User Authentication](#user-authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Calculating Electricity Bills](#calculating-electricity-bills)
5. [Managing Your Profile](#managing-your-profile)
6. [Admin Panel Guide](#admin-panel-guide)
7. [Troubleshooting](#troubleshooting)
8. [Frequently Asked Questions](#frequently-asked-questions)

## 🚀 Getting Started

### System Requirements
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** for real-time features
- **Mobile device** or computer with web access

### Accessing the Application
1. Open your web browser
2. Navigate to the application URL
3. You'll be automatically redirected to login if not authenticated

### First Time Setup
1. **Create Account**: Click "สมัครสมาชิก" (Register) on login page
2. **Fill Information**: Enter your email and password
3. **Verify Email**: Check your email for verification (if enabled)
4. **Complete Profile**: Add your name and profile information

---

## 🔐 User Authentication

### Logging In
1. **Visit Login Page**: Navigate to the login page
2. **Enter Credentials**: 
   - Email address
   - Password
3. **Click Login**: Press "เข้าสู่ระบบ" button
4. **Access Granted**: You'll be redirected to your dashboard

### Password Reset
1. **Click "ลืมรหัสผ่าน?"** on login page
2. **Enter Email**: Provide your registered email
3. **Check Email**: Look for password reset link
4. **Create New Password**: Follow the link to reset

### Logging Out
1. **Click Profile Menu**: Top right corner
2. **Select "ออกจากระบบ"**: Logout option
3. **Confirm**: You'll be redirected to login page

---

## 🏠 Dashboard Overview

### Main Navigation
- **หน้าหลัก (Home)**: Dashboard and quick access
- **คำนวณค่าไฟ (Calculator)**: Main calculation tool
- **ประวัติ (History)**: View past calculations
- **โปรไฟล์ (Profile)**: Manage account settings

### Dashboard Features
- **Quick Stats**: Overview of recent bills
- **Recent Calculations**: Last few bill calculations
- **Room Summary**: Overview of managed rooms
- **Payment Status**: Outstanding bills and payments

### User Interface Elements

#### Navigation Bar
- **Back Button**: Return to previous page
- **Page Title**: Current page indicator
- **User Menu**: Profile and logout options

#### Cards and Sections
- **Information Cards**: Display key metrics
- **Action Buttons**: Primary functions
- **Data Tables**: Organized information display

---

## ⚡ Calculating Electricity Bills

### Basic Calculation

#### Step 1: Access Calculator
1. **Click "คำนวณค่าไฟ"** from main menu
2. **Select Room**: Choose the room/unit
3. **Enter Date**: Bill period date

#### Step 2: Enter Meter Readings
1. **Previous Reading**: Last month's meter reading
2. **Current Reading**: This month's meter reading
3. **Units Used**: Automatically calculated (Current - Previous)

#### Step 3: Review Calculation
1. **Progressive Rates**: See breakdown by rate tiers
2. **Base Charges**: Fixed service charges
3. **VAT**: 7% value-added tax
4. **Total Amount**: Final bill amount

#### Step 4: Save and Generate Receipt
1. **Click "บันทึกข้อมูล"**: Save the calculation
2. **Generate QR Code**: For payment via PromptPay
3. **Print/Download**: Receipt for records

### Advanced Features

#### Rate Tier Breakdown
The system automatically calculates using progressive rates:

| Units (kWh) | Rate (THB/unit) | Description |
|-------------|----------------|-------------|
| 0-15 | 2.3488 | First tier |
| 16-25 | 2.9882 | Second tier |
| 26-35 | 3.2405 | Third tier |
| 36-100 | 3.6237 | Fourth tier |
| 101-150 | 3.7171 | Fifth tier |
| 151-400 | 4.2218 | Sixth tier |
| 400+ | 4.4217 | Seventh tier |

#### Additional Charges
- **Service Charge**: ฿38.22 (fixed)
- **VAT**: 7% of total
- **Other Fees**: As applicable

### Managing Rooms

#### Adding New Room
1. **Go to Room Management**
2. **Click "เพิ่มห้อง"**
3. **Enter Details**:
   - Room name/number
   - Description
   - Location details
4. **Save Room**

#### Editing Room Information
1. **Select Room** from list
2. **Click Edit Icon**
3. **Update Information**
4. **Save Changes**

---

## 👤 Managing Your Profile

### Accessing Profile Settings
1. **Click Profile Icon** (top right)
2. **Select "โปรไฟล์"**
3. **View/Edit Information**

### Profile Information

#### Personal Details
- **Full Name**: Your display name
- **Email Address**: Login email (usually non-editable)
- **Phone Number**: Contact information
- **Address**: Optional location information

#### Profile Picture
1. **Click "เปลี่ยนรูปโปรไฟล์"**
2. **Select Image**: Choose from device
3. **Crop/Adjust**: If supported
4. **Save**: Update profile picture

#### Account Settings
- **Password Change**: Update your password
- **Notification Preferences**: Email/SMS settings
- **Privacy Settings**: Data sharing preferences

### Security Settings

#### Changing Password
1. **Go to Profile Settings**
2. **Click "เปลี่ยนรหัสผ่าน"**
3. **Enter Current Password**
4. **Enter New Password** (twice)
5. **Save Changes**

#### Two-Factor Authentication (If Available)
1. **Enable 2FA** in security settings
2. **Scan QR Code** with authenticator app
3. **Enter Verification Code**
4. **Save Recovery Codes**

---

## 👨‍💼 Admin Panel Guide

*Note: Admin features are only available to users with Administrator privileges.*

### Accessing Admin Panel
1. **Login with Admin Account**
2. **Navigate to "จัดการระบบ"** or Admin Panel
3. **Verify Permissions**: Ensure admin access

### User Management

#### Viewing All Users
1. **Go to "จัดการผู้ใช้" Tab**
2. **View User List**: All registered users
3. **Use Search**: Find specific users
4. **Apply Filters**: Filter by role or status

#### Adding New Users
1. **Click "เพิ่มผู้ใช้"**
2. **Fill User Information**:
   - Name
   - Email
   - Initial Password
   - Role Assignment
   - Account Status
3. **Save User**: Create account

#### Editing User Information
1. **Find User** in list
2. **Click Edit Button**
3. **Modify Details**:
   - Personal information
   - Role assignment
   - Account status
4. **Save Changes**

#### Managing User Status
- **Active**: Full access to system
- **Inactive**: Account disabled
- **Pending**: Awaiting verification

#### Role Management
- **Admin**: Full system access
- **User**: Standard user privileges
- **Level 1**: Limited access
- **Level 2**: Minimal access

### System Statistics

#### Dashboard Overview
- **Total Users**: All registered users
- **Active Users**: Currently active accounts
- **Recent Activity**: Latest system activity
- **System Health**: Performance metrics

#### Reports and Analytics
1. **Access Reports Tab**
2. **Select Date Range**
3. **Choose Report Type**:
   - User activity
   - Bill calculations
   - System usage
4. **Generate Report**

---

## 🔧 Troubleshooting

### Common Issues

#### Login Problems

**Issue**: Can't log in to account
**Solutions**:
1. Check email and password spelling
2. Use "ลืมรหัสผ่าน?" for password reset
3. Clear browser cache and cookies
4. Try different browser or incognito mode
5. Check internet connection

**Issue**: Account locked or disabled
**Solutions**:
1. Contact administrator
2. Check email for account status notifications
3. Wait for automatic unlock (if temporary)

#### Calculator Issues

**Issue**: Incorrect calculations
**Solutions**:
1. Verify meter readings are correct
2. Check date selection
3. Clear form and re-enter data
4. Contact support if rates seem wrong

**Issue**: Can't save calculations
**Solutions**:
1. Check internet connection
2. Ensure all required fields are filled
3. Try refreshing page and re-entering
4. Check browser permissions

#### Profile and Settings

**Issue**: Can't update profile information
**Solutions**:
1. Check all required fields are filled
2. Verify image format for profile pictures
3. Check internet connection
4. Try different browser

**Issue**: Profile picture won't upload
**Solutions**:
1. Check image size (max 5MB typically)
2. Use supported formats (JPG, PNG)
3. Check internet connection
4. Try smaller image size

### Browser Compatibility

#### Supported Browsers
- **Chrome**: Version 80+
- **Firefox**: Version 75+
- **Safari**: Version 13+
- **Edge**: Version 80+

#### Browser Settings
1. **Enable JavaScript**: Required for functionality
2. **Allow Cookies**: For session management
3. **Enable Local Storage**: For offline features

### Performance Issues

#### Slow Loading
**Solutions**:
1. Check internet connection speed
2. Clear browser cache
3. Close unnecessary browser tabs
4. Try different time of day
5. Use faster internet connection

#### Mobile Performance
**Solutions**:
1. Use mobile browser (not in-app browser)
2. Close other mobile apps
3. Check mobile data/WiFi connection
4. Update browser to latest version

---

## ❓ Frequently Asked Questions

### General Questions

**Q: Is the application free to use?**
A: Yes, the basic electricity bill calculation features are free for all users.

**Q: Do I need to register to use the calculator?**
A: Yes, registration is required to save calculations and access history.

**Q: Can I use this on my mobile phone?**
A: Yes, the application is fully responsive and works on mobile devices.

**Q: Is my data secure?**
A: Yes, we use Firebase security and encryption to protect your data.

### Account Questions

**Q: How do I change my email address?**
A: Contact an administrator to change your email address, as it's tied to your login.

**Q: Can I delete my account?**
A: Contact an administrator to request account deletion.

**Q: What if I forget my password?**
A: Use the "ลืมรหัสผ่าน?" link on the login page to reset your password.

### Calculation Questions

**Q: Are the electricity rates current?**
A: The rates are updated periodically. Contact admin if you notice discrepancies.

**Q: Can I edit a saved calculation?**
A: Currently, saved calculations cannot be edited. Create a new calculation instead.

**Q: How accurate are the calculations?**
A: Calculations use official rate structures and should be very accurate for estimation purposes.

### Technical Questions

**Q: Why is the page not loading?**
A: Check your internet connection and try refreshing. Clear browser cache if issues persist.

**Q: Can I use this offline?**
A: Basic viewing of saved data may work offline, but calculations require internet connection.

**Q: What browsers are supported?**
A: Modern browsers including Chrome, Firefox, Safari, and Edge are supported.

### Admin Questions

**Q: How do I get admin access?**
A: Admin access is granted by existing administrators or system owners.

**Q: Can I manage user roles?**
A: Yes, administrators can assign and modify user roles through the admin panel.

**Q: How do I add new users?**
A: Use the "เพิ่มผู้ใช้" function in the admin panel to create new user accounts.

---

## 📞 Support and Contact

### Getting Help

#### Self-Service Options
1. **Check this manual** for common solutions
2. **Review FAQ section** for quick answers
3. **Try troubleshooting steps** for technical issues

#### Contact Administrator
- **Email**: Contact your system administrator
- **In-App**: Use contact form if available
- **Phone**: Call support number if provided

#### Reporting Issues
When reporting issues, please include:
1. **Description**: What you were trying to do
2. **Error Message**: Exact error text if any
3. **Browser**: Which browser and version
4. **Steps**: How to reproduce the issue
5. **Screenshots**: If helpful for visual issues

---

**Last Updated**: June 21, 2025  
**Version**: 2.0.0  
**Language**: Thai/English
