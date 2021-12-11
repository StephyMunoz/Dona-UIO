import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Avatar, Image as ImageElements} from 'react-native-elements';
import {size} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import imageNotFound from '../../images/no-image.png';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Loading from '../Loading';

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

  return (
    <TouchableOpacity onPress={goAnimalNeed}>
      <View style={styles.viewAnimalNeed}>
        <Text style={styles.title}>{title}</Text>
        <ImageElements
          resizeMode="cover"
          PlaceholderContent={<ActivityIndicator color="fff" />}
          source={imageRequirement ? {uri: imageRequirement} : imageNotFound}
          style={styles.imageAnimalNeed}
        />
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
        <Divider />
      </View>
    </TouchableOpacity>
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
        <Text>No quedan AnimalNeedes por cargar</Text>
      </View>
    );
  }
}

export default ListAnimalNeeds;

const styles = StyleSheet.create({
  loaderAnimalNeeds: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  viewAnimalNeed: {
    // flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  title: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  viewAnimalNeedImage: {
    marginRight: 15,
  },
  imageAnimalNeed: {
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
  notFoundAnimalNeeds: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});
