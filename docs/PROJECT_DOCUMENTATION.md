# Electricity Bill Calculator - Project Documentation

## 📋 Project Overview

The Electricity Bill Calculator is a comprehensive web application designed for calculating electricity bills with detailed breakdowns, user management, and administrative features. Built with modern web technologies and Firebase backend.

## 🏗️ Project Structure

```
bravealltime.github.io/
├── 📁 Root Files (Main Application)
│   ├── index.html              # Main electricity calculator page
│   ├── home.html              # User dashboard/home page
│   ├── login.html             # User authentication page
│   ├── admin.html             # Admin panel for user management
│   ├── profile.html           # User profile management
│   ├── create-admin.html      # Admin account creation
│   ├── styles.css             # Global styles
│   └── README.md              # Basic project information
│
├── 📁 JavaScript Modules
│   ├── script.js              # Main calculator logic
│   ├── auth.js                # Authentication and authorization
│   ├── admin.js               # Admin panel functionality
│   ├── profile.js             # Profile management
│   ├── promptpay.js           # QR code generation for payments
│   └── sheets.js              # Google Sheets integration
│
├── 📁 Assets
│   ├── images/
│   │   └── qr-payment.jpg.jpg # Payment QR code image
│   ├── 4752033d-585c-465f-be9a-e58200579846.jpg
│   └── 59303b13-5fdc-4fbc-8634-db16afccfcab.jpg
│
├── 📁 Documentation
│   ├── docs/
│   │   ├── index.html         # Documentation homepage
│   │   ├── script.js          # Documentation scripts
│   │   ├── styles.css         # Documentation styles
│   │   ├── PROJECT_DOCUMENTATION.md    # Complete project overview
│   │   ├── API_DOCUMENTATION.md        # API and function reference
│   │   ├── DEPLOYMENT_GUIDE.md         # Deployment instructions
│   │   ├── USER_MANUAL.md              # End-user guide
│   │   └── README.md                   # Documentation index
│   └── FIREBASE_SETUP.md      # Firebase configuration guide
│
└── 📁 Configuration
    ├── cors.json              # CORS configuration for Firebase
    ├── storage.rules          # Firebase Storage security rules
    └── .gitignore             # Git ignore rules
```

## 🎯 Core Features

### 1. **Electricity Bill Calculator**
- **Location**: `index.html` + `script.js`
- **Features**:
  - Progressive rate calculation
  - Multiple tariff support
  - Historical bill tracking
  - Receipt generation with QR codes
  - Data export capabilities

### 2. **User Authentication System**
- **Location**: `auth.js` + `login.html`
- **Features**:
  - Firebase Authentication integration
  - Role-based access control (Admin, User, Level 1, Level 2)
  - Password reset functionality
  - Session management

### 3. **Admin Panel**
- **Location**: `admin.html` + `admin.js`
- **Features**:
  - Complete user management (CRUD operations)
  - User status management (Active/Inactive/Pending)
  - Role assignment and permissions
  - Statistics dashboard
  - Advanced search and filtering

### 4. **User Dashboard**
- **Location**: `home.html`
- **Features**:
  - Personal bill history
  - Quick calculations
  - Profile access
  - Room management

### 5. **Profile Management**
- **Location**: `profile.html` + `profile.js`
- **Features**:
  - Personal information editing
  - Profile picture upload
  - Account settings

## 🔧 Technical Architecture

### Frontend Technologies
- **HTML5**: Semantic structure
- **CSS3**: Styling with Tailwind CSS
- **JavaScript (ES6+)**: Modern JavaScript features
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library
- **Kanit Font**: Thai-friendly typography

### Backend Services
- **Firebase Realtime Database**: Real-time data storage
- **Firebase Authentication**: User management
- **Firebase Storage**: File uploads
- **Firebase Hosting**: Web hosting

### External Libraries
- **QRCode.js**: QR code generation
- **Flatpickr**: Date picker
- **PromptPay**: Thai payment QR codes

## 📊 Database Schema

### Users Collection
```javascript
users: {
  [uid]: {
    name: "string",
    email: "string", 
    role: "admin|user|1|2",
    status: "active|inactive|pending",
    profileImage: "string|null",
    createdAt: "ISO string",
    updatedAt: "ISO string"
  }
}
```

### Electricity Data Collection
```javascript
electricityData: {
  [billId]: {
    room: "string",
    date: "string",
    previousReading: "number",
    currentReading: "number",
    unitsUsed: "number",
    totalCost: "number",
    userId: "string",
    createdAt: "ISO string"
  }
}
```

### Rooms Collection
```javascript
rooms: {
  [roomId]: {
    name: "string",
    description: "string",
    userId: "string",
    createdAt: "ISO string"
  }
}
```

## 🔐 Security & Permissions

### Role Hierarchy
1. **Admin** - Full system access
2. **User** - Standard user privileges  
3. **Level 1** - Limited access
4. **Level 2** - Minimal access

### Permission Matrix
| Feature | Admin | User | Level 1 | Level 2 |
|---------|-------|------|---------|---------|
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ | ❌ |
| View All Rooms | ✅ | ✅ | ❌ | ❌ |
| Edit All Bills | ✅ | ✅ | ❌ | ❌ |
| Delete Bills | ✅ | ❌ | ❌ | ❌ |
| Upload Evidence | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ |

## 🚀 Deployment

### Firebase Hosting
The application is deployed on Firebase Hosting with the following configuration:

```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  }
}
```

### Environment Configuration
Firebase configuration is embedded in HTML files for simplicity. For production, consider using environment variables.

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach**
- **Responsive navigation**
- **Touch-friendly interfaces**
- **Optimized forms for mobile**

## 🔄 Development Workflow

### 1. Local Development
```bash
# Serve locally (if using live server)
npx live-server .

# Or simply open index.html in browser
open index.html
```

### 2. Testing
- **Manual testing** across different devices
- **Cross-browser compatibility**
- **Authentication flow testing**

### 3. Deployment
```bash
# Deploy to Firebase Hosting
firebase deploy
```

## 📋 Setup Instructions

### Prerequisites
- Modern web browser
- Firebase project
- Internet connection

### Initial Setup
1. **Clone the repository**
2. **Configure Firebase** (see FIREBASE_SETUP.md)
3. **Update Firebase config** in HTML files
4. **Deploy to Firebase Hosting**

### Firebase Configuration
Update the Firebase configuration in each HTML file:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Configure Firebase Storage CORS (see cors.json)
   - Use Firebase CLI to set CORS policies

2. **Authentication Issues**
   - Check Firebase Authentication settings
   - Verify authorized domains

3. **Database Permission Errors**
   - Review Firebase Database Rules
   - Check user authentication status

## 📈 Future Enhancements

### Planned Features
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Data export to Excel
- [ ] Automated billing reminders

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit testing implementation
- [ ] Performance optimization
- [ ] PWA features
- [ ] Offline functionality

## 🤝 Contributing

### Code Style
- Use modern JavaScript (ES6+)
- Follow consistent naming conventions
- Comment complex functions
- Maintain responsive design principles

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add: new feature description"

# Push and create pull request
git push origin feature/new-feature
```

## 📞 Support & Maintenance

### Monitoring
- Firebase Analytics for user behavior
- Error logging in browser console
- Performance monitoring

### Backup Strategy
- Firebase automatic backups
- Regular database exports
- Code repository backups

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: June 21, 2025  
**Version**: 2.0.0  
**Author**: Development Team
