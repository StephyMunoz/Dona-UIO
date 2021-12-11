import React, {useCallback, useState} from 'react';
import {View, ScrollView, StyleSheet, Text} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {auth, db} from '../firebase';
import ListHumanitarianNeeds from '../components/humanitary_needs/ListHumanitarianNeeds';

const HumanitarianNeeds = () => {
  const navigation = useNavigation();
  const [humanitarianNeeds, setHumanitarianNeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const resultHumanitarianNeeds = [];

      const getRequirements = async () => {
        await db.ref('foundations').on('value', snapshot => {
          snapshot.forEach(need => {
            const q = need.val();
            if (q.createdBy === auth.currentUser.uid) {
              resultHumanitarianNeeds.push(q);
            }
          });
          setHumanitarianNeeds(resultHumanitarianNeeds);
        });
      };
      getRequirements();
      return () => {
        db.ref('foundations').off();
      };
    }, []),
  );
  console.log('hh', humanitarianNeeds);

  return (
    <View style={styles.viewBody}>
      <Text style={styles.textStyle}>
        Listado de requerimientos de la fundación:
      </Text>
      {humanitarianNeeds.length === 0 ? (
        <Text style={styles.textEmpty}>
          Aún no ingresa necesidades para su fundación
        </Text>
      ) : (
        <ListHumanitarianNeeds
          humanitarianNeeds={humanitarianNeeds}
          // handleLoadMore={handleLoadMore}
          isLoading={isLoading}
        />
      )}

      <Icon
        reverse
        type="material-community"
        name="plus"
        color="#00a680"
        containerStyle={styles.btnContainer}
        onPress={() => navigation.navigate('form_humanitarian_needs')}
      />
    </View>
  );
};

export default HumanitarianNeeds;

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 20,
    marginTop: 20,
  },
  btnContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
  },
  viewBody: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 50,
  },
  textEmpty: {
    marginTop: 30,
    textAlign: 'center',
  },
});
