import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements';
import {Formik} from 'formik';
import * as yup from 'yup';
import {auth, db} from '../../firebase';
import {useAuth} from '../../lib/auth';
import Modal from '../Modal';

export default function ChangeDisplayNameForm({isVisible, setIsVisible}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [change, setChange] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const {user} = useAuth();

  const schema = yup.object().shape({
    address: yup.string().required('Agregue la dirección de la fundación'),
  });

  const onFinish = async data => {
    setLoading(true);
    setError(null);
    try {
      setChange(true);
      // await db.ref(`users/${user.uid}/name`).set(data.name);
      // await auth.currentUser.updateProfile(update);
      setLoading(false);
      setShowModal(false);
      setIsVisible(false);
      Alert.alert(
        'Ubicación actualizada',
        'Ubicación actualizada exitosamente',
      );
      // await db.ref(`users/${user.uid}/name`).set(data.name);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await auth.currentUser;
      await db
        .ref(`users/${user.uid}/displayName`)
        .set(auth.currentUser.displayName);
    })();
    setChange(false);
  }, [change, user]);

  return (
    <View style={styles.view}>
      <Modal isVisible={isVisible} setIsVisible={setIsVisible}>
        <View style={styles.view}>
          <Formik
            validationSchema={schema}
            initialValues={{name: auth.currentUser.displayName}}
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
                  name="address"
                  placeholder="Ingresa el nuevo nombre"
                  // containerStyle={styles.inputForm}
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                  value={values.address}
                  errorMessage={error}
                  rightIcon={
                    <Icon
                      type="material-community"
                      name="google-maps"
                      iconStyle={styles.iconRight}
                    />
                  }
                />
                {errors.location && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.location}
                  </Text>
                )}

                <Button
                  onPress={handleSubmit}
                  title="Actualizar ubicación"
                  disabled={!isValid}
                  containerStyle={styles.btnContainerLogin}
                  loading={loading}
                />
              </>
            )}
          </Formik>
        </View>
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
