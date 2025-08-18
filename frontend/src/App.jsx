import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Dashboard, HomeLayout, Landing, Login, Logout, Register, BlogScoring } from "./pages";
import History from "./pages/History";
import BlogEditor from "./pages/BlogEditor";
import ShopifyIntegration from "./pages/ShopifyIntegration";
import AuthSuccess from "./pages/AuthSuccess";
import Onboarding from "./pages/Onboarding";
import { ToastContainer, toast } from 'react-toastify';
import ErrorBoundary from './components/ErrorBoundary';
import { OnboardingProvider } from './contexts/OnboardingContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "history",
        element: <History />,
      },
      {
        path: "brand/:brandId/blog-scoring",
        element: <BlogScoring />,
      },
      {
        path: "editor/:postId",
        element: <BlogEditor />,
      },
      {
        path: "shopify-integration",
        element: <ShopifyIntegration />,
      },
      {
        path: "auth/success",
        element: <AuthSuccess />,
      },
      {
        path: "onboarding",
        element: <Onboarding />,
      }
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <OnboardingProvider>
        <RouterProvider router={router} />
        <ToastContainer 
          position='top-center'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </OnboardingProvider>
    </ErrorBoundary>
  );
}

export default App;
