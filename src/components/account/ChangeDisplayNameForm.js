import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Button, Icon, Input} from 'react-native-elements';
import {Formik} from 'formik';
import * as yup from 'yup';
import {auth, db} from '../../firebase';
import {useAuth} from '../../lib/auth';
import Modal from '../Modal';

export default function ChangeDisplayNameForm({isVisible, setIsVisible}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [change, setChange] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const {user} = useAuth();

  const schema = yup.object().shape({
    name: yup.string().required('Ingrese el nuevo nombre'),
  });

  const onFinish = async data => {
    setLoading(true);
    setError(null);
    if (auth.currentUser.displayName !== data.name) {
      try {
        const update = {
          displayName: data.name,
        };
        setChange(true);
        // await db.ref(`users/${user.uid}/name`).set(data.name);
        await auth.currentUser.updateProfile(update);
        setLoading(false);
        setShowModal(false);
        setIsVisible(false);
        Alert.alert('Nombre actualizado', 'Nombre actualizado exitosamente');
        // await db.ref(`users/${user.uid}/name`).set(data.name);
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setError('El nombre debe ser diferente');
      //mensaje de error
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
                  name="name"
                  placeholder="Ingresa el nuevo nombre"
                  // containerStyle={styles.inputForm}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                  errorMessage={error}
                  rightIcon={
                    <Icon
                      type="material-community"
                      name="account-outline"
                      iconStyle={styles.iconRight}
                    />
                  }
                />
                {errors.name && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.name}
                  </Text>
                )}

                <Button
                  onPress={handleSubmit}
                  title="Cambiar el nombre"
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
