import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, Image} from 'react-native-elements';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-easy-toast';
import Loading from '../components/Loading';
import {useAuth} from '../lib/auth';
import {db, storage} from '../firebase';
import imageNotFound from '../images/no-image.png';

const Favorites = props => {
  const {navigation} = props;
  const {user} = useAuth();
  const [foundations, setFoundations] = useState(null);
  const [foundationList, setFoundationList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const toastRef = useRef();

  useFocusEffect(
    useCallback(() => {
      const listFoundations = [];
      db.ref('favorites').on('value', snapshot => {
        snapshot.forEach(foundation => {
          if (foundation.val().idUser === user.uid) {
            listFoundations.push(foundation.val().idFoundation);
          }
        });
      });
      setFoundations(listFoundations);
      setReloadData(false);
    }, [user.uid, reloadData]),
  );

  useFocusEffect(
    useCallback(() => {
      let foundationFavorite = [];
      if (foundations) {
        foundations.forEach(foundation => {
          db.ref(`users/${foundation}`).on('value', snapshot => {
            foundationFavorite.push(snapshot.val());
          });
        });
        setFoundationList(foundationFavorite);
      }
      setReloadData(false);
    }, [foundations, reloadData]),
  );

  // if (!foundationList) {
  //   return <Loading isVisible={true} text="Cargando información" />;
  // }

  if (!foundationList) {
    // return <NotFoundFoundations />;
    return <ActivityIndicator size="large" />;
  } else if (foundationList && foundationList.length === 0) {
    return <NotFoundFoundations />;
  }

  if (foundationList) {
    console.log('foun', foundationList);
  }

  return (
    <View style={styles.viewBody}>
      {foundations ? (
        <FlatList
          data={foundationList}
          renderItem={foundation => (
            <Foundation
              foundation={foundation}
              setIsLoading={setIsLoading}
              toastRef={toastRef}
              setReloadData={setReloadData}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderFoundations}>
          <ActivityIndicator size="large" />
          <Text style={{textAlign: 'center'}}>Cargando Foundaciones</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading text="Eliminando fundación" isVisible={isLoading} />
    </View>
  );
};

export default Favorites;

function NotFoundFoundations() {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        No tiene fundaciones en la lista de favoritos
      </Text>
    </View>
  );
}

function Foundation(props) {
  const {foundation, setIsLoading, toastRef, setReloadData, navigation} = props;
  const {uid, displayName, email} = foundation.item;
  const {user} = useAuth();
  const [image, setImage] = useState(null);

  useEffect(() => {
    storage
      .ref()
      .child(`avatar/${foundation.item.uid}`)
      .getDownloadURL()
      .then(async response => {
        setImage(response);
      });

    return () => {
      db.ref(`avatar/${foundation.item.uid}`).off();
    };
  }, [foundation.item.uid]);

  const confirmRemoveFavorite = () => {
    Alert.alert(
      'Eliminar la fundación de favoritos',
      '¿Estas seguro de que quieres eliminar la fundación de favoritos?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: removeFavorite,
        },
      ],
      {cancelable: false},
    );
  };

  const removeFavorite = () => {
    let idToRemove = '';
    setIsLoading(true);
    db.ref('favorites').on('value', snapshot => {
      snapshot.forEach(fav => {
        const q = fav.val();
        if (q.idFoundation === uid) {
          if (q.idUser === user.uid) {
            idToRemove = fav.key;
          }
        }
      });
    });

    db.ref(`favorites/${idToRemove}`)
      .remove()
      .then(() => {
        setIsLoading(false);
        setReloadData(true);
        toastRef.current.show('Foundación eliminado correctamente');
      })
      .catch(() => {
        setIsLoading(false);
        toastRef.current.show('Error al eliminar el Foundatione');
      });
    db.ref('favorites').off();
  };

  const goToFoundationScreen = () => {
    navigation.navigate('foundation_favorite', {
      name: displayName,
      image,
      id: uid,
      email,
    });
  };

  return (
    <View style={styles.Foundation}>
      <TouchableOpacity onPress={goToFoundationScreen}>
        <Image
          resizeMode="cover"
          style={styles.image}
          PlaceholderContent={<ActivityIndicator color="#fff" />}
          source={image ? {uri: image} : imageNotFound}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{displayName}</Text>
          <Icon
            type="material-community"
            name="heart"
            color="#f00"
            containerStyle={styles.favorite}
            onPress={confirmRemoveFavorite}
            underlayColor="transparent"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  loaderFoundations: {
    marginTop: 10,
    marginBottom: 10,
  },
  Foundation: {
    margin: 10,
  },
  image: {
    width: '100%',
    height: 180,
  },
  info: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: -30,
    backgroundColor: '#fff',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 30,
  },
  favorite: {
    marginTop: -35,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 100,
  },
});
