import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';


export default function OAuth2Callback() {
  const [params]           = useSearchParams();
  const { loginWithTokens } = useAuth();
  const navigate           = useNavigate();
  const handled            = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const error        = params.get('error');
    const accessToken  = params.get('token');
    const refreshToken = params.get('refreshToken');
    const fullName     = params.get('fullName') ?? '';
    const email        = params.get('email')    ?? '';
    const role         = params.get('role')     ?? 'USER';

    if (error) {
      navigate('/login?oauthError=' + encodeURIComponent(error), { replace: true });
      return;
    }

    if (accessToken && refreshToken) {
      loginWithTokens({ accessToken, refreshToken, email, fullName, role });
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return <LoadingSpinner />;
}
