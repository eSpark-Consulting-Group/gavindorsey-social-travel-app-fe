import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { CheckIcon } from '../assets';

interface SuccessPopupProps {
  visible: boolean;
  onContinue: () => void;
  title?: string;
  subtitle?: string;
}

const { width } = Dimensions.get('window');

export const LoginSuccessPopup: React.FC<SuccessPopupProps> = ({
  visible,
  onContinue,
  title = 'You have logged in successfully',
  subtitle = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <View style={styles.iconContainer}>
            <CheckIcon width={30} height={30}/>
          </View>
          
          <Text style={styles.title}>{title}</Text>
          
          <Text style={styles.subtitle}>{subtitle}</Text>
          
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 350,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: '#7CB342',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});