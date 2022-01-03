import React, {useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import imageNotFound from '../../images/no-image.png';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Carousel from '../Carousel';
import {db} from '../../firebase';
import Loading from '../Loading';

const screenWidth = Dimensions.get('window').width;

const ListAnimalCampaigns = ({animalCampaigns, isLoading, toastRef}) => {
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
          // onEndReached={handleLoadMore}
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
  const {id, images, campaignDescription, other, title, createdAt, createdBy} =
    animalCampaign.item;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);

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
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar campaña',
      '¿Esta seguro que desea eliminar esta campaña?',
      [
        {text: 'Cancelar'},
        {text: 'Eliminar', onPress: handleDeletePublication},
      ],
    );
  };

  const handleDeletePublication = () => {
    setIsLoading(true);
    setLoadingText('Eliminando campaña');
    let campaignKey = '';
    db.ref('campaigns').on('value', snapshot => {
      snapshot.forEach(needItem => {
        if (
          needItem.val().createdBy === createdBy &&
          needItem.val().id === id
        ) {
          campaignKey = needItem.key;
        }
      });
    });

    try {
      db.ref(`campaigns/${campaignKey}`)
        .remove()
        .then(() => {
          setIsLoading(false);
          toastRef.current.show('Publicación eliminada exitosamente');
        })
        .catch(() => {
          setIsLoading(false);
          toastRef.current.show(
            'Ha ocurrido un error, por favor intente nuevamente más tarde',
          );
        });
    } catch (e) {
      setIsLoading(false);
      toastRef.current.show(
        'Ha ocurrido un error, por favor intente nuevamente más tarde',
      );
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
        <Divider />
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
  title: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
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
  },
  notFoundAnimalCampaigns: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});
