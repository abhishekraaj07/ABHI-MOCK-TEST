import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextType {
  path: string;
  currentPath: string;
  queryParams: URLSearchParams;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUrl, setCurrentUrl] = useState<string>(() => window.location.pathname + window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to !== window.location.pathname + window.location.search) {
      window.history.pushState(null, '', to);
      setCurrentUrl(to);
      window.scrollTo(0, 0);
    }
  }, []);

  const path = currentUrl.split('?')[0];
  const queryParams = new URLSearchParams(currentUrl.includes('?') ? currentUrl.split('?')[1] : '');

  return (
    <RouterContext.Provider value={{ path, currentPath: path, queryParams, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export const Link: React.FC<{
  href: string;
  className?: string;
  children: React.ReactNode;
  id?: string;
  onClick?: () => void;
}> = ({ href, className, children, id, onClick }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return; // let browser open in new tab
    }
    e.preventDefault();
    onClick?.();
    navigate(href);
  };

  return (
    <a id={id} href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};
