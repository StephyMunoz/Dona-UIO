import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {size} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Loading from '../Loading';
import Carousel from '../Carousel';
import {db} from '../../firebase';

const screenWidth = Dimensions.get('window').width;

const ListAnimalNeeds = ({
  animalNeeds,
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
      {size(animalNeeds) > 0 ? (
        <FlatList
          data={animalNeeds}
          refreshControl={
            <RefreshControl
              enabled={true}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          renderItem={need => (
            <AnimalNeed
              animalNeed={need}
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
      ) : (
        <View style={styles.loaderAnimalNeeds}>
          {/*<ActivityIndicator size="large" />*/}
          {/*<Text>Cargando requerimientos</Text>*/}
          <Loading isVisible={true} text="Cargando requerimientos" />
        </View>
      )}
    </View>
  );
};

function AnimalNeed({animalNeed, navigation, toastRef, setRefresh}) {
  const {
    id,
    images,
    food,
    medicine,
    other,
    title,
    createdBy,
    createdAt,
    updatedAt,
  } = animalNeed.item;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);

  const handleEdit = () => {
    Alert.alert(
      'Editar este registro',
      '??Esta seguro que desea editar esta publicaci??n?',
      [{text: 'Cancelar'}, {text: 'Editar', onPress: handleEditNeed}],
    );
  };

  const handleEditNeed = () => {
    navigation.navigate('edit_animal_need', {
      id,
      images,
      food,
      medicine,
      other,
      title,
      createdBy,
      createdAt,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar requerimiento',
      '??Esta seguro que desea eliminar esta publicaci??n?',
      [
        {text: 'Cancelar'},
        {text: 'Eliminar', onPress: handleDeletePublication},
      ],
    );
  };

  const handleDeletePublication = () => {
    setLoadingText('Eliminando requerimiento');
    setIsLoading(true);
    db.ref('foundations').on('value', snapshot => {
      snapshot.forEach(publication => {
        const q = publication.val();
        if (q.id === id) {
          db.ref(`foundations/${publication.key}`)
            .remove()
            .then(() => {
              setIsLoading(false);
              setRefresh(true);
              toastRef.current.show('Publicaci??n eliminada exitosamente');
            })
            .catch(() => {
              setIsLoading(false);
              toastRef.current.show(
                'Ha ocurrido un error, por favor intente nuevamente m??s tarde ',
              );
            });
        }
      });
    });

    return () => {
      db.ref('foundations').off();
    };
  };

  return (
    <View>
      <View style={styles.viewAnimalNeed}>
        <Text style={styles.title}>{title}</Text>
        <Icon
          name="pencil"
          type="material-community"
          size={30}
          containerStyle={styles.iconEdit}
          onPress={handleEdit}
        />
        <Icon
          name="delete"
          type="material-community"
          size={30}
          containerStyle={styles.iconTrash}
          onPress={handleDelete}
        />
        <Carousel arrayImages={images} height={350} width={screenWidth - 20} />
        <Text style={styles.date}>
          Publicado:{'  '}
          {new Date(updatedAt).getDate()}/{new Date(updatedAt).getMonth() + 1}/
          {new Date(updatedAt).getFullYear()}{' '}
          {new Date(updatedAt).toLocaleTimeString()}
        </Text>
        {food !== '' && (
          <View>
            <Text style={styles.requirements}>
              Requerimientos de comida balanceada:{' '}
            </Text>
            <Text style={styles.requirementsText}>{food}</Text>
          </View>
        )}

        {medicine !== '' && (
          <View>
            <Text style={styles.requirements}>
              Requerimientos de medicina:{' '}
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
        <Divider style={styles.divider} width={1} />
      </View>
      <Loading isVisible={isLoading} text={loadingText} />
    </View>
  );
}

function FooterList(props) {
  const {isLoading} = props;

  if (isLoading) {
    return (
      <View style={styles.loaderAnimalNeeds}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    return (
      <View style={styles.notFoundAnimalNeeds}>
        <Text>No quedan necesidades por cargar</Text>
      </View>
    );
  }
}

export default ListAnimalNeeds;

const styles = StyleSheet.create({
  loaderAnimalNeeds: {
    marginTop: 10,
    marginBottom: 10,
  },
  viewAnimalNeed: {
    margin: 10,
  },
  date: {
    color: 'grey',
  },
  title: {
    fontSize: 20,
    marginTop: 20,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  divider: {
    marginTop: 10,
    marginBottom: 20,
  },
  iconEdit: {
    position: 'absolute',
    right: 40,
  },
  iconTrash: {
    position: 'absolute',
    right: 10,
  },
  viewAnimalNeedImage: {
    marginRight: 15,
  },
  imageAnimalNeed: {
    width: 300,
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
  notFoundAnimalNeeds: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
});
