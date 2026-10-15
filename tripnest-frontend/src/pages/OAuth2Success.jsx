import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2Success = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const role  = params.get('role');

    if (token && email && role) {
      // LocalStorage mein save karo
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ token, email, role }));

      setStatus('Login successful! Redirecting...');

      // Thoda wait karo phir redirect karo
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } else {
      setStatus('Login failed! Redirecting...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default OAuth2Success;