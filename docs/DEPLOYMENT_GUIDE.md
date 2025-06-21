# Deployment Guide - Electricity Bill Calculator

## 🚀 Deployment Overview

This guide covers the complete deployment process for the Electricity Bill Calculator application, from local development to production deployment on Firebase Hosting.

## 📋 Prerequisites

### Required Tools
- **Node.js** (v14 or later)
- **Firebase CLI**
- **Git**
- **Modern web browser**

### Required Accounts
- **Firebase/Google Cloud Account**
- **GitHub Account** (optional, for version control)

## 🔧 Initial Setup

### 1. Firebase Project Setup

#### Create Firebase Project
```bash
# 1. Go to https://console.firebase.google.com/
# 2. Click "Create a project"
# 3. Enter project name: "electricity-bill-calculator"
# 4. Enable Google Analytics (optional)
# 5. Create project
```

#### Enable Required Services
```bash
# In Firebase Console:
# 1. Enable Authentication
#    - Go to Authentication > Sign-in method
#    - Enable Email/Password provider
#    - Add authorized domains (your domain)

# 2. Enable Realtime Database
#    - Go to Realtime Database
#    - Create database in test mode
#    - Choose region (asia-southeast1 recommended)

# 3. Enable Storage
#    - Go to Storage
#    - Get started with default settings
#    - Set up security rules
```

### 2. Local Development Setup

#### Install Firebase CLI
```bash
# Install globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

#### Initialize Project
```bash
# Clone repository
git clone <repository-url>
cd bravealltime.github.io

# Initialize Firebase in project
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Storage: Configure files for Cloud Storage
# - Database: Configure files for Realtime Database

# Configure:
# - Public directory: . (current directory)
# - Single-page app: No
# - Automatic builds: No
```

## ⚙️ Configuration

### 1. Firebase Configuration

#### Update Firebase Config in HTML Files
Replace the Firebase configuration in all HTML files:

**Files to update:**
- `index.html`
- `home.html`
- `login.html`
- `admin.html`
- `profile.html`
- `create-admin.html`

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

#### Get Firebase Config
```bash
# In Firebase Console:
# 1. Go to Project Settings (gear icon)
# 2. Scroll to "Your apps" section
# 3. Click "Add app" > Web app
# 4. Register app with nickname
# 5. Copy configuration object
```

### 2. Database Rules Setup

#### Realtime Database Rules
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "electricityData": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$billId": {
        ".validate": "newData.hasChildren(['room', 'date', 'unitsUsed', 'totalCost', 'userId'])"
      }
    },
    "rooms": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /bills/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. CORS Configuration

#### Create cors.json file
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

#### Apply CORS Settings
```bash
# Set CORS for Firebase Storage
gsutil cors set cors.json gs://YOUR_PROJECT_ID.appspot.com
```

## 🌐 Local Development

### 1. Local Testing

#### Start Local Server
```bash
# Option 1: Using Firebase serve
firebase serve --only hosting

# Option 2: Using Python (if available)
python3 -m http.server 8080

# Option 3: Using Node.js live-server
npx live-server .

# Option 4: Using PHP (if available)
php -S localhost:8080
```

#### Access Application
```
Local URL: http://localhost:5000 (Firebase)
           http://localhost:8080 (Python/PHP)
           http://127.0.0.1:8080 (live-server)
