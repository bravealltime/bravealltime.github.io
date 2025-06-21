# API Documentation - Electricity Bill Calculator

## 🔗 Overview

This document outlines the internal API structure, functions, and data flow within the Electricity Bill Calculator application.

## 📋 Core Modules

### 1. Authentication Module (`auth.js`)

#### Global Variables
```javascript
let currentUser = null;
let userRole = 'user';
const ROLE_HIERARCHY = {
    'admin': 4,
    'user': 3,
    '1': 2,
    '2': 1
};
```

#### Core Functions

##### `checkAuth(): Promise<User|null>`
**Description**: Validates user authentication status  
**Returns**: User object or null  
**Usage**: Called on page load to verify authentication

```javascript
const user = await checkAuth();
if (user) {
    console.log('User authenticated:', user.email);
}
```

##### `hasPermission(permission: string): boolean`
**Description**: Checks if current user has specific permission  
**Parameters**: 
- `permission`: Permission key (e.g., 'canManageUsers')
**Returns**: Boolean indicating permission status

```javascript
if (hasPermission('canManageUsers')) {
    // Show admin features
}
```

##### `loginUser(email: string, password: string): Promise<void>`
**Description**: Authenticates user with email/password  
**Parameters**:
- `email`: User email address
- `password`: User password

##### `logout(): Promise<void>`
**Description**: Signs out current user and redirects to login

#### Exported Functions
```javascript
window.loginUser = loginUser;
window.logout = logout;
window.hasPermission = hasPermission;
window.checkAuth = checkAuth;
window.requireAuth = requireAuth;
```

---

### 2. Admin Module (`admin.js`)

#### Data Structures
```javascript
let users = [];           // All users array
let filteredUsers = [];   // Filtered users for display
let stats = {             // Dashboard statistics
    totalUsers: 0,
    totalRooms: 0,
    totalBills: 0,
    totalAdmins: 0
};
```

#### Core Functions

##### `loadUsers(): Promise<void>`
**Description**: Fetches all users from Firebase and updates UI  
**Side Effects**: Populates users array and renders table

##### `addUser(name, email, password, role, status): Promise<void>`
**Description**: Creates new user account  
**Parameters**:
- `name`: Full name
- `email`: Email address  
- `password`: Initial password
- `role`: User role ('admin', 'user', '1', '2')
- `status`: Account status ('active', 'inactive', 'pending')

##### `updateUser(uid, name, email, role, status): Promise<void>`
**Description**: Updates existing user information  
**Parameters**:
- `uid`: User unique identifier
- `name`: Updated name
- `email`: Updated email
- `role`: Updated role
- `status`: Updated status

##### `toggleUserStatus(uid: string): Promise<void>`
**Description**: Toggles user between active/inactive status  
**Parameters**:
- `uid`: User unique identifier

##### `deleteUser(uid: string): Promise<void>`
**Description**: Removes user from system  
**Parameters**:
- `uid`: User unique identifier

#### UI Functions

##### `renderUsersTable(): void`
**Description**: Renders user data in table format

##### `filterUsers(): void`
**Description**: Applies search and role filters to user list

##### `switchTab(tabName: string): void`
**Description**: Switches between admin panel tabs  
**Parameters**:
- `tabName`: 'users', 'roles', or 'reports'

---

### 3. Calculator Module (`script.js`)

#### Core Functions

##### `calculateElectricity(units: number): Object`
**Description**: Calculates electricity bill based on progressive rates  
**Parameters**:
- `units`: Number of electricity units used
**Returns**: Calculation breakdown object

```javascript
const result = calculateElectricity(150);
// Returns: {
//   units: 150,
//   breakdown: [...],
//   total: 450.50,
//   vat: 31.54,
//   grandTotal: 482.04
// }
```

##### `saveBillData(billData: Object): Promise<string>`
**Description**: Saves bill calculation to Firebase  
**Parameters**:
- `billData`: Complete bill information
**Returns**: Promise resolving to bill ID

##### `loadBillHistory(userId?: string): Promise<Array>`
**Description**: Loads historical bills for user  
**Parameters**:
- `userId`: Optional user ID (defaults to current user)
**Returns**: Array of bill objects

