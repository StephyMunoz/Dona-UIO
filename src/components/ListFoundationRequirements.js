import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Avatar, Icon} from 'react-native-elements';
import {size} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import {db, storage} from '../firebase';
import Carousel from '../components/Carousel';
import {useAuth} from '../lib/auth';
import avatarDefault from '../images/avatar-default.jpg';

const screenWidth = Dimensions.get('window').width;

const ListFoundationRequirements = ({
  foundationsNeeds,
  isLoading,
  toastRef,
  handleLoadMore,
}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(foundationsNeeds) > 0 ? (
        <FlatList
          data={foundationsNeeds}
          initialNumToRender={3}
          renderItem={need => (
            <FoundationNeed
              foundationNeed={need}
              navigation={navigation}
              toastRef={toastRef}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loaderHumanitarianNeeds}>
          <ActivityIndicator size="large" />
          {/*<Text>Cargando requerimientos</Text>*/}
        </View>
      )}
    </View>
  );
};

function FoundationNeed({foundationNeed, navigation, toastRef}) {
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
  const [foundationSelected, setFoundationSelected] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);

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

  useEffect(() => {
    if (user) {
      db.ref('favorites').on('value', snapshot => {
        snapshot.forEach(fav => {
          const q = fav.val();
          if (q.idFoundation === createdBy) {
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
  }, [createdBy, user]);

  if (!foundationSelected) {
    return <ActivityIndicator size="large" />;
  }

  const handleDelete = () => {
    Alert.alert(
      'Eliminar publicación',
      '¿Esta seguro que desea eliminar esta publicación?',
      [{text: 'Cancelar'}, {text: 'Eliminar', onPress: handlePublication}],
    );
  };
  const handlePublication = () => {
    setLoading(true);
    setLoadingText('Eliminando publicación');
    let needKey = '';
    db.ref('foundations').on('value', snapshot => {
      snapshot.forEach(need => {
        if (need.val().createdBy === createdBy && need.val().id === id) {
          needKey = need.key;
        }
      });
    });

    try {
      db.ref(`foundations/${needKey}`)
        .remove()
        .then(() => {
          setLoading(false);
          toastRef.current.show('Publicación eliminada correctamente');
        })
        .catch(() => {
          setLoading(false);
          toastRef.current.show(
            'Ha ocurrido un error, por favor intente nuevamente más tarde',
          );
        });
    } catch (e) {
      setLoading(false);
      toastRef.current.show(
        'Ha ocurrido un error, por favor intente nuevamente más tarde',
      );
    }

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
        if (q.idFoundation === createdBy) {
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

  const handleEditPress = () => {
    Alert.alert(
      'Editar publicación',
      '¿Estas segur@ que deseas editar esta publicación?',
      [{text: 'Cancelar'}, {text: 'Editar', onPress: handleEdit}],
    );
  };

  const handleEdit = () => {
    console.log(foundationSelected);
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
      <View style={{flexDirection: 'row'}}>
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
        <TouchableOpacity onPress={handleNavigation}>
          <Text style={styles.foundation}>
            {foundationSelected.displayName}
          </Text>
          <Text style={styles.descriptionCampaign}>
            {foundationSelected.email}
          </Text>
        </TouchableOpacity>
      </View>
      <Carousel arrayImages={images} height={250} width={screenWidth} />
      <Text style={styles.date}>
        Publicado:{'  '}
        {new Date(updatedAt).toLocaleDateString()}{' '}
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
      {/*<Loading isVisible={loading} text={loadingText} />*/}
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
});
