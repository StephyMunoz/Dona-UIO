import React, {useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, Text, View} from 'react-native';
import Modal from '../Modal';
import {Formik} from 'formik';
import {Button, Divider, Icon, Input} from 'react-native-elements';
import {auth, db} from '../../firebase';
import {useAuth} from '../../lib/auth';
import * as yup from 'yup';
import ecuadorFlag from '../../images/ecuador.png';

const ContactForm = ({isVisible, setIsVisible}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [change, setChange] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [contacts, setContacts] = useState(null);
  const phoneRegExp =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
  const {user} = useAuth();

  const schema = yup.object().shape({
    phone1: yup
      .string()
      .matches(phoneRegExp, 'Número telefónico invalido')
      .min(8, ({min}) => `Números convencionales ${min} digitos mínimo`)
      .max(9, ({max}) => `Números celulares ${max} dígitos máximo`)
      .required('Al menos ingrese un número telefónico'),
    phone2: yup
      .string()
      .matches(phoneRegExp, 'Número telefónico invalido')
      .min(8, ({min}) => `Números convencionales ${min} digitos mínimo`)
      .max(9, ({max}) => `Números celulares ${max} dígitos máximo`),
    phone3: yup
      .string()
      .matches(phoneRegExp, 'Número telefónico invalido')
      .min(8, ({min}) => `Números convencionales ${min} digitos mínimo`)
      .max(9, ({max}) => `Números celulares ${max} dígitos máximo`),
  });
  const onFinish = async data => {
    setLoading(true);
    setError(null);
    if (data.phone1 && data.phone2 && data.phone3) {
      try {
        setChange(true);
        await db.ref(`phones/${user.uid}/phone1`).set(data.phone1);
        await db.ref(`phones/${user.uid}/phone2`).set(data.phone2);
        await db.ref(`phones/${user.uid}/phone3`).set(data.phone3);
        setLoading(false);
        setShowModal(false);
        setIsVisible(false);
        console.log('numero guardado en la base');
      } catch (e) {
        setLoading(false);
      }
    } else if (data.phone1 && data.phone2) {
      try {
        setChange(true);
        await db.ref(`phones/${user.uid}/phone1`).set(data.phone1);
        await db.ref(`phones/${user.uid}/phone2`).set(data.phone2);
        setLoading(false);
        setShowModal(false);
        setIsVisible(false);
        console.log('numero guardado en la base');
      } catch (e) {
        setLoading(false);
      }
    } else {
      try {
        setChange(true);
        await db.ref(`phones/${user.uid}/phone1`).set(data.phone1);
        setLoading(false);
        setShowModal(false);
        setIsVisible(false);
        console.log('numero guardado en la base');
      } catch (e) {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    (async () => {
      db.ref(`phones/${user.uid}`).on('value', snapshot => {
        const contactsList = [];
        snapshot.forEach(contact => {
          const q = contact.val();
          contactsList.push(q);
        });
        setContacts(contactsList);
      });
    })();
    setChange(false);
  }, [change, user]);

  return (
    <View style={styles.view}>
      <Modal isVisible={isVisible} setIsVisible={setIsVisible}>
        <View style={styles.view}>
          <Formik
            initialValues={{
              phone1: !contacts ? '' : contacts.length >= 1 ? contacts[0] : '',
              phone2: !contacts ? '' : contacts.length >= 2 ? contacts[1] : '',
              phone3: !contacts ? '' : contacts.length >= 3 ? contacts[2] : '',
            }}
            validationSchema={schema}
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
                <View style={styles.contactView}>
                  <Image source={ecuadorFlag} style={styles.flag} />
                  <Text style={styles.contact}>+ 593</Text>
                  <Input
                    name="phone1"
                    placeholder="Número de contacto 1"
                    containerStyle={styles.input}
                    onChangeText={handleChange('phone1')}
                    onBlur={handleBlur('phone1')}
                    value={values.phone1}
                    errorMessage={error}
                    keyboardType={'number-pad'}
                  />
                </View>
                {errors.phone1 && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.phone1}
                  </Text>
                )}
                <Divider orientation="horizontal" />
                <View style={styles.contactView}>
                  <Image source={ecuadorFlag} style={styles.flag} />
                  <Text style={styles.contact}>+ 593</Text>
                  <Input
                    name="phone2"
                    placeholder="Número de contacto 2"
                    containerStyle={styles.input}
                    onChangeText={handleChange('phone2')}
                    onBlur={handleBlur('phone2')}
                    value={values.phone2}
                    errorMessage={error}
                    keyboardType={'number-pad'}
                  />
                </View>
                {errors.phone2 && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.phone2}
                  </Text>
                )}
                <Divider orientation="horizontal" />
                <View style={styles.contactView}>
                  <Image source={ecuadorFlag} style={styles.flag} />
                  <Text style={styles.contact}>+ 593</Text>
                  <Input
                    name="phone3"
                    placeholder="Número de contacto 3"
                    containerStyle={styles.input}
                    onChangeText={handleChange('phone3')}
                    onBlur={handleBlur('phone3')}
                    value={values.phone3}
                    errorMessage={error}
                    keyboardType={'number-pad'}
                  />
                </View>
                {errors.phone3 && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.phone3}
                  </Text>
                )}

                <Button
                  onPress={handleSubmit}
                  title="Guardar contactos"
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
};

export default ContactForm;

const styles = StyleSheet.create({
  view: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
    paddingRight: 50,
  },
  btnContainer: {
    marginTop: 20,
    width: '95%',
  },
  btn: {
    backgroundColor: '#00a680',
  },
  flag: {
    width: 50,
    height: 50,
    marginTop: 3,
    marginRight: 5,
    // paddingLeft: 50,
    marginLeft: 30,
  },
  contactView: {
    flexDirection: 'row',
    paddingRight: 30,
    paddingLeft: 50,
    marginTop: 10,
    alignContent: 'center',
  },
  contact: {
    fontSize: 20,
    paddingTop: 15,
    color: '#000',
  },
});
