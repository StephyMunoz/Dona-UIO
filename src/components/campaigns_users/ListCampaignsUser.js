import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Avatar, Divider, Icon} from 'react-native-elements';
import {size} from 'lodash';
import Carousel from '../Carousel';
import {db, storage} from '../../firebase';
import {useAuth} from '../../lib/auth';
import Loading from '../Loading';

const screenWidth = Dimensions.get('window').width;

const ListCampaignsUser = ({
  animalCampaigns,
  isLoading,
  toastRef,
  handleLoadMore,
  setRefresh,
}) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefresh(true);
    wait(2000).then(() => setRefreshing(false));
  }, [setRefresh]);

  return (
    <View>
      {size(animalCampaigns) > 0 && (
        <FlatList
          data={animalCampaigns}
          initialNumToRender={5}
          // extraData={refresh}
          refreshControl={
            <RefreshControl
              enabled={true}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          renderItem={campaign => (
            <AnimalCampaign
              animalCampaign={campaign}
              navigation={navigation}
              toastRef={toastRef}
              setRefresh={setRefresh}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      )}
    </View>
  );
};

function AnimalCampaign({animalCampaign, navigation, toastRef, setRefresh}) {
  const {
    id,
    images,
    campaignDescription,
    other,
    title,
    createdBy,
    createdAt,
    updatedAt,
  } = animalCampaign.item;
  const [foundation, setFoundation] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const {user} = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (user) {
        db.ref(`users/${user.uid}/favorites`).on('value', snapshot => {
          snapshot.forEach(fav => {
            const q = fav.val();
            if (q === createdBy) {
              setFavorite(true);
              setReloadData(reloadData);
              setRefresh(true);
            }
          });
        });
      }
      return () => {
        db.ref(`users/${user.uid}/favorites`).off();
      };
    }, [createdBy, reloadData, setRefresh, user]),
  );
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
        toastRef.currentUser.show('Error al descargar avatar');
      });

    return () => {
      db.ref(`users/${createdBy}`).off();
    };
  }, [createdBy, toastRef.currentUser]);

  if (!avatar) {
    return <ActivityIndicator />;
  }

  const addFavorite = () => {
    if (!user) {
      toastRef.current.show(
        'Para usar el sistema de favoritos tienes que estar logeado',
      );
    } else if (user && user.role === 'user') {
      db.ref(`users/${user.uid}/favorites`)
        .push()
        .set(createdBy)
        .then(() => {
          setFavorite(true);
          setReloadData(true);
          toastRef.current.show('Fundación añadida a favoritos');
        })
        .catch(() => {
          toastRef.current.show('Error al añadir la fundación a favoritos');
        });
    }
    db.ref(`users/${user.uid}/favorites`).off();
  };

  const removeFavorite = () => {
    if (!user) {
      toastRef.current.show(
        'Para usar el sistema de favoritos tienes que estar logeado',
      );
    } else if (user && user.role === 'user') {
      db.ref(`users/${user.uid}/favorites`).on('value', snapshot => {
        snapshot.forEach(fav => {
          const q = fav.val();
          if (q === createdBy) {
            setFavorite(false);
            db.ref(`users/${user.uid}/favorites/${fav.key}`)
              .remove()
              .then(() => {
                setFavorite(false);
                setReloadData(true);
                setRefresh(true);
                toastRef.current.show('Fundación eliminada de favoritos');
              })
              .catch(() => {
                toastRef.current.show(
                  'Error al eliminar el restaurante de favoritos',
                );
              });
          }
        });
      });
    }
    db.ref('favorites').off();
  };

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
    setLoadingText('Eliminando campaña');
    db.ref('campaigns').on('value', snapshot => {
      snapshot.forEach(campaign => {
        const q = campaign.val();
        if (q.id === id) {
          db.ref(`campaigns/${campaign.key}`)
            .remove()
            .then(() => {
              setIsLoading(false);
              setRefresh(true);
              setReloadData(true);
              toastRef.current.show('Campaña eliminada correctamente');
            })
            .catch(() => {
              setIsLoading(false);
              toastRef.current.show(
                'Ha ocurrido un error, por favor intente nuevamente más tarde',
              );
            });
        }
      });
    });

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
      <View style={styles.viewFavorite}>
        {(!user || user.role === 'user') && (
          <Icon
            type="material-community"
            name={favorite ? 'heart' : 'heart-outline'}
            onPress={favorite ? removeFavorite : addFavorite}
            color={favorite ? '#f00' : '#000'}
            size={35}
            underlayColor="transparent"
          />
        )}
      </View>
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
      {foundation && avatar && (
        <View style={styles.avatarView}>
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
      )}

      <Carousel arrayImages={images} height={350} width={screenWidth} />
      <Text style={styles.date}>
        Publicado:{'  '}
        {new Date(updatedAt).getDate()}/{new Date(updatedAt).getMonth() + 1}/
        {new Date(updatedAt).getFullYear()}{' '}
        {new Date(updatedAt).toLocaleTimeString()}
      </Text>
      <Text style={styles.title}>{title}</Text>
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
  viewFavorite: {
    position: 'absolute',
    top: 5,
    right: 10,
    zIndex: 2,
    backgroundColor: '#fff',
    padding: 5,
    paddingLeft: 15,
  },
  avatarView: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  viewAnimalCampaignImage: {
    marginRight: 15,
  },
  iconTrash: {
    position: 'absolute',
    right: 25,
  },
  iconEdit: {
    position: 'absolute',
    right: 55,
  },
  imageAnimalCampaign: {
    width: 200,
    height: 200,
    marginBottom: 10,
    marginRight: 10,
  },
  requirements: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'justify',
    color: '#000',
  },
  date: {
    color: 'grey',
  },
  requirementsText: {
    fontSize: 18,
    textAlign: 'justify',
    color: 'grey',
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
