import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useAuth} from '../lib/auth';
import {db, storage} from '../firebase';
import {
  Avatar,
  Divider,
  Icon,
  ListItem,
  SocialIcon,
} from 'react-native-elements';
import {map} from 'lodash';
import Map from '../components/Map';
import {useNavigation} from '@react-navigation/native';
import Loading from '../components/Loading';

const FoundationView = () => {
  const {user} = useAuth();
  const navigation = useNavigation();
  const [foundationPhone, setFoundationPhone] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [foundation, setFoundation] = useState(null);

  useEffect(() => {
    const getPhones = async () => {
      const phoneList = [];
      await db.ref(`phones/${user.uid}`).on('value', snapshot => {
        snapshot.forEach(phone => {
          const q = phone.val();
          phoneList.push(q);
        });
        setFoundationPhone(phoneList);
      });
      await db.ref(`users/${user.uid}`).on('value', snapshot => {
        setFoundation(snapshot.val());
      });
      storage
        .ref()
        .child(`avatar/${user.uid}`)
        .getDownloadURL()
        .then(async response => {
          setAvatar(response);
        });
    };
    getPhones();
    return () => {
      db.ref(`phones/${user.uid}`).off();
    };
  }, [user.uid]);

  const handleInfo = () => {
    Alert.alert(
      '¿Cómo me ven los usuarios de Dona-UIO?',
      'Esta pantalla muestra cómo ven los usuarios tu perfil, para modificarlo dirígete a tu perfil',
      [
        {
          text: 'Entendido',
          style: 'cancel',
        },
        {
          text: 'Ir a perfil',
          onPress: () => navigation.navigate('profile'),
        },
      ],
    );
  };

  if (!foundation) {
    return <Loading isVisible={true} text="Cargando información" />;
  }

  return (
    <ScrollView>
      <View style={styles.viewBody}>
        <View style={styles.viewCampaignTitle}>
          <Avatar
            size={100}
            rounded
            containerStyle={styles.avatar}
            source={{uri: avatar}}
          />

          <View>
            <Text style={styles.foundation}>{user.displayName}</Text>
            <Text style={styles.descriptionCampaign}>{user.email}</Text>
          </View>
          <Icon
            name="information-outline"
            type="material-community"
            size={30}
            containerStyle={styles.infoIcon}
            onPress={handleInfo}
          />
        </View>
        {foundation.description ? (
          <View>
            <Text style={styles.viewDescription}>{foundation.description}</Text>
          </View>
        ) : (
          <View>
            {foundation.description === '' && (
              <View>
                <Text style={styles.messages}>
                  Aún no ingresas la descripción de tu fundación dirigete a tu
                  perfil para agregar una que ayude a los donantes a conocerte
                </Text>
              </View>
            )}
          </View>
        )}
        {foundation.location ? (
          <View>
            <Text style={styles.contactTitle}>Ubicación de la fundación</Text>
            <FoundationLocation
              location={foundation.location}
              name={foundation.displayName}
              address={foundation.address}
              email={foundation.email}
            />
          </View>
        ) : (
          <View>
            <Text style={styles.contactTitle}>Dirección y ubicación</Text>
            <Text style={styles.messages}>
              Aún no has ingresado tu dirección y ubicación en el mapa. Recuerda
              que mientras más información obtengan los donantes será mejor
            </Text>
          </View>
        )}
        {foundationPhone.length !== 0 ? (
          <View>
            <Text style={styles.contactTitle}>Teléfonos de contacto</Text>
            {map(foundationPhone, (item, index) => (
              <ListItem key={index} containerStyle={styles.containerListItem}>
                <Icon
                  name="phone"
                  reverse
                  type="material-community"
                  color="#00a680"
                />
                {item.length === 9 && (
                  <SocialIcon type="whatsapp" style={styles.whatsappIcon} />
                )}
                <ListItem.Content>
                  <ListItem.Title>0{item}</ListItem.Title>
                  <Divider width={1} />
                </ListItem.Content>
              </ListItem>
            ))}
          </View>
        ) : (
          <View>
            <Text style={styles.contactTitle}>Teléfonos de contacto</Text>
            <Text style={styles.messages}>
              Aún no has ingresado tus teléfonos de contacto. Recuerda que
              mientras más información brindes más fácil será para los donantes
              contactarte
            </Text>
          </View>
        )}

        {/*<Text style={styles.contactTitle}>Dirección</Text>*/}
      </View>
    </ScrollView>
  );
};

export default FoundationView;

function FoundationLocation() {
  const {user} = useAuth();

  const listInfo = [
    {
      text: user.address,
      iconName: 'map-marker',
      iconType: 'material-community',
      action: null,
    },
    {
      text: user.email,
      iconName: 'email',
      iconType: 'material-community',
      action: null,
    },
  ];

  return (
    <View style={styles.viewFoundationInfo}>
      <Map location={user.location} name={user.name} height={200} />

      {map(listInfo, (item, index) => (
        <ListItem key={index} containerStyle={styles.containerListItem}>
          <Icon name={item.iconName} type={item.iconType} color="#00a680" />
          <ListItem.Content>
            <ListItem.Title>{item.text}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: '#fff',
  },
  infoIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  whatsappIcon: {
    backgroundColor: '#00a680',
  },
  messages: {
    fontSize: 15,
    margin: 15,
  },
  viewCampaignTitle: {
    padding: 15,
    flexDirection: 'row',
  },
  nameCampaign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  descriptionCampaign: {
    marginTop: 5,
    color: 'grey',
    fontSize: 15,
  },
  viewCampaignInfo: {
    margin: 15,
    marginTop: 25,
  },
  viewFoundationInfo: {
    margin: 15,
    marginTop: 20,
  },
  viewFavorite: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 100,
    padding: 5,
    paddingLeft: 15,
  },
  avatar: {
    marginRight: 20,
    marginBottom: 10,
  },
  foundation: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
  },
  viewDescription: {
    margin: 15,
    color: '#000',
    fontSize: 18,
  },
  contactTitle: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    margin: 15,
  },
  contactList: {
    color: '#000',
    fontSize: 18,
    marginLeft: 15,
    marginBottom: 10,
  },
  containerListItem: {
    borderBottomColor: '#d8d8d8',
    borderBottomWidth: 1,
  },
  editText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#00a680',
  },
});
