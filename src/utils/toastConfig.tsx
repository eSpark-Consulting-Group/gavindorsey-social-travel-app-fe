import { View, StyleSheet, Text } from 'react-native';
import React from 'react';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const toastConfig = {
  custom: ({ text1 }) => (
    <View style={[style.toast]}>
      <Text style={{ color:'white', width: '90%', fontWeight: '500' }}>
        {text1}
      </Text>
    </View>
  ),
};

export default function ToastConfig() {
  const inset = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        width: '100%',
        top: inset.top,
      }}>
      <Toast
        topOffset={inset.top}
        autoHide
        config={toastConfig}
      />
    </View>
  );
}

const style = StyleSheet.create({
  toast: {
    minHeight: 50,
    width: '100%',
    backgroundColor: '#7D7D7D', // Greyish background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 }, 
  },
});