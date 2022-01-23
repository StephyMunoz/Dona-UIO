import React, {createContext, useContext, useEffect, useState} from 'react';
import {auth, db} from '../firebase';
import {Alert} from 'react-native';
import translateMessage from '../utils/translateMessage';

export const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function useAuthProvider() {
  const [user, setUser] = useState(null);

  const handleUser = user => {
    if (user) {
      // si tengo sesión activa
      setUser(user);

      return user;
    } else {
      // no tengo sesión activa
      setUser(false);
      return false;
    }
  };

  useEffect(() => {
    // try {
    const init = () => {
      auth.onAuthStateChanged(async user => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          const userSnap = await db.ref(`users/${user.uid}`).once('value');
          const userData = userSnap.val();

          handleUser({...user, ...userData});

          // history.replace(Routes.HOME);
        } else {
          // User is signed out
          handleUser(false);
        }
      });
    };
    init();
  }, []);

  async function register(data) {
    try {
      const userData = await auth.createUserWithEmailAndPassword(
        data.email,
        data.password,
      );
      const {uid} = userData.user;
      let description = '';
      const {displayName, email, role} = data;
      await db.ref(`users/${userData.user.uid}`).set({
        displayName,
        email,
        uid,
        role,
        description,
      });

      //.then((user) => {
      // Signed in
      // message.success('Usuario registrado');
      //handleUser(user);
      // })
      //return true;
    } catch (error) {
      const errorCode = error.code;
      Alert.alert(
        'Ha ocurrido un error en el registro: ',
        translateMessage(errorCode),
      ),
        // message.error(translateMessage(errorCode));
        handleUser(false);
      throw error;
    }
  }

  async function login(email, password) {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(user => {
        // Signed in
        handleUser(user);
      })
      .catch(error => {
        const errorCode = error.code;
        Alert.alert('Credenciales invalidas', errorCode);

        handleUser(false);
      });
  }

  async function logout() {
    try {
      await auth.signOut();
      handleUser(false);
    } catch (error) {}
  }

  const sendPasswordResetEmail = email => {
    return auth.sendPasswordResetEmail(email).then(() => {
      return true;
    });
  };

  const confirmPasswordReset = (password, code) => {
    const resetCode = code;

    return auth.confirmPasswordReset(resetCode, password).then(() => {
      return true;
    });
  };

  return {
    user,
    register,
    login,
    logout,
    sendPasswordResetEmail,
    confirmPasswordReset,
  };
}
