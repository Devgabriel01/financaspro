import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import Resumo from './src/screens/Resumo';
import Receitas from './src/screens/Receitas';
import Gastos from './src/screens/Gastos';
import Investimentos from './src/screens/Investimentos';
import Cartoes from './src/screens/Cartoes';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}