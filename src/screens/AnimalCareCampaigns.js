import React, {useCallback, useRef, useState} from 'react';
import {View, ScrollView, StyleSheet, Text} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {auth, db} from '../firebase';
import ListAnimalCampaigns from '../components/campaigns/ListAnimalCampaigns';
import Toast from 'react-native-easy-toast';

const AnimalCareCampaigns = () => {
  const navigation = useNavigation();
  const {toastRef} = useRef();
  const [animalCampaigns, setAnimalCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const resultAnimalCampaigns = [];

      db.ref(`campaigns`)
        .orderByChild('createdAt')
        .on('value', snapshot => {
          snapshot.forEach(campaign => {
            const q = campaign.val();
            if (q.createdBy === auth.currentUser.uid) {
              resultAnimalCampaigns.push(q);
            }
          });
          setAnimalCampaigns(resultAnimalCampaigns.reverse());
        });
      return () => {
        db.ref('campaigns').off();
      };
    }, []),
  );

  return (
    <View style={styles.viewBody}>
      {animalCampaigns.length === 0 ? (
        <Text style={styles.textEmpty}>No existen registros aún</Text>
      ) : (
        <ListAnimalCampaigns
          animalCampaigns={animalCampaigns}
          // handleLoadMore={handleLoadMore}
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
    paddingBottom: 50,
  },
  textEmpty: {
    marginTop: 30,
    textAlign: 'center',
  },
});
