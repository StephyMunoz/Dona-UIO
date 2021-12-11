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
import imageNotFound from '../images/no-image.png';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Loading from '../components/Loading';

const ListFoundationRequirements = ({foundationsNeeds, isLoading}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(foundationsNeeds) > 0 ? (
        <FlatList
          data={foundationsNeeds}
          renderItem={need => <FoundationNeed foundationNeed={need} />}
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

function FoundationNeed({foundationNeed}) {
  const {id, images, food, personal_care, other, title, medicine, role} =
    foundationNeed.item;
  const imagenNeed = images ? images[0] : null;

  // console.log('images', images);

  const goFoundationNeed = () => {
    console.log('image  Selected', images[0]);

    // navigation.navigate('humanitarianNeed', {
    //   id,
    //   name,
    // });
  };

  return (
    <TouchableOpacity onPress={goFoundationNeed}>
      <View style={styles.viewHumanitarianNeed}>
        <Text style={styles.title}>{title}</Text>
        <ImageElements
          resizeMode="cover"
          PlaceholderContent={<ActivityIndicator color="fff" />}
          source={imagenNeed ? {uri: imagenNeed} : imageNotFound}
          style={styles.imageHumanitarianNeed}
        />
        {food !== '' && role === 'humanitarian_help' ? (
          <View>
            <Text style={styles.requirements}>
              Requerimientos alimenticios:{' '}
            </Text>
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

        {personal_care !== '' && (
          <View>
            <Text style={styles.requirements}>
              Implementos de aseo personal:{' '}
            </Text>
            <Text style={styles.requirementsText}>{personal_care}</Text>
          </View>
        )}
        {medicine !== '' && (
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

export default ListFoundationRequirements;

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
