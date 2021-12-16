import React, {useCallback, useEffect, useState} from 'react';
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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import imageNotFound from '../images/no-image.png';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import Loading from '../components/Loading';
import {db} from '../firebase';

const ListFoundationRequirements = ({foundationsNeeds, isLoading}) => {
  const navigation = useNavigation();

  return (
    <View>
      {size(foundationsNeeds) > 0 ? (
        <FlatList
          data={foundationsNeeds}
          renderItem={need => (
            <FoundationNeed foundationNeed={need} navigation={navigation} />
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

function FoundationNeed({foundationNeed, navigation}) {
  const {images, food, personal_care, other, title, medicine, createdBy} =
    foundationNeed.item;
  const imageNeed = images ? images[0] : null;
  const [foundationSelected, setFoundationSelected] = useState(null);

  useEffect(() => {
    db.ref(`users/${createdBy}`).on('value', snapshot => {
      setFoundationSelected(snapshot.val());
    });
    return () => {
      db.ref(`users/${createdBy}`).off();
    };
  }, [createdBy]);

  const goFoundationNeed = () => {
    navigation.navigate('foundation_need', {
      foundationSelected,
      foundationNeed,
    });
  };

  return (
    <View style={styles.viewHumanitarianNeed}>
      <TouchableOpacity onPress={goFoundationNeed}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      <ImageElements
        resizeMode="cover"
        PlaceholderContent={<ActivityIndicator color="fff" />}
        source={imageNeed ? {uri: imageNeed} : imageNotFound}
        style={styles.imageHumanitarianNeed}
      />

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
      <Divider />
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
