import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import {Avatar, Icon, Image as ImageElements} from 'react-native-elements';
import {size} from 'lodash';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import imageNotFound from '../images/no-image.png';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Loading from '../components/Loading';
import {db, storage} from '../firebase';
import Carousel from '../components/Carousel';
import {useAuth} from '../lib/auth';

const screenWidth = Dimensions.get('window').width;

const ListFoundationRequirements = ({
  foundationsNeeds,
  isLoading,
  toastRef,
}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(foundationsNeeds) > 0 ? (
        <FlatList
          data={foundationsNeeds}
          renderItem={need => (
            <FoundationNeed
              foundationNeed={need}
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
        <View style={styles.loaderHumanitarianNeeds}>
          {/*<ActivityIndicator size="large" />*/}
          {/*<Text>Cargando requerimientos</Text>*/}
          <Loading isVisible={true} text="Cargando requerimientos" />
        </View>
      )}
    </View>
  );
};

function FoundationNeed({foundationNeed, navigation, toastRef}) {
  const [foundationAvatar, setFoundationAvatar] = useState(null);
  const {images, food, personal_care, other, title, medicine, createdBy, id} =
    foundationNeed.item;
  const [foundationSelected, setFoundationSelected] = useState(null);
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);

  // useFocusEffect(
  //   useCallback(() => {
  //     db.ref(`foundations`);
  //   }),
  //   [],
  // );

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

  if (!foundationSelected) {
    return <Loading isVisible={true} text="Cargando información" />;
  }

  const goFoundationNeed = () => {
    navigation.navigate('foundation_need', {
      foundationSelected,
      foundationNeed,
    });
  };

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

  return (
    <View style={styles.viewHumanitarianNeed}>
      <View style={{flexDirection: 'row'}}>
        <Avatar
          source={{uri: foundationAvatar}}
          rounded
          containerStyle={styles.avatar}
          size="medium"
        />
        <TouchableOpacity onPress={handleNavigation}>
          <Text style={styles.foundation}>
            {foundationSelected.displayName}
          </Text>
          <Text style={styles.descriptionCampaign}>
            {foundationSelected.email}
          </Text>
        </TouchableOpacity>
        {user && user.role === 'administrator' && (
          <Icon
            name="trash-can-outline"
            type="material-community"
            containerStyle={styles.iconTrash}
            size={35}
            onPress={handleDelete}
          />
        )}
      </View>
      <Carousel arrayImages={images} height={250} width={screenWidth} />
      {user && user.role !== 'user' ? (
        <View>
          <Text style={styles.title}>{title}</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={goFoundationNeed}>
          <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
      )}

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
    alignItems: 'left',
  },
  descriptionCampaign: {
    marginTop: 5,
    color: 'grey',
  },
  viewHumanitarianNeed: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // margin: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
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
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'justify',
  },
  requirementsText: {
    fontSize: 15,
    textAlign: 'justify',
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
});
