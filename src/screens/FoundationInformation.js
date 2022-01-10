import React, {useEffect, useState} from 'react';
import {Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Avatar, Icon, ListItem, SocialIcon} from 'react-native-elements';
import {db} from '../firebase';
import Loading from '../components/Loading';
import Map from '../components/Map';
import {map} from 'lodash';

const FoundationInformation = props => {
  const {navigation, route} = props;
  const {id, name, image, email} = route.params;
  const [foundationPhone, setFoundationPhone] = useState([]);
  const [foundation, setFoundation] = useState(null);

  useEffect(() => {
    navigation.setOptions({title: name});

    const getPhones = async () => {
      const phoneList = [];
      await db.ref(`phones/${id}`).on('value', snapshot => {
        snapshot.forEach(phone => {
          const q = phone.val();
          phoneList.push(q);
        });
        setFoundationPhone(phoneList);
      });
      await db.ref(`users/${id}`).on('value', snapshot => {
        setFoundation(snapshot.val());
      });
    };
    getPhones();
    return () => {
      db.ref(`phones/${id}`).off();
    };
  }, [navigation, name, id]);

  if (!foundation || !foundationPhone) {
    return <Loading setVisible={true} text="Cargando información" />;
  }

  const handleWhatsAppPress = async number => {
    await Linking.openURL(`https://wa.me/593${number}`);
  };

  const handleCallPress = async number => {
    await Linking.openURL(`tel:0${number}`);
  };

  return (
    <ScrollView>
      <View style={styles.viewBody}>
        <View style={styles.viewCampaignTitle}>
          <Avatar
            source={{uri: image}}
            rounded
            containerStyle={styles.avatar}
            size={100}
            icon={{name: 'adb', type: 'material'}}
          />

          <View>
            <Text style={styles.foundation}>{name}</Text>

            <Text style={styles.descriptionCampaign}>{email}</Text>
          </View>
        </View>
        {foundation ? (
          <View>
            <Text style={styles.viewDescription}>{foundation.description}</Text>
          </View>
        ) : (
          <Loading isVisible={true} text="Cargando, espere" />
        )}
        {foundation.location && (
          <View>
            <Text style={styles.contactTitle}>Ubicación de la fundación</Text>
            <FoundationLocation
              location={foundation.location}
              name={foundation.displayName}
              address={foundation.address}
              email={foundation.email}
            />
          </View>
        )}
        {foundationPhone.length !== 0 && (
          <View>
            <Text style={styles.contactTitle}>Teléfonos de contacto</Text>
            {map(foundationPhone, (item, index) => (
              <ListItem key={index} containerStyle={styles.containerListItem}>
                <Icon
                  name="phone"
                  reverse
                  type="material-community"
                  color="#00a680"
                  onPress={() => handleCallPress(item)}
                />
                {item.length === 9 && (
                  <SocialIcon
                    type="whatsapp"
                    onPress={() => handleWhatsAppPress(item)}
                    style={styles.whatsappIcon}
                  />
                )}
                <ListItem.Content>
                  <ListItem.Title>0{item}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            ))}
          </View>
        )}

        {/*<Text style={styles.contactTitle}>Dirección</Text>*/}
      </View>
    </ScrollView>
  );
};

export default FoundationInformation;

function FoundationLocation(props) {
  const {location, name, address, email} = props;

  const listInfo = [
    {
      text: address,
      iconName: 'map-marker',
      iconType: 'material-community',
      action: null,
    },
    {
      text: email,
      iconName: 'email',
      iconType: 'material-community',
      action: () => handleEmailPress(email),
    },
  ];

  const handleEmailPress = async emailChosen => {
    await Linking.openURL(`mailto:${emailChosen}`);
  };

  return (
    <View style={styles.viewFoundationInfo}>
      <Map location={location} name={name} height={200} />

      {map(listInfo, (item, index) => (
        <ListItem key={index} containerStyle={styles.containerListItem}>
          <Icon
            name={item.iconName}
            type={item.iconType}
            color="#00a680"
            onPress={item.action}
          />
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
  viewCampaignTitle: {
    padding: 15,
    flexDirection: 'row',
  },
  whatsappIcon: {
    backgroundColor: '#00a680',
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
