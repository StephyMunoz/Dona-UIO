import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Toast from 'react-native-easy-toast';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {db} from '../../firebase';
import ListAnimalNeeds from '../../components/animalNeeds/ListAnimalNeeds';
import {useAuth} from '../../lib/auth';

const AnimalNeeds = () => {
  const navigation = useNavigation();
  const toastRef = useRef();
  const {user} = useAuth();
  const limitAnimalNeeds = 20;
  const [animalNeeds, setAnimalNeeds] = useState([]);
  const [totalAnimalNeeds, setTotalAnimalNeeds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    let total = 0;
    const getTotal = async () => {
      await db.ref('foundations').on('value', snapshot => {
        snapshot.forEach(need => {
          const q = need.val();
          if (q.createdBy === user.uid) {
            setTotalAnimalNeeds((total = total + 1));
          }
        });
      });
    };
    getTotal();
    return () => {
      db.ref('foundations').off();
    };
  }, [user.uid]);

  useFocusEffect(
    useCallback(() => {
      const resultAnimalNeeds = [];

      db.ref('foundations')
        .orderByChild('updatedAt')
        .limitToLast(limitAnimalNeeds)
        .on('value', snapshot => {
          snapshot.forEach(need => {
            const q = need.val();
            if (q.createdBy === user.uid) {
              resultAnimalNeeds.push(q);
              setRefresh(refresh);
            }
          });
          setAnimalNeeds(resultAnimalNeeds.reverse());
        });

      return () => {
        db.ref('foundations').off();
      };
    }, [user.uid, refresh]),
  );

  const handleLoadMore = async () => {
    const resultNeeds = [];

    if (animalNeeds.length <= totalAnimalNeeds) {
      setIsLoading(true);
      await db
        .ref('foundations')
        .orderByChild('updatedAt')
        .limitToLast(limitAnimalNeeds)
        .endBefore(animalNeeds[animalNeeds.length - 1].updatedAt)
        .on('value', snapshot => {
          if (snapshot.numChildren() > 0) {
            snapshot.forEach(need => {
              const q = need.val();
              if (q.createdBy === user.uid) {
                setIsLoading(true);
                resultNeeds.push(q);
              }
            });
          } else {
            setIsLoading(false);
          }
        });
      setAnimalNeeds([...animalNeeds, ...resultNeeds.reverse()]);
      setIsLoading(false);
    }
    return () => {
      db.ref('foundations').off();
    };
  };

  return (
    <View style={styles.viewBody}>
      {animalNeeds.length === 0 ? (
        <Text style={styles.textEmpty}>No existen registros aún</Text>
      ) : (
        <ListAnimalNeeds
          animalNeeds={animalNeeds}
          handleLoadMore={handleLoadMore}
          isLoading={isLoading}
          toastRef={toastRef}
          setRefresh={setRefresh}
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
      <Toast ref={toastRef} position="center" opacity={0.9} />
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
  },
  textEmpty: {
    marginTop: 30,
    textAlign: 'center',
    color: '#000',
  },
});
