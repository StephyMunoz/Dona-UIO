import React, {useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Avatar, Button, Icon, ListItem} from 'react-native-elements';
import {useAuth} from '../../lib/auth';
import Toast from 'react-native-easy-toast';
import ChangeDisplayNameForm from './ChangeDisplayNameForm';
import {auth, db, storage} from '../../firebase';
import ChangeEmailForm from './ChangeEmailForm';
import ChangePasswordForm from './ChangePasswordForm';
import ContactForm from './ContactForm';
import avatarDefault from '../../images/avatar-default.jpg';
import {launchImageLibrary} from 'react-native-image-picker';
import AddDescriptionForm from './AddDescriptionForm';
import AddLocation from './AddLocation';
import Loading from '../Loading';

const ProfileOptions = () => {
  const {user, logout} = useAuth();
  const toastRef = useRef();
  const [showModalDescription, setShowModalDescription] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandedContact, setExpandedContact] = useState(false);
  const [contactList, setContactList] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedLocation, setExpandedLocation] = useState(false);
  const [description, setDescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [textLoading, setTextLoading] = useState(null);
  const [change, setChange] = useState(false);
  const [address, setAddress] = useState(null);
  const [showModalEmail, setShowModalEmail] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [showModalContact, setShowModalContact] = useState(false);
  const [showModalLocation, setShowModalLocation] = useState(false);

  useEffect(() => {
    (async () => {
      await auth.currentUser;
      await db
        .ref(`users/${user.uid}/displayName`)
        .set(auth.currentUser.displayName);
      await db.ref(`phones/${user.uid}`).on('value', snapshot => {
        const contacts = [];
        snapshot.forEach(contact => {
          const q = contact.val();
          contacts.push(q);
        });
        setContactList(contacts);
      });

      await db.ref(`users/${user.uid}/description`).on('value', snapshot => {
        setDescription(snapshot.val());
      });

      await db.ref(`users/${user.uid}/address`).on('value', snapshot => {
        setAddress(snapshot.val());
      });

      return () => {
        db.ref(`phones/${user.uid}`).off();
        db.ref(`users/${user.uid}/description`).off();
      };
    })();
    setChange(false);
  }, [change, user, description]);

  const options = {
    title: 'Selecciona una imagen',
    storageOptions: {
      skipBackup: true,
      path: 'images,',
    },
    quality: 1,
    maxWidth: 2048,
    maxHeight: 2048,
  };

  const changeAvatar = async () => {
    await launchImageLibrary(options, response => {
      if (response.didCancel) {
        toastRef.current.show('Seleccion de imagen cancelada');
      } else if (response.errorCode) {
        toastRef.current.show('Ha ocurrido un error ', response.errorCode);
      } else {
        if (response.assets[0].type.split('/')[0] === 'image') {
          if (response.assets[0].fileSize > 2000000) {
            toastRef.current.show('La imagen es muy pesada, excede los 2 MB');
          } else {
            uploadImage(response.assets[0].uri)
              .then(() => {
                updatePhotoUrl();
              })
              .catch(() => {
                toastRef.current.show('Error al actualizar el avatar.');
              });
          }
        } else {
          toastRef.current.show('Solo se permiten imagenes');
        }
      }
    });
  };
  const uploadImage = async uri => {
    setTextLoading('Actualizando Avatar');
    setLoading(true);
    const response = await fetch(uri.name);
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
        toastRef.current.show('Error al actualizar el avatar.');
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

  return (
    <ScrollView>
      <View style={styles.viewUserInfo}>
        <TouchableOpacity onPress={changeAvatar}>
          <Avatar
            rounded
            size="xlarge"
            icon={{name: 'adb', type: 'material', onPress: {changeAvatar}}}
            containerStyle={styles.userInfoAvatar}
            source={
              auth.currentUser.photoURL
                ? {uri: auth.currentUser.photoURL}
                : avatarDefault
            }>
            <Avatar.Accessory size={35} />
          </Avatar>
        </TouchableOpacity>
        <View style={styles.textStyle}>
          <Text style={styles.displayName}>
            {auth.currentUser.displayName
              ? auth.currentUser.displayName
              : user.displayName}
          </Text>
          <Text style={styles.emailText}>{auth.currentUser.email}</Text>
          <Button
            title="Cerrar sesi??n"
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
                <ListItem.Title>Informaci??n de la cuenta</ListItem.Title>
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
                  <Text>Fundaci??n</Text>
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
                <ListItem.Title>Contrase??a</ListItem.Title>
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
                <ListItem.Title>Descripci??n de la fundaci??n</ListItem.Title>
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
                    Agrega la descripci??n de tu fundaci??n
                  </ListItem.Title>
                ) : (
                  <ListItem.Title>
                    Modifica la descripci??n de tu fundaci??n
                  </ListItem.Title>
                )}
              </View>
              <Text style={styles.description}>{description}</Text>
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
                <ListItem.Title>Informaci??n de contacto</ListItem.Title>
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
                  <ListItem.Title>Editar n??meros de contacto</ListItem.Title>
                )}
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
                  Direcci??n y ubicaci??n de la fundaci??n
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
                Direcci??n y ubicaci??n de la fundaci??n
              </ListItem.Title>
              <ListItem.Subtitle>{address}</ListItem.Subtitle>
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
      <Loading isVisible={loading} text={textLoading} />
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
  description: {
    marginTop: 15,
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
