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
import uuid from 'random-uuid-v4';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-easy-toast';
import Loading from '../Loading';

const AnimalCampaignForm = () => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [imagesSelected, setImagesSelected] = useState([]);
  const {user} = useAuth();
  const toastRef = useRef();
  const navigation = useNavigation();

  const schema = yup.object().shape({
    title: yup.string().required('Ingrese un título'),
    campaignDescription: yup
      .string()
      .required('Ingrese una breve descripción de la campaña'),
    other: yup.string(),
    // images: yup.mixed().required('Ingrese al menos una fotografía'),
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
      console.log('Error');
      toastRef.current.show(
        'Debe seleccionar al menos una imagen para continuar',
      );
      setLoading(false);
    } else {
      setLoading(true);
      try {
        setLoading(true);
        setLoadingText('Ingresando la información');
        await uploadImageStorage().then(response => {
          db.ref('campaigns')
            .push()
            .set({
              createdAt: new Date().getTime(),
              updatedAt: new Date().getTime(),
              title: data.title,
              campaignDescription: data.campaignDescription,
              other: data.other,
              images: response,
              createdBy: user.uid,
              id: uuid(),
            })
            .then(snapshot => {
              setLoading(false);
              navigation.navigate('animalCampaign');
            })
            .catch(e => {
              setLoading(false);
              console.log('e', e);
              toastRef.current.show(
                'Error al subir la campaña, intentelo más tarde',
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
        toastRef.current.show('Ha cancelado el selector de imágenes');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
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
        const ref = storage.ref('campaigns').child(uuid());
        await ref.put(blob).then(async result => {
          await storage
            .ref(`campaigns/${result.metadata.name}`)
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
      '¿Estas seguro de que quieres eliminar la imagen?',
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
            campaignDescription: '',
            other: '',
            images: null,
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
              <Text style={styles.textStyle}>Registro de campaña: </Text>
              <Input
                name="title"
                placeholder="Ingrese el título de la campaña"
                containerStyle={styles.inputForm}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                value={values.title}
                rightIcon={
                  <Icon
                    type="material-community"
                    name="account-outline"
                    iconStyle={styles.iconRight}
                  />
                }
              />
              {errors.title && (
                <Text style={{fontSize: 10, color: 'red'}}>{errors.title}</Text>
              )}
              <Text style={styles.subtitle}>Descripción de la campaña: </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="campaignDescription"
                  placeholderTextColor="grey"
                  style={styles.textPlaceholder}
                  placeholder="Descripción de la campaña"
                  onChangeText={handleChange('campaignDescription')}
                  onBlur={handleBlur('campaignDescription')}
                  value={values.campaignDescription}
                  editable
                  multiline
                  numberOfLines={3}
                />
                {errors.campaignDescription && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.campaignDescription}
                  </Text>
                )}
              </View>
              <Text style={styles.subtitle}>
                Más información relacionada a la campaña:{' '}
              </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="other"
                  placeholder="Incluya más información (opcional)"
                  placeholderTextColor="grey"
                  style={styles.textPlaceholder}
                  onChangeText={handleChange('other')}
                  onBlur={handleBlur('other')}
                  value={values.other}
                  editable
                  multiline
                  numberOfLines={4}
                />
                {errors.other && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.other}
                  </Text>
                )}
              </View>
              <Text style={styles.subtitle}>Seleccione una imagen</Text>
              <View style={styles.viewImages}>
                {size(imagesSelected) < 5 && (
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
                {map(imagesSelected, (imageCampaign, index) => (
                  <Avatar
                    key={index}
                    style={styles.miniatureStyle}
                    source={{uri: imageCampaign}}
                    onPress={() => removeImage(imageCampaign)}
                  />
                ))}
              </View>
              <Button
                onPress={handleSubmit}
                title="Guardar campaña"
                disabled={!isValid}
                containerStyle={styles.btnContainerLogin}
              />
            </>
          )}
        </Formik>
        <Toast ref={toastRef} position="center" opacity={0.9} />
        <Loading isVisible={loading} text={loadingText} />
      </View>
    </ScrollView>
  );
};

export default AnimalCampaignForm;

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
    textAlign: 'center',
    fontSize: 15,
    color: '#000',
  },
  textInput: {
    borderBottomColor: '#c2c2c2',
    borderBottomWidth: 1,
    borderTopColor: '#c2c2c2',
    marginBottom: 10,
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
