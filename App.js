import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './components/home';
import LoginScreen from './components/login';
import SignupScreen from './components/signup';
import LogoutScreen from './components/logout';
import FeedScreen from './components/feed';
import ProfileScreen from './components/Profile';
import FriendScreen from './components/Friends';
import ProfilePictureUploadScreen from './components/ProfilePicUpload';

const Tab = createBottomTabNavigator();

class App extends Component {

  render(){
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Signup" component={SignupScreen} />
          <Tab.Screen name="Login" component={LoginScreen} />
          <Tab.Screen name="Logout" component={LogoutScreen} />
          <Tab.Screen name="Feed" component={FeedScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Friends" component={FriendScreen} />
          <Tab.Screen name="Profile Picture Upload" component={ProfilePictureUploadScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
  
}

export default App;


