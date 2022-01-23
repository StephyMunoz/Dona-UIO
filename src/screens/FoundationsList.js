import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {db, storage} from '../firebase';
import {size} from 'lodash';
import {Icon} from 'react-native-elements';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Toast from 'react-native-easy-toast';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import avatarDefault from '../images/avatar-default.jpg';

const FoundationsList = () => {
  const navigation = useNavigation();
  const toastRef = useRef();
  const [refreshing, setRefreshing] = useState(false);
  const [foundationsList, setFoundationsList] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let foundationList = [];
      db.ref('users').on('value', snapshot => {
        snapshot.forEach(foundation => {
          const q = foundation.val();
          if (q.role === 'humanitarian_help' || q.role === 'animal_help') {
            foundationList.push(foundation.val());
            setRefreshing(refreshing);
          }
        });
        setFoundationsList(foundationList.reverse());
      });
    }, [refreshing]),
  );

  useEffect(() => {
    if (foundationsList.length === 0) {
      setRefreshing(true);
      wait(2000).then(() => setRefreshing(false));
    }
  }, [foundationsList.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  return (
    <View>
      {size(foundationsList) > 0 ? (
        <FlatList
          data={foundationsList}
          refreshControl={
            <RefreshControl
              enabled={true}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          renderItem={foundation => (
            <Foundation
              foundation={foundation}
              navigation={navigation}
              toastRef={toastRef}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderHumanitarianNeeds}>
          <Text style={styles.empty}>
            No se encuentran fundaciones registradas
          </Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );

  function Foundation({foundation}) {
    const [avatar, setAvatar] = useState(null);
    const {uid, displayName, email} = foundation.item;

    useEffect(() => {
      storage
        .ref()
        .child(`avatar/${uid}`)
        .getDownloadURL()
        .then(async response => {
          setAvatar(response);
        })
        .catch(() => {
          toastRef.current.show('Error al descargar avatar');
        });

      return () => {
        db.ref(`users/${uid}`).off();
      };
    }, [uid]);

    const handleDelete = () => {
      Alert.alert(
        'Eliminar fundación',
        `¿Esta seguro que desea eliminar la fundación ${displayName}? Recuerde que se eliminarán todas las publicaciones de la fundación`,
        [
          {text: 'Cancelar'},
          {text: 'Eliminar', onPress: handleDeleteFoundation},
        ],
      );
    };

    const handleDeleteFoundation = () => {
      db.ref(`users/${uid}`)
        .remove()
        .then(() => {
          toastRef.current.show('Fundación eliminada correctamente');
          db.ref('foundations').on('value', snapshot => {
            snapshot.forEach(publication => {
              const q = publication.val();
              if (q.createdBy === uid) {
                db.ref(`foundations/${publication.key}`)
                  .remove()
                  .then(
                    toastRef.current.show(
                      'Publicación eliminada correctamente',
                    ),
                  );
              }
            });
          });

          db.ref(`phones/${uid}`)
            .remove()
            .then(toastRef.current.show('Teléfonos eliminados'));

          db.ref('users').on('value', snapshot => {
            snapshot.forEach(item => {
              const q = item.val();
              if (q.role === 'user') {
                db.ref('users/favorites').on('value', snapshot1 => {
                  snapshot1.forEach(item2 => {
                    const r = item2.val();
                    if (r === uid) {
                      db.ref(`users/favorites/${item2.key}`)
                        .remove()
                        .then(toastRef.current.show('Elimando'));
                    }
                  });
                });
              }
            });
          });

          db.ref('campaigns').on('value', snapshot => {
            snapshot.forEach(publication => {
              const q = publication.val();
              if (q.createdBy === uid) {
                db.ref(`campaigns/${publication.key}`)
                  .remove()
                  .then(
                    toastRef.current.show(
                      'Publicación eliminada correctamente',
                    ),
                  );
              }
            });
          });
          storage
            .ref()
            .child(`avatar/${uid}`)
            .delete()
            .then(toastRef.current.show('Avatar eliminado correctamente'));
        })
        .catch(() => {
          toastRef.current.show(
            'Ha ocurrido un error, por favor intente nuevamente más tarde',
          );
        });
      return () => {
        db.ref(`users/${uid}`).off();
      };
    };

    const handleNavigation = () => {
      navigation.navigate('foundation_information', {
        name: displayName,
        image: avatar,
        id: uid,
        email,
      });
    };

    return (
      <View style={styles.viewFoundation}>
        <View style={styles.viewNavigation}>
          <TouchableOpacity onPress={handleNavigation}>
            <Text style={styles.foundation}>{displayName}</Text>
            <Text style={styles.descriptionCampaign}>{email}</Text>
          </TouchableOpacity>
          <Icon
            name="trash-o"
            type="font-awesome"
            containerStyle={styles.dotsStyle}
            size={30}
            onPress={handleDelete}
          />
        </View>

        <View style={styles.viewAvatar}>
          {avatar ? (
            <Image
              source={{uri: avatar}}
              style={styles.avatar}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={avatarDefault}
              style={styles.avatar}
              resizeMode="contain"
            />
          )}
        </View>
        <Divider style={styles.divider} width={1} />
      </View>
    );
  }
};

export default FoundationsList;

const styles = StyleSheet.create({
  viewFoundation: {
    marginTop: 20,
    color: '#fff',
  },
  empty: {
    textAlign: 'center',
    fontSize: 30,
  },
  viewAvatar: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  avatar: {
    width: 250,
    height: 150,
    alignItems: 'center',
  },
  viewNavigation: {
    flexDirection: 'row',
  },
  foundation: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 20,
  },
  divider: {
    height: 5,
    marginTop: 20,
    color: '#000',
  },
  descriptionCampaign: {
    marginLeft: 20,
    marginBottom: 10,
  },
  dotsStyle: {
    position: 'absolute',
    right: 55,
  },
  modalStyle: {
    width: 'auto',
    height: 'auto',
  },
  iconTrash: {
    position: 'absolute',
    right: 10,
  },
  campaignText: {
    fontSize: 20,
    color: 'red',
    marginRight: 50,
    marginBottom: 5,
  },
  foundationText: {
    fontSize: 20,
    marginRight: 40,
    marginBottom: 5,
    color: '#000',
  },
});
