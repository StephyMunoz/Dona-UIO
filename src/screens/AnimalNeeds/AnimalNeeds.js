import React, {useCallback, useState} from 'react';
import {View, ScrollView, StyleSheet, Text} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {auth, db} from '../../firebase';
import ListAnimalNeeds from '../../components/animalNeeds/ListAnimalNeeds';

const AnimalNeeds = () => {
  const navigation = useNavigation();
  const [animalNeeds, setAnimalNeeds] = useState([]);
  const [totalAnimalNeeds, setTotalAnimalNeeds] = useState(0);
  const [startNeeds, setStartNeeds] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const limitNeeds = 5;

  useFocusEffect(
    useCallback(() => {
      const resultAnimalNeeds = [];

      db.ref('foundations').on('value', snapshot => {
        snapshot.forEach(need => {
          const q = need.val();
          if (q.createdBy === auth.currentUser.uid) {
            resultAnimalNeeds.push(q);
          }
        });
        setAnimalNeeds(resultAnimalNeeds);
      });

      // db.ref(`animal_needs/${auth.currentUser.uid}`)
      //   // .orderBy('createAt', 'desc')
      //   .limit(limitNeeds)
      //   .get()
      //   .then(response => {
      //     setStartNeeds(response.docs[response.docs.length - 1]);
      //
      //     response.forEach(doc => {
      //       const need = doc.data();
      //       need.id = doc.id;
      //       resultAnimalNeeds.push(need);
      //     });
      //     setAnimalNeeds(resultAnimalNeeds);
      //   });
      return () => {
        db.ref('foundations').off();
      };
    }, []),
  );

  // const handleLoadMore = () => {
  //   const resultAnimalNeeds = [];
  //   animalNeeds.length < totalAnimalNeeds && setIsLoading(true);
  //
  //   db.ref(`animal_needs/${auth.currentUser.uid}`)
  //     // .orderBy('createAt', 'desc')
  //     .startAfter(startNeeds.data())
  //     .limit(limitNeeds)
  //     .get()
  //     .then(response => {
  //       if (response.docs.length > 0) {
  //         setStartNeeds(response.docs[response.docs.length - 1]);
  //       } else {
  //         setIsLoading(false);
  //       }
  //
  //       response.forEach(doc => {
  //         const need = doc.data();
  //         need.id = doc.id;
  //         resultAnimalNeeds.push(need);
  //       });
  //
  //       setAnimalNeeds([...animalNeeds, ...resultAnimalNeeds]);
  //     });
  // };

  return (
    <View style={styles.viewBody}>
      <Text style={styles.textStyle}>
        Listado de requerimientos de la fundación
      </Text>
      {animalNeeds.length === 0 ? (
        <Text style={styles.textEmpty}>No existen registros aún</Text>
      ) : (
        <ListAnimalNeeds
          animalNeeds={animalNeeds}
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
        onPress={() => navigation.navigate('form_animal_needs')}
      />
    </View>
  );
};

export default AnimalNeeds;

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
