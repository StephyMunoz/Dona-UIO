import React, {useRef, useState} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Avatar, Button, Icon, Input} from 'react-native-elements';
import Loading from '../../components/Loading';
import {Formik} from 'formik';
import * as yup from 'yup';
import Toast from 'react-native-easy-toast';
import {useAuth} from '../../lib/auth';
import {useNavigation} from '@react-navigation/native';
import accountImage from '../../images/gdpr_icons_5.png';
import {auth, storage} from '../../firebase';
import avatarDefault from '../../images/avatar-default.jpg';
import {filter, map, size} from 'lodash';
import {launchImageLibrary} from 'react-native-image-picker';
import uuid from 'random-uuid-v4';

const Register = ({role}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageSelected, setImageSelected] = useState([]);
  const [selectRole, setSelectRole] = useState(0);
  const navigation = useNavigation();
  const {register} = useAuth();
  const toastRef = useRef();

  const options = {
    titleImage: 'Selecciona una imagen de perfil',
    storageOptions: {
      skipBackup: true,
      path: 'images,',
    },
  };

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

  const uploadImage = async uri => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storage.ref().child(`avatar/${auth.currentUser.uid}`);
    return ref.put(blob);
  };

  const onFinish = async data => {
    setLoading(true);
    // console.log('data', data.displayName);
    if (role) {
      try {
        setLoading(true);
        await register({
          ...data,
          role,
        });
        await auth.currentUser.updateProfile({displayName: data.displayName});

        await uploadImage(imageSelected);

        await storage
          .ref(`avatar/${auth.currentUser.uid}`)
          .getDownloadURL()
          .then(async response => {
            const update = {
              photoURL: response,
            };
            await auth.currentUser.updateProfile(update);
            setLoading(false);
          })
          .catch(() => {
            toastRef.current.show('Error al actualizar el avatar.');
            // console.log('Error al actualizar el avatar');
          });

        await auth.currentUser.sendEmailVerification().then(
          toastRef.current.show(
            'Se ha enviado un email de verificación a tu correo electrónico',
            Alert.alert(
              'Completar verificación',
              'Se ha enviado un email de verificación a tu correo electrónico',
            ),
          ),

          setLoading(false),
          navigation.navigate('home'),
        );
      } catch (error) {
        const errorCode = error.code;
        // toastRef.current.show(errorCode);
        // message.error(translateMessage(errorCode));
        // setLoading(false);
      }
    } else {
      toastRef('Seleccione un rol de usuario para poder registarse');
    }
  };

  const handleLaunchCamera = async () => {
    await launchImageLibrary(options, response => {
      if (response.didCancel) {
        toastRef.current.show('Selección de imagen cancelada');
      } else if (response.errorCode) {
        toastRef.current.show('Ha ocurrido un error');
      } else {
        setImageSelected(response.assets[0].uri);
      }
    });
  };

  return (
    <ScrollView>
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
                  role === 'user'
                    ? 'Nombre de usuario'
                    : 'Nombre de la fundación'
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

              {role !== 'user' && (
                <View>
                  <Text style={styles.subtitle}>
                    Seleccione una foto de perfil
                  </Text>
                  <View style={styles.viewImages}>
                    <TouchableOpacity onPress={handleLaunchCamera}>
                      <Icon
                        type="material-community"
                        name="camera"
                        color="#7a7a7a"
                        containerStyle={styles.containerIcon}
                        size={35}
                      />
                    </TouchableOpacity>

                    {size(imageSelected) !== 0 && (
                      <Avatar
                        style={styles.miniatureStyle}
                        source={{uri: imageSelected}}
                      />
                    )}
                  </View>
                </View>
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
        <Toast ref={toastRef} position="center" opacity={0.9} />
      </View>
    </ScrollView>
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
    marginTop: 10,
  },
  btnContainerLogin: {
    marginTop: 10,
    width: '70%',
    backgroundColor: '#00a680',
  },
  miniatureStyle: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  iconRight: {
    color: '#c1c1c1',
  },
  text: {
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000',
  },
  logo: {
    height: 50,
    marginTop: 10,
    width: 50,
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
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    marginTop: 20,
  },
  viewImages: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  containerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    height: 60,
    width: 60,
    backgroundColor: '#e3e3e3',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    color: '#7a7a7a',
  },
});
