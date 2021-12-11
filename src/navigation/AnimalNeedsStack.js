import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Account from '../screens/Login/index';
import Login from '../screens/Login/Login';
import Register from '../screens/Login/Register';
import AnimalNeeds from '../screens/AnimalNeeds/AnimalNeeds';
import AnimalNeedsForm from '../components/animalNeeds/AnimalNeedsForm';
import AnimalCampaignForm from '../components/campaigns/AnimalCampaignForm';

const Stack = createStackNavigator();

export default function AnimalNeedsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="animal_needs"
        component={AnimalNeeds}
        // options={{title: 'Crea una cuenta'}}
      />
      <Stack.Screen
        name="form_animal_needs"
        component={AnimalNeedsForm}
        options={{title: 'Formulario'}}
      />
    </Stack.Navigator>
  );
}
