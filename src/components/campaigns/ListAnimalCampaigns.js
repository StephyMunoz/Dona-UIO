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
import Carousel from '../Carousel';
import {db} from '../../firebase';
import Loading from '../Loading';

const screenWidth = Dimensions.get('window').width;

const ListAnimalCampaigns = ({
  animalCampaigns,
  isLoading,
  toastRef,
  handleLoadMore,
}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(animalCampaigns) > 0 ? (
        <FlatList
          data={animalCampaigns}
          renderItem={campaign => (
            <AnimalCampaign
              animalCampaign={campaign}
              toastRef={toastRef}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={
            <FooterList isLoading={isLoading} navigation={navigation} />
          }
        />
      ) : (
        <View style={styles.loaderAnimalCampaigns}>
          <ActivityIndicator size="large" />
          <Text>Cargando campañas</Text>
        </View>
      )}
    </View>
  );
};

function AnimalCampaign({animalCampaign, navigation, toastRef}) {
  const {
    id,
    images,
    campaignDescription,
    other,
    title,
    createdAt,
    createdBy,
    updatedAt,
  } = animalCampaign.item;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [deleteKey, setDeleteKey] = useState(null);

  const handleEdit = () => {
    Alert.alert(
      'Editar la campaña',
      '¿Esta seguro que desea editar esta campaña?',
      [{text: 'Cancelar'}, {text: 'Editar', onPress: handleEditCampaign}],
    );
  };

  const handleEditCampaign = () => {
    navigation.navigate('edit_campaign', {
      id,
      images,
      campaignDescription,
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
      'Eliminar campaña',
      '¿Esta seguro que desea eliminar esta campaña?',
      [
        {text: 'Cancelar'},
        {text: 'Eliminar', onPress: handleDeletePublication},
      ],
    );
  };

  const getDeleteKey = () => {
    if (!deleteKey) {
      let campaignKey = null;
      db.ref('campaigns').on('value', snapshot => {
        snapshot.forEach(needItem => {
          if (needItem.val().id === id) {
            campaignKey = needItem.key;
          }
        });
      });
      setDeleteKey(campaignKey);
    }
  };

  console.log('jjj', deleteKey);

  const handleDeletePublication = () => {
    db.ref('campaigns').on('value', snapshot => {
      snapshot.forEach(needItem => {
        if (needItem.val().id === id) {
          setDeleteKey(needItem.key);
        }
      });
    });

    if (deleteKey) {
      setIsLoading(true);
      setLoadingText('Eliminando campaña');
      try {
        db.ref(`campaigns/${deleteKey}`)
          .remove()
          .then(() => {
            setIsLoading(false);
            toastRef.current.show('Publicación eliminada exitosamente');
          })
          .catch(e => {
            setIsLoading(false);
            toastRef.current.show(
              'Ha ocurrido un error, por favor intente nuevamente más tarde ',
              e,
            );
          });
      } catch (e) {
        setIsLoading(false);
        toastRef.current.show(
          'Ha ocurrido un error, por favor intente nuevamente más tarde',
        );
      }
    } else {
      toastRef.current.show('Ha ocurrido un error, vuelva a intentarlo');
      getDeleteKey();
    }

    return () => {
      db.ref('campaigns').off();
    };
  };

  return (
    <View>
      <View style={styles.viewAnimalCampaign}>
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
        <Carousel arrayImages={images} height={250} width={screenWidth - 20} />
        <Text style={styles.date}>
          Publicado:{'  '}
          {new Date(updatedAt).getDate()}/{new Date(updatedAt).getMonth() + 1}/
          {new Date(updatedAt).getFullYear()}{' '}
          {new Date(updatedAt).toLocaleTimeString()}
        </Text>
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
        <Divider width={1} style={styles.divider} />
      </View>
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

export default ListAnimalCampaigns;

const styles = StyleSheet.create({
  loaderAnimalCampaigns: {
    marginTop: 10,
    marginBottom: 10,
  },
  viewAnimalCampaign: {
    margin: 10,
  },
  date: {
    color: 'grey',
  },
  title: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    marginTop: 20,
  },
  viewAnimalCampaignImage: {
    marginRight: 15,
  },
  imageAnimalCampaign: {
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
  iconEdit: {
    position: 'absolute',
    right: 40,
  },
  iconTrash: {
    position: 'absolute',
    right: 10,
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
  divider: {
    marginTop: 10,
    // marginBottom: 10,
  },
});
