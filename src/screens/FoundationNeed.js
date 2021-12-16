import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-easy-toast';
import {db, storage} from '../firebase';
import Loading from '../components/Loading';
import Carousel from '../components/Carousel';
import {Avatar, Icon} from 'react-native-elements';
import {useAuth} from '../lib/auth';

const screenWidth = Dimensions.get('window').width;

const FoundationNeed = props => {
  const {navigation, route} = props;
  const {user} = useAuth();
  const toastRef = useRef();
  const {foundationSelected, foundationNeed} = route.params;
  const [foundationAvatar, setFoundationAvatar] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigationToFoundation = useNavigation();

  useEffect(() => {
    navigation.setOptions({title: foundationNeed.item.title});
  }, [navigation, foundationNeed.item.title]);

  useEffect(() => {
    storage
      .ref()
      .child(`avatar/${foundationSelected.uid}`)
      .getDownloadURL()
      .then(async response => {
        setFoundationAvatar(response);
      })
      .catch(() => {
        toastRef.current.show('Error al descargar avatar');
      });
  }, [foundationSelected.uid]);

  useEffect(() => {
    if (user) {
      db.ref('favorites').on('value', snapshot => {
        snapshot.forEach(fav => {
          const q = fav.val();
          if (q.idFoundation === foundationNeed.item.createdBy) {
            if (q.idUser === user.uid) {
              setIsFavorite(true);
            }
          }
        });
      });
    }

    return () => {
      db.ref('favorites').off();
    };
  }, [foundationNeed.item.createdBy, user]);

  const addFavorite = () => {
    if (!user) {
      toastRef.current.show(
        'Para usar el sistema de favoritos tienes que estar logeado',
      );
    } else if (user.role === 'user') {
      const payload = {
        idUser: user.uid,
        idFoundation: foundationNeed.item.createdBy,
      };
      db.ref('favorites')
        .push()
        .set(payload)
        .then(() => {
          setIsFavorite(true);
          toastRef.current.show('Fundación añadida a favoritos');
        })
        .catch(() => {
          toastRef.current.show('Error al añadir la fundación a favoritos');
        });
    }
    db.ref('favorites').off();
  };

  const removeFavorite = () => {
    let idRemove = '';
    db.ref('favorites').on('value', snapshot => {
      snapshot.forEach(fav => {
        const q = fav.val();
        if (q.idFoundation === foundationNeed.item.createdBy) {
          if (q.idUser === user.uid) {
            idRemove = fav.key;
          }
        }
      });
    });

    db.ref(`favorites/${idRemove}`)
      .remove()
      .then(() => {
        setIsFavorite(false);
        toastRef.current.show('Fundación eliminada de favoritos');
      })
      .catch(() => {
        toastRef.current.show('Error al eliminar el restaurante de favoritos');
      });
    db.ref('favorites').off();
  };

  return (
    <ScrollView vertical style={styles.viewBody}>
      {foundationAvatar ? (
        <View style={{flexDirection: 'row'}}>
          <OwnerCampaign
            name={foundationSelected.displayName}
            description={foundationSelected.description}
            email={foundationSelected.email}
            image={foundationAvatar}
            navigationToFoundation={navigationToFoundation}
            id={foundationSelected.uid}
          />
          <View style={styles.viewFavorite}>
            {(!user || user.role === 'user') && (
              <Icon
                type="material-community"
                name={isFavorite ? 'heart' : 'heart-outline'}
                onPress={isFavorite ? removeFavorite : addFavorite}
                color={isFavorite ? '#f00' : '#000'}
                size={35}
                underlayColor="transparent"
              />
            )}
          </View>
        </View>
      ) : (
        <Loading isVisible={true} text="Cargando información" />
      )}
      <Carousel
        arrayImages={foundationNeed.item.images}
        height={250}
        width={screenWidth}
      />
      <TitleNeed
        name={foundationNeed.item.title}
        description={foundationNeed.item.campaignDescription}
      />
      {foundationSelected &&
      foundationNeed.item.food !== '' &&
      foundationSelected.role === 'humanitarian_help' ? (
        <View>
          <Text style={styles.requirements}>Requerimientos alimenticios: </Text>
          <Text style={styles.requirementsText}>
            {foundationNeed.item.food}
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.requirements}>
            Requerimientos de comida balanceada:{' '}
          </Text>
          <Text style={styles.requirementsText}>
            {foundationNeed.item.food}
          </Text>
        </View>
      )}

      {foundationSelected &&
        foundationSelected.role === 'humanitarian_help' &&
        foundationNeed.item.personal_care !== '' && (
          <View>
            <Text style={styles.requirements}>
              Implementos de aseo personal:{' '}
            </Text>
            <Text style={styles.requirementsText}>
              {foundationNeed.item.personal_care}
            </Text>
          </View>
        )}
      {foundationSelected &&
        foundationSelected.role === 'animal_help' &&
        foundationNeed.item.medicine !== '' && (
          <View>
            <Text style={styles.requirements}>
              Medicina requerida en la fundación:{' '}
            </Text>
            <Text style={styles.requirementsText}>
              {foundationNeed.item.medicine}
            </Text>
          </View>
        )}
      {foundationNeed.item.other !== '' && (
        <View>
          <Text style={styles.requirements}>Comentarios: </Text>
          <Text style={styles.requirementsText}>
            {foundationNeed.item.other}
          </Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
};

export default FoundationNeed;

function TitleNeed({name, description}) {
  return (
    <View style={styles.viewCampaignTitle}>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.nameCampaign}>{name}</Text>
      </View>
      {/*<Text style={styles.descriptionCampaign}>{description}</Text>*/}
    </View>
  );
}

function OwnerCampaign({name, email, image, navigationToFoundation, id}) {
  const gotoFoundationScreen = () => {
    navigationToFoundation.navigate('foundation', {
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
    top: 5,
    right: 10,
    zIndex: 2,
    backgroundColor: '#fff',
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
  requirements: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'justify',
    marginLeft: 15,
  },
  requirementsText: {
    fontSize: 17,
    textAlign: 'justify',
    marginLeft: 15,
    marginBottom: 10,
  },
});
