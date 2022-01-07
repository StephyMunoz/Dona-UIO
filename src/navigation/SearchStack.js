import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import FoundationInformation from '../screens/FoundationInformation';
import Search from '../screens/Search';

const Stack = createStackNavigator();

export default function FoundationStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="search_foundation"
        component={Search}
        options={{title: 'Buscar fundaciones'}}
      />
      <Stack.Screen
        name="select_foundation"
        component={FoundationInformation}
      />
    </Stack.Navigator>
  );
}
