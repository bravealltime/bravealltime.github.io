# Firebase Setup Guide for Electricity Bill Calculator

## Step 1: Enable Firebase Authentication

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select your project: `electricity-bill-calcula-ea4a2`

2. **Enable Authentication**
   - In the left sidebar, click on "Authentication"
   - Click "Get started" or "Set up sign-in method"
   - Go to the "Sign-in method" tab

3. **Enable Email/Password Authentication**
   - Click on "Email/Password" provider
   - Toggle the switch to "Enable"
   - Make sure "Email link (passwordless sign-in)" is also enabled if you want password reset functionality
   - Click "Save"

## Step 2: Configure Authentication Settings

1. **User Management**
   - Go to "Users" tab in Authentication
   - You can manually add users here or use the create-admin.html page

2. **Settings**
   - Go to "Settings" tab
   - Add your domain to "Authorized domains" if needed
   - For localhost testing, make sure `localhost` is in the authorized domains

## Step 3: Test the Setup

1. **Run create-admin.html**
   - Open `create-admin.html` in your browser
   - Click "สร้าง Admin User" button
   - You should see a success message

2. **Test Login**
   - Go to `login.html`
   - Use the admin credentials:
     - Email: `admin@electricity.com`
     - Password: `fluke 1997`

## Alternative: Manual Admin Creation

If the create-admin.html still doesn't work, you can manually create the admin user:

### Method 1: Firebase Console
1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter:
   - Email: `admin@electricity.com`
   - Password: `fluke 1997`
4. Click "Add user"

### Method 2: Database Setup
After creating the user in Firebase Console, manually add the user data to Realtime Database:

```json
{
  "users": {
    "USER_UID_HERE": {
      "name": "Admin",
      "email": "admin@electricity.com",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "profileImage": null,
      "isAdmin": true
    }
  }
}
```

Replace `USER_UID_HERE` with the actual UID from Firebase Authentication.

## Troubleshooting

### Error: "auth/configuration-not-found"
- **Cause**: Firebase Authentication is not enabled
- **Solution**: Follow Step 1 above to enable Email/Password authentication

### Error: "auth/operation-not-allowed"
- **Cause**: Email/Password sign-up is disabled
- **Solution**: Enable Email/Password provider in Firebase Console

### Error: "auth/invalid-api-key"
- **Cause**: API key is incorrect or project is misconfigured
- **Solution**: Check Firebase configuration in your HTML files

### Error: "auth/unauthorized-domain"
- **Cause**: Domain is not authorized
- **Solution**: Add your domain to authorized domains in Firebase Console

## Security Rules

Make sure your Realtime Database rules allow user data access:

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
      ".write": "auth != null"
    }
  }
}
```

## Testing Checklist

- [ ] Firebase Authentication is enabled
- [ ] Email/Password provider is enabled
- [ ] Domain is authorized (localhost for testing)
- [ ] Admin user is created successfully
- [ ] Login works with admin credentials
- [ ] Admin can access admin panel
- [ ] Role-based permissions work correctly 