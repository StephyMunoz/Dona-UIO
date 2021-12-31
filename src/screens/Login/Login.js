import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements';
import Loading from '../../components/Loading';
import {Formik} from 'formik';
import * as yup from 'yup';
import {useAuth} from '../../lib/auth';
import {useNavigation} from '@react-navigation/native';
import loginIcon from '../../images/hero_illustration.png';
import {auth} from '../../firebase';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const {login, user} = useAuth();
  const navigation = useNavigation();

  const schema = yup.object().shape({
    email: yup
      .string()
      .email('Please enter valid email')
      .required('Email Address is Required'),
    password: yup
      .string()
      .min(8, ({min}) => `Password must be at least ${min} characters`)
      .required('Password is required'),
  });

  const loginScreen = () => {
    navigation.navigate('register');
  };

  useEffect(() => {
    if (!!user) {
      navigation.navigate('home');
    }
  }, [user, navigation]);

  const onFinishLog = data => {
    setLoading(true);
    try {
      login(data.email, data.password);
      // console.log('usuario logeado');
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log('e', e);
    }
  };

  if (user === null) {
    setLoading(true);
    setLoadingText('Verificando sesión');
    return <Loading isVisible={true} text="Verificando sesión" />;
  }

  return (
    <View style={styles.formContainer}>
      <Icon
        onPress={() => navigation.navigate('register')}
        name="arrow-circle-o-left"
        type="font-awesome"
        containerStyle={styles.backIcon}
        size={35}
      />
      <Text style={styles.text}>Inicia sesión</Text>
      <Text style={styles.textLogin}>¿Aún no tienes una cuenta?</Text>
      <TouchableOpacity onPress={loginScreen} style={styles.loginButton}>
        <Text style={styles.loginText}>Registrate</Text>
      </TouchableOpacity>
      <Image source={loginIcon} style={styles.logo} />
      <Formik
        validationSchema={schema}
        initialValues={{email: '', password: ''}}
        onSubmit={onFinishLog}>
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
              name="email"
              placeholder="Ingresa tu mail"
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
              placeholder="Password"
              style={styles.textInput}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              password={true}
              secureTextEntry={!showPassword}
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
              title="LOGIN"
              disabled={!isValid}
              containerStyle={styles.btnContainerLogin}
            />
          </>
        )}
      </Formik>
      <Loading isVisible={loading} text={loadingText} />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  inputForm: {
    width: '100%',
    marginTop: 20,
  },
  btnContainerLogin: {
    marginTop: 20,
    width: '95%',
  },
  btnLogin: {
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
