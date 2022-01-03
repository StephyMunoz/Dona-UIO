import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Avatar,
  Divider,
  Icon,
  Image as ImageElements,
} from 'react-native-elements';
import {size} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import imageNotFound from '../images/no-image.png';
import Carousel from '../components/Carousel';
import {db, storage} from '../firebase';
import {useAuth} from '../lib/auth';
import Loading from './Loading';
// import {Divider} from 'react-native-elements/dist/divider/Divider';

const screenWidth = Dimensions.get('window').width;

const ListCampaignsUser = ({animalCampaigns, isLoading, toastRef}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(animalCampaigns) > 0 ? (
        <FlatList
          data={animalCampaigns}
          renderItem={campaign => (
            <AnimalCampaign
              animalCampaign={campaign}
              navigation={navigation}
              toastRef={toastRef}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          // onEndReached={handleLoadMore}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loaderAnimalCampaigns}>
          <ActivityIndicator size="large" />
          <Text>Cargando campañas</Text>
        </View>
      )}
    </View>
  );
};

function AnimalCampaign({animalCampaign, navigation, toastRef}) {
  const {id, images, campaignDescription, other, title, createdBy, createdAt} =
    animalCampaign.item;
  const [foundation, setFoundation] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const {user} = useAuth();
  // console.log(animalCampaign);

  const goAnimalCampaign = () => {
    navigation.navigate('campaign_screen', {
      id,
      title,
    });
  };

  useEffect(() => {
    db.ref(`users/${createdBy}`).on('value', snapshot => {
      setFoundation(snapshot.val());
    });
    storage
      .ref()
      .child(`avatar/${createdBy}`)
      .getDownloadURL()
      .then(async response => {
        setAvatar(response);
      })
      .catch(() => {
        console.log('Error al descargar avatar');
      });

    // db.ref(`users/${foundationNeed.item.createdBy}`).on('value', snapshot => {
    //   setInfoFoundation(snapshot.val());
    // });
    return () => {
      db.ref(`users/${createdBy}`).off();
    };
  }, [createdBy]);

  if (!foundation || !avatar) {
    return <Loading isVisible={true} text="Cargando información" />;
  }

  const handleNavigation = () => {
    navigation.navigate('foundation_screen', {
      name: foundation.displayName,
      image: avatar,
      id: foundation.uid,
      email: foundation.email,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar campaña',
      '¿Esta seguro que desea eliminar esta campaña?',
      [{text: 'Cancelar'}, {text: 'Eliminar', onPress: handleDeleteCampaign}],
    );
  };

  const handleDeleteCampaign = () => {
    setIsLoading(true);
    setLoadingText('Eliminando campaña, espere');
    let campaignDeleteKey = '';
    db.ref('campaigns').on('value', snapshot => {
      snapshot.forEach(needItem => {
        if (needItem.val().id === id) {
          campaignDeleteKey = needItem.key;
        }
      });
    });

    try {
      db.ref(`campaigns/${campaignDeleteKey}`)
        .remove()
        .then(() => {
          setIsLoading(false);
          toastRef.current.show('Publicación eliminada correctamente');
        })
        .catch(() => {
          setIsLoading(false);
          toastRef.current.show(
            'Ha ocurrido un error, por favor intente nuevamente más tarde',
          );
        });
    } catch (e) {
      setIsLoading(false);
      toastRef.current.show(
        'Ha ocurrido un error, por favor intente nuevamente más tarde',
      );
    }

    return () => {
      db.ref('campaigns').off();
    };
  };

  const handleEdit = () => {
    Alert.alert(
      'Editar la campaña',
      '¿Esta seguro que desea editar esta campaña?',
      [{text: 'Cancelar'}, {text: 'Editar', onPress: handleEditCampaign}],
    );
  };

  const handleEditCampaign = () => {
    navigation.navigate('edit_campaign_animals', {
      id,
      images,
      campaignDescription,
      other,
      title,
      createdBy,
      createdAt,
    });
  };

  return (
    <View style={styles.viewAnimalCampaign}>
      {user && user.role === 'administrator' && (
        <View>
          <Icon
            name="pencil"
            type="material-community"
            containerStyle={styles.iconEdit}
            size={35}
            onPress={handleEdit}
          />
          <Icon
            name="trash-can-outline"
            type="material-community"
            containerStyle={styles.iconTrash}
            size={35}
            onPress={handleDelete}
          />
        </View>
      )}
      <View style={{flexDirection: 'row'}}>
        <Avatar
          source={{uri: avatar}}
          rounded
          containerStyle={styles.avatar}
          size="medium"
        />
        <TouchableOpacity onPress={handleNavigation}>
          <View>
            <Text style={styles.foundation}>{foundation.displayName}</Text>
            <Text style={styles.descriptionCampaign}>{foundation.email}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Carousel arrayImages={images} height={200} width={screenWidth} />
      <TouchableOpacity onPress={goAnimalCampaign}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.requirements}>Descripción: </Text>
        <Text style={styles.requirementsText}>{campaignDescription}</Text>
      </View>
      {other !== '' && (
        <View>
          <Text style={styles.requirements}>Comentarios: </Text>
          <Text style={styles.requirementsText}>{other}</Text>
        </View>
      )}
      <Divider style={styles.divider} />
      <Loading isVisible={isLoading} text={loadingText} />
    </View>
  );
}

function FooterList(props) {
  const {isLoading} = props;

  if (isLoading) {
    return (
      <View style={styles.loaderAnimalCampaigns}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    return (
      <View style={styles.notFoundAnimalCampaigns}>
        <Text>No quedan campañas por cargar</Text>
      </View>
    );
  }
}

export default ListCampaignsUser;

const styles = StyleSheet.create({
  loaderAnimalCampaigns: {
    marginTop: 10,
    marginBottom: 10,
  },
  viewAnimalCampaign: {},
  title: {
    fontSize: 20,
    color: '#000',
    // textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    margin: 20,
  },
  viewAnimalCampaignImage: {
    marginRight: 15,
  },
  iconTrash: {
    position: 'absolute',
    right: 10,
  },
  iconEdit: {
    position: 'absolute',
    right: 50,
  },
  imageAnimalCampaign: {
    width: 200,
    height: 200,
    marginBottom: 10,
    marginRight: 10,
  },
  requirements: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'justify',
    marginLeft: 20,
    marginTop: 10,
  },
  requirementsText: {
    fontSize: 18,
    textAlign: 'justify',
    marginLeft: 20,
  },
  notFoundAnimalCampaigns: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 20,
    marginLeft: 10,
    marginBottom: 10,
  },
  foundation: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
  },
  divider: {
    height: 5,
    marginTop: 10,
    marginBottom: 30,
    color: '#000',
  },
  descriptionCampaign: {
    marginTop: 5,
    color: 'grey',
  },
});
