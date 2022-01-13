import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import Toast from 'react-native-easy-toast';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {auth, db} from '../firebase';
import ListFoundationRequirements from '../components/ListFoundationRequirements';
import {useAuth} from '../lib/auth';
import avatarDefault from '../images/avatar-default.jpg';

const Home = () => {
  const [foundationNeeds, setFoundationNeeds] = useState([]);
  const [totalNeeds, setTotalNeeds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  const {user} = useAuth();
  const limitNeed = 5;

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
            snapshot.forEach(need1 => {
              const q = need1.val();
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
  console.log(totalNeeds);

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
      {foundationNeeds.length === 0 ? (
        <View>
          <Text style={styles.textEmpty}>Aún no existen registros</Text>
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
  textEmpty: {
    textAlign: 'center',
    marginTop: 30,
  },
});
