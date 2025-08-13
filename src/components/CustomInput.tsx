import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { PasswordHide, PasswordShow } from '../assets';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hasError?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  bgColor?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  hasError = false,
  style,
  bgColor,
  showPassword,
  onTogglePassword,
  value,
  secureTextEntry,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          props.multiline && styles.inputContainerMultiline,
          hasError && styles.inputError,
          {
            backgroundColor: bgColor,
            borderColor: '#E0E0E0',
          },
          style,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            props.multiline && styles.multilineInput,
            hasError && styles.inputTextError,
            {
              color: '#333',
              fontFamily: 'Gilroy-Medium',
            },
          ]}
          placeholderTextColor={hasError ? '#E74C3C' : '#999'}
          secureTextEntry={secureTextEntry && !showPassword}
          value={value}
          {...props}
        />
           {secureTextEntry && onTogglePassword && (
        <TouchableOpacity
          onPress={onTogglePassword}
          style={styles.eyeIconBelow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {showPassword ? <PasswordHide /> : <PasswordShow />}
        </TouchableOpacity>
      )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50,
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputTextError: {
    color: '#E74C3C',
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  eyeIconBelow: {
    marginLeft: 8,
  justifyContent: 'center',
  alignItems: 'center',
  width: 30,
  height: 30
  }
});

export default CustomInput;
