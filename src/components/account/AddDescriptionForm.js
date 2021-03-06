import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, View} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import {Formik} from 'formik';
import * as yup from 'yup';
import {db} from '../../firebase';
import {useAuth} from '../../lib/auth';
import Modal from '../Modal';
import Loading from '../Loading';

export default function AddDescriptionForm({isVisible, setIsVisible}) {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [description, setDescription] = useState(null);
  const [change, setChange] = useState(false);
  const {user} = useAuth();

  const schema = yup.object().shape({
    description: yup
      .string()
      .required('Ingrese una breve descripción de la fundación'),
  });

  const onFinish = async data => {
    setLoading(true);
    setLoadingText('Actualizando descripción');
    try {
      setChange(true);
      await db.ref(`users/${user.uid}/description`).set(data.description);
      setLoading(false);
      setIsVisible(false);
      Alert.alert(
        'Descripción actualizada',
        'Descripción actualizada exitosamente',
      );
      return () => {};
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await db.ref(`users/${user.uid}/description`).on('value', snapshot => {
        setDescription(snapshot.val());
      });
    })();
    setChange(false);
  }, [change, user.uid]);

  return (
    <View style={styles.view}>
      <Modal isVisible={isVisible} setIsVisible={setIsVisible}>
        <View style={styles.view}>
          <Formik
            validationSchema={schema}
            initialValues={{
              description: description ? description : '',
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
                  placeholderTextColor="#c1c1c1"
                  style={styles.inputForm}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  value={values.description}
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
                />
              </>
            )}
          </Formik>
        </View>
        <Loading isVisible={loading} text={loadingText} />
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
    color: '#000',
  },
  btnContainer: {
    marginTop: 20,
    width: '95%',
  },
  btn: {
    backgroundColor: '#00a680',
  },
});
