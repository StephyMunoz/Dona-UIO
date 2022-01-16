import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../lib/auth';
import {useNavigation} from '@react-navigation/native';
import * as yup from 'yup';
import {filter, map, size} from 'lodash';
import {db, storage} from '../firebase';
import uuid from 'random-uuid-v4';
import {launchImageLibrary} from 'react-native-image-picker';
import {Formik} from 'formik';
import {Avatar, Button, Icon, Input} from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import Loading from './Loading';

const EditAnimalNeed = props => {
  // /const {routes} = props.params;
  const {id, images, food, medicine, other, title, createdAt, createdBy} =
    props.route.params;
  const toastRef = useRef();
  const {user} = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [imagesSelected, setImagesSelected] = useState([...images]);
  const [loadingText, setLoadingText] = useState(false);
  const [getKey, setGetKey] = useState(null);

  useEffect(() => {
    db.ref('foundations').on('value', snapshot => {
      snapshot.forEach(needItem => {
        if (
          needItem.val().createdBy === createdBy &&
          needItem.val().id === id
        ) {
          console.log(needItem.key);
          setGetKey(needItem.key);
        }
      });
    });
    return () => {
      db.ref('foundations').off();
    };
  }, [id, createdBy]);

  const handleGetKeyNeed = async () => {
    if (!getKey) {
      await db.ref('foundations').on('value', snapshot => {
        snapshot.forEach(needItem => {
          if (needItem.val().id === id) {
            setGetKey(needItem.key);
          }
        });
      });
      return () => {
        db.ref('foundations').off();
      };
    }
  };

  console.log('props ani', getKey);

  const schema = yup.object().shape({
    title: yup.string().required('Ingrese un título adecuado'),
    food: yup.string(),
    personal_care: yup.string(),
    other: yup.string(),
    // images: yup.mixed(),
  });

  const options = {
    titleImage: 'Selecciona una imagen',
    storageOptions: {
      skipBackup: true,
      path: 'images,',
    },
  };

  const onFinish = async data => {
    if (size(imagesSelected) === 0) {
      setLoading(false);
      toastRef.current.show('Seleccione al menos imagen para poder continuar');
    } else {
      if (getKey) {
        setLoading(true);
        try {
          setLoading(true);
          setLoadingText('Actualizando información');
          await uploadImageStorage().then(response => {
            db.ref(`foundations/${getKey}`)
              .set({
                updatedAt: new Date().getTime(),
                createdAt: createdAt,
                title: data.title,
                food: data.food,
                medicine: data.medicine,
                other: data.other,
                images: response,
                createdBy: createdBy,
                id: id,
              })
              .then(() => {
                setLoading(false);
                if (user.role === 'administrator') {
                  navigation.navigate('home');
                } else {
                  navigation.navigate('animal_needs');
                }
              })
              .catch(e => {
                setLoading(false);
                console.log('e', e);
                toastRef.current.show(
                  'Error al subir la información, intentelo más tarde',
                );
              });
          });
        } catch (e) {
          setLoading(false);
        }
      } else {
        toastRef.current.show('Por favor intentelo de nuevo');
        await handleGetKeyNeed();
      }
    }
  };

  const handleLaunchCamera = async () => {
    await launchImageLibrary(options, response => {
      if (response.didCancel) {
        toastRef.current.show('Elección de imagen cancelada');
      } else if (response.errorCode) {
        toastRef.current.show('Ocurrio un error, por favor intente más tarde');
      } else {
        setImagesSelected([...imagesSelected, response.assets[0].uri]);
      }
    });
  };

  const uploadImageStorage = async () => {
    const imageWithBlob = [];
    await Promise.all(
      map(imagesSelected, async image => {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = storage.ref(`humanitarian_needs`).child(uuid());
        await ref.put(blob).then(async result => {
          await storage
            .ref(`humanitarian_needs/${result.metadata.name}`)
            .getDownloadURL()
            .then(photoUrl => {
              imageWithBlob.push(photoUrl);
            });
        });
      }),
    );

    return imageWithBlob;
  };

  const removeImage = image => {
    Alert.alert(
      'Eliminar Imagen',
      '¿Estas segur@ de que quieres eliminar la imagen seleccionada?',
      [
        {
          text: 'Cancelar',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            setImagesSelected(
              filter(imagesSelected, imageUrl => imageUrl !== image),
            );
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <ScrollView>
      <View style={styles.view}>
        <Formik
          validationSchema={schema}
          initialValues={{
            title: title,
            food: food ? food : '',
            medicine: medicine ? medicine : '',
            other: other ? other : '',
          }}
          onSubmit={onFinish}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            isValid,
          }) => (
            <>
              <Text style={styles.textStyle}>Registro de necesidades: </Text>
              <Input
                name="title"
                placeholder="Ingresa un título adecuado"
                containerStyle={styles.inputForm}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                value={values.title}
                rightIcon={
                  <Icon
                    type="font-awesome"
                    name="font"
                    iconStyle={styles.iconRight}
                  />
                }
              />
              {errors.title && (
                <Text style={{fontSize: 10, color: 'red'}}>{errors.title}</Text>
              )}
              <Text style={styles.subtitle}>
                Tipo de alimento balanceado que necesita la fundación:{' '}
              </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="food"
                  placeholder="Ingrese información relacionada con el alimento balanceado"
                  placeholderTextColor="grey"
                  style={styles.textPlaceholder}
                  onChangeText={handleChange('food')}
                  onBlur={handleBlur('food')}
                  value={values.food}
                  editable
                  multiline
                  numberOfLines={3}
                  rightIcon={
                    <Icon
                      type="font-awesome"
                      name="font"
                      iconStyle={styles.iconRight}
                    />
                  }
                />
                {errors.food && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.food}
                  </Text>
                )}
              </View>
              <Text style={styles.subtitle}>
                Ingrese el medicamento que necesita la fundación:{' '}
              </Text>
              <Text style={styles.subtitleUnder}>
                Incluya información relacionada con marcas, genéricos, cantidad,
                etc., del medicamento requerido
              </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="medicine"
                  placeholder="Ingrese información relacionada al medicamento (opcional)"
                  placeholderTextColor="grey"
                  style={styles.textPlaceholder}
                  onChangeText={handleChange('medicine')}
                  onBlur={handleBlur('medicine')}
                  value={values.medicine}
                  editable
                  multiline
                  numberOfLines={4}
                />
                {errors.medicine && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.medicine}
                  </Text>
                )}
              </View>
              <Text style={styles.subtitle}>Otras necesidades: </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="other"
                  placeholder="En este apartado puede incluir otras necesidades de la fundación (opcional)"
                  placeholderTextColor="grey"
                  style={styles.textPlaceholder}
                  onChangeText={handleChange('other')}
                  onBlur={handleBlur('other')}
                  value={values.other}
                  editable
                  multiline
                  numberOfLines={3}
                />
                {errors.other && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.other}
                  </Text>
                )}
              </View>
              <Text style={styles.subtitle}>Seleccione una imagen</Text>
              <View style={styles.viewImages}>
                {size(imagesSelected) < 4 && (
                  <TouchableOpacity onPress={handleLaunchCamera}>
                    <Icon
                      type="material-community"
                      name="camera"
                      color="#7a7a7a"
                      containerStyle={styles.containerIcon}
                    />
                  </TouchableOpacity>
                )}
                {size(imagesSelected) === 0 && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    Seleccione al menos una imagen
                  </Text>
                )}
                {map(imagesSelected, (imageRestaurant, index) => (
                  <Avatar
                    key={index}
                    style={styles.miniatureStyle}
                    source={{uri: imageRestaurant}}
                    onPress={() => removeImage(imageRestaurant)}
                  />
                ))}
              </View>
              <Button
                onPress={handleSubmit}
                title="Actualizar requerimiento"
                disabled={!isValid}
                containerStyle={styles.btnContainerLogin}
                // loading={isLoading}
              />
            </>
          )}
        </Formik>
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading isVisible={loading} text={loadingText} />
    </ScrollView>
  );
};

export default EditAnimalNeed;

const styles = StyleSheet.create({
  view: {
    paddingTop: 10,
    paddingBottom: 30,
    margin: 10,
  },

  textStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  textPlaceholder: {
    color: '#000',
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 15,
    color: '#000',
  },
  inputForm: {
    textAlign: 'center',
    borderColor: '#c2c2c2',
  },
  textInput: {
    borderBottomColor: '#c2c2c2',
    borderBottomWidth: 1,
    borderTopColor: '#c2c2c2',
    marginBottom: 10,
  },
  checkBox: {
    backgroundColor: '#f2f2f2',
  },
  checkOther: {
    textAlign: 'center',
  },
  imageButton: {
    textAlign: 'center',
    backgroundColor: '#f9eff7',
    alignItems: 'center',
    padding: 10,
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewImage: {
    justifyContent: 'center',
    alignItems: 'center',
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    marginTop: 20,
  },
  viewImages: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  containerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    height: 70,
    width: 70,
    backgroundColor: '#e3e3e3',
  },
  miniatureStyle: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  viewPhoto: {
    alignItems: 'center',
    height: 200,
    marginBottom: 20,
  },
});
