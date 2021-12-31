import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {db, storage} from '../firebase';
import Loading from '../components/Loading';
import {size} from 'lodash';
import {useAuth} from '../lib/auth';
import {Avatar, Icon, Overlay} from 'react-native-elements';
import Carousel from '../components/Carousel';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Toast from 'react-native-easy-toast';
import {useNavigation} from '@react-navigation/native';
import avatarDefault from '../images/avatar-default.jpg';

import Modal from '../components/Modal';

const screenWidth = Dimensions.get('window').width;

const FoundationsList = () => {
  const navigation = useNavigation();
  const toastRef = useRef();
  const [foundationsList, setFoundationsList] = useState([]);

  useEffect(() => {
    let foundationList = [];
    db.ref('users').on('value', snapshot => {
      snapshot.forEach(foundation => {
        if (
          foundation.val().role === 'humanitarian_help' ||
          foundation.val().role === 'animal_help'
        ) {
          foundationList.push(foundation.val());
        }
      });
      setFoundationsList(foundationList);
    });
  }, []);

  if (foundationsList.length === 0) {
    return <Loading isVisble={true} text="Cargando información" />;
  }

  return (
    <View>
      {size(foundationsList) > 0 ? (
        <FlatList
          data={foundationsList}
          renderItem={foundation => (
            <Foundation
              foundation={foundation}
              navigation={navigation}
              toastRef={toastRef}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          // onEndReached={handleLoadMore}
          // ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loaderHumanitarianNeeds}>
          {/*<ActivityIndicator size="large" />*/}
          {/*<Text>Cargando requerimientos</Text>*/}
          <Loading isVisible={true} text="Cargando listado de fundaciones" />
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );
  function Foundation({foundation, navigation}) {
    const [avatar, setAvatar] = useState(null);
    const {uid, displayName, email} = foundation.item;
    const [foundationSelected, setFoundationSelected] = useState(null);
    const {user} = useAuth();

    useEffect(() => {
      storage
        .ref()
        .child(`avatar/${uid}`)
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
        db.ref(`users/${uid}`).off();
      };
    }, [uid]);

    const handleDelete = () => {
      Alert.alert(
        'Eliminar fundación',
        `¿Esta seguro que desea eliminar la fundación ${displayName}?`,
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
          toastRef.current.show('Publicación eliminada correctamente');
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

    // const handleFunctions = foundationDelete => {
    //   console.log('heloo');
    //   // setModalVisible(true);
    //   return (
    //     <Overlay
    //       isVisible={true}
    //       setIsVisible={setModalVisible}
    //       onBackdropPress={() => setModalVisible(false)}
    //       style={styles.modalStyle}>
    //       <TouchableOpacity
    //         style={{flexDirection: 'row'}}
    //         onPress={() => console.log(displayName)}
    //         // onPress={() => handleDelete(foundation.item)}
    //       >
    //         <Text style={styles.campaignText}>Eliminar fundación</Text>
    //         <Icon
    //           name="trash-can-outline"
    //           type="material-community"
    //           color="red"
    //           size={25}
    //           containerStyle={styles.iconTrash}
    //           onPress={() => console.log(foundationDelete)}
    //         />
    //       </TouchableOpacity>
    //       <Divider width={0.5} style={{marginBottom: 20}} />
    //       <View style={{flexDirection: 'row'}}>
    //         <Text style={styles.foundationText}>Ver fundación</Text>
    //         <Icon
    //           name="information"
    //           type="material-community"
    //           size={25}
    //           containerStyle={styles.iconTrash}
    //           // onPress={handleDelete}
    //         />
    //       </View>
    //       <Divider width={0.5} style={{marginBottom: 20}} />
    //       <TouchableOpacity
    //         style={{flexDirection: 'row'}}
    //         onPress={() => setModalVisible(false)}>
    //         <Text style={styles.foundationText}>SALIR</Text>
    //       </TouchableOpacity>
    //     </Overlay>
    //   );
    // };

    return (
      <View style={styles.viewFoundation}>
        <View style={{flexDirection: 'row'}}>
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
            <Image source={{uri: avatar}} style={styles.avatar} />
          ) : (
            <Image source={avatarDefault} style={styles.avatar} />
          )}
        </View>
        <Divider style={styles.divider} width={1} />
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
          <Text>No quedan fundaciones por cargar</Text>
        </View>
      );
    }
  }
};

export default FoundationsList;

const styles = StyleSheet.create({
  viewFoundation: {
    marginTop: 20,
    color: '#fff',
    // / marginLeft: 20,
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
