import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const router = useRouter();

    useEffect(() => {
      // Check if window is available
      if (typeof window !== "undefined") {
        const authToken =  sessionStorage.getItem('authToken');

        // If there's no authToken, redirect to login page
        if (!authToken) {
          router.replace('/');
        }
      }
    }, [router]);

    // If authToken exists, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuth;
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuth;
