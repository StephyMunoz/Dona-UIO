import React, {useState, useRef, useEffect} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Input, Icon, Button} from 'react-native-elements';
import Loading from '../../components/Loading';
import {Formik} from 'formik';
import * as yup from 'yup';
import Toast from 'react-native-easy-toast';
import {useAuth} from '../../lib/auth';
import {useNavigation} from '@react-navigation/native';
import accountImage from '../../images/gdpr_icons_5.png';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {auth} from '../../firebase';
import Account from './index';
import loginIcon from '../../images/hero_illustration.png';

const Register = ({role}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectRole, setSelectRole] = useState(0);
  const navigation = useNavigation();
  const {register} = useAuth();
  const toastRef = useRef();

  const schema = yup.object().shape({
    displayName: yup.string().required('Ingrese el nombre de la fundación'),
    email: yup
      .string()
      .email('Ingrese un email valido')
      .required('El campo email es requerido'),
    password: yup
      .string()
      .min(
        8,
        ({min}) => `La contraseña debe contener al menos ${min} caracteres`,
      )
      .required('Contraseña requerida'),
  });

  const loginScreen = () => {
    navigation.navigate('login');
  };
  const goToIndex = () => {
    setSelectRole(1);
    navigation.push('selectRole');
  };

  const onFinish = async data => {
    setLoading(true);
    // console.log('data', data.displayName);
    try {
      setLoading(true);
      await register({
        ...data,
        role,
      });
      await auth.currentUser.updateProfile({displayName: data.displayName});
      setLoading(false);
      navigation.navigate('home');
    } catch (error) {
      const errorCode = error.code;
      // toastRef.current.show(errorCode);
      // message.error(translateMessage(errorCode));
      // setLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Icon
        onPress={goToIndex}
        name="arrow-circle-o-left"
        type="font-awesome"
        containerStyle={styles.backIcon}
        size={35}
      />
      <Text style={styles.text}>Registra tu cuenta</Text>
      <Text style={styles.textLogin}>¿Ya tienes una cuenta?</Text>
      <TouchableOpacity onPress={loginScreen} style={styles.loginButton}>
        <Text style={styles.loginText}>Inicia sesión</Text>
      </TouchableOpacity>

      <Image source={accountImage} style={styles.logo} />

      <Formik
        validationSchema={schema}
        initialValues={{displayName: '', email: '', password: ''}}
        onSubmit={onFinish}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          isValid,
        }) => (
          <>
            <Input
              name="displayName"
              placeholder={
                role === 'user' ? 'Nombre de usuario' : 'Nombre de la fundación'
              }
              containerStyle={styles.inputForm}
              onChangeText={handleChange('displayName')}
              onBlur={handleBlur('displayName')}
              value={values.name}
              rightIcon={
                <Icon
                  type="material-community"
                  name="account-outline"
                  iconStyle={styles.iconRight}
                />
              }
            />
            {errors.displayName && (
              <Text style={{fontSize: 10, color: 'red'}}>
                {errors.displayName}
              </Text>
            )}
            <Input
              name="email"
              placeholder="Dirección de correo electrónico"
              containerStyle={styles.inputForm}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              rightIcon={
                <Icon
                  type="material-community"
                  name="at"
                  iconStyle={styles.iconRight}
                />
              }
            />
            {errors.email && (
              <Text style={{fontSize: 10, color: 'red'}}>{errors.email}</Text>
            )}
            <Input
              name="password"
              placeholder="Contraseña"
              style={styles.textInput}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              password={true}
              secureTextEntry={!showPassword}
              // onChange={e => onChange(e, 'password')}
              rightIcon={
                <Icon
                  type="material-community"
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  iconStyle={styles.iconRight}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {errors.password && (
              <Text style={{fontSize: 10, color: 'red'}}>
                {errors.password}
              </Text>
            )}

            <Button
              onPress={handleSubmit}
              title="Registrarme"
              disabled={!isValid}
              containerStyle={styles.btnContainerLogin}
            />
          </>
        )}
      </Formik>
      <Loading isVisible={loading} text="Creando una cuenta" />
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  inputForm: {
    width: '100%',
    marginTop: 20,
  },
  btnContainerLogin: {
    marginTop: 20,
    width: '70%',
    backgroundColor: '#00a680',
  },
  iconRight: {
    color: '#c1c1c1',
  },
  text: {
    textAlign: 'center',
    margin: 20,
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000',
  },
  logo: {
    height: 110,
    marginTop: 10,
    width: 100,
  },
  textLogin: {
    fontSize: 20,
    textAlign: 'center',
  },
  loginText: {
    textAlign: 'center',
    color: '#396EB0',
    height: 30,
    fontSize: 20,
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
  },
});
