/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
// import {firebaseApp} from './src/firebase/index';
import {auth} from './src/firebase/index';
import Navigation from './src/navigation/Navigation';
import {AuthProvider} from './src/lib/auth';
import {LogBox} from 'react-native';

const App = () => {
  useEffect(() => {
    LogBox.ignoreAllLogs();
  });

  return (
    <>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </>
  );
};

export default App;
