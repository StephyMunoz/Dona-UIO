import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, FlatList, Image} from 'react-native';
import {SearchBar, ListItem, Icon} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import {db} from '../firebase';
import notFound from '../images/no-result-found.png';
import imageNotFound from '../images/no-image.png';

const Search = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState(null);
  const [foundations, setFoundations] = useState([]);

  useEffect(() => {
    db.ref('users')
      .orderByChild('displayName')
      .startAt(search)
      .endAt(`${search}\uf8ff`)
      .once('value')
      .then(c => console.log('fff', c.val()));
  }, [search]);

  if (foundations) {
    console.log('whats foun', foundations);
  }

  return (
    <View>
      <SearchBar
        placeholder="Busca la fundación de tu preferencia"
        onChangeText={e => setSearch(e)}
        value={search}
        containerStyle={styles.searchBar}
      />
      {!foundations ? (
        <View style={{flex: 1, alignItems: 'center'}}>
          <Image
            source={notFound}
            resizeMode="cover"
            style={{width: 200, height: 200}}
          />
        </View>
      ) : (
        <FlatList
          data={foundations}
          renderItem={foundation => (
            <Foundation foundation={foundation} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

export default Search;

function Foundation(props) {
  const {foundation, navigation} = props;
  const {id, name, images} = foundation.item;
  console.log('heey', foundation);

  return (
    <ListItem
      title={name}
      // leftAvatar={{
      //   source: images[0] ? {uri: images[0]} : imageNotFound,
      // }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() =>
        navigation.navigate('restaurants', {
          screen: 'restaurant',
          params: {id, name},
        })
      }
    />
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20,
  },
});
