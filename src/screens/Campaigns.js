import React, {useCallback, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
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
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const limitCampaigns = 5;

  useFocusEffect(
    useCallback(() => {
      const resultAnimalCampaigns = [];

      db.ref('campaigns').on('value', snapshot => {
        setTotalCampaigns(snapshot.numChildren());
      });

      const getCampaigns = async () => {
        db.ref('campaigns')
          .orderByChild('updatedAt')
          .limitToFirst(limitCampaigns)
          .on('value', snapshot => {
            snapshot.forEach(campaign => {
              const q = campaign.val();
              resultAnimalCampaigns.push(q);
            });
            setAnimalCampaigns(resultAnimalCampaigns.reverse());
          });
      };
      getCampaigns();

      return () => {
        db.ref('campaigns').off();
      };
    }, []),
  );

  if (animalCampaigns.length === 0) {
    return <ActivityIndicator size="large" />;
  }

  const handleLoadMore = async () => {
    const resultCampaigns = [];
    // setStartNeeds(foundationNeeds[foundationNeeds.length - 1]);

    if (animalCampaigns.length <= totalCampaigns) {
      setIsLoading(true);
      await db
        .ref('foundations')
        .orderByChild('updatedAt')
        .limitToLast(limitCampaigns)
        .endBefore(animalCampaigns[animalCampaigns.length - 1].updatedAt)
        .on('value', snapshot => {
          if (snapshot.numChildren() > 0) {
            snapshot.forEach(need => {
              const q = need.val();
              resultCampaigns.push(q);
            });
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        });
      setAnimalCampaigns([...animalCampaigns, ...resultCampaigns.reverse()]);
    }
    return () => {
      db.ref('foundations').off();
    };
  };

  return (
    <View style={styles.viewBody}>
      {/*<Text style={styles.textStyle}>Tenencia responsable de animales</Text>*/}
      {animalCampaigns?.length === 0 ? (
        <Text style={styles.textEmpty}>No existen registros aún</Text>
      ) : (
        <ListCampaignsUser
          animalCampaigns={animalCampaigns}
          handleLoadMore={handleLoadMore}
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
  },
  textEmpty: {
    marginTop: 30,
    textAlign: 'center',
  },
});
