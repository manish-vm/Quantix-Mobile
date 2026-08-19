import 'react-native-gesture-handler';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, TouchableOpacity, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { DashboardScreen, EmployeeManagementScreen, ProductMasterScreen, ReportsScreen } from './src/screens/AdminScreens';
import { colors, styles } from './src/styles';

enableScreens(false);

const Tab = createBottomTabNavigator();

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.centerScreen}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={[styles.error, { marginTop: 12 }]}>
            {this.state.error?.message || String(this.state.error)}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ error: null })}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

function TabLabel({ label, focused }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  );
}

function TabIcon({ name, focused, color, size }) {
  return (
    <MaterialIcons
      name={focused ? name.active : name.inactive}
      size={size}
      color={color}
    />
  );
}

const tabIcons = {
  Dashboard: { active: 'dashboard', inactive: 'dashboard' },
  Products: { active: 'inventory-2', inactive: 'inventory-2' },
  Employees: { active: 'groups', inactive: 'groups' },
  Reports: { active: 'bar-chart', inactive: 'bar-chart' },
  Scanner: { active: 'qr-code-scanner', inactive: 'qr-code-scanner' },
  History: { active: 'history', inactive: 'history' },
  Profile: { active: 'account-circle', inactive: 'account-circle' }
};

function HomeTabs() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const displayRole = user?.employeeType === 'vendor' || user?.role === 'vendor' ? 'Vendor' : 'Employee';

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontWeight: 'bold' },
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar
      }}
    >
      {isAdmin ? (
        <>
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Dashboard',
              tabBarIcon: (props) => <TabIcon name={tabIcons.Dashboard} {...props} />,
              tabBarLabel: ({ focused }) => <TabLabel label="Dashboard" focused={focused} />
            }}
          />
          <Tab.Screen
            name="Products"
            component={ProductMasterScreen}
            options={{
              title: 'Products',
              tabBarIcon: (props) => <TabIcon name={tabIcons.Products} {...props} />,
              tabBarLabel: ({ focused }) => <TabLabel label="Products" focused={focused} />
            }}
          />
          <Tab.Screen
            name="Employees"
            component={EmployeeManagementScreen}
            options={{
              title: 'Employees',
              tabBarIcon: (props) => <TabIcon name={tabIcons.Employees} {...props} />,
              tabBarLabel: ({ focused }) => <TabLabel label="Employees" focused={focused} />
            }}
          />
          <Tab.Screen
            name="Reports"
            component={ReportsScreen}
            options={{
              title: 'Reports',
              tabBarIcon: (props) => <TabIcon name={tabIcons.Reports} {...props} />,
              tabBarLabel: ({ focused }) => <TabLabel label="Reports" focused={focused} />
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{
              title: `${displayRole} Scanner`,
              tabBarIcon: (props) => <TabIcon name={tabIcons.Scanner} {...props} />,
              tabBarLabel: ({ focused }) => <TabLabel label="Scan" focused={focused} />
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: 'Scan History',
              tabBarIcon: (props) => <TabIcon name={tabIcons.History} {...props} />,
              tabBarLabel: ({ focused }) => <TabLabel label="History" focused={focused} />
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Profile',
              tabBarIcon: (props) => <TabIcon name={tabIcons.Profile} {...props} />,
              tabBarLabel: ({ focused }) => <TabLabel label="Profile" focused={focused} />
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.loadingText}>Loading Quantix...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <HomeTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </AppErrorBoundary>
  );
}
