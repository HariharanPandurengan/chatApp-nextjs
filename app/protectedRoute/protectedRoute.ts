"use client"
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useRouter, usePathname } from 'next/navigation'; // useRouter for redirection

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.login); // Get login status from Redux
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/') {
      router.push("/");
    }
  }, [isAuthenticated, router,pathname]);

  if(isAuthenticated || pathname === '/'){
    return children;
  } 
};

export default ProtectedRoute;