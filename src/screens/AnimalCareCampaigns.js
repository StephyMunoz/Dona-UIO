import React, {useCallback, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {db} from '../firebase';
import ListAnimalCampaigns from '../components/campaigns/ListAnimalCampaigns';
import Toast from 'react-native-easy-toast';
import {useAuth} from '../lib/auth';

const AnimalCareCampaigns = () => {
  const navigation = useNavigation();
  const toastRef = useRef();
  const {user} = useAuth();
  const [animalCampaigns, setAnimalCampaigns] = useState([]);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const limitCampaigns = 20;

  useFocusEffect(
    useCallback(() => {
      const resultAnimalCampaigns = [];
      let total = 0;

      db.ref('campaigns').on('value', snapshot => {
        snapshot.forEach(campaign => {
          if (campaign.val().createdBy === user.uid) {
            setTotalCampaigns(total + 1);
          }
        });
      });

      db.ref('campaigns')
        .orderByChild('updatedAt')
        .limitToLast(limitCampaigns)
        .on('value', snapshot => {
          snapshot.forEach(campaign => {
            const q = campaign.val();
            if (q.createdBy === user.uid) {
              resultAnimalCampaigns.push(q);
            }
          });
          setAnimalCampaigns(resultAnimalCampaigns.reverse());
        });
      return () => {
        db.ref('campaigns').off();
      };
    }, [user.uid]),
  );

  const handleLoadMore = async () => {
    const resultCampaigns = [];

    if (animalCampaigns.length <= totalCampaigns) {
      setIsLoading(true);
      await db
        .ref('campaigns')
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
      {animalCampaigns.length === 0 ? (
        <Text style={styles.textEmpty}>No existen registros aún</Text>
      ) : (
        <ListAnimalCampaigns
          animalCampaigns={animalCampaigns}
          handleLoadMore={handleLoadMore}
          isLoading={isLoading}
          toastRef={toastRef}
        />
      )}

      <Icon
        reverse
        type="material-community"
        name="plus"
        color="#00a680"
        containerStyle={styles.btnContainer}
        onPress={() => navigation.navigate('form_animal_campaign')}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );
};

export default AnimalCareCampaigns;

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 15,
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
