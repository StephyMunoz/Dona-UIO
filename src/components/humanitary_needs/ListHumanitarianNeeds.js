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

const ListHumanitarianNeeds = ({humanitarianNeeds, isLoading}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(humanitarianNeeds) > 0 ? (
        <FlatList
          data={humanitarianNeeds}
          renderItem={need => <HumanitarianNeed humanitarianNeed={need} />}
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

function HumanitarianNeed({humanitarianNeed}) {
  const {id, images, food, personal_care, other, title} = humanitarianNeed.item;
  const imageNeed = images ? images[0] : null;

  // console.log('images', images);

  const goHumanitarianNeed = () => {
    console.log('image  Selected', images[0]);

    // navigation.navigate('humanitarianNeed', {
    //   id,
    //   name,
    // });
  };

  return (
    <TouchableOpacity onPress={goHumanitarianNeed}>
      <View style={styles.viewHumanitarianNeed}>
        <Text style={styles.title}>{title}</Text>
        <ImageElements
          resizeMode="cover"
          PlaceholderContent={<ActivityIndicator color="fff" />}
          source={imageNeed ? {uri: imageNeed} : imageNotFound}
          style={styles.imageHumanitarianNeed}
        />
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
        <Divider />
      </View>
    </TouchableOpacity>
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
    alignItems: 'center',
  },
  viewHumanitarianNeed: {
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
    marginBottom: 20,
    alignItems: 'center',
  },
});
