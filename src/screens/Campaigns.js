import React, {useCallback, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {Icon} from 'react-native-elements';
import {db} from '../firebase';
import ListCampaignsUser from '../components/ListCampaignsUser';
import Toast from 'react-native-easy-toast';
import {useAuth} from '../lib/auth';

const Campaigns = () => {
  const navigation = useNavigation();
  const toastRef = useRef();
  const {user} = useAuth();
  const [animalCampaigns, setAnimalCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const resultAnimalCampaigns = [];

      const getCampaigns = async () => {
        db.ref(`campaigns`)
          .orderByChild('updatedAt')
          .limitToFirst(3)
          .on('value', snapshot => {
            snapshot.forEach(campaign => {
              // let key = campaign.key;

              const q = campaign.val();
              resultAnimalCampaigns.push(q);
            });
            setAnimalCampaigns(resultAnimalCampaigns.reverse());
            // setAnimalCampaignKey(resultId);
          });
      };
      getCampaigns();

      return () => {
        db.ref(`campaigns`).off();
      };
    }, []),
  );

  return (
    <View style={styles.viewBody}>
      {/*<Text style={styles.textStyle}>Tenencia responsable de animales</Text>*/}
      {animalCampaigns.length === 0 ? (
        <Text style={styles.textEmpty}>No existen registros aún</Text>
      ) : (
        <ListCampaignsUser
          animalCampaigns={animalCampaigns}
          // handleLoadMore={handleLoadMore}
          isLoading={isLoading}
          toastRef={toastRef}
        />
      )}

      {user &&
        (user.role === 'animal_help' || user.role === 'humanitarian_help') && (
          <Icon
            reverse
            type="material-community"
            name="plus"
            color="#00a680"
            containerStyle={styles.btnContainer}
            onPress={() => navigation.navigate('form_animal_campaign')}
          />
        )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );
};

export default Campaigns;

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 20,
    marginTop: 20,
  },
  btnContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
  },
  viewBody: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 50,
  },
  textEmpty: {
    marginTop: 30,
    textAlign: 'center',
  },
});
