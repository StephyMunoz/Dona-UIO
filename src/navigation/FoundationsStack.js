import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Home from '../screens/Home';
import FoundationNeed from '../screens/FoundationNeed';
import FoundationInformation from '../screens/FoundationInformation';

const Stack = createStackNavigator();

export default function FoundationStack() {
  return (
    <Stack.Navigator
    // screenOptions={{
    //   headerShown: false,
    // }}
    >
      <Stack.Screen name="home" component={Home} options={{title: 'Inicio'}} />
      <Stack.Screen name="foundation_need" component={FoundationNeed} />
      <Stack.Screen name="foundation" component={FoundationInformation} />
    </Stack.Navigator>
  );
}
