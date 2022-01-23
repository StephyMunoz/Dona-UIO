import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HumanitarianNeeds from '../screens/HumanitarianNeed/HumanitarianNeeds';
import HumanitarianNeedsForm from '../components/humanitary_needs/HumanitarianNeedsForm';
import EditHumanitarianNeed from '../components/humanitary_needs/EditHumanitarianNeed';

const Stack = createStackNavigator();

export default function HumanitarianHelpStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="humanitarian_needs"
        component={HumanitarianNeeds}
        options={{title: 'Requerimientos de la fundación'}}
      />
      <Stack.Screen
        name="form_humanitarian_needs"
        component={HumanitarianNeedsForm}
        options={{title: 'Registro de necesidades'}}
      />
      <Stack.Screen
        name="form_edit_needs"
        component={EditHumanitarianNeed}
        options={{title: 'Edición de requerimiento'}}
      />
    </Stack.Navigator>
  );
}
