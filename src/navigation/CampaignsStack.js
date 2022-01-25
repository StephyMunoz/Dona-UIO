import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Campaigns from '../screens/CampaignsUsers/Campaigns';
import FoundationInformation from '../screens/Users/FoundationInformation';
import EditCampaign from '../components/campaigns/EditCampaign';

const Stack = createStackNavigator();

export default function AnimalNeedsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="campaigns_page"
        component={Campaigns}
        options={{title: 'Campañas'}}
      />
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
