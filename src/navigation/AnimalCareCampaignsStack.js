import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AnimalCareCampaigns from '../screens/AnimalCareCampaigns';
import AnimalCampaignForm from '../components/campaigns/AnimalCampaignForm';

const Stack = createStackNavigator();

export default function AnimalCareCampaignsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="animalCampaign"
        component={AnimalCareCampaigns}
        // options={{title: 'Crea una cuenta'}}
      />
      <Stack.Screen
        name="form_animal_campaign"
        component={AnimalCampaignForm}
        options={{title: 'Formulario'}}
      />
    </Stack.Navigator>
  );
}
