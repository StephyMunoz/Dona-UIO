import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import avatarImage from '../../images/character_icons_7.png';
import {Avatar, Button, Icon, Input, ListItem} from 'react-native-elements';
import {useAuth} from '../../lib/auth';
import Modal from '../Modal';
import ChangeDisplayNameForm from './ChangeDisplayNameForm';
import * as yup from 'yup';
import {auth, db, storage} from '../../firebase';
import {Formik} from 'formik';
import ChangeEmailForm from './ChangeEmailForm';
import ChangePasswordForm from './ChangePasswordForm';
import ContactForm from './ContactForm';
import {launchImageLibrary} from 'react-native-image-picker';

const ProfileOptions = () => {
  const {user, logout} = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showModalEmail, setShowModalEmail] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [showModalContact, setShowModalContact] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandedContact, setExpandedContact] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [change, setChange] = useState(false);

  useEffect(() => {
    (async () => {
      await auth.currentUser;
      await db
        .ref(`users/${user.uid}/displayName`)
        .set(auth.currentUser.displayName);
    })();
    setChange(false);
  }, [change, user]);

  const options = {
    title: 'Seleccion de avatar',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const changeAvatar = async () => {
    setLoading(true);
    await launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Seleccion de imagen cancelada');
      } else if (response.errorCode) {
        console.log('Error: ', response.errorCode);
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
    setLoading(true);
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storage.ref().child(`avatar/${user.uid}`);
    return ref.put(blob);
  };

  const updatePhotoUrl = () => {
    setLoading(true);

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

  return (
    <ScrollView>
      <View style={styles.viewUserInfo}>
        <Avatar
          rounded
          size="xlarge"
          showEditButton={true}
          onPress={changeAvatar}
          containerStyle={styles.userInfoAvatar}
          source={
            auth.currentUser.photoURL
              ? {uri: auth.currentUser.photoURL}
              : avatarImage
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
                  <Text>Nombre de usuario</Text>
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
        {/*<ChangeDisplayNameForm*/}
        {/*  isVisible={showModal}*/}
        {/*  setIsVisible={setShowModal}*/}
        {/*/>*/}
      </View>
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
});
