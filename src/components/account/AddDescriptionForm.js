import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, View} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements';
import {Formik} from 'formik';
import * as yup from 'yup';
import {auth, db} from '../../firebase';
import {useAuth} from '../../lib/auth';
import Loading from '../Loading';
import AccountOptions from './AccountOptions';
import Modal from '../Modal';

export default function AddDescriptionForm({isVisible, setIsVisible}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [change, setChange] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const {user} = useAuth();

  const schema = yup.object().shape({
    description: yup
      .string()
      .required('Ingrese una breve descripción de la fundación'),
  });

  const onFinish = async data => {
    setLoading(true);
    setError(null);
    try {
      setChange(true);
      // await db.ref(`users/${user.uid}/name`).set(data.name);
      // await auth.currentUser.updateProfile(update);
      await db.ref(`users/${user.uid}/description`).set(data.description);
      setLoading(false);
      setShowModal(false);
      setIsVisible(false);
      Alert.alert(
        'Descripción actualizada',
        'Descripción actualizada exitosamente',
      );
      // await db.ref(`users/${user.uid}/name`).set(data.name);
      return () => {};
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.view}>
      <Modal isVisible={isVisible} setIsVisible={setIsVisible}>
        <View style={styles.view}>
          <Formik
            validationSchema={schema}
            initialValues={{
              description: user.description ? user.description : '',
            }}
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
                <TextInput
                  name="description"
                  placeholder="Ingrese la descripción de la fundación"
                  containerStyle={styles.inputForm}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  value={values.description}
                  errorMessage={error}
                  editable
                  multiline
                  numberOfLines={4}
                  rightIcon={
                    <Icon
                      type="font-awesome"
                      name="file-text-o"
                      iconStyle={styles.iconRight}
                    />
                  }
                />
                {errors.description && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.description}
                  </Text>
                )}

                <Button
                  onPress={handleSubmit}
                  title="Actualizar descripción"
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
  inputForm: {
    marginBottom: 10,
    borderBottomColor: '#c2c2c2',
    borderBottomWidth: 1,
    borderTopColor: '#c2c2c2',
  },
  btnContainer: {
    marginTop: 20,
    width: '95%',
  },
  btn: {
    backgroundColor: '#00a680',
  },
});
