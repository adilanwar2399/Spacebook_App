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
      friendRequestsData: []


    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
    });
  
    this.getFriends();
    this.getFriendsRequests();
  }

  componentWillUnmount() {
    this.unsubscribe();
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
            friendRequestsData: responseJson
          })
        })
        .catch((error) => {
            console.log(error);
        })
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    if (value == null) {
        this.props.navigation.navigate('Login');
    }
  };

  render() {

    // if (this.state.isLoading){
    //   return (
    //     <View
    //       style={{
    //         flex: 1,
    //         flexDirection: 'column',
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //       }}>
    //       <Text>Loading..</Text>
    //     </View>
    //   );
    // }else{
    //   console.log(this.state.friendsListData)
    //   console.log(this.state.friendRequestsData)

      return (
        <View style={{backgroundColor: 'lightblue'}}>
          <ScrollView>
            <Button
                    title='Friend Requests'
                    onPress={() => this.props.navigation.navigate('FriendRequestsScreen')}
                />
            <Text style={styles.title}>Online Friends Count:</Text>
            <FlatList
                  data={this.state.friendsListData}
                  renderItem={({item}) => (
                      <View>
                        <Text> {item.user_id} {item.user_givenname} {item.user_familyname}</Text>
                      </View>
                  )}
                  keyExtractor={(item,index) => item.user_id.toString()}
                />
                <Text style={styles.title}>Number Of Friend Requests:</Text>
            <FlatList
                  data={this.state.friendRequestsData}
                  renderItem={({item}) => (
                      <View>
                        <Text> {item.user_id} {item.first_name} {item.last_name}</Text>
                      </View>
                  )}
                  keyExtractor={(item,index) => item.user_id.toString()}
                />
           <Text style={styles.title}>Friends</Text>
              <FlatList
                  data={this.state.listData}
                  renderItem={({item}) => (
                    <View style={styles.friendObjects}>
                    <TouchableOpacity
                      onPress={() => this.props.navigation.navigate('ProfileScreen',{id: item.user_id})}
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
      backgroundColor:'lightblue',
      padding:10,
      flex: 1,
      textAlign: 'center',
      fontSize:25
    },
  friendObjects: {
      padding:15,
      borderColor: 'slateblue',
      borderRadius: 1,
      borderWidth: 1
    },
  textStyleFriend:{
      textAlign: 'center',
      fontSize: 18,
  }
})


export default FriendScreen;
