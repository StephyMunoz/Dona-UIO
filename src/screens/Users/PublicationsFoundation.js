import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {db} from '../../firebase';
import {Avatar} from 'react-native-elements';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-easy-toast';
import Carousel from '../../components/Carousel';
import {Divider} from 'react-native-elements/dist/divider/Divider';

const screenWidth = Dimensions.get('window').width;

const PublicationsFoundation = props => {
  const {navigation, route} = props;
  const {id, name, image, email} = route.params;
  const [publications, setPublications] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  const limitNeed = 20;

  useEffect(() => {
    navigation.setOptions({title: name});
    let totalPublications = 0;
    const getTotal = async () => {
      await db.ref('foundations').on('value', snapshot => {
        snapshot.forEach(need => {
          const q = need.val();
          if (q.createdBy === id) {
            setTotal((totalPublications = totalPublications + 1));
          }
        });
      });
    };
    getTotal();
    return () => {
      db.ref('foundations').off();
    };
  }, [name, id, navigation]);

  useFocusEffect(
    useCallback(() => {
      const resultNeeds = [];

      db.ref('foundations')
        .orderByChild('updatedAt')
        .limitToLast(limitNeed)
        .on('value', snapshot => {
          snapshot.forEach(need => {
            const q = need.val();
            if (q.createdBy === id) {
              resultNeeds.push(q);
            }
          });
          setPublications(resultNeeds.reverse());
        });

      return () => {
        db.ref('foundations').off();
      };
    }, [id]),
  );

  const handleLoadMore = async () => {
    const resultNeeds = [];

    if (publications.length <= total) {
      setIsLoading(true);
      await db
        .ref('foundations')
        .orderByChild('updatedAt')
        .limitToLast(limitNeed)
        .endBefore(publications[publications.length - 1].updatedAt)
        .on('value', snapshot => {
          if (snapshot.numChildren() > 0) {
            snapshot.forEach(need => {
              const q = need.val();
              if (q.createdBy === id) {
                setIsLoading(true);
                resultNeeds.push(q);
              }
            });
          } else {
            setIsLoading(false);
          }
        });
      setPublications([...publications, ...resultNeeds.reverse()]);
      setIsLoading(false);
    }
    return () => {
      db.ref('foundations').off();
    };
  };

  const handleNavigation = () => {
    navigation.navigate('foundation_favorite', {
      name,
      image,
      id,
      email,
    });
  };

  return (
    <View style={styles.viewBody}>
      <TouchableOpacity style={styles.head} onPress={handleNavigation}>
        <Avatar
          source={{uri: image}}
          rounded
          containerStyle={styles.avatar}
          size="large"
        />
        <Text style={styles.name}>{name}</Text>
      </TouchableOpacity>
      {publications && (
        <FlatList
          data={publications}
          renderItem={foundation => (
            <Publication
              foundation={foundation}
              isLoading={isLoading}
              toastRef={toastRef}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
        />
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );
};

export default PublicationsFoundation;

function Publication({foundation}) {
  const {
    images,
    food,
    other,
    personal_care,
    medicine,
    title,
    createdBy,
    updatedAt,
  } = foundation.item;
  const [foundationSelected, setFoundationSelected] = useState(null);

  useState(() => {
    db.ref(`users/${createdBy}`).on('value', snapshot => {
      setFoundationSelected(snapshot.val());
    });
  });

  return (
    <ScrollView>
      <Carousel arrayImages={images} height={250} width={screenWidth} />
      <Text style={styles.date}>
        Publicado:{'  '}
        {new Date(updatedAt).getDate()}/{new Date(updatedAt).getMonth() + 1}/
        {new Date(updatedAt).getFullYear()}{' '}
        {new Date(updatedAt).toLocaleTimeString()}
      </Text>

      <Text style={styles.title}>{title}</Text>

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
      <Divider style={styles.divider} width={1} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  head: {
    flexDirection: 'row',
  },
  loaderFoundations: {
    marginTop: 10,
    marginBottom: 10,
  },
  Foundation: {
    margin: 10,
  },
  image: {
    width: screenWidth - 20,
    height: 180,
  },
  info: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    marginTop: -30,
    backgroundColor: '#fff',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 30,
    color: 'grey',
  },
  favorite: {
    marginTop: -35,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 100,
  },
  title: {
    fontSize: 20,
    color: '#000',
    marginBottom: 10,
    fontWeight: 'bold',
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
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'justify',
    color: '#000',
  },
  requirementsText: {
    fontSize: 18,
    textAlign: 'justify',
    color: 'grey',
  },
  date: {
    color: 'grey',
  },
  viewFavorite: {
    position: 'absolute',
    top: 5,
    right: 10,
    zIndex: 2,
    backgroundColor: '#fff',
    padding: 5,
    paddingLeft: 15,
  },
  notFoundHumanitarianNeeds: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 20,
    marginLeft: 10,
    marginBottom: 10,
  },
  foundation: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
  },
  divider: {
    height: 5,
    marginTop: 20,
    color: '#000',
  },
});
