import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AnimalNeedsForm from '../components/animalNeeds/AnimalNeedsForm';
import Campaigns from '../screens/Campaigns';
import CampaignScreen from '../screens/CampaignScreen';
import FoundationInformation from '../screens/FoundationInformation';

const Stack = createStackNavigator();

export default function AnimalNeedsStack() {
  return (
    <Stack.Navigator
    // screenOptions={{
    //   headerShown: false,
    // }}
    >
      <Stack.Screen
        name="campaigns_page"
        component={Campaigns}
        options={{title: 'Campañas'}}
      />
      <Stack.Screen name="campaign_screen" component={CampaignScreen} />
      <Stack.Screen
        name="foundation_screen"
        component={FoundationInformation}
      />
    </Stack.Navigator>
  );
}
