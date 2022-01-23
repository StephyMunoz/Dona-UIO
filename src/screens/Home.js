import React, {useCallback, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import Toast from 'react-native-easy-toast';
import {useFocusEffect} from '@react-navigation/native';
import {db} from '../firebase';
import ListFoundationRequirements from '../components/ListFoundationRequirements';

const Home = () => {
  const [foundationNeeds, setFoundationNeeds] = useState([]);
  const [totalNeeds, setTotalNeeds] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  const limitNeed = 5;

  useFocusEffect(
    useCallback(() => {
      const resultFoundationNeeds = [];

      const getRequirements = async () => {
        await db.ref('foundations').on('value', snapshot => {
          setTotalNeeds(snapshot.numChildren());
        });
        await db
          .ref('foundations')
          .orderByChild('updatedAt')
          .limitToLast(limitNeed)
          .on('value', snapshot => {
            snapshot.forEach(need1 => {
              const q = need1.val();
              resultFoundationNeeds.push(q);
            });
            setFoundationNeeds(resultFoundationNeeds.reverse());
            setRefreshing(refreshing);
          });
      };
      getRequirements();
      return () => {
        db.ref('foundations').off();
      };
    }, [refreshing]),
  );

  if (foundationNeeds.length === 0) {
    return <ActivityIndicator size="large" />;
  }

  const handleLoadMore = async () => {
    const resultNeeds = [];

    if (foundationNeeds.length <= totalNeeds) {
      setIsLoading(true);
      await db
        .ref('foundations')
        .orderByChild('updatedAt')
        .limitToLast(limitNeed)
        .endBefore(foundationNeeds[foundationNeeds.length - 1].updatedAt)
        .on('value', snapshot => {
          if (snapshot.numChildren() > 0) {
            snapshot.forEach(need => {
              const q = need.val();
              resultNeeds.push(q);
            });
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        });
      setFoundationNeeds([...foundationNeeds, ...resultNeeds.reverse()]);
    }
    return () => {
      db.ref('foundations').off();
    };
  };

  return (
    <View style={styles.viewBody}>
      {foundationNeeds?.length === 0 ? (
        <View>
          <Text style={styles.textEmpty}>Aún no existen registros</Text>
        </View>
      ) : (
        <ListFoundationRequirements
          foundationsNeeds={foundationNeeds}
          handleLoadMore={handleLoadMore}
          toastRef={toastRef}
          isLoading={isLoading}
          setRefresh={setRefreshing}
        />
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );
};

export default Home;

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
    textAlign: 'center',
    marginTop: 30,
  },
});
