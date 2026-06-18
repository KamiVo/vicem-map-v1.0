import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Đăng nhập
  const login = (email, password) => {
    if (!auth) return Promise.reject("Firebase Auth chưa được cấu hình.");
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Đăng xuất
  const logout = () => {
    if (!auth) return Promise.resolve();
    return signOut(auth);
  };

  // Theo dõi trạng thái đăng nhập
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    isAdmin: !!currentUser // Nếu có user login thì là Admin (Khách không cần login)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
