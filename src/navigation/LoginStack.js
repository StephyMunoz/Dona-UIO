import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Account from '../screens/Login/index';
import Login from '../screens/Login/Login';
import Register from '../screens/Login/Register';

const Stack = createStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="selectRole"
        component={Account}
        // options={{title: 'Crea una cuenta'}}
      />
      <Stack.Screen
        name="login"
        component={Login}
        options={{title: 'Iniciar sesión'}}
      />
      <Stack.Screen
        name="register"
        component={Register}
        options={{title: 'Registro'}}
      />
    </Stack.Navigator>
  );
}
