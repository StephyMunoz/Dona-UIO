import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import {Avatar, Icon, Image as ImageElements} from 'react-native-elements';
import {size} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import imageNotFound from '../../images/no-image.png';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Loading from '../Loading';
import Carousel from '../Carousel';

const screenWidth = Dimensions.get('window').width;

const ListAnimalNeeds = ({animalNeeds, isLoading}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(animalNeeds) > 0 ? (
        <FlatList
          data={animalNeeds}
          renderItem={need => <AnimalNeed animalNeed={need} />}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          // onEndReached={handleLoadMore}
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

function AnimalNeed({animalNeed}) {
  const {id, images, food, medicine, other, title} = animalNeed.item;
  const imageRequirement = images ? images[0] : null;

  // console.log('images', images);

  const goAnimalNeed = () => {
    console.log('image  Selected', images[0]);

    // navigation.navigate('AnimalNeed', {
    //   id,
    //   name,
    // });
  };

  const handleEdit = () => {
    Alert.alert(
      'Editar este registro',
      '¿Esta seguro que desea editar esta publicación?',
      [{text: 'Cancelar'}, {text: 'Editar', onPress: handleEditNeed}],
    );
  };

  const handleEditNeed = () => {};

  const handleDelete = () => {
    Alert.alert(
      'Eliminar requerimiento',
      '¿Esta seguro que desea eliminar esta publicación?',
      [
        {text: 'Cancelar'},
        {text: 'Eliminar', onPress: handleDeletePublication},
      ],
    );
  };

  const handleDeletePublication = () => {};

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
        <Carousel arrayImages={images} height={250} width={screenWidth - 20} />
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
        <Divider style={styles.divider} />
      </View>
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
  title: {
    fontSize: 20,
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
  },
  notFoundAnimalNeeds: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});