```

### 2. Testing Checklist

#### Authentication Testing
- [ ] User registration
- [ ] User login
- [ ] Password reset
- [ ] Role-based access
- [ ] Session persistence

#### Core Functionality Testing
- [ ] Electricity calculation
- [ ] Bill saving
- [ ] History viewing
- [ ] QR code generation
- [ ] Profile management

#### Admin Features Testing
- [ ] User management
- [ ] Role assignment
- [ ] Status management
- [ ] Statistics display

#### Responsive Testing
- [ ] Mobile devices
- [ ] Tablet devices
- [ ] Desktop browsers
- [ ] Different screen sizes

## 🚀 Production Deployment

### 1. Pre-deployment Checklist

#### Code Review
- [ ] Remove console.log statements
- [ ] Update Firebase config
- [ ] Verify all links work
- [ ] Check responsive design
- [ ] Test error handling

#### Security Review
- [ ] Update Firebase rules
- [ ] Set proper CORS
- [ ] Review permissions
- [ ] Check input validation

#### Performance Review
- [ ] Optimize images
- [ ] Minify CSS/JS (optional)
- [ ] Check loading times
- [ ] Verify CDN links

### 2. Firebase Hosting Deployment

#### Build and Deploy
```bash
# Ensure you're in project directory
cd bravealltime.github.io

# Test Firebase configuration
firebase use --add
# Select your project

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy database rules
firebase deploy --only database

# Deploy storage rules
firebase deploy --only storage

# Deploy everything
firebase deploy
```

#### Verify Deployment
```bash
# Check deployment status
firebase hosting:sites:list

# View live site
firebase open hosting:site
```

### 3. Custom Domain Setup (Optional)

#### Add Custom Domain
```bash
# In Firebase Console:
# 1. Go to Hosting
# 2. Click "Add custom domain"
# 3. Enter your domain
# 4. Verify ownership
# 5. Update DNS records
```

#### DNS Configuration
```
# Add these DNS records to your domain:
A record: 151.101.1.195
A record: 151.101.65.195
```

## 🔍 Post-Deployment Verification

### 1. Functionality Testing

#### Critical Path Testing
```bash
# Test these flows:
1. User registration/login
2. Bill calculation
3. Admin user management
4. Profile updates
5. Data persistence
```

#### Performance Testing
```bash
# Check:
1. Page load times
2. Database response times
3. Image loading
4. Mobile performance
```

### 2. Monitoring Setup

#### Firebase Analytics
```javascript
// Add to HTML files if not already present
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);
```

#### Error Monitoring
```javascript
// Global error handler
window.addEventListener('error', (event) => {
    console.error('Production error:', event.error);
    // Send to monitoring service
});
```

## 🔄 Continuous Deployment

### 1. GitHub Actions (Optional)

#### Create `.github/workflows/deploy.yml`
```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

### 2. Manual Deployment Script

#### Create `deploy.sh`
```bash
#!/bin/bash
echo "Deploying Electricity Bill Calculator..."

# Build checks
echo "Running pre-deployment checks..."

# Deploy to Firebase
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "Deployment complete!"
echo "Visit: https://your-project-id.web.app"
```

```bash
# Make executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 🛠️ Maintenance

### 1. Regular Updates

#### Weekly Tasks
- [ ] Check Firebase usage
- [ ] Review error logs
- [ ] Update dependencies
- [ ] Monitor performance

#### Monthly Tasks
- [ ] Security audit
- [ ] Backup database
- [ ] Update documentation
- [ ] Review user feedback

### 2. Backup Strategy

#### Database Backup
```bash
# Export Realtime Database
curl -X GET \
'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/.json?auth=YOUR_ACCESS_TOKEN' \
-o backup_$(date +%Y%m%d).json
```

#### Code Backup
```bash
# Regular Git commits
git add .
git commit -m "Regular backup - $(date)"
git push origin main
```

## 🚨 Troubleshooting

### Common Issues

#### CORS Errors
```bash
# Re-apply CORS settings
gsutil cors set cors.json gs://YOUR_PROJECT_ID.appspot.com
```

#### Authentication Issues
```bash
# Check Firebase Authentication settings
# Verify authorized domains
# Check API keys
```

#### Database Permission Errors
```bash
# Review Firebase Database Rules
# Check user authentication
# Verify rule syntax
```

### Support Resources
- **Firebase Documentation**: https://firebase.google.com/docs
- **Firebase Support**: https://firebase.google.com/support
- **Stack Overflow**: Firebase tag

---

**Last Updated**: June 21, 2025  
**Version**: 2.0.0
