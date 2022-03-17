import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './components/home';
import LoginScreen from './components/login';
import SignupScreen from './components/signup';
import LogoutScreen from './components/logout';
import ProfileScreen from './components/Profile';
import FriendScreen from './components/Friends';
import FriendRequestsScreen from './components/FriendRequests';
import PhotoCaptureScreen from './components/PhotoCapture';
import PostsScreen from './components/Posts';
import UserScreen from './components/User';
import UserUpdateScreen from './components/userInfoUpdate';
import SearchScreen from './components/Search';


export const serverBase = 'http://localhost:3333/api/1.0.0/'
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();



function TabNavigation() {
  return(
  <Tab.Navigator>
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Friend Requests" component={FriendRequestsScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Logout" component={LogoutScreen} />
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="User Update" component={UserUpdateScreen} />
  </Tab.Navigator> 
  );
}
class App extends Component {

  render(){
    return (
      <NavigationContainer>
        
        {/* <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Friend Requests" component={FriendRequestsScreen} />
          <Tab.Screen name="Logout" component={LogoutScreen} />
          <Tab.Screen name="Posts" component={PostsScreen} />
          <Tab.Screen name="User" component={UserScreen} />
          <Tab.Screen name="User Update" component={UserUpdateScreen} />
          <Tab.Screen name="Photo Capture" component={PhotoCaptureScreen} /> 
          <Tab.Screen name="Signup" component={SignupScreen} />
          <Tab.Screen name="Login" component={LoginScreen} />
          <Tab.Screen name="Friends" component={FriendScreen} />  
        </Tab.Navigator>  */}
         <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Posts" component={PostsScreen} />
          <Stack.Screen name="ProfileScreen" component={TabNavigation} options={{headerShown: false, cardStyle: {flex: 1}}} />
          <Stack.Screen name="User" component={UserScreen} />
          <Stack.Screen name="User Update" component={UserUpdateScreen} />
          <Stack.Screen name="Photo Capture" component={PhotoCaptureScreen} /> 
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Friends" component={FriendScreen} />
          </Stack.Navigator>
      </NavigationContainer>
    );
  }
  
}

export default App;


