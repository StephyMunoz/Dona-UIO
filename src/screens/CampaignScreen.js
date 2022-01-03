import React, {useCallback, useEffect, useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {db, storage} from '../firebase';
import {useFocusEffect} from '@react-navigation/native';
import Loading from '../components/Loading';
import Carousel from '../components/Carousel';
import {Avatar} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const CampaignScreen = props => {
  const {navigation, route} = props;
  const {id, title} = route.params;
  const navigationToFoundation = useNavigation();

  useEffect(() => {
    navigation.setOptions({title: title});
  }, [navigation, title]);

  const [campaignSelected, setCampaignSelected] = useState(null);
  const [campaignOwner, setCampaignOwner] = useState(null);
  const [campaignOwnerAvatar, setCampaignOwnerAvatar] = useState(null);

  useFocusEffect(
    useCallback(() => {
      // db.ref('campaigns').on

      db.ref(`campaigns`)
        .limit(5)
        .on('value', snapshot => {
          snapshot.forEach(campaign => {
            if (campaign.val().id === id) {
              setCampaignSelected(campaign.val());
            }
          });
        });
      return () => {
        db.ref('campaigns').off();
      };
    }, [id]),
  );

  useEffect(() => {
    const getOwnerInfo = async () => {
      await db.ref(`users`).on('value', snapshot => {
        snapshot.forEach(user => {
          if (campaignSelected !== null) {
            if (campaignSelected.createdBy === user.val().uid) {
              setCampaignOwner(user.val());
            }
          }
        });
      });

      if (campaignSelected !== null) {
        await storage
          .ref()
          .child(`avatar/${campaignSelected.createdBy}`)
          .getDownloadURL()
          .then(async response => {
            setCampaignOwnerAvatar(response);
          });
      }
    };
    getOwnerInfo();
    return () => {
      db.ref('users').off();
    };
  }, [campaignSelected]);

  if (!campaignSelected)
    return <Loading isVisible={true} text="Cargando información" />;

  return (
    <ScrollView vertical style={styles.viewBody}>
      {campaignOwner && campaignOwnerAvatar ? (
        <OwnerCampaign
          name={campaignOwner.displayName}
          description={campaignOwner.description}
          email={campaignOwner.email}
          image={campaignOwnerAvatar}
          navigationToFoundation={navigationToFoundation}
          id={campaignOwner.uid}
        />
      ) : (
        <Loading isVisible={true} text="Cargando información" />
      )}
      {/*<View style={styles.viewFavorite}>*/}
      {/*  <Icon*/}
      {/*    type="material-community"*/}
      {/*    name={isFavorite ? 'heart' : 'heart-outline'}*/}
      {/*    onPress={isFavorite ? removeFavorite : addFavorite}*/}
      {/*    color={isFavorite ? '#f00' : '#000'}*/}
      {/*    size={35}*/}
      {/*    underlayColor="transparent"*/}
      {/*  />*/}
      {/*</View>*/}
      <Carousel
        arrayImages={campaignSelected.images}
        height={250}
        width={screenWidth}
      />
      <TitleCampaign
        name={campaignSelected.title}
        description={campaignSelected.campaignDescription}
      />

      {/*<CampaignInfo*/}
      {/*  location={Campaign.location}*/}
      {/*  name={Campaign.name}*/}
      {/*  address={Campaign.address}*/}
      {/*/>*/}
      {/*<ListReviews navigation={navigation} idCampaign={Campaign.id} />*/}
      {/*<Toast ref={toastRef} position="center" opacity={0.9} />*/}
    </ScrollView>
  );
};

export default CampaignScreen;

function TitleCampaign({name, description}) {
  return (
    <View style={styles.viewCampaignTitle}>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.nameCampaign}>{name}</Text>
      </View>
      <Text style={styles.descriptionCampaign}>{description}</Text>
    </View>
  );
}

function OwnerCampaign({name, email, image, navigationToFoundation, id}) {
  const gotoFoundationScreen = () => {
    navigationToFoundation.navigate('foundation_screen', {
      name,
      image,
      id,
      email,
    });
  };
  return (
    <View style={styles.viewCampaignTitle}>
      <TouchableOpacity
        style={{flexDirection: 'row'}}
        onPress={gotoFoundationScreen}>
        <Avatar
          source={{uri: image}}
          rounded
          containerStyle={styles.avatar}
          size="medium"
        />
        <View>
          <Text style={styles.foundation}>{name}</Text>
          <Text style={styles.descriptionCampaign}>{email}</Text>
        </View>
      </TouchableOpacity>
      {/*{description !== '' && (*/}
      {/*  <Text style={styles.descriptionCampaign}>{description}</Text>*/}
      {/*)}*/}
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
  },
  nameCampaign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  descriptionCampaign: {
    marginTop: 5,
    color: 'grey',
  },
  rating: {
    position: 'absolute',
    right: 0,
  },
  viewCampaignInfo: {
    margin: 15,
    marginTop: 25,
  },
  CampaignInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  containerListItem: {
    borderBottomColor: '#d8d8d8',
    borderBottomWidth: 1,
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
});
