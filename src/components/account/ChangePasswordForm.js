import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements';
import {Formik} from 'formik';
import * as yup from 'yup';
import {auth, db} from '../../firebase';
import {useAuth} from '../../lib/auth';
import Modal from '../Modal';

export default function ChangePasswordForm({isVisible, setIsVisible}) {
  const {user, login, logout} = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [change, setChange] = useState(false);
  const [showModal, setShowModal] = useState();

  const schema = yup.object().shape({
    password: yup
      .string()
      .min(
        8,
        ({min}) => `La contraseña debe contener al menos ${min} caracteres`,
      )
      .required('Contraseña actual requerida'),
    newPassword: yup
      .string()
      .min(
        8,
        ({min}) => `La contraseña debe contener al menos ${min} caracteres`,
      )
      .required('Contraseña nueva requerida'),
    repeatPassword: yup
      .string()
      .min(
        8,
        ({min}) => `La contraseña debe contener al menos ${min} caracteres`,
      )
      .required('Repetir contraseña'),
  });

  const onFinish = async data => {
    setLoading(true);
    if (data.newPassword === data.repeatPassword) {
      try {
        // await user.currentUser.reauthenticateWithCredential(
        //   user.email,
        //   data.password,
        // );
        try {
          login(user.email, data.password);
          console.log('exito');

          await auth.currentUser.updatePassword(data.newPassword);
          setLoading(false);
          setShowModal(false);
          logout;
          Alert.alert(
            'Contraseña actualizada',
            'Constraseña cambiada con éxito ',
          );
        } catch (e) {
          console.log('e', e);
          Alert.alert(
            'Error',
            'Ha ocurrido un error actualizando tu contraseña, inicie sesión e intente de nuevo',
          );
        }
      } catch (e) {
        console.log('e', e);
        console.log('password incorrecta');
      }
    } else {
      setLoading(false);
      console.log('error');
    }
  };
  useEffect(() => {
    (async () => {
      await auth.currentUser;
    })();
    setChange(false);
  }, [change]);

  return (
    <View style={styles.view}>
      <Modal isVisible={isVisible} setIsVisible={setIsVisible}>
        <Formik
          validationSchema={schema}
          initialValues={{password: '', newPassword: '', repeatPassword: ''}}
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
              <Input
                name="newPassword"
                placeholder="Nueva contraseña"
                style={styles.textInput}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                value={values.newPassword}
                password={true}
                secureTextEntry={!showPassword1}
                // onChange={e => onChange(e, 'password')}
                rightIcon={
                  <Icon
                    type="material-community"
                    name={showPassword1 ? 'eye-off-outline' : 'eye-outline'}
                    iconStyle={styles.iconRight}
                    onPress={() => setShowPassword1(!showPassword1)}
                  />
                }
              />
              <Input
                name="repeatPassword"
                placeholder="Repita la contraseña"
                style={styles.textInput}
                onChangeText={handleChange('repeatPassword')}
                onBlur={handleBlur('repeatPassword')}
                value={values.repeatPassword}
                password={true}
                secureTextEntry={!showPassword2}
                // onChange={e => onChange(e, 'password')}
                rightIcon={
                  <Icon
                    type="material-community"
                    name={showPassword2 ? 'eye-off-outline' : 'eye-outline'}
                    iconStyle={styles.iconRight}
                    onPress={() => setShowPassword2(!showPassword2)}
                  />
                }
                errorMessage={errors.repeatNewPassword}
              />
              <Button
                onPress={handleSubmit}
                title="Actualizar contraseña"
                disabled={!isValid}
                containerStyle={styles.btnContainer}
                loading={loading}
              />
            </>
          )}
        </Formik>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: '95%',
  },
  btn: {
    backgroundColor: '#00a680',
  },
});
