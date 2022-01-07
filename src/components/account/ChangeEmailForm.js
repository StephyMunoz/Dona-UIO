import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Button, Icon, Input} from 'react-native-elements';
import {Formik} from 'formik';
import * as yup from 'yup';
import {auth} from '../../firebase';
import {useAuth} from '../../lib/auth';
import Modal from '../Modal';

export default function ChangeEmailForm({setIsVisible, isVisible}) {
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [change, setChange] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const schema = yup.object().shape({
    email: yup
      .string()
      .email('Please enter valid email')
      .required('Email Address is Required'),
  });

  const onFinish = async data => {
    try {
      await auth.currentUser.updateEmail(data.email);
      setLoading(false);
      setShowModal(false);
      setIsVisible(false);
      setChange(true);
      Alert.alert(
        'Email actualizado',
        'El emal se ha actualizado exitosamente',
      );
    } catch (e) {
      // setError('Error al actualizar el nombre.');
      // setIsLoading(false);
      Alert.alert(
        'Ha ocurrido un error',
        'Intenta iniciando sesión nuevamente y vuelve a intentarlo',
      );
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
          initialValues={{email: ''}}
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

              <Button
                onPress={handleSubmit}
                title="Cambiar el email"
                disabled={!isValid}
                containerStyle={styles.btnContainerLogin}
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
