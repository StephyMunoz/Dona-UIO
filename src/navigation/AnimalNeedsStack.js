import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Account from '../screens/Login/index';
import Login from '../screens/Login/Login';
import Register from '../screens/Login/Register';
import AnimalNeeds from '../screens/AnimalNeeds/AnimalNeeds';
import AnimalNeedsForm from '../components/animalNeeds/AnimalNeedsForm';
import AnimalCampaignForm from '../components/campaigns/AnimalCampaignForm';
import EditAnimalNeed from '../components/EditAnimalNeed';

const Stack = createStackNavigator();

export default function AnimalNeedsStack() {
  return (
    <Stack.Navigator
    // screenOptions={{
    //   headerShown: false,
    // }}
    >
      <Stack.Screen
        name="animal_needs"
        component={AnimalNeeds}
        options={{title: 'Lo que necesita tu fundación'}}
      />
      <Stack.Screen
        name="form_animal_needs"
        component={AnimalNeedsForm}
        options={{title: 'Registro de necesidades'}}
      />
      <Stack.Screen
        name="edit_animal_need"
        component={EditAnimalNeed}
        options={{title: 'Edición de necesidades'}}
      />
    </Stack.Navigator>
  );
}
