import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import FoundationInformation from '../screens/Users/FoundationInformation';
import Favorites from '../screens/Users/Favorites';
import PublicationsFoundation from '../screens/Users/PublicationsFoundation';

const Stack = createStackNavigator();

export default function FoundationStack() {
  return (
    <Stack.Navigator
    // screenOptions={{
    //   headerShown: false,
    // }}
    >
      <Stack.Screen
        name="favorites"
        component={Favorites}
        options={{title: 'Fundaciones favoritas'}}
      />
      <Stack.Screen name="publications" component={PublicationsFoundation} />
      <Stack.Screen
        name="foundation_favorite"
        component={FoundationInformation}
      />
    </Stack.Navigator>
  );
}
