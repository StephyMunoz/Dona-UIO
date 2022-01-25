import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Icon} from 'react-native-elements';
import LoginStack from './LoginStack';
import EditProfileOptions from '../components/account/EditProfileOptions';
import EditProfileOptionsUser from '../components/account/EditProfileOptionsUser';
import {useAuth} from '../lib/auth';
import AnimalNeedsStack from './AnimalNeedsStack';
import AnimalCareCampaignsStack from './AnimalCareCampaignsStack';
import HumanitarianHelpStack from './HumanitarianHelpStack';
import CampaignsStack from './CampaignsStack';
import FoundationsStack from './FoundationsStack';
import FavoritesStack from './FavoritesStack';
import AdministratorStack from './AdministratorStack';
import FoundationView from '../screens/FoundationView';
import SearchStack from './SearchStack';

const Tab = createBottomTabNavigator();

const Navigation = () => {
  const {user} = useAuth();
  return (
    <NavigationContainer>
      {!user && (
        <Tab.Navigator
          initialRouteName="home"
          screenOptions={({route}) => ({
            tabBarIcon: ({color}) => screenOptions(route, color),
            headerShown: false,
            tabBarInactiveTintColor: '#646464',
            tabBarActiveTintColor: '#00a680',
          })}>
          <Tab.Screen
            name="foundations_needs"
            component={FoundationsStack}
            options={{title: 'Inicio'}}
          />
          <Tab.Screen
            name="search"
            component={SearchStack}
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

      {user && user.emailVerified === false && (
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
            name="foundations_needs"
            component={FoundationsStack}
            options={{title: 'Inicio'}}
          />
          <Tab.Screen
            name="search"
            component={SearchStack}
            options={{title: 'Buscar'}}
          />
          <Tab.Screen
            name="campaigns"
            component={CampaignsStack}
            options={{title: 'Campañas'}}
          />
          <Tab.Screen
            name="profile"
            component={EditProfileOptionsUser}
            options={{title: 'Perfil'}}
          />
        </Tab.Navigator>
      )}

      {(user && user.role) === 'user' && user.emailVerified === true && (
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
            name="foundations_needs"
            component={FoundationsStack}
            options={{title: 'Inicio'}}
          />
          <Tab.Screen
            name="search"
            component={SearchStack}
            options={{title: 'Buscar'}}
          />
          <Tab.Screen
            name="favorites_stack"
            component={FavoritesStack}
            options={{title: 'Favoritos'}}
          />
          <Tab.Screen
            name="campaigns"
            component={CampaignsStack}
            options={{title: 'Campañas'}}
          />
          <Tab.Screen
            name="profile"
            component={EditProfileOptionsUser}
            options={{title: 'Perfil'}}
          />
        </Tab.Navigator>
      )}
      {(user && user.role) === 'animal_help' && user.emailVerified === true && (
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
            name="foundations_needs"
            component={FoundationsStack}
            options={{title: 'Inicio'}}
          />
          <Tab.Screen
            name="animalNeeds"
            component={AnimalNeedsStack}
            options={{title: 'Necesidades'}}
          />
          <Tab.Screen
            name="animal-campaigns"
            component={AnimalCareCampaignsStack}
            options={{title: 'Campañas'}}
          />
          <Tab.Screen
            name="info_foundation"
            component={FoundationView}
            options={{title: 'Fundación'}}
          />

          <Tab.Screen
            name="profile"
            component={EditProfileOptions}
            options={{title: 'Perfil'}}
          />
        </Tab.Navigator>
      )}
      {(user && user.role) === 'humanitarian_help' &&
        user.emailVerified === true && (
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
              name="foundations_needs"
              component={FoundationsStack}
              options={{title: 'Inicio'}}
            />
            <Tab.Screen
              name="humanitarian_help"
              component={HumanitarianHelpStack}
              options={{title: 'Necesidades'}}
            />
            <Tab.Screen
              name="info_foundation"
              component={FoundationView}
              options={{title: 'Fundación'}}
            />

            <Tab.Screen
              name="profile"
              component={EditProfileOptions}
              options={{title: 'Perfil'}}
            />
          </Tab.Navigator>
        )}
      {(user && user.role) === 'administrator' && user.emailVerified === true && (
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
            name="foundations_needs"
            component={FoundationsStack}
            options={{title: 'Inicio'}}
          />
          <Tab.Screen
            name="campaigns"
            component={CampaignsStack}
            options={{title: 'Campañas'}}
          />
          <Tab.Screen
            name="foundations"
            component={AdministratorStack}
            options={{title: 'Fundaciones'}}
          />

          <Tab.Screen
            name="profile"
            component={EditProfileOptionsUser}
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
    case 'foundations_needs':
      iconName = 'home';
      break;
    case 'home':
      iconName = 'home';
      break;
    case 'search':
      iconName = 'magnify';
      break;
    case 'info_foundation':
      iconName = 'account-box-outline';
      break;
    case 'campaigns':
      iconName = 'paw';
      break;
    case 'profile':
      iconName = 'account-outline';
      break;
    case 'favorites_stack':
      iconName = 'heart-outline';
      break;
    case 'animal-campaigns':
      iconName = 'paw';
      break;
    case 'humanitarian_help':
      iconName = 'star-outline';
      break;
    case 'foundations':
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
