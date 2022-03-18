import React, {Component} from "react";
import {Text, Button, Image, StyleSheet, TextInput, FlatList, View, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBase } from "../App";

class UserScreen extends Component{
    constructor(props){
        super(props);
        console.log(this.props)
        
        this.state = {
            photo: null,
            userInfo: {},
            inputForPosts: "",
            listsOfPosts: [],
            titleForLikes: "Like",
            textForChecks: "",
            arefriends: false, 
            
        }
    }
    

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
          this.checkLoggedIn();
          let {id} = this.props.route.params
          this.get_profile_photo(id);
          this.get_posts(id);
          this.getData(id);
        });
        
    }
    getData = async (id) => {
    const value = await AsyncStorage.getItem('@session_token');
    //const idValue = await AsyncStorage.getItem('@user_id');
    return fetch(serverBase + "user/" + id, {
          'headers': {
            'X-Authorization':  value
          }
        })
        .then((response) => {
            if(response.status === 200){
                return response.json()
            }else if(response.status === 401){
              this.props.navigation.navigate("Login");
            }else if(response.status === 404){
              console.log("404 Error: Not found")
            }else{
                throw 'Something Unexpected has happened';
            }
        })
        .then((responseJson) => {
          console.log(responseJson)
          this.setState({
            isLoading: false,
            userInfo: responseJson,
          })
          console.log(this.state.nameFirst)
        })
        .catch((error) => {
            console.log(error);
        })
  }
    
    get_posts = async (id) =>{
        //Post data will be retrieved here - stored in a list
        //Data is being added - look @ postman - but it is not showing up after
        const token = await AsyncStorage.getItem("@session_token");
        return fetch(serverBase+"user/" + id + "/post", {
          'method':'get',
          'headers': {
            'X-Authorization': token
          },
        })
        .then((response) => {
          if(response.status ===200){
              this.setState({
                  friends: true
              })
            return response.json()
          }else if(response.status === 401){
            this.props.navigation.navigate("Login")
          }else if(response.status === 403){
              this.setState({
                  friends: false
              })
          }else{
              throw "Something went unfortunately wrong"
          }
            
        })
        .then((responseJson) => {
          this.setState({
            listsOfPosts: responseJson
          })
        })
        .catch((error) => {
          console.log(error)
        })
      }

    componentWillUnmount(){
        this.unsubscribe();
    }

    add_post = async () => {

        const token = await AsyncStorage.getItem("@session_token")
        if(this.state.inputForPosts != ""){
            let to_send =  {
                text: this.state.inputForPosts
            }
            return fetch(serverBase+"user/"+this.state.userInfo.user_id+"/post", {
                'method':"post",
                'headers': {
                    'X-Authorization': token,
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(to_send)
            })
            .then((response) => {
                if(response.status === 201){
                    this.get_posts();
                }else if(response.status === 401){
                    this.props.navigation.navigate("Login")
                }else if(response.status === 404){
                    console.log("404 Error: Not Found")
                }else{
                    throw "Something went unfortunately wrong"
                }
            })
            .catch((error) => {
                console.log("Tried to add post with no data")
            })
        }else{
            this.setState({textForChecks: "- Trying to add post with no text"})
        }
    }


    checkLoggedIn = async () => {
        const value = await AsyncStorage.getItem('@session_token');
        if(value == null){
            this.props.navigation.navigate('Login');
        }
    };

    get_profile_photo = async (id) =>{
        const token = await AsyncStorage.getItem("@session_token");
        return fetch(serverBase+"user/"+ id + "/photo", {
            'method': 'get',
            'headers': {
                'X-Authorization': token
            },
        })
        .then((response) => {
            if(response.status === 200){
                return response.blob()
            }else if(response.status === 401){
                this.props.navigation.navigate("Login")
            }else if(response.status === 404){
                console.log("404 Error: Not found")
            }else{
                throw "Something wrong has happened"
            }
        })
        .then((responseBlob) =>{
            let data = URL.createObjectURL(responseBlob);
            this.setState({
                photo: data,
            })
        })
        .catch((error) =>{ 
            console.log(error)
        })
    }
    

    addFriend = async () =>{
        this.setState({textForChecks:"You have already sent your request"})
        //Send a friend request for this 
        const value = await AsyncStorage.getItem('@session_token');
        //const id = await AsyncStorage.getItem('user_id');
        console.log(this.state.userInfo.user_id)
        
        return fetch(serverBase+"user/"+this.state.userInfo.user_id+"/friends",{
            'method': 'post',
            'headers' : {
                    'X-Authorization': value
            }
        })
        .then((response) => {
            if(response.status ===200){
                console.log("Friend request has successfully been sent")
            }else if(response.status === 401){
                this.props.navigation.navigate("Login");
            }else if(response.status === 403){
                this.setState({textForChecks:"Friend Request has already been sent to this user"})
            }else if(response.status === 404){
                console.log('404 Error: Not found')
            }else{
                console.log("Something went wrong")
            }
        })
        .catch((error) => {
            console.log(error);
        })
        
    }

    render(){
        if(this.state.arefriends) 
        {
          return (
          <View>
            <ScrollView>
              <View style={styles.containerDiv}>
                  <Image
                      source={{
                          uri: this.state.photo,
                      }}
                      style = {styles.imagePhotoStyling}
                  />
                  <Text style={styles.stylingForNames}>{this.state.userInfo.first_name} {this.state.userInfo.last_name}</Text>
              </View>
              <View style={styles.buttonContainerDiv}>
                  <Button
                      title="Friends"
                      onPress={() => this.props.navigation.navigate('Friends',{userID: this.state.userID})}
                  />
              </View>
              <View style={styles.addPostContainer}> 
                  <Text>Add Post</Text>
                  <TextInput
                      placeholder="Add a post"
                      onChangeText={(inputForPosts) => this.setState({inputForPosts})}
                      value={this.state.inputForPosts}
                  />
                  <Text>{this.state.textForChecks}</Text>
                  <Button
                      title="Add Post"
                      onPress={() => this.add_post()}
                  />
              </View>
              <View >
                  <TouchableWithoutFeedback>
                  <FlatList
                      data={this.state.list}
                      renderItem={({item}) => ( 
                          <TouchableOpacity
                              style={styles.postItem}
                              onPress={() => this.props.navigation.navigate('Posts',{item: item.post_id, userInfo: this.state.userID, userName: this.state.userInfo.first_name})}
                          >
                              <Text>{item.text}</Text> 
                              <Text>{item.numLikes} Likes</Text>
                          </TouchableOpacity> 
  
                      )}
                  />
                  </TouchableWithoutFeedback>
              </View>
            </ScrollView>
        </View>  
       )
      }else{
        return(
          <View>
            <ScrollView>
              <View style={styles.container}>
                  <Image
                    source={{
                      uri: this.state.photo,
                    }}
                    style = {styles.imagePhotoStyling}
                  />
                  <Text style={styles.nameStyle}>{this.state.userInfo.first_name} {this.state.userInfo.last_name}</Text>
              </View>
              <Button
              title="Add Friend"
              onPress = {() => this.addFriend()}
              />
              <Text>{this.state.textForChecks}</Text>            
            </ScrollView>
          </View>
        );
       } 
    }
}

const styles = StyleSheet.create({
    imagePhotoStyling: {
        width: 200,
        height: 200,
    },
    stylingForPostingItem: {
        padding:15,
        borderColor: 'slateblue',
        borderRadius: 1,
        borderWidth: 1,
        margin: 5
    },
    addPostDivContainer:{
        flex:1,
        alignItems: 'center',
        flexDirection: 'row',
        margin: 0,
        justifyContent: 'space-evenly',
        backgroundColor: 'lightblue'
    },
    stylingForNames:{
        flex:1,
        width:130,
        height: 110,
        textAlign: 'center',
        fontSize: 18,
        
    },
    containerDiv: {
        flex: 1,
        height: 300,
        width: 393,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',    
    },
    buttonContainerDiv: {
        flex:1,
        flexDirection:'row-reverse',
        justifyContent: 'flex-start',
        alignItems: 'center',
        
    }
  
  })
export default UserScreen;
