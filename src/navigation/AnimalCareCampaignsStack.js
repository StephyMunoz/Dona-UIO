import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AnimalCareCampaigns from '../screens/AnimalCareCampaigns';
import AnimalCampaignForm from '../components/campaigns/AnimalCampaignForm';
import EditCampaign from '../components/EditCampaign';

const Stack = createStackNavigator();

export default function AnimalCareCampaignsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="animalCampaign"
        component={AnimalCareCampaigns}
        options={{title: 'Campañas de la fundación'}}
      />
      <Stack.Screen
        name="form_animal_campaign"
        component={AnimalCampaignForm}
        options={{title: 'Registro de campañas'}}
      />
      <Stack.Screen
        name="edit_campaign"
        component={EditCampaign}
        options={{title: 'Edición de campaña'}}
      />
    </Stack.Navigator>
  );
}
