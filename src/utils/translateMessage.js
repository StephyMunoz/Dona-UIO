const translateMessage = code => {
  const dictionary = {
    'auth/email-already-in-use': 'El correo electrónico ya está en uso.',
    'auth/weak-password': 'La clave debe contener al menos 8 caracteres',
    'auth/wrong-password': 'Usuario o clave incorrectos',
    'auth/user-not-found': 'Usuario o clave incorrectos',
  };

  return dictionary[code] || code;
};

export default translateMessage;
