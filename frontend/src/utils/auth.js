// Utility function to decode JWT token and extract user information
export const decodeToken = (token) => {
  try {
    // JWT tokens have 3 parts separated by dots
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserInfo = () => {
  try {
    const token = localStorage.getItem('auth') || null;
    if (!token) return null;
    
    return decodeToken(token);
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

export const getUserName = () => {
  const userInfo = getUserInfo();
  return userInfo?.name || 'User';
};

export const getUserRole = () => {
  const userInfo = getUserInfo();
  return userInfo?.role || 'user';
};

export const isSuperuser = () => {
  return getUserRole() === 'superuser';
};
