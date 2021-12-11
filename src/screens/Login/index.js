import React, {useEffect, useState} from 'react';
import {
  Image,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import refugio_animal from '../../images/DogJumpDoodle.png';
import shelter from '../../images/LovingDoodle.png';
import user from '../../images/RollingDoodle.png';
import {useNavigation} from '@react-navigation/native';
import Register from './Register';

const SelectRole = () => {
  const [role, setRole] = useState(null);
  const navigation = useNavigation();

  const show = () => {
    setRole('animal_help');
  };
  const showA = () => {
    setRole('humanitarian_help');
  };
  const showU = () => {
    setRole('user');
  };
  const loginScreen = () => {
    navigation.navigate('login');
  };
  return (
    <ScrollView style={styles.container}>
      {!role ? (
        <View>
          <Text style={styles.text}>
            Selecciona el tipo de cuenta que deseas crear...
          </Text>
          <Text style={styles.textLogin}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={loginScreen} style={styles.loginButton}>
            <Text style={styles.loginText}>Inicia sesión</Text>
          </TouchableOpacity>
          <View style={styles.helpAccount}>
            <TouchableOpacity onPress={show} style={styles.button}>
              <Image
                source={refugio_animal}
                resizeMode="contain"
                style={styles.logo}
              />
              <Text>Fundación de </Text>
              <Text>ayuda animal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={showA} style={styles.button}>
              <Image
                source={shelter}
                resizeMode="contain"
                style={styles.logo}
              />
              <Text>Fundación de </Text>
              <Text>ayuda humanitaria</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={showU} style={styles.button}>
            <Image source={user} resizeMode="contain" style={styles.logo} />
            <Text>Usuario</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Register role={role} />
      )}
    </ScrollView>
  );
};

export default SelectRole;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignContent: 'center',
    position: 'absolute',
  },
  textLogin: {
    fontSize: 20,
    textAlign: 'center',
  },
  loginButton: {
    textAlign: 'center',
  },
  loginText: {
    textAlign: 'center',
    color: '#396EB0',
    height: 30,
    fontSize: 20,
  },
  text: {
    textAlign: 'center',
    margin: 20,
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000',
  },
  helpAccount: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  logo: {
    height: 150,
    marginTop: 10,
    width: 150,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    margin: 10,
    padding: 10,
  },
});
