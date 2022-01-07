import React, {useCallback, useRef, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import Toast from 'react-native-easy-toast';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {db} from '../firebase';
import ListFoundationRequirements from '../components/ListFoundationRequirements';
import {useAuth} from '../lib/auth';

const Home = () => {
  const [foundationNeeds, setFoundationNeeds] = useState([]);
  const [totalNeeds, setTotalNeeds] = useState(0);
  const [startNeeds, setStartNeeds] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  const {user} = useAuth();
  const limitNeed = 10;

  if (user && user.emailVerified === false) {
    Alert.alert(
      'Cuenta no verificada',
      'Revisa tu badeja de Correo No Deseado o dirígete a Perfil para reenviar el link de activación. No podrás acceder a las funcionalidades completas',
      [{text: 'Entendido'}],
    );
  }

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
            snapshot.forEach(need => {
              const q = need.val();
              resultFoundationNeeds.push(q);
            });
            // setStartNeeds(resultFoundationNeeds[0]);
            setFoundationNeeds(resultFoundationNeeds.reverse());
          });
      };

      getRequirements();
      return () => {
        db.ref('foundations').off();
      };
    }, []),
  );

  const handleLoadMore = async () => {
    const resultNeeds = [];
    setIsLoading(true);
    if (foundationNeeds) {
      setStartNeeds(foundationNeeds[foundationNeeds.length - 1]);
    }
    if (foundationNeeds.length < totalNeeds) {
      setIsLoading(true);
    }
    if (startNeeds) {
      await db
        .ref('foundations')
        .orderByChild('updatedAt')
        .limitToLast(limitNeed)
        .startAfter(startNeeds.updatedAt)
        .endBefore(startNeeds.updatedAt)
        .on('value', snapshot => {
          snapshot.forEach(need => {
            const q = need.val();
            resultNeeds.push(q);
          });
          setIsLoading(false);
          setFoundationNeeds([...foundationNeeds, ...resultNeeds.reverse()]);
        });
      return () => {
        db.ref('foundations').off();
      };
    }
  };

  return (
    <View style={styles.viewBody}>
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
          handleLoadMore={handleLoadMore}
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
