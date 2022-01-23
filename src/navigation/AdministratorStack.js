import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import FoundationInformation from '../screens/Users/FoundationInformation';
import FoundationsList from '../screens/FoundationsList';

const Stack = createStackNavigator();

export default function AdministratorStack() {
  return (
    <Stack.Navigator
    // screenOptions={{
    //   headerShown: false,
    // }}
    >
      <Stack.Screen
        name="foundation_list"
        component={FoundationsList}
        options={{title: 'Fundaciones registradas'}}
      />
      <Stack.Screen
        name="foundation_information"
        component={FoundationInformation}
      />
    </Stack.Navigator>
  );
}
