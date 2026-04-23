import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/api';
import { useAuth } from '../providers/AuthProvider';
import { PageLoader, PageErrorState } from '../components/common/PageState';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthSession, isAuthenticated, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const error = searchParams.get('error');

    if (error) {
      const message = decodeURIComponent(error);
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    if (!accessToken) {
      const message = 'Token OAuth tidak ditemukan pada callback.';
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    let isMounted = true;

    async function completeLogin() {
      try {
        const currentUser = await completeOAuthSession(accessToken);

        if (isMounted) {
          toast.success('Login Google berhasil.');
          navigate(redirectTo || (currentUser.role === 'admin' ? '/admin' : '/dashboard'), {
            replace: true,
          });
        }
      } catch (error) {
        if (isMounted) {
          const message = getErrorMessage(error, 'Gagal menyelesaikan login Google.');
          setErrorMessage(message);
          toast.error(message);
        }
      }
    }

    void completeLogin();

    return () => {
      isMounted = false;
    };
  }, [completeOAuthSession, navigate, searchParams]);

  if (isAuthenticated && !errorMessage) {
    return (
      <Navigate
        to={redirectTo || (user?.role === 'admin' ? '/admin' : '/dashboard')}
        replace
      />
    );
  }

  if (errorMessage) {
    return (
      <PageErrorState
        title="Google OAuth Gagal"
        message={errorMessage}
      />
    );
  }

  return <PageLoader message="Menyelesaikan login Google..." />;
}
