import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface CustomTextProps extends TextProps {
  text?: string;
  children?: React.ReactNode;
  fontFamily?:
    | 'Gilroy-Bold'
    | 'Gilroy-ExtraBold'
    | 'Gilroy-Medium'
    | 'Gilroy-Regular'
    | 'Gilroy-SemiBold'
    | 'Inter_24pt-Regular'
    | 'Mondia-Thin'
    | 'Poppins-Medium'
    | 'Poppins-Regular'
    | 'Poppins-SemiBold';
  size?: number;
  color?: string;
}

const CustomText: React.FC<CustomTextProps> = ({
  text,
  children,
  style,
  fontFamily = 'Gilroy-Medium',
  size,
  color,
  ...rest
}) => {

  const content = children ?? text ?? '';

  return (
    <Text
      style={[
        styles.defaultText,
        {
          fontSize: size || 14,
          fontFamily: fontFamily,
          color: color,
        },
        style,
      ]}
      {...rest}
    >
      {content}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    color: '#333',
  },
});

export default CustomText;