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
import {Avatar, Icon} from 'react-native-elements';
import {size} from 'lodash';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import {db, storage} from '../firebase';
import Carousel from './Carousel';
import {useAuth} from '../lib/auth';
import avatarDefault from '../images/avatar-default.jpg';
import Loading from './Loading';

const screenWidth = Dimensions.get('window').width;

const ListFoundationRequirements = ({
  foundationsNeeds,
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
      {size(foundationsNeeds) > 0 && (
        <FlatList
          data={foundationsNeeds}
          initialNumToRender={5}
          refreshControl={
            <RefreshControl
              enabled={true}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          renderItem={need => (
            <FoundationNeed
              foundationNeed={need}
              navigation={navigation}
              toastRef={toastRef}
              setRefresh={setRefresh}
              setRefreshing={setRefreshing}
              refreshing={refreshing}
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

function FoundationNeed({
  foundationNeed,
  navigation,
  toastRef,
  setRefresh,
  setRefreshing,
  refreshing,
}) {
  const [foundationAvatar, setFoundationAvatar] = useState(null);
  const {
    images,
    food,
    personal_care,
    other,
    title,
    medicine,
    createdBy,
    id,
    updatedAt,
    createdAt,
  } = foundationNeed.item;
  const {user} = useAuth();
  const [foundationSelected, setFoundationSelected] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    db.ref(`users/${createdBy}`).on('value', snapshot => {
      setFoundationSelected(snapshot.val());
    });
    storage
      .ref()
      .child(`avatar/${createdBy}`)
      .getDownloadURL()
      .then(async response => {
        setFoundationAvatar(response);
      });

    return () => {
      db.ref(`users/${createdBy}`).off();
    };
  }, [createdBy]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        db.ref(`users/${user.uid}/favorites`).on('value', snapshot => {
          snapshot.forEach(fav => {
            const q = fav.val();
            if (q === createdBy) {
              setIsFavorite(true);
              setReload(reload);
              setRefresh(true);
              setRefreshing(refreshing);
            }
          });
        });
      }
      return () => {
        db.ref('users').off();
      };
    }, [createdBy, user, reload, setRefresh, refreshing, setRefreshing]),
  );

  const handleDelete = () => {
    Alert.alert(
      'Eliminar publicación',
      '¿Esta seguro que desea eliminar esta publicación?',
      [{text: 'Cancelar'}, {text: 'Eliminar', onPress: handlePublication}],
    );
  };

  const handlePublication = () => {
    setLoading(true);
    setLoadingText('Eliminando requerimiento');
    db.ref('foundations').on('value', snapshot => {
      snapshot.forEach(item => {
        const q = item.val();
        if (q.id === id) {
          db.ref(`foundations/${item.key}`)
            .remove()
            .then(() => {
              setLoading(false);
              setRefresh(true);
              toastRef.current.show('Publicación eliminada');
            })
            .catch(() => {
              setLoading(false);
              toastRef.current.show(
                'Ha ocurrido un error, por favor intente nuevamente',
              );
            });
        }
      });
    });
    return () => {
      db.ref('foundations').off();
    };
  };

  const handleNavigation = () => {
    navigation.navigate('foundation', {
      name: foundationSelected.displayName,
      image: foundationAvatar,
      id: foundationSelected.uid,
      email: foundationSelected.email,
    });
  };

  const addFavorite = () => {
    if (!user) {
      toastRef.current.show(
        'Para usar el sistema de favoritos tienes que estar logeado',
      );
    } else if (user && user.role === 'user') {
      db.ref(`users/${user.uid}/favorites`)
        .push()
        .set(foundationNeed.item.createdBy)
        .then(() => {
          setIsFavorite(true);
          setReload(true);
          toastRef.current.show('Fundación añadida a favoritos');
        })
        .catch(() => {
          toastRef.current.show('Error al añadir la fundación a favoritos');
        });
    }
    db.ref('users').off();
  };

  const removeFavorite = () => {
    if (user) {
      setReload(true);
      db.ref(`users/${user.uid}/favorites`).on('value', snapshot => {
        snapshot.forEach(fav => {
          const q = fav.val();
          if (q === createdBy) {
            setIsFavorite(false);
            db.ref(`users/${user.uid}/favorites/${fav.key}`)
              .remove()
              .then(() => {
                setIsFavorite(false);
                setReload(true);
                setRefreshing(true);
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

    db.ref('users').off();
  };

  const handleEditPress = () => {
    Alert.alert(
      'Editar publicación',
      '¿Estas segur@ que deseas editar esta publicación?',
      [{text: 'Cancelar'}, {text: 'Editar', onPress: handleEdit}],
    );
  };

  const handleEdit = () => {
    if (foundationSelected.role === 'animal_help') {
      navigation.navigate('edit_animals_publication', {
        id,
        images,
        food,
        medicine,
        other,
        title,
        createdBy,
        createdAt,
      });
    } else if (foundationSelected.role === 'humanitarian_help') {
      navigation.navigate('edit_humanitarian_publication', {
        id,
        images,
        food,
        personal_care,
        other,
        title,
        createdBy,
        createdAt,
      });
    }
  };

  return (
    <View style={styles.viewHumanitarianNeed}>
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
      {user && user.role === 'administrator' && (
        <View>
          <Icon
            name="pencil"
            type="material-community"
            containerStyle={styles.iconEdit}
            size={35}
            onPress={handleEditPress}
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
      <View style={styles.avatarView}>
        {foundationAvatar ? (
          <Avatar
            source={{uri: foundationAvatar}}
            rounded
            containerStyle={styles.avatar}
            size="medium"
          />
        ) : (
          <Avatar
            source={avatarDefault}
            rounded
            containerStyle={styles.avatar}
            size="medium"
          />
        )}
        {foundationSelected && (
          <TouchableOpacity onPress={handleNavigation}>
            <Text style={styles.foundation}>
              {foundationSelected.displayName}
            </Text>
            <Text style={styles.descriptionCampaign}>
              {foundationSelected.email}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Carousel arrayImages={images} height={350} width={screenWidth} />
      <Text style={styles.date}>
        Publicado:{'  '}
        {new Date(updatedAt).getDate()}/{new Date(updatedAt).getMonth() + 1}/
        {new Date(updatedAt).getFullYear()}{' '}
        {new Date(updatedAt).toLocaleTimeString()}
      </Text>

      <Text style={styles.title}>{title}</Text>

      {foundationSelected &&
      food !== '' &&
      foundationSelected.role === 'humanitarian_help' ? (
        <View>
          <Text style={styles.requirements}>Requerimientos alimenticios: </Text>
          <Text style={styles.requirementsText}>{food}</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.requirements}>
            Requerimientos de comida balanceada:{' '}
          </Text>
          <Text style={styles.requirementsText}>{food}</Text>
        </View>
      )}

      {foundationSelected &&
        foundationSelected.role === 'humanitarian_help' &&
        personal_care !== '' && (
          <View>
            <Text style={styles.requirements}>
              Implementos de aseo personal:{' '}
            </Text>
            <Text style={styles.requirementsText}>{personal_care}</Text>
          </View>
        )}
      {foundationSelected &&
        foundationSelected.role === 'animal_help' &&
        medicine !== '' && (
          <View>
            <Text style={styles.requirements}>
              Medicina requerida en la fundación:{' '}
            </Text>
            <Text style={styles.requirementsText}>{medicine}</Text>
          </View>
        )}
      {other !== '' && (
        <View>
          <Text style={styles.requirements}>Comentarios: </Text>
          <Text style={styles.requirementsText}>{other}</Text>
        </View>
      )}
      <Divider style={styles.divider} />
      <Loading isVisible={loading} text={loadingText} />
    </View>
  );
}

function FooterList(props) {
  const {isLoading} = props;

  if (isLoading) {
    return (
      <View style={styles.loaderHumanitarianNeeds}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    return (
      <View style={styles.notFoundHumanitarianNeeds}>
        <Text>No quedan requerimientos por cargar</Text>
      </View>
    );
  }
}

export default ListFoundationRequirements;

const styles = StyleSheet.create({
  loaderHumanitarianNeeds: {
    marginTop: 10,
    marginBottom: 10,
  },
  descriptionCampaign: {
    marginTop: 5,
    color: 'grey',
  },
  viewHumanitarianNeed: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#000',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  avatarView: {
    flexDirection: 'row',
  },
  viewHumanitarianNeedImage: {
    marginRight: 15,
  },
  imageHumanitarianNeed: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  requirements: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'justify',
    color: '#000',
  },
  requirementsText: {
    fontSize: 18,
    textAlign: 'justify',
    color: 'grey',
  },
  date: {
    color: 'grey',
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
  notFoundHumanitarianNeeds: {
    marginTop: 10,
    marginBottom: 30,
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
    marginTop: 20,
    color: '#000',
  },
  iconTrash: {
    position: 'absolute',
    right: 10,
  },
  iconEdit: {
    position: 'absolute',
    right: 50,
  },
  iconHeart: {
    position: 'absolute',
    right: 10,
    top: 0,
  },
});
