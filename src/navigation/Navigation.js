import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Icon} from 'react-native-elements';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Campaigns from '../screens/Campaigns';
import LoginStack from './LoginStack';
import EditProfileOptions from '../components/account/EditProfileOptions';
import EditProfileOptionsUser from '../components/account/EditProfileOptionsUser';
import {useAuth} from '../lib/auth';
import Favorites from '../screens/Favorites';
import AnimalNeedsStack from './AnimalNeedsStack';
import AnimalCareCampaignsStack from './AnimalCareCampaignsStack';
import HumanitarianHelpStack from './HumanitarianHelpStack';
import CampaignsStack from './CampaignsStack';

const Tab = createBottomTabNavigator();

const Navigation = () => {
  const {user} = useAuth();
  return (
    <NavigationContainer>
      {!user && (
        <Tab.Navigator
          initialRouteName="home"
          tabBarOptions={{
            inactiveTintColor: '#646464',
            activeTintColor: '#00a680',
          }}
          screenOptions={({route}) => ({
            tabBarIcon: ({color}) => screenOptions(route, color),
            headerShown: false,
          })}>
          <Tab.Screen
            name="home"
            component={Home}
            options={{title: 'Inicio'}}
          />
          <Tab.Screen
            name="search"
            component={Search}
            options={{title: 'Buscar'}}
          />
          <Tab.Screen
            name="campaigns"
            component={CampaignsStack}
            options={{title: 'Campañas'}}
          />
          <Tab.Screen
            name="profile"
            component={LoginStack}
            options={{title: 'Registrate'}}
          />
        </Tab.Navigator>
      )}
      {(user && user.role) === 'user' && (
        <Tab.Navigator
          initialRouteName="home"
          tabBarOptions={{
            inactiveTintColor: '#646464',
            activeTintColor: '#00a680',
          }}
          screenOptions={({route}) => ({
            tabBarIcon: ({color}) => screenOptions(route, color),
            headerShown: false,
          })}>
          <Tab.Screen
            name="home"
            component={Home}
            options={{title: 'Inicio'}}
          />
          <Tab.Screen
            name="search"
            component={Search}
            options={{title: 'Buscar'}}
          />
          <Tab.Screen
            name="campaigns"
            component={CampaignsStack}
            options={{title: 'Campañas'}}
          />
          <Tab.Screen
            name="favorites"
            component={Favorites}
            options={{title: 'Favoritos'}}
          />
          <Tab.Screen
            name="profile"
            component={EditProfileOptionsUser}
            options={{title: 'Perfil'}}
          />
        </Tab.Navigator>
      )}
      {(user && user.role) === 'animal_help' && (
        <Tab.Navigator
          initialRouteName="home"
          tabBarOptions={{
            inactiveTintColor: '#646464',
            activeTintColor: '#00a680',
          }}
          screenOptions={({route}) => ({
            tabBarIcon: ({color}) => screenOptions(route, color),
            headerShown: false,
          })}>
          <Tab.Screen
            name="home"
            component={Home}
            options={{title: 'Inicio'}}
          />

          <Tab.Screen
            name="animal-campaigns"
            component={AnimalCareCampaignsStack}
            options={{title: 'Campañas'}}
          />
          <Tab.Screen
            name="animalNeeds"
            component={AnimalNeedsStack}
            options={{title: 'Necesidades'}}
          />

          <Tab.Screen
            name="profile"
            component={EditProfileOptions}
            options={{title: 'Perfil'}}
          />
        </Tab.Navigator>
      )}
      {(user && user.role) === 'humanitarian_help' && (
        <Tab.Navigator
          initialRouteName="home"
          tabBarOptions={{
            inactiveTintColor: '#646464',
            activeTintColor: '#00a680',
          }}
          screenOptions={({route}) => ({
            tabBarIcon: ({color}) => screenOptions(route, color),
            headerShown: false,
          })}>
          <Tab.Screen
            name="home"
            component={Home}
            options={{title: 'Inicio'}}
          />
          <Tab.Screen
            name="humanitarian_help"
            component={HumanitarianHelpStack}
            options={{title: 'Necesidades'}}
          />

          <Tab.Screen
            name="profile"
            component={EditProfileOptions}
            options={{title: 'Perfil'}}
          />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
};

export default Navigation;

function screenOptions(route, color) {
  let iconName;

  switch (route.name) {
    case 'home':
      iconName = 'home';
      break;
    case 'search':
      iconName = 'magnify';
      break;
    case 'campaigns':
      iconName = 'paw';
      break;
    case 'profile':
      iconName = 'account-outline';
      break;
    case 'favorites':
      iconName = 'heart-outline';
      break;
    case 'animal-campaigns':
      iconName = 'paw';
      break;
    case 'humanitarian_help':
      iconName = 'star-outline';
      break;
    case 'animalNeeds':
      iconName = 'star-outline';
      break;
    default:
      break;
  }
  return (
    <Icon type="material-community" name={iconName} size={22} color={color} />
  );
}
