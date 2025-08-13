import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { Provider } from 'react-redux';
import RootNavigation from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/redux/store';
import ToastConfig  from './src/utils/toastConfig';

function App() {

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Provider store={store}>
          <StatusBar barStyle={'dark-content'} />
          <ToastConfig />
          <RootNavigation />
        </Provider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
