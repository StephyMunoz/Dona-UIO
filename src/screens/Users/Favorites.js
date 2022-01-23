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
import Toast from 'react-native-easy-toast';
import Loading from '../../components/Loading';
import {useAuth} from '../../lib/auth';
import {db, storage} from '../../firebase';
import imageNotFound from '../../images/no-image.png';
import {useFocusEffect} from '@react-navigation/native';

const Favorites = props => {
  const {navigation} = props;
  const {user} = useAuth();
  const [foundations, setFoundations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const toastRef = useRef();

  useFocusEffect(
    useCallback(() => {
      const listFoundations = [];
      db.ref(`users/${user.uid}/favorites`).on('value', snapshot => {
        snapshot.forEach(fav => {
          const q = fav.val();
          listFoundations.push(q);
          setReloadData(reloadData);
        });
        setFoundations(listFoundations.reverse());
      });
      return () => {
        db.ref(`users/${user.uid}/favorites`).off();
      };
    }, [user.uid, reloadData]),
  );

  if (!foundations) {
    return <ActivityIndicator size="large" />;
  } else if (foundations && foundations?.length === 0) {
    return <NotFoundFoundations />;
  }

  return (
    <View style={styles.viewBody}>
      {foundations ? (
        <FlatList
          data={foundations}
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
          <Text style={styles.loading}>Cargando Foundaciones</Text>
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
    <View style={styles.noFoundation}>
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={styles.textNotFound}>
        No tiene fundaciones en la lista de favoritos
      </Text>
    </View>
  );
}

function Foundation(props) {
  const {user} = useAuth();
  const {foundation, setIsLoading, toastRef, setReloadData, navigation} = props;
  const [foundationSelected, setFoundationSelected] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    db.ref(`users/${foundation.item}`).on('value', snapshot => {
      setFoundationSelected(snapshot.val());
    });
  }, [foundation.item]);

  useEffect(() => {
    storage
      .ref()
      .child(`avatar/${foundation.item}`)
      .getDownloadURL()
      .then(async response => {
        setImage(response);
      });

    return () => {
      db.ref(`avatar/${foundation.item}`).off();
    };
  }, [foundation.item]);

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
    db.ref(`users/${user.uid}/favorites`).on('value', snapshot => {
      snapshot.forEach(fav => {
        const q = fav.val();
        if (q === foundationSelected.uid) {
          db.ref(`users/${user.uid}/favorites/${fav.key}`)
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
        }
      });
    });

    db.ref(`users/${user.uid}/favorites`).off();
  };

  if (!foundationSelected) {
    return <ActivityIndicator size="large" />;
  }

  const goToFoundationScreen = () => {
    navigation.navigate('publications', {
      name: foundationSelected.displayName,
      image,
      id: foundationSelected.uid,
      email: foundationSelected.email,
    });
  };

  return (
    <View style={styles.Foundation}>
      <TouchableOpacity onPress={goToFoundationScreen}>
        <Image
          resizeMode="contain"
          style={styles.image}
          PlaceholderContent={<ActivityIndicator color="#fff" />}
          source={image ? {uri: image} : imageNotFound}
        />
        <View style={styles.info}>
          {foundationSelected && (
            <Text style={styles.name}>{foundationSelected.displayName}</Text>
          )}
          <Icon
            type="material-community"
            name="heart"
            color="#f00"
            containerStyle={styles.favorite}
            onPress={confirmRemoveFavorite}
            underlayColor="transparent"
            size={30}
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
  loading: {
    textAlign: 'center',
  },
  Foundation: {
    margin: 10,
  },
  image: {
    width: '100%',
    height: 180,
  },
  noFoundation: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    marginTop: -30,
    backgroundColor: '#fff',
  },
  textNotFound: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 30,
    color: 'grey',
  },
  favorite: {
    marginTop: -35,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 100,
  },
});
