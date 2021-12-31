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

const ListAnimalCampaigns = ({animalCampaigns, isLoading}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(animalCampaigns) > 0 ? (
        <FlatList
          data={animalCampaigns}
          renderItem={campaign => <AnimalCampaign animalCampaign={campaign} />}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          // onEndReached={handleLoadMore}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
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

function AnimalCampaign({animalCampaign}) {
  const {id, images, campaignDescription, other, title} = animalCampaign.item;
  const imageCampaign = images ? images[0] : null;

  // console.log('images', images);

  const goAnimalCampaign = () => {
    // navigation.navigate('AnimalCampaign', {
    //   id,
    //   name,
    // });
  };

  return (
    <TouchableOpacity onPress={goAnimalCampaign}>
      <View style={styles.viewAnimalCampaign}>
        <Text style={styles.title}>{title}</Text>
        <ImageElements
          resizeMode="cover"
          PlaceholderContent={<ActivityIndicator color="fff" />}
          source={imageCampaign ? {uri: imageCampaign} : imageNotFound}
          style={styles.imageAnimalCampaign}
        />
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
    </TouchableOpacity>
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
    alignItems: 'center',
  },
  viewAnimalCampaign: {
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
  viewAnimalCampaignImage: {
    marginRight: 15,
  },
  imageAnimalCampaign: {
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
  notFoundAnimalCampaigns: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});
