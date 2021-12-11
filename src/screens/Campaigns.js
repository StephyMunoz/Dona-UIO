import React, {useCallback, useState} from 'react';
import {View, ScrollView, StyleSheet, Text} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {auth, db} from '../firebase';
import ListAnimalCampaigns from '../components/campaigns/ListAnimalCampaigns';
import ListCampaignsUser from '../components/ListCampaignsUser';

const Campaigns = () => {
  const navigation = useNavigation();
  const [animalCampaigns, setAnimalCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const resultAnimalCampaigns = [];

      const getCampaigns = async () => {
        db.ref(`campaigns`).on('value', snapshot => {
          snapshot.forEach(campaign => {
            // let key = campaign.key;

            const q = campaign.val();
            resultAnimalCampaigns.push(q);
          });
          setAnimalCampaigns(resultAnimalCampaigns);
          // setAnimalCampaignKey(resultId);
        });
      };
      getCampaigns();

      return () => {
        db.ref(`campaigns`).off();
      };
    }, []),
  );
  // console.log('buscar', animalCampaigns);
  // console.log('buscarId', animalCampaignKey);

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
