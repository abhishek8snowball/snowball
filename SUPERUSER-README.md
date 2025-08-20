# Superuser Implementation

## Overview
The superuser functionality has been implemented to restrict domain analysis features to authorized users only. Regular users can access brand dashboard, blog analysis, and content calendar features, while only superusers can access domain analysis functionality.

## Backend Changes

### User Model
- Added `role` field to User schema with enum values `['user', 'superuser']` and default `'user'`
- Updated JWT token generation to include user role

### Middleware
- Enhanced `authenticationMiddleware` to fetch full user information including role
- Added `requireSuperuser` middleware to protect domain analysis routes
- Updated all route imports to use destructured middleware

### Protected Routes
- `/api/v1/domain-analysis/*` routes now require superuser privileges
- Added `/api/v1/users/me` endpoint to get current user info including role

## Frontend Changes

### Authentication Utils
- Added `getUserRole()` and `isSuperuser()` helper functions
- Updated JWT token decoding to handle role information

### Dashboard Component
- Domain analysis sidebar option only shows for superusers
- Domain analysis cards are hidden for regular users
- Quick Link Analysis feature is superuser-only
- Navigation to `/domain-analysis` route is conditional

### Route Protection
- `DomainAnalysisDashboard` component redirects non-superusers to `/dashboard`
- Login flow updated to consider superuser status for redirects

## Testing

### Making a User Superuser
Use the provided script to promote a user to superuser:

```bash
cd backend
node scripts/make-superuser.js user@example.com
```

### API Testing
Test user role with the `/me` endpoint:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/v1/users/me
```

## Security Notes
- Domain analysis functionality is completely hidden from regular users
- Backend routes are protected with middleware requiring superuser role
- Frontend conditionally renders UI elements based on user role
- Route protection prevents direct navigation to restricted pages

## Current User Flow
1. **Regular User**: Login → Onboarding (if needed) → Dashboard (brand features only)
2. **Superuser**: Login → Onboarding (if needed) → Dashboard (all features) or Domain Analysis Dashboard (if has brands)

## Files Modified
- `backend/models/User.js` - Added role field
- `backend/middleware/auth.js` - Enhanced with superuser middleware  
- `backend/controllers/user.js` - Updated JWT generation
- `backend/routes/domainAnalysis.js` - Added superuser requirement
- `frontend/src/utils/auth.js` - Added role helpers
- `frontend/src/pages/Dashboard.jsx` - Conditional UI rendering
- `frontend/src/pages/DomainAnalysisDashboard.jsx` - Route protection
- `frontend/src/pages/Login.jsx` - Updated redirect logic