import React, {useEffect, useState} from 'react';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import {Avatar, Icon, ListItem, SearchBar} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import {db, storage} from '../firebase';
import notFound from '../images/no-result-found.png';
import avatarNotFound from '../images/avatar-default.jpg';

const Search = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [searchLowercase, setSearchLowercase] = useState('');
  const [foundations, setFoundations] = useState([]);

  useEffect(() => {
    const getFoundationsSearch = async () => {
      let listFoundations = [];
      if (search !== '') {
        setSearchLowercase(search.toLowerCase());
        console.log(searchLowercase);
        await db
          .ref('users')
          .orderByChild('displayName')
          .startAt(search)
          .endAt(`${search}\uf8ff`)
          .on('value', snapshot => {
            snapshot.forEach(item => {
              const q = item.val();
              if (
                item.val().role === 'humanitarian_help' ||
                item.val().role === 'animal_help'
              ) {
                listFoundations.push(q);
                console.log(q);
              }
            });
            setFoundations(listFoundations);
          });
      } else {
        setFoundations([]);
      }
    };
    getFoundationsSearch();

    return () => {
      db.ref('users').off();
    };
  }, [search]);

  return (
    <View>
      <SearchBar
        placeholder="Busca la fundación de tu preferencia"
        onChangeText={e => setSearch(e)}
        value={search}
        containerStyle={styles.searchBar}
      />
      {foundations.length !== 0 ? (
        <FlatList
          data={foundations}
          renderItem={foundation => (
            <Foundation foundation={foundation} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={{flex: 1, alignItems: 'center', marginTop: 150}}>
          <Image
            source={notFound}
            resizeMode="cover"
            style={{width: 200, height: 200}}
          />
        </View>
      )}
    </View>
  );
};

export default Search;

function Foundation(props) {
  const {foundation, navigation} = props;
  const {uid, displayName, email} = foundation.item;
  const [avatar, setAvatar] = useState(null);

  console.log('foundaation', foundation);
  useEffect(() => {
    storage
      .ref()
      .child(`avatar/${uid}`)
      .getDownloadURL()
      .then(async response => {
        setAvatar(response);
      });
  });

  const handleNavigation = () => {
    navigation.navigate('select_foundation', {
      name: displayName,
      image: avatar,
      id: uid,
      email: email,
    });
  };

  return (
    <View>
      <ListItem
        onPress={handleNavigation}
        bottomDivider
        contarinerStyle={styles.view}
        rightIcon={
          <Icon
            type="material-community"
            name="chevron-right"
            size={100}
            color={'#000'}
          />
        }>
        <ListItem.Content>
          <View style={styles.view}>
            {avatar ? (
              <Avatar
                source={{uri: avatar}}
                rounded
                containerStyle={styles.avatar}
                size={80}
              />
            ) : (
              <Avatar
                source={avatarNotFound}
                rounded
                containerStyle={styles.avatar}
                size={80}
              />
            )}
            <ListItem.Title>
              <View>
                <Text style={styles.foundation}>{displayName}</Text>
                <Text style={styles.descriptionCampaign}>{email}</Text>
              </View>
            </ListItem.Title>
          </View>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20,
  },
  view: {
    flexDirection: 'row',
  },
  descriptionCampaign: {
    fontSize: 16,
    marginTop: 15,
    color: 'grey',
  },
  foundation: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 23,
  },
  avatar: {
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
});
