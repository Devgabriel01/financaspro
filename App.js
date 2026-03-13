import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { ThemeProvider } from './src/theme';
import Resumo from './src/screens/Resumo';
import Receitas from './src/screens/Receitas';
import Gastos from './src/screens/Gastos';
import Investimentos from './src/screens/Investimentos';
import Cartoes from './src/screens/Cartoes';
import Login from './src/screens/Login';
import Cadastro from './src/screens/Cadastro';
import Perfil from './src/screens/Perfil';
import Configuracoes from './src/screens/Configuracoes';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarStyle: { backgroundColor: '#111827', borderTopColor: '#1e2d42' },
      tabBarActiveTintColor: '#00d4ff',
      tabBarInactiveTintColor: '#64748b',
      headerShown: false,
    }}>
      <Tab.Screen name="Resumo" component={Resumo} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text> }} />
      <Tab.Screen name="Receitas" component={Receitas} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💵</Text> }} />
      <Tab.Screen name="Gastos" component={Gastos} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🧾</Text> }} />
      <Tab.Screen name="Investimentos" component={Investimentos} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📈</Text> }} />
      <Tab.Screen name="Cartoes" component={Cartoes} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💳</Text> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Perfil" component={Perfil} />
          <Stack.Screen name="Configuracoes" component={Configuracoes} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}