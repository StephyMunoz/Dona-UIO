import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HumanitarianNeeds from '../screens/HumanitarianNeeds';
import HumanitarianNeedsForm from '../components/humanitary_needs/HumanitarianNeedsForm';

const Stack = createStackNavigator();

export default function HumanitarianHelpStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="humanitarian_needs"
        component={HumanitarianNeeds}
        // options={{title: 'Crea una cuenta'}}
      />
      <Stack.Screen
        name="form_humanitarian_needs"
        component={HumanitarianNeedsForm}
        options={{title: 'Formulario'}}
      />
    </Stack.Navigator>
  );
}
