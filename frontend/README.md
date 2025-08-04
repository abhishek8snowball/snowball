# SEO Analysis Frontend

A modern React application for comprehensive SEO and brand analysis with improved error handling, loading states, and user experience.

## 🚀 Features

- **Centralized API Management**: All API calls are managed through a centralized service
- **Error Boundary**: Graceful error handling with user-friendly error messages
- **Loading States**: Consistent loading indicators across all components
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Data Validation**: Input validation and error handling
- **Modern UI/UX**: Clean, professional interface with smooth transitions

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=https://snowball-u41l.onrender.com
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ErrorBoundary.jsx
│   └── LoadingSpinner.jsx
├── pages/               # Page components
│   ├── Dashboard.jsx
│   ├── DomainAnalysis.jsx
│   ├── History.jsx
│   └── ...
├── utils/               # Utility functions
│   └── api.js          # Centralized API service
├── styles/              # CSS files
└── App.jsx             # Main application component
```

## 🔧 Key Improvements

### 1. Centralized API Service (`src/utils/api.js`)
- **Consistent Error Handling**: All API errors are handled uniformly
- **Authentication**: Automatic token management
- **Request/Response Interceptors**: Global error handling and auth token injection
- **Timeout Configuration**: 30-second timeout for all requests

### 2. Error Boundary (`src/components/ErrorBoundary.jsx`)
- **Graceful Error Recovery**: Catches React errors and displays user-friendly messages
- **Development Mode**: Shows detailed error information in development
- **Production Safe**: Clean error messages in production

### 3. Loading States (`src/components/LoadingSpinner.jsx`)
- **Consistent Loading**: Reusable loading component with different sizes
- **User Feedback**: Clear indication of ongoing operations
- **Accessible**: Proper ARIA labels and semantic markup

### 4. Enhanced Components

#### Dashboard (`src/pages/Dashboard.jsx`)
- **Improved Layout**: Modern, responsive design
- **Better UX**: Clear action buttons and feedback
- **Data Validation**: URL validation before submission
- **State Management**: Proper loading and error states

#### Domain Analysis (`src/pages/DomainAnalysis.jsx`)
- **Domain Validation**: Regex-based domain validation
- **Error Handling**: Specific error messages for different failure types
- **Responsive Grid**: Adaptive layout for different screen sizes
- **Raw Data Toggle**: Collapsible raw API response

#### History (`src/pages/History.jsx`)
- **Enhanced Display**: Better visual hierarchy
- **Delete Confirmation**: Safe deletion with loading states
- **Empty States**: Helpful messages when no data is available
- **Date Formatting**: Proper date display with error handling

## 🎨 Styling

### Tailwind CSS Integration
- **Utility-First**: Rapid development with utility classes
- **Custom Components**: Reusable component classes
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Easy theme switching capability

### Custom CSS Classes
```css
.btn-primary    /* Primary action buttons */
.btn-secondary  /* Secondary action buttons */
.btn-danger     /* Destructive action buttons */
.input-field    /* Form input styling */
.card          /* Card container styling */
```

## 🔒 Security Features

### Authentication
- **Token Management**: Automatic token injection in API requests
- **Session Handling**: Automatic logout on token expiration
- **Secure Storage**: Token stored in localStorage with proper cleanup

### Input Validation
- **URL Validation**: Proper URL format checking
- **Domain Validation**: Regex-based domain validation
- **XSS Prevention**: Safe rendering of user content

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Key Features
- **Flexible Grid**: CSS Grid for responsive layouts
- **Mobile Navigation**: Touch-friendly interface
- **Readable Text**: Proper font sizes and spacing
- **Touch Targets**: Adequate button sizes for mobile

## 🚀 Performance Optimizations

### Code Splitting
- **Route-based**: Automatic code splitting by routes
- **Component-based**: Lazy loading of heavy components

### Bundle Optimization
- **Tree Shaking**: Unused code elimination
- **Minification**: Compressed production builds
- **Caching**: Proper cache headers for static assets

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login/Logout functionality
- [ ] Dashboard data loading
- [ ] Domain analysis submission
- [ ] History viewing and deletion
- [ ] Error handling scenarios
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Form validation

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check if backend server is running
   - Verify `VITE_API_URL` in `.env` file
   - Check network connectivity

2. **Authentication Issues**
   - Clear localStorage and re-login
   - Check token expiration
   - Verify backend auth middleware

3. **Build Errors**
   - Clear `node_modules` and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## 📈 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Filtering**: Search and filter history
- **Export Functionality**: PDF/CSV export of reports
- **Dark Mode**: Theme switching capability
- **Offline Support**: Service worker for offline functionality
- **Analytics**: User behavior tracking
- **A/B Testing**: Feature flag system

### Performance Improvements
- **Virtual Scrolling**: For large history lists
- **Image Optimization**: WebP format support
- **CDN Integration**: Static asset delivery
- **Caching Strategy**: Service worker caching

## 🤝 Contributing

### Code Standards
- **ESLint**: Follow linting rules
- **Prettier**: Consistent code formatting
- **Component Structure**: Follow established patterns
- **Error Handling**: Always handle potential errors
- **Loading States**: Provide user feedback

### Git Workflow
1. Create feature branch
2. Make changes with proper commits
3. Test thoroughly
4. Submit pull request
5. Code review and merge

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team
- Create an issue on GitHub
