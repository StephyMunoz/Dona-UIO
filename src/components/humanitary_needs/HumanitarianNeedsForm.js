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
import {Avatar, Button, Icon, Input} from 'react-native-elements';
import {Formik} from 'formik';
import {db, storage} from '../../firebase';
import * as yup from 'yup';
import {launchImageLibrary} from 'react-native-image-picker';
import {filter, map, size} from 'lodash';
import {useAuth} from '../../lib/auth';
import Loading from '../Loading';
import uuid from 'random-uuid-v4';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-easy-toast';

const HumanitarianNeedsForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagesSelected, setImagesSelected] = useState([]);
  const [loadingText, setLoadingText] = useState(false);
  const {user} = useAuth();
  const toastRef = useRef();
  const navigation = useNavigation();

  const schema = yup.object().shape({
    title: yup.string().required('Ingrese un título'),
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
      toastRef.current.show('Seleccione una imagen para poder continuar');
    } else {
      setLoading(true);
      setError(null);
      try {
        setLoading(true);
        setLoadingText('Guardando información');
        await uploadImageStorage().then(response => {
          db.ref('foundations')
            .push()
            .set({
              createdAt: new Date().getTime(),
              updatedAt: new Date().getTime(),
              title: data.title,
              food: data.food,
              personal_care: data.personal_care,
              other: data.other,
              images: response,
              createdBy: user.uid,
              id: uuid(),
            })
            .then(() => {
              setLoading(false);
              navigation.navigate('humanitarian_needs');
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
    }
  };

  const handleLaunchCamera = async () => {
    await launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        toastRef.current.show('Selección de imagen cancelada');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
        toastRef.current.show('Ocurrió un error intente luego');
      } else {
        setImagesSelected([...imagesSelected, response.assets[0].uri]);
      }
    });
  };

  const uploadImageStorage = async () => {
    const imageBlob = [];

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
            title: '',
            food: '',
            personal_care: '',
            other: '',
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
              <Input
                name="title"
                placeholder="Ingresa un título adecuado"
                containerStyle={styles.inputForm}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                value={values.title}
                errorMessage={error}
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
                Alimento que necesita la fundación:{' '}
              </Text>
              <View style={styles.textInput}>
                <TextInput
                  style={styles.textPlaceholder}
                  name="food"
                  placeholder="Ingrese información relacionada con el alimento requerido"
                  placeholderTextColor="#c1c1c1"
                  onChangeText={handleChange('food')}
                  onBlur={handleBlur('food')}
                  value={values.food}
                  errorMessage={error}
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
                Ingrese productos de higiene personal que necesita la fundación:{' '}
              </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="personal_care"
                  style={styles.textPlaceholder}
                  placeholder="Ingrese información relacionada con productos de higiene personal (opcional)"
                  placeholderTextColor="#c1c1c1"
                  onChangeText={handleChange('personal_care')}
                  onBlur={handleBlur('personal_care')}
                  value={values.personal_care}
                  errorMessage={error}
                  editable
                  multiline
                  numberOfLines={4}
                />
                {errors.personal_care && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.personal_care}
                  </Text>
                )}
              </View>
              <Text style={styles.subtitle}>Otras necesidades: </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="other"
                  placeholder="En este apartado puede incluir otras necesidades de la fundación (opcional)"
                  onChangeText={handleChange('other')}
                  placeholderTextColor="#c1c1c1"
                  style={styles.textPlaceholder}
                  onBlur={handleBlur('other')}
                  value={values.other}
                  errorMessage={error}
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
              <Text style={styles.subtitle}>
                Seleccione una imagen (Máximo 4)
              </Text>
              <View style={styles.viewImages}>
                {size(imagesSelected) < 5 && (
                  <TouchableOpacity onPress={handleLaunchCamera}>
                    <Icon
                      type="material-community"
                      name="camera"
                      color="#7a7a7a"
                      containerStyle={styles.containerIcon}
                      size={40}
                    />
                  </TouchableOpacity>
                )}
                {size(imagesSelected) === 0 && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    Seleccione al menos una imagen
                  </Text>
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
                title="Ingresar requerimiento"
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

export default HumanitarianNeedsForm;

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
  subtitle: {
    textAlign: 'left',
    fontSize: 15,
    color: '#000',
  },
  inputForm: {
    textAlign: 'center',
    borderColor: '#c2c2c2',
  },
  textPlaceholder: {
    color: '#000',
  },
  textInput: {
    borderBottomColor: '#c2c2c2',
    borderBottomWidth: 1,
    borderTopColor: '#c2c2c2',
    marginBottom: 10,
    color: '#c2c2c2',
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
