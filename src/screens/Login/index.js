import React, {useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
          <TouchableOpacity
            onPress={() => navigation.navigate('login')}
            style={styles.loginButton}>
            <Text style={styles.loginText}>Inicia sesión</Text>
          </TouchableOpacity>
          <View style={styles.helpAccount}>
            <TouchableOpacity onPress={show} style={styles.button}>
              <Image
                source={refugio_animal}
                resizeMode="contain"
                style={styles.logo}
              />
              <Text style={styles.textLogin}>Fundación de </Text>
              <Text style={styles.textLogin}>ayuda animal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={showA} style={styles.button}>
              <Image
                source={shelter}
                resizeMode="contain"
                style={styles.logo}
              />
              <Text style={styles.textLogin}>Fundación de </Text>
              <Text style={styles.textLogin}>ayuda humanitaria</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={showU} style={styles.button}>
            <Image source={user} resizeMode="contain" style={styles.logo} />
            <Text style={styles.textLogin}>Usuario</Text>
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
    color: '#000',
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
