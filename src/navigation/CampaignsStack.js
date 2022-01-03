import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AnimalNeedsForm from '../components/animalNeeds/AnimalNeedsForm';
import Campaigns from '../screens/Campaigns';
import CampaignScreen from '../screens/CampaignScreen';
import FoundationInformation from '../screens/FoundationInformation';
import EditCampaign from '../components/EditCampaign';

const Stack = createStackNavigator();

export default function AnimalNeedsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="campaigns_page"
        component={Campaigns}
        options={{title: 'Campañas registradas'}}
      />
      <Stack.Screen name="campaign_screen" component={CampaignScreen} />
      <Stack.Screen
        name="foundation_screen"
        component={FoundationInformation}
      />
      <Stack.Screen
        name="edit_campaign_animals"
        component={EditCampaign}
        options={{title: 'Edición de campaña'}}
      />
    </Stack.Navigator>
  );
}
