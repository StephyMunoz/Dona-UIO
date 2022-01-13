import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Button, Input} from 'react-native-elements';
import {Formik} from 'formik';
import * as yup from 'yup';
import {db} from '../../firebase';
import {useAuth} from '../../lib/auth';
import Modal from '../Modal';
import * as Permissions from 'react-native-permissions';
import * as Location from 'react-native-location';
import MapView from 'react-native-maps';

export default function AddLocation({isVisible, setIsVisible, toastRef}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [change, setChange] = useState(false);
  const [isVisibleMap, setIsVisibleMap] = useState(false);
  const [address, setAddress] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationFoundation, setLocationFoundation] = useState(null);
  const {user} = useAuth();
  // const { toastRef, setIsLoading, navigation } = ;

  const schema = yup.object().shape({
    address: yup.string().required('Agregue la dirección de la fundación'),
  });

  const onFinish = async data => {
    if (locationFoundation || location) {
      setLoading(true);
      setError(null);
      try {
        setChange(true);
        await db.ref(`users/${user.uid}/address`).set(data.address);
        if (!locationFoundation) {
          await db.ref(`users/${user.uid}/location`).set(location);
        } else {
          await db.ref(`users/${user.uid}/location`).set(locationFoundation);
        }
        setLoading(false);
        setIsVisible(false);
        Alert.alert(
          'Ubicación actualizada',
          'Ubicación actualizada exitosamente',
        );
      } catch (e) {
        setLoading(false);
      }
    } else {
      toastRef.current.show(
        'Debe guardar la dirección y ubicación de la fundación',
      );
    }
  };

  useEffect(() => {
    (async () => {
      await db.ref(`users/${user.uid}/location`).on('value', snapshot => {
        if (snapshot.val() !== null) {
          setLocation(snapshot.val());
        }
      });
      await db.ref(`users/${user.uid}/address`).on('value', snapshot => {
        setAddress(snapshot.val());
      });
    })();
    setChange(false);
  }, [change, user.uid]);

  return (
    <View style={styles.view}>
      <Modal isVisible={isVisible} setIsVisible={setIsVisible}>
        <View style={styles.view}>
          <Formik
            validationSchema={schema}
            initialValues={{address: address ? address : ''}}
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
                  name="address"
                  placeholder="Ingresa la dirección de la fundación"
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                  value={values.address}
                  errorMessage={error}
                  rightIcon={{
                    type: 'material-community',
                    name: 'google-maps',
                    color:
                      location || locationFoundation ? '#00a680' : '#c2c2c2',
                    size: 35,
                    onPress: () => setIsVisibleMap(true),
                  }}
                />
                {errors.location && (
                  <Text style={{fontSize: 10, color: 'red'}}>
                    {errors.location}
                  </Text>
                )}

                <Button
                  onPress={handleSubmit}
                  title="Actualizar ubicación"
                  disabled={!isValid}
                  containerStyle={styles.btnContainerLogin}
                  loading={loading}
                />
                <Map
                  isVisibleMap={isVisibleMap}
                  setIsVisibleMap={setIsVisibleMap}
                  setLocationFoundation={setLocationFoundation}
                  toastRef={toastRef}
                />
              </>
            )}
          </Formik>
        </View>
      </Modal>
    </View>
  );
}

function Map(props) {
  const {isVisibleMap, setIsVisibleMap, setLocationFoundation, toastRef} =
    props;
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const resultPermissions = await Permissions.request(
        Permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        Permissions.PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      );
      if (resultPermissions === 'denied') {
        toastRef.current.show(
          'Tienes que aceptar los permisos de localizacion para agregar ubicación de la fundación',
          3000,
        );
      } else if (resultPermissions === 'granted') {
        const loc = await Location.getLatestLocation();

        setLocation({
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      }
    })();
  }, [toastRef]);

  const confirmLocation = () => {
    setLocationFoundation(location);
    toastRef.current.show('Localizacion guardada correctamente');
    setIsVisibleMap(false);
  };

  return (
    <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
      <View>
        {location && (
          <MapView
            style={styles.mapStyle}
            // initialRegion={location}
            initialRegion={{
              latitude: -0.2232645,
              longitude: -78.5182572,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            }}
            showsUserLocation={true}
            onRegionChange={region => setLocation(region)}>
            <MapView.Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              draggable
            />
          </MapView>
        )}
        <View style={styles.viewMapBtn}>
          <Button
            title="Guardar Ubicación"
            containerStyle={styles.viewMapBtnContainerSave}
            buttonStyle={styles.viewMapBtnSave}
            onPress={confirmLocation}
          />
          <Button
            title="Cancelar Ubicación"
            containerStyle={styles.viewMapBtnContainerCancel}
            buttonStyle={styles.viewMapBtnCancel}
            onPress={() => setIsVisibleMap(false)}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  view: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: '95%',
  },
  btn: {
    backgroundColor: '#00a680',
  },
  scrollView: {
    height: '100%',
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    width: '100%',
    padding: 0,
    margin: 0,
  },
  btnAddFoundation: {
    backgroundColor: '#00a680',
    margin: 20,
  },
  viewImages: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
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
  mapStyle: {
    width: '100%',
    height: 550,
  },
  viewMapBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  viewMapBtnContainerCancel: {
    paddingLeft: 5,
  },
  viewMapBtnCancel: {
    backgroundColor: '#a60d0d',
  },
  viewMapBtnContainerSave: {
    paddingRight: 5,
  },
  viewMapBtnSave: {
    backgroundColor: '#00a680',
  },
});
