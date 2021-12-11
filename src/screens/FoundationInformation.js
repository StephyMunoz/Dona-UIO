import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Avatar} from 'react-native-elements';
import {db} from '../firebase';
import Loading from '../components/Loading';

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

  return (
    <View style={styles.viewBody}>
      <View style={styles.viewCampaignTitle}>
        <Avatar
          source={{uri: image}}
          rounded
          containerStyle={styles.avatar}
          size={100}
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
      {foundationPhone.length !== 0 && (
        <View>
          <Text style={styles.contactTitle}>Números de contacto</Text>
          {foundationPhone.map((phone, index) => (
            <View key={index}>
              <Text style={styles.contactList}>{phone}</Text>
            </View>
          ))}
        </View>
      )}

      {/*<Text style={styles.contactTitle}>Dirección</Text>*/}
    </View>
  );
};

export default FoundationInformation;

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: '#fff',
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
});
