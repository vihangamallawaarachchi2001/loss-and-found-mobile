import AppNavigator from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css"

export default function App() {
 return (
	 <SafeAreaProvider>
		 <AppNavigator />
	 </SafeAreaProvider>
 );
}

