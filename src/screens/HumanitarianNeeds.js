import React, {useCallback, useRef, useState} from 'react';
import {View, ScrollView, StyleSheet, Text} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import {auth, db} from '../firebase';
import ListHumanitarianNeeds from '../components/humanitary_needs/ListHumanitarianNeeds';
import {useAuth} from '../lib/auth';

const HumanitarianNeeds = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const toastRef = useRef();
  const [humanitarianNeeds, setHumanitarianNeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const resultHumanitarianNeeds = [];

      const getRequirements = async () => {
        await db
          .ref('foundations')
          .orderByChild('createdAt')
          .on('value', snapshot => {
            snapshot.forEach(need => {
              const q = need.val();
              if (q.createdBy === auth.currentUser.uid) {
                resultHumanitarianNeeds.push(q);
              }
            });
            setHumanitarianNeeds(resultHumanitarianNeeds.reverse());
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
      {humanitarianNeeds.length === 0 ? (
        <View>
          {user !== 'user' || user === null ? (
            <Text style={styles.textEmpty}>Aún no existen registros</Text>
          ) : (
            <Text style={styles.textEmpty}>
              Aún no ingresa necesidades para su fundación
            </Text>
          )}
        </View>
      ) : (
        <ListHumanitarianNeeds
          humanitarianNeeds={humanitarianNeeds}
          // handleLoadMore={handleLoadMore}
          isLoading={isLoading}
          toastRef={toastRef}
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
      <Toast ref={toastRef} position="center" opacity={0.9} />
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
