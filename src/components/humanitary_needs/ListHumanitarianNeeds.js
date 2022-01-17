import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {size} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Loading from '../Loading';
import {db} from '../../firebase';
import Carousel from '../Carousel';

const screenWidth = Dimensions.get('window').width;

const ListHumanitarianNeeds = ({
  humanitarianNeeds,
  isLoading,
  toastRef,
  handleLoadMore,
}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(humanitarianNeeds) > 0 ? (
        <FlatList
          data={humanitarianNeeds}
          renderItem={need => (
            <HumanitarianNeed
              humanitarianNeed={need}
              toastRef={toastRef}
              navigation={navigation}
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
          {/*<Loading isVisible={true} text="Cargando requerimientos" />*/}
        </View>
      )}
    </View>
  );
};

function HumanitarianNeed({humanitarianNeed, toastRef, navigation}) {
  const {
    id,
    images,
    food,
    personal_care,
    other,
    title,
    createdBy,
    createdAt,
    updatedAt,
  } = humanitarianNeed.item;
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [deleteKey, setDeleteKey] = useState(null);

  const handleEdit = () => {
    Alert.alert(
      'Editar el registro',
      '¿Esta seguro que desea editar esta publicación?',
      [{text: 'Cancelar'}, {text: 'Editar', onPress: handleEditPublication}],
    );
  };

  const handleEditPublication = async () => {
    navigation.navigate('form_edit_needs', {
      id,
      images,
      food,
      personal_care,
      other,
      title,
      createdBy,
      createdAt,
      updatedAt,
    });
  };

  const handleDelete = () => {
    getDeleteKey();
    Alert.alert(
      'Eliminar requerimiento',
      '¿Esta seguro que desea eliminar esta publicación?',
      [{text: 'Cancelar'}, {text: 'Eliminar', onPress: handlePublication}],
    );
  };

  const getDeleteKey = () => {
    let needFoundationKey = null;
    db.ref('foundations').on('value', snapshot => {
      snapshot.forEach(needItem => {
        if (
          needItem.val().createdBy === createdBy &&
          needItem.val().id === id
        ) {
          needFoundationKey = needItem.key;
        }
      });
      setDeleteKey(needFoundationKey);
    });
    return () => {
      db.ref('foundations').off();
    };
  };

  const handlePublication = () => {
    setLoading(true);
    setLoadingText('Eliminando publicación');
    db.ref('foundations').on('value', snapshot => {
      snapshot.forEach(needItem => {
        if (
          needItem.val().createdBy === createdBy &&
          needItem.val().id === id
        ) {
          setDeleteKey(needItem.key);
        }
      });
    });

    if (deleteKey) {
      try {
        db.ref(`foundations/${deleteKey}`)
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
    } else {
      toastRef.current.show('Por favor vuelvalo a intentar nuevamente');
      getDeleteKey();
    }

    return () => {
      db.ref('foundations').off();
    };
  };

  return (
    <View>
      <View style={styles.viewHumanitarianNeed}>
        <Text style={styles.title}>{title}</Text>
        <Icon
          name="edit"
          style="material-community"
          size={30}
          containerStyle={styles.iconEdit}
          onPress={handleEdit}
        />
        <Icon
          name="delete"
          style="material-community"
          size={30}
          containerStyle={styles.iconTrash}
          onPress={handleDelete}
        />
        <Carousel arrayImages={images} height={250} width={screenWidth - 20} />
        <Text style={styles.date}>
          Publicado:{'  '}
          {new Date(updatedAt).getDate()}/{new Date(updatedAt).getMonth() + 1}/
          {new Date(updatedAt).getFullYear()}{' '}
          {new Date(updatedAt).toLocaleTimeString()}
        </Text>
        <View style={styles.needItem}>
          {food !== '' && (
            <View>
              <Text style={styles.requirements}>
                Requerimientos alimenticios:{' '}
              </Text>
              <Text style={styles.requirementsText}>{food}</Text>
            </View>
          )}

          {personal_care !== '' && (
            <View>
              <Text style={styles.requirements}>
                Implementos de aseo personal:{' '}
              </Text>
              <Text style={styles.requirementsText}>{personal_care}</Text>
            </View>
          )}
          {other !== '' && (
            <View>
              <Text style={styles.requirements}>Comentarios: </Text>
              <Text style={styles.requirementsText}>{other}</Text>
            </View>
          )}
          <Divider style={styles.divider} />
        </View>
      </View>
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

export default ListHumanitarianNeeds;

const styles = StyleSheet.create({
  loaderHumanitarianNeeds: {
    marginTop: 10,
    marginBottom: 10,
  },
  viewHumanitarianNeed: {
    margin: 10,
  },
  date: {
    color: 'grey',
  },
  title: {
    fontSize: 20,
    marginTop: 20,
    color: '#000',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconEdit: {
    position: 'absolute',
    right: 50,
  },
  iconTrash: {
    position: 'absolute',
    right: 10,
  },
  viewHumanitarianNeedImage: {
    marginRight: 15,
  },
  imageHumanitarianNeed: {
    width: screenWidth - 20,
    height: 250,
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
  notFoundHumanitarianNeeds: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  images: {
    alignItems: 'center',
  },
  divider: {
    marginBottom: 20,
    marginTop: 10,
  },
});
