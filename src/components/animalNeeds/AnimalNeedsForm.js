import React, {useState} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Input,
  Button as ButtonElements,
  Icon,
  Avatar,
} from 'react-native-elements';
import {Formik} from 'formik';
import {auth, storage, db} from '../../firebase';
import * as yup from 'yup';
import * as Permissions from 'react-native-permissions';
// import * as ImagePicker from 'react-native-image-picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {map, size, filter} from 'lodash';
import {useAuth} from '../../lib/auth';
import {Dropdown} from 'react-native-material-dropdown';
import Loading from '../Loading';
import uuid from 'random-uuid-v4';
import {useNavigation} from '@react-navigation/native';

const AnimalNeedsForm = () => {
  const {user} = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagesSelected, setImagesSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const schema = yup.object().shape({
    title: yup.string().required('Ingrese un título'),
    food: yup.string(),
    medicine: yup.string(),
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
      setIsLoading(false);
      // setError('Seleccione al menos una imagen');
      console.log('Seleccione al menos una imagen');
    } else {
      setIsLoading(true);
      setError(null);
      try {
        setIsLoading(true);
        await uploadImageStorage().then(response => {
          // const currentDate = new Date.now();
          db.ref('foundations')
            .push()
            .set({
              createdAt: new Date(),
              title: data.title,
              food: data.food,
              medicine: data.medicine,
              other: data.other,
              images: response,
              createdBy: user.uid,
            })
            .then(() => {
              setIsLoading(false);
              navigation.navigate('animal_needs');
            })
            .catch(e => {
              setIsLoading(false);
              console.log('e', e);
              // toastRef.current.show(
              //   'Error al subir el restaurante, intentelo más tarde',
              // );
            });
        });
      } catch (e) {
        setLoading(false);
      }
    }
  };

  const handleLaunchCamera = async () => {
    await launchImageLibrary(options, response => {
      console.log('Response = ', response.assets);

      if (response.didCancel) {
        console.log('User cancelled image picker');
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
        const ref = storage.ref(`animal_needs`).child(uuid());
        await ref.put(blob).then(async result => {
          await storage
            .ref(`animal_needs/${result.metadata.name}`)
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
            food: '',
            medicine: '',
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
              <Text style={styles.textStyle}>Registro de necesidades: </Text>
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
                Tipo de alimento balanceado que necesita la fundación:{' '}
              </Text>
              <View style={styles.textInput}>
                <TextInput
                  name="food"
                  placeholder="Ingrese información relacionada con el alimento balanceado"
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
                  onChangeText={handleChange('medicine')}
                  onBlur={handleBlur('medicine')}
                  value={values.medicine}
                  errorMessage={error}
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
                  onChangeText={handleChange('other')}
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
                title="Ingresar requerimiento"
                // disabled={!isValid}
                containerStyle={styles.btnContainerLogin}
                loading={isLoading}
              />
            </>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

export default AnimalNeedsForm;

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
  subtitleUnder: {
    textAlign: 'left',
    fontSize: 10,
    // color: 'red',
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
