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
import {db, storage} from '../firebase';
import * as yup from 'yup';
import {filter, map, size} from 'lodash';
import {launchImageLibrary} from 'react-native-image-picker';
import uuid from 'random-uuid-v4';
import {Formik} from 'formik';
import {Avatar, Button, Icon, Input} from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import Loading from './Loading';

const EditCampaign = props => {
  const {id, images, campaignDescription, other, title, createdBy, createdAt} =
    props.route.params;
  const toastRef = useRef();
  const {user} = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagesSelected, setImagesSelected] = useState([...images]);
  const [loadingText, setLoadingText] = useState(false);
  const [getKey, setGetKey] = useState(null);

  useEffect(() => {
    db.ref('campaigns').on('value', snapshot => {
      snapshot.forEach(needItem => {
        if (needItem.val().id === id) {
          setGetKey(needItem.key);
        }
      });
    });
  }, [id]);

  const schema = yup.object().shape({
    title: yup.string().required('Ingrese un título'),
    campaignDescription: yup
      .string()
      .required('Ingrese una breve descripción de la campaña'),
    other: yup.string(),
  });

  const options = {
    titleImage: 'Selecciona imagen',
    storageOptions: {
      skipBackup: true,
      path: 'images,',
    },
  };

  if (!getKey) {
    return <Loading isVisible={true} text="Cargando formulario" />;
  }

  const onFinish = async data => {
    if (size(imagesSelected) === 0) {
      setLoading(false);
      toastRef.current.show('Seleccione al menos imagen para continuar');
    } else {
      setLoading(true);
      setError(null);
      try {
        setLoading(true);
        setLoadingText('Actualizando información');
        await uploadImageStorage().then(response => {
          db.ref(`campaigns/${getKey}`)
            .set({
              updatedAt: new Date().getTime(),
              createdAt: createdAt,
              title: data.title,
              campaignDescription: data.campaignDescription,
              other: data.other,
              images: response,
              createdBy: createdBy,
              id: id,
            })
            .then(() => {
              setLoading(false);
              if (user && user.role === 'administrator') {
                navigation.navigate('campaigns_page');
              } else {
                navigation.navigate('animalCampaign');
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
    }
  };

  const handleLaunchCamera = async () => {
    await launchImageLibrary(options, response => {
      if (response.didCancel) {
        toastRef.current.show('Selección de imagen ha sido cancelada');
      } else if (response.errorCode) {
        toastRef.current.show('Ocurrio un error, intente más tarde');
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
        const ref = storage.ref(`campaigns`).child(uuid());
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
      '¿Estas seguro de que deseas eliminar la imagen seleccionada?',
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
            campaignDescription: campaignDescription ? campaignDescription : '',
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
                  placeholder="Descripción de la campaña"
                  placeholderTextColor="grey"
                  style={styles.textPlaceholder}
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
                title="Actualizar campaña"
                disabled={!isValid}
                containerStyle={styles.btnContainerLogin}
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

export default EditCampaign;

const styles = StyleSheet.create({
  view: {
    paddingTop: 10,
    paddingBottom: 30,
    margin: 10,
  },
  textPlaceholder: {
    color: '#000',
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
