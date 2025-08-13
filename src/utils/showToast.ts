import Toast from "react-native-toast-message";

export const showToast = (message: string, type?: 'success' | 'error') => {
    Toast.show({
      type: type,
      position: 'top',
      text1: message,
      topOffset: 0,
    });
  };