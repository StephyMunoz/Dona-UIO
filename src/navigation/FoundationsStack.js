import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Home from '../screens/Home';
import FoundationInformation from '../screens/Users/FoundationInformation';
import EditAnimalNeed from '../components/animalNeeds/EditAnimalNeed';
import EditHumanitarianNeed from '../components/humanitary_needs/EditHumanitarianNeed';

const Stack = createStackNavigator();

export default function FoundationStack() {
  return (
    <Stack.Navigator
    // screenOptions={{
    //   headerShown: false,
    // }}
    >
      <Stack.Screen name="home" component={Home} options={{title: 'Inicio'}} />
      <Stack.Screen name="foundation" component={FoundationInformation} />
      <Stack.Screen
        name="edit_animals_publication"
        component={EditAnimalNeed}
        options={{title: 'Editar necesidades'}}
      />
      <Stack.Screen
        name="edit_humanitarian_publication"
        component={EditHumanitarianNeed}
        options={{title: 'Editar necesidades'}}
      />
    </Stack.Navigator>
  );
}