##### `generateQRCode(billData: Object): void`
**Description**: Generates PromptPay QR code for payment  
**Parameters**:
- `billData`: Bill information for payment

---

### 4. Profile Module (`profile.js`)

#### Core Functions

##### `loadUserProfile(): Promise<void>`
**Description**: Loads current user profile data

##### `updateProfile(profileData: Object): Promise<void>`
**Description**: Updates user profile information  
**Parameters**:
- `profileData`: Updated profile data

##### `uploadProfileImage(file: File): Promise<string>`
**Description**: Uploads profile image to Firebase Storage  
**Parameters**:
- `file`: Image file object
**Returns**: Promise resolving to image URL

---

## 🔄 Data Flow

### Authentication Flow
```
Page Load → checkAuth() → User Object → Set Global Variables → Initialize Page
```

### User Management Flow
```
Admin Panel → loadUsers() → Filter/Search → renderUsersTable() → User Actions
```

### Bill Calculation Flow
```
User Input → calculateElectricity() → Display Results → saveBillData() → Generate QR
```

## 🔐 Security Implementation

### Role-Based Access Control
```javascript
// Permission checking example
function adminOnlyFunction() {
    if (!hasPermission('canManageUsers')) {
        window.location.href = 'home.html';
        return;
    }
    // Admin functionality here
}
```

### Input Validation
```javascript
// Example validation
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
```

## 📊 Firebase Integration

### Database Structure
```javascript
// Reading data
const snapshot = await db.ref('users').once('value');
const data = snapshot.val();

// Writing data
await db.ref(`users/${uid}`).set(userData);

// Updating data
await db.ref(`users/${uid}`).update(updates);

// Deleting data
await db.ref(`users/${uid}`).remove();
```

### Storage Operations
```javascript
// Upload file
const storageRef = storage.ref(`profiles/${userId}`);
const snapshot = await storageRef.put(file);
const downloadURL = await snapshot.ref.getDownloadURL();
```

## 🎯 Event Handling

### Form Submissions
```javascript
document.getElementById('form-id').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Handle form data
    const formData = new FormData(e.target);
    await processForm(formData);
});
```

### Modal Management
```javascript
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}
```

## 🔔 Notification System

### Alert Function
```javascript
showAlert(message, type);
// Types: 'success', 'error', 'warning', 'info'
```

### Implementation
```javascript
function showAlert(message, type = 'info') {
    // Create alert element
    // Add to container
    // Auto-remove after timeout
}
```

## 📱 Responsive Utilities

### Device Detection
```javascript
function isMobile() {
    return window.innerWidth <= 768;
}
```

### Dynamic Styling
```javascript
function updateLayout() {
    if (isMobile()) {
        // Mobile-specific adjustments
    }
}
```

## 🔧 Utility Functions

### Date Formatting
```javascript
function formatDate(date) {
    return new Date(date).toLocaleDateString('th-TH');
}
```

### Number Formatting
```javascript
function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
    }).format(amount);
}
```

## 🐛 Error Handling

### Global Error Handler
```javascript
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showAlert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
});
```

### Async Error Handling
```javascript
async function safeAsyncFunction() {
    try {
        const result = await riskyOperation();
        return result;
    } catch (error) {
        console.error('Operation failed:', error);
        showAlert('การดำเนินการล้มเหลว', 'error');
        throw error;
    }
}
```

## 📋 Constants

### Application Constants
```javascript
const ELECTRICITY_RATES = {
    tier1: { max: 15, rate: 2.3488 },
    tier2: { max: 25, rate: 2.9882 },
    tier3: { max: 35, rate: 3.2405 },
    tier4: { max: 100, rate: 3.6237 },
    tier5: { max: 150, rate: 3.7171 },
    tier6: { max: 400, rate: 4.2218 },
    tier7: { max: Infinity, rate: 4.4217 }
};

const VAT_RATE = 0.07; // 7%
const SERVICE_CHARGE = 38.22;
```

### UI Constants
```javascript
const MODAL_IDS = {
    ADD_USER: 'add-user-modal',
    EDIT_USER: 'edit-user-modal',
    CONFIRM_DELETE: 'confirm-delete-modal'
};

const ALERT_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};
```

---

**Last Updated**: June 21, 2025  
**Version**: 2.0.0
