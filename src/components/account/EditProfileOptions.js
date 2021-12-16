import React, {useEffect, useRef, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import avatarImage from '../../images/character_icons_7.png';
import {Avatar, Button, Icon, Input, ListItem} from 'react-native-elements';
import {useAuth} from '../../lib/auth';
import Modal from '../Modal';
import ChangeDisplayNameForm from './ChangeDisplayNameForm';
import * as yup from 'yup';
import {auth, db, storage} from '../../firebase';
import Toast from 'react-native-easy-toast';
import ChangeEmailForm from './ChangeEmailForm';
import ChangePasswordForm from './ChangePasswordForm';
import ContactForm from './ContactForm';
import avatarDefault from '../../images/avatar-default.jpg';
import {launchImageLibrary} from 'react-native-image-picker';
import AddDescriptionForm from './AddDescriptionForm';
import {useNavigation} from '@react-navigation/native';
import * as Permissions from 'react-native-permissions';
import * as Location from 'react-native-location';
import MapView from 'react-native-maps';
import AddLocation from './AddLocation';

const ProfileOptions = () => {
  const [showModalDescription, setShowModalDescription] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandedContact, setExpandedContact] = useState(false);
  const [contactList, setContactList] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedLocation, setExpandedLocation] = useState(false);
  const [description, setDescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [change, setChange] = useState(false);
  const [changeLogout, setChangeLogout] = useState(false);
  const [showModalEmail, setShowModalEmail] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [showModalContact, setShowModalContact] = useState(false);
  const [showModalLocation, setShowModalLocation] = useState(false);
  const [locationFoundation, setLocationFoundation] = useState(null);

  const {user, logout} = useAuth();
  const navigation = useNavigation();
  const toastRef = useRef();

  useEffect(() => {
    (async () => {
      await auth.currentUser;
      await db
        .ref(`users/${user.uid}/displayName`)
        .set(auth.currentUser.displayName);
      db.ref(`phones/${user.uid}`).on('value', snapshot => {
        const contacts = [];
        snapshot.forEach(contact => {
          const q = contact.val();
          contacts.push(q);
        });
        setContactList(contacts);
      });

      db.ref(`users/${user.uid}/description`).on('value', snapshot => {
        const descriptions = [];
        snapshot.forEach(descrip => {
          const q = descrip.val();
          descriptions.push(q);
        });
        setDescription(descriptions);
        return () => {
          db.ref(`phones/${user.uid}`).off();
          db.ref(`users/${user.uid}/description`).off();
        };
      });
    })();
    setChange(false);
  }, [change, user, description]);

  const options = {
    title: 'Selecciona una imagen',
    storageOptions: {
      skipBackup: true,
      path: 'images,',
    },
  };

  const changeAvatar = async () => {
    await launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        console.log('response', response.assets[0].uri);
        uploadImage(response.assets[0].uri)
          .then(() => {
            updatePhotoUrl();
          })
          .catch(() => {
            // toastRef.current.show('Error al actualizar el avatar.');
            console.log('Error al actualizar el avatar');
          });
      }
    });
  };
  const uploadImage = async uri => {
    // setLoadingText('Actualizando Avatar');
    setLoading(true);

    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storage.ref().child(`avatar/${user.uid}`);
    return ref.put(blob);
  };

  const updatePhotoUrl = () => {
    storage
      .ref(`avatar/${user.uid}`)
      .getDownloadURL()
      .then(async response => {
        const update = {
          photoURL: response,
        };
        await auth.currentUser.updateProfile(update);
        setLoading(false);
      })
      .catch(() => {
        // toastRef.current.show('Error al actualizar el avatar.');
        console.log('Error al actualizar el avatar');
      });
  };

  const editName = () => {
    setShowModal(true);
  };

  const editMail = () => {
    setShowModalEmail(true);
  };

  const changePassword = () => {
    setShowModalPassword(true);
  };

  const contactInformation = () => {
    setShowModalContact(true);
  };

  const descriptionForm = () => {
    setShowModalDescription(true);
  };

  const showLocation = () => {
    setShowModalLocation(true);
  };

  const getAlert = () => {
    console.log('close sesion');
    Alert.alert('Cerrar sesión', '¿Estás seguro/a que deseas cerrar sesión', [
      {
        text: 'Cancelar',
        // onPress: () => console.log('Cancel Pressed'),
      },
      {text: 'Cerrar sesión', onPress: () => setChangeLogout(true)},
    ]);
  };

  // const handleLogout = () => {
  //   logout;
  //   navigation.navigate('register');
  // };

  return (
    <ScrollView>
      <View style={styles.viewUserInfo}>
        <Avatar
          rounded
          showEditButton={true}
          onPress={changeAvatar}
          size="xlarge"
          containerStyle={styles.userInfoAvatar}
          source={
            auth.currentUser.photoURL
              ? {uri: auth.currentUser.photoURL}
              : avatarDefault
          }
        />
        <View style={styles.textStyle}>
          <Text style={styles.displayName}>
            {auth.currentUser.displayName
              ? auth.currentUser.displayName
              : user.displayName}
          </Text>
          <Text style={styles.emailText}>{auth.currentUser.email}</Text>
          <Button
            title="Cerrar sesión"
            buttonStyle={styles.btnCloseSession}
            titleStyle={styles.btnCloseSessionText}
            onPress={logout}
          />
        </View>
      </View>
      <View>
        <ListItem.Accordion
          content={
            <>
              <Icon name="account-circle" size={40} style={styles.iconStyle} />
              <ListItem.Content>
                <ListItem.Title>Información de la cuenta</ListItem.Title>
              </ListItem.Content>
            </>
          }
          isExpanded={expanded}
          onPress={() => {
            setExpanded(!expanded);
          }}>
          <ListItem key={1} onPress={editName} bottomDivider topDivider>
            <ListItem.Content>
              <View>
                <ListItem.Title>
                  {auth.currentUser.displayName
                    ? auth.currentUser.displayName
                    : user.displayName}
                </ListItem.Title>
                <ListItem.Subtitle>
                  <Text>Fundación</Text>
                </ListItem.Subtitle>
              </View>
            </ListItem.Content>
            <Icon name="edit" type="material-icons" />
            <ChangeDisplayNameForm
              isVisible={showModal}
              setIsVisible={setShowModal}
            />
          </ListItem>

          <ListItem key={2} onPress={editMail} bottomDivider topDivider>
            <ListItem.Content>
              <View>
                <ListItem.Title>{auth.currentUser.email}</ListItem.Title>
                <ListItem.Subtitle>
                  <Text>Email registrado</Text>
                </ListItem.Subtitle>
              </View>
            </ListItem.Content>
            <Icon name="edit" type="material-icons" />
            <ChangeEmailForm
              isVisible={showModalEmail}
              setIsVisible={setShowModalEmail}
            />
          </ListItem>

          <ListItem key={3} onPress={changePassword} bottomDivider topDivider>
            <ListItem.Content>
              <View>
                <ListItem.Title>Contraseña</ListItem.Title>
                <ListItem.Subtitle>
                  <Text>*********</Text>
                </ListItem.Subtitle>
              </View>
            </ListItem.Content>
            <Icon name="edit" type="material-icons" />
            <ChangePasswordForm
              isVisible={showModalPassword}
              setIsVisible={setShowModalPassword}
            />
          </ListItem>
        </ListItem.Accordion>
      </View>

      <View>
        <ListItem.Accordion
          content={
            <>
              <Icon
                name="clipboard-text"
                type="material-community"
                size={40}
                style={styles.iconStyle}
              />
              <ListItem.Content>
                <ListItem.Title>Descripción de la fundación</ListItem.Title>
              </ListItem.Content>
            </>
          }
          isExpanded={expandedDescription}
          onPress={() => {
            setExpandedDescription(!expandedDescription);
          }}>
          <ListItem key={1} onPress={descriptionForm} bottomDivider topDivider>
            <ListItem.Content>
              <View>
                {user.description === '' ? (
                  <ListItem.Title>
                    Agrega la descripción de tu fundación
                  </ListItem.Title>
                ) : (
                  <ListItem.Title>
                    Modifica la descripción de tu fundación
                  </ListItem.Title>
                )}
              </View>
            </ListItem.Content>
            <Icon name="edit" type="material-icons" />
            <AddDescriptionForm
              isVisible={showModalDescription}
              setIsVisible={setShowModalDescription}
            />
          </ListItem>
        </ListItem.Accordion>
      </View>

      <View>
        <ListItem.Accordion
          content={
            <>
              <Icon name="smartphone" size={40} style={styles.iconStyle} />
              <ListItem.Content>
                <ListItem.Title>Información de contacto</ListItem.Title>
              </ListItem.Content>
            </>
          }
          isExpanded={expandedContact}
          onPress={() => {
            setExpandedContact(!expandedContact);
          }}>
          <ListItem
            key={1}
            onPress={contactInformation}
            bottomDivider
            topDivider>
            <ListItem.Content>
              <View>
                {!contactList ? (
                  <ListItem.Title>Crea tu lista de contactos</ListItem.Title>
                ) : (
                  <ListItem.Title>Editar números de contacto</ListItem.Title>
                )}

                {/*<ListItem.Subtitle>{user.email}</ListItem.Subtitle>*/}
              </View>
            </ListItem.Content>
            <Icon name="edit" type="material-icons" />
            <ContactForm
              isVisible={showModalContact}
              setIsVisible={setShowModalContact}
            />
          </ListItem>
          {contactList &&
            contactList.map((contact, i) => (
              <ListItem key={i}>
                <Text style={styles.contactList}>+593 {contact}</Text>
              </ListItem>
            ))}
        </ListItem.Accordion>
      </View>

      <View>
        <ListItem.Accordion
          content={
            <>
              <Icon
                name="google-maps"
                type="material-community"
                size={40}
                style={styles.iconStyle}
              />
              <ListItem.Content>
                <ListItem.Title>
                  Dirección y ubicación de la fundación
                </ListItem.Title>
              </ListItem.Content>
            </>
          }
          isExpanded={expandedLocation}
          onPress={() => {
            setExpandedLocation(!expandedLocation);
          }}>
          <ListItem key={1} onPress={showLocation} bottomDivider topDivider>
            <ListItem.Content>
              <ListItem.Title>
                Dirección y ubicación de la fundación
              </ListItem.Title>
            </ListItem.Content>
            <Icon name="edit" type="material-icons" />
            <AddLocation
              isVisible={showModalLocation}
              setIsVisible={setShowModalLocation}
              toastRef={toastRef}
            />
          </ListItem>
        </ListItem.Accordion>
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
};

export default ProfileOptions;

const styles = StyleSheet.create({
  viewUserInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    paddingTop: 30,
    paddingBottom: 30,
  },
  textStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoAvatar: {
    marginRight: 20,
  },
  displayName: {
    fontWeight: 'bold',
    paddingBottom: 5,
    fontSize: 20,
    color: '#000',
  },
  emailText: {
    paddingBottom: 5,
    fontSize: 15,
    color: '#000',
  },
  viewUserInfoForm: {
    minHeight: '100%',
    backgroundColor: '#f2f2f2',
  },
  iconStyle: {
    paddingRight: 10,
  },
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
  contactList: {
    color: '#000',
    // fontSize: 12,
    textAlign: 'center',
  },
});
