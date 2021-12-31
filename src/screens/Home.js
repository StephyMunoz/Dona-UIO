import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Toast from 'react-native-easy-toast';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {db} from '../firebase';
import ListFoundationRequirements from '../components/ListFoundationRequirements';
import {useAuth} from '../lib/auth';
import Loading from '../components/Loading';

const Home = () => {
  const navigation = useNavigation();
  const [foundationNeeds, setFoundationNeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  const {user} = useAuth();

  useFocusEffect(
    useCallback(() => {
      const resultFoundationNeeds = [];

      const getRequirements = async () => {
        await db
          .ref('foundations')
          .orderByChild('createdAt')
          .on('value', snapshot => {
            snapshot.forEach(need => {
              const q = need.val();
              resultFoundationNeeds.push(q);
            });

            setFoundationNeeds(resultFoundationNeeds.reverse());
          });
      };

      getRequirements();
      return () => {
        db.ref('foundations').off();
      };
    }, []),
  );

  return (
    <View style={styles.viewBody}>
      {/*<Text style={styles.textStyle}>*/}
      {/*  Lo que necesitan nuestras fundaciones:*/}
      {/*</Text>*/}
      {foundationNeeds.length === 0 ? (
        <View>
          {user && user.role !== 'user' ? (
            <Text style={styles.textEmpty}>
              Aún no ingresa necesidades para su fundación
            </Text>
          ) : (
            <Text style={styles.textEmpty}>Aún no existen registros</Text>
          )}
        </View>
      ) : (
        <ListFoundationRequirements
          foundationsNeeds={foundationNeeds}
          // handleLoadMore={handleLoadMore}
          toastRef={toastRef}
          isLoading={isLoading}
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
    paddingBottom: 20,
  },
});
