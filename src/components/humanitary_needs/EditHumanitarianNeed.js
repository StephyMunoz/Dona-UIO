import React, {useRef, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../../lib/auth';
import {useNavigation} from '@react-navigation/native';
import * as yup from 'yup';
import {filter, map, size} from 'lodash';
import {db, storage} from '../../firebase';
import uuid from 'random-uuid-v4';
import {launchImageLibrary} from 'react-native-image-picker';
import {Formik} from 'formik';
import {Avatar, Button, Icon, Input} from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import Loading from '../Loading';

const EditHumanitarianNeed = props => {
  const {id, images, food, personal_care, other, title, createdAt, createdBy} =
    props.route.params;
  const {user} = useAuth();
  const toastRef = useRef();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [imagesSelected, setImagesSelected] = useState([...images]);
  const [loadingText, setLoadingText] = useState(false);

  const schema = yup.object().shape({
    title: yup.string().required('Ingrese un título adecuado'),
    food: yup.string(),
    personal_care: yup.string(),
    other: yup.string(),
  });

  const options = {
    titleImage: 'Selecciona una imagen',
    storageOptions: {
      skipBackup: true,
      path: 'images,',
    },
    quality: 1,
    maxWidth: 2048,
    maxHeight: 2048,
  };

  const onFinish = async data => {
    if (size(imagesSelected) === 0) {
      setLoading(false);
      toastRef.current.show('Seleccione una imagen para poder continuar');
    } else {
      try {
        setLoading(true);
        setLoadingText('Actualizando información');
        await db.ref('foundations').on('value', snapshot => {
          snapshot.forEach(needItem => {
            const q = needItem.val();
            if (q.id === id) {
              uploadImageStorage().then(response => {
                db.ref(`foundations/${needItem.key}`)
                  .set({
                    updatedAt: new Date().getTime(),
                    createdAt: createdAt,
                    title: data.title,
                    food: data.food,
                    personal_care: data.personal_care,
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
                      navigation.navigate('humanitarian_needs');
                    }
                  })
                  .catch(() => {
                    setLoading(false);
                    toastRef.current.show(
                      'Error al subir la información, intentelo más tarde',
                    );
                  });
              });
            }
          });
        });
      } catch (e) {
        setLoading(false);
      }
    }
  };

  const handleLaunchCamera = async () => {
    await launchImageLibrary(options, response => {
      if (response.didCancel) {
        toastRef.current.show('Seleccion de imagen cancelada');
      } else if (response.errorCode) {
        toastRef.current.show(
          'Ha ocurrido un error vuelva a intentalo más tarde: ',
          response.errorCode,
        );
      } else {
        if (response.assets[0].type.split('/')[0] === 'image') {
          if (response.assets[0].fileSize > 2000000) {
            toastRef.current.show('La imagen excede los 2 MB');
          } else {
            if (imagesSelected.includes(response.assets[0].uri)) {
              toastRef.current.show('Imagen ya ingresada, seleccione otra');
            } else {
              setImagesSelected([...imagesSelected, response.assets[0].uri]);
            }
          }
        } else {
          toastRef.current.show('Solo se permiten imagenes');
        }
      }
    });
  };

  const uploadImageStorage = async () => {
    const imageBlob = [];

    await Promise.all(
      map(imagesSelected, async image => {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = storage.ref('humanitarian_needs').child(uuid());
        await ref.put(blob).then(async result => {
          await storage
            .ref(`humanitarian_needs/${result.metadata.name}`)
            .getDownloadURL()
            .then(photoUrl => {
              imageBlob.push(photoUrl);
            });
        });
      }),
    );

    return imageBlob;
  };

  const removeImage = image => {
    Alert.alert(
      'Eliminar Imagen',
      '¿Estas seguro de que quieres eliminar la imagen seleccionada?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
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
            personal_care: personal_care ? personal_care : '',
            other: other ? other : '',
          }}
          onSubmit={onFinish}>
          {({handleChange, handleBlur, handleSubmit, values, errors}) => (
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
                <Text style={styles.errorMessage}>{errors.title}</Text>
              )}
              <Text style={styles.subtitle}>
                Alimento que necesita la fundación:{' '}
              </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="food"
                  placeholder="Ingrese información relacionada con el alimento requerido"
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
                  <Text style={styles.errorMessage}>{errors.food}</Text>
                )}
              </View>
              <Text style={styles.subtitle}>
                Ingrese productos de higiene personal que necesita la fundación:{' '}
              </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="personal_care"
                  placeholder="Ingrese información relacionada con productos de higiene personal (opcional)"
                  placeholderTextColor="grey"
                  style={styles.textPlaceholder}
                  onChangeText={handleChange('personal_care')}
                  onBlur={handleBlur('personal_care')}
                  value={values.personal_care}
                  editable
                  multiline
                  numberOfLines={4}
                />
                {errors.personal_care && (
                  <Text style={styles.errorMessage}>
                    {errors.personal_care}
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
                  <Text style={styles.errorMessage}>{errors.other}</Text>
                )}
              </View>
              <Text style={styles.subtitle}>
                Seleccione una imagen (Máximo 4)
              </Text>
              <View style={styles.viewImages}>
                {size(imagesSelected) < 4 && (
                  <TouchableOpacity onPress={handleLaunchCamera}>
                    <Icon
                      type="material-community"
                      name="camera"
                      color="#7a7a7a"
                      containerStyle={styles.containerIcon}
                      size={35}
                    />
                  </TouchableOpacity>
                )}

                {map(imagesSelected, (imageHumanitarian, index) => (
                  <Avatar
                    key={index}
                    style={styles.miniatureStyle}
                    source={{uri: imageHumanitarian}}
                    onPress={() => removeImage(imageHumanitarian)}
                  />
                ))}
              </View>
              <Button
                onPress={handleSubmit}
                title="Actualizar requerimiento"
                // disabled={!isValid}
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

export default EditHumanitarianNeed;

const styles = StyleSheet.create({
  view: {
    paddingTop: 10,
    paddingBottom: 30,
    margin: 10,
  },
  textPlaceholder: {
    color: '#000',
  },
  errorMessage: {
    fontSize: 10,
    color: 'red',
  },
  textStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
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
