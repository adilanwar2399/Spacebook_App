import React, {Component} from 'react';
import {Text, Button, TouchableOpacity} from 'react-native';
import { View, StyleSheet, FlatList } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';


class FriendScreen extends Component {
  constructor(props){
    super(props);

    this.state = {
      isLoading: true,
      friendsListData: [],
      friendRequestsData: [],
      userID: this.props.route.params.userID,
      listData: []

    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getData;
    });
  
    this.getFriends();
    this.getFriendsRequests();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    if (value == null) {
        this.props.navigation.navigate('Login');
    }
  };

  getData = async () => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.userID+"/friends",{
        'method': 'get',
        'headers': {
          'X-Authorization': token,
          'Content-Type': 'application/json'

        },
    })
    .then((response) => {
        if(response.status ===200){
            return response.json()
        }else if(response.status === 401){
            this.props.navigation.navigate("login");
        }else if(response.status === 403){
            console.log("You can only view the friends of yourself or your friends");
        }else if(response.status === 404){
            console.log("No one is there")
        }else if(response.status === 500){
            console.log("Server Error")
        }else{
            throw 'Something went wrong';
        }
    })
    .then((responseJson) => {
        this.setState({
            listData: responseJson
        })
    })
    .catch((error) => {
        console.log("Something is going wrog")
        console.log(error);
    })
}

  getFriends = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    const idValue = await AsyncStorage.getItem('@user_id');
    return fetch("http://localhost:3333/api/1.0.0/user/" + idValue + "/friends", {
      'method': 'get', 'headers': {
            'X-Authorization':  value,
            'Content-Type': 'application/json'
          }
        })
        .then((response) => {
            if(response.status === 200){
                return response.json()
            }else if(response.status === 401){
              this.props.navigation.navigate("Login");
            }else if(response.status === 403){
                console.log("Only Your friends can be shown");
            }else if(response.status === 404){
                console.log("No Friends to show ")
            }else if(response.status === 500){
                console.log("There is a Server Error")
            }else{
                throw 'Something Unexpected has happened';
            }  
        })
        .then((responseJson) => {
          this.setState({
            isLoading: false,
            friendsListData: responseJson
          })
        })
        .catch((error) => {
            console.log("Surprisingly something unexpected happened")
            console.log(error);
        })
  }

  getFriendsRequests = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    const idValue = await AsyncStorage.getItem('@session_id');
    return fetch("http://localhost:3333/api/1.0.0/friendrequests", {
          'headers': {
            'X-Authorization':  value
          }
        })
        .then((response) => {
            if(response.status === 200){
                return response.json()
            }else if(response.status === 401){
              this.props.navigation.navigate("Login");
            }else if(response.status === 403){
              console.log("You can only view the friends of yourself or your friends");
            }else if(response.status === 500){
              console.log("There is a Server Error")  
            }else{
                throw 'Something went wrong';
            }
        })
        .then((responseJson) => {
          this.setState({
            isLoading: false,
            listData: responseJson
          })
        })
        .catch((error) => {
            console.log("Something has gone wrong")
            console.log(error);
        })
  }

  render() {
      return (
        <View style={{backgroundColor: 'lightblue'}}>
            <Text style={styles.title}>Friends</Text>
            <ScrollView>
              <FlatList
                  data={this.state.friendsListData}
                  renderItem={({item}) => (
                      <View style={styles.friendObjects}>
                      <TouchableOpacity
                          onPress={() => this.props.navigation.navigate('User',{id: item.user_id})}
                      >
                      <Text style={styles.textStyleFriend}>{item.user_givenname} {item.user_familyname}</Text>
                      </TouchableOpacity>
                      </View>
                  )}
              />
            </ScrollView>
            <ScrollView>
                <Button
                    title='Friend Requests'
                    onPress={() => this.props.navigation.navigate('Friend Requests')}
                />
              <FlatList
                  data={this.state.listData}
                  renderItem={({item}) => (
                      <View style={styles.friendObjects}>
                      <TouchableOpacity
                          onPress={() => this.props.navigation.navigate('User',{id: item.user_id})}
                      >
                      <Text style={styles.textStyleFriend}>{item.user_givenname} {item.user_familyname}</Text>
                      </TouchableOpacity>
                      </View>
                  )}
              />
            </ScrollView>
        </View>
        
      );
    }  
  }

const styles = StyleSheet.create({
  title: {
      color:'slateblue',
      textAlign: 'center',
      fontSize:27,
      backgroundColor:'lightblue',
      padding:12,
      flex: 1,
    },
  textStyleFriend:{
      fontSize: 18,
      textAlign: 'center',
      
  },
  friendObjects: {
      borderRadius: 2,
      borderWidth: 2,
      padding:15,
      borderColor: 'slateblue'
    }
})


export default FriendScreen;
