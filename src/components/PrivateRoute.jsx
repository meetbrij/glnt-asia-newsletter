// components/PrivateRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { QuerySupabase } from './utils/supabaseClient';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await QuerySupabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    // Optional: listen for auth state changes
    const { data: listener } = QuerySupabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return session ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;