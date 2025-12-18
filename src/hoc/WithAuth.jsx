"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      // Check if window is available
      if (typeof window !== "undefined") {
        // Check sessionStorage first
        let authToken = sessionStorage.getItem('authToken');

        // Also check URL params for token (local dev cross-port auth)
        if (!authToken) {
          const urlParams = new URLSearchParams(window.location.search);
          const urlToken = urlParams.get('token');
          if (urlToken) {
            authToken = urlToken;
            sessionStorage.setItem('authToken', urlToken);
          }
        }

        if (!authToken) {
          // No token - redirect to login
          router.replace('/');
        } else {
          // Token exists - allow render
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      }
    }, [router]);

    // Show nothing while checking auth (prevents flash of protected content)
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    // Not authenticated - don't render anything (redirect is happening)
    if (!isAuthenticated) {
      return null;
    }

    // Authenticated - render the wrapped component
    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuth;
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuth;
