import React, {Component} from "react";
import {Text, Button, Image, StyleSheet, TextInput, FlatList, View, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBase } from "../App";

class UserScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            photo: null,
            userInformation: this.props.route.params.item,
            inputForPosts: "",
            listsOfPosts: [],
            titleForLikes: "Like",
            textForChecks: "",
            friends: false, 
            
        }
    }
    

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
          this.checkLoggedIn();
          this.get_profile_photo();
          this.get_posts();
        });
        
    }
    
    get_posts = async () =>{
        //Post data will be retrieved here - stored in a list
        //Data is being added - look @ postman - but it is not showing up after
        const token = await AsyncStorage.getItem("@session_token");
        return fetch(serverBase+"user/" + this.state.userInfo.user_id + "/post", {
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
              throw "Something went wunfortunately wrong"
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
                    throw "Somthing went unfortunately wrong"
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

    get_profile_photo = async () =>{
        const token = await AsyncStorage.getItem("@session_token");
        return fetch(serverBase+"user/"+ this.state.userInfo.user_id + "/photo", {
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
        if(this.state.friends) 
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
                      onChangeText={(postInput) => this.setState({postInput})}
                      value={this.state.postInput}
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
                      data={this.state.postList}
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
              onPress = {() => this.add_Friends()}
              />
              <Text>{this.state.textForChecks}</Text>            
            </ScrollView>
          </View>
        );
       } 
        // if(!this.state.friends){
        //     //Do something 
        //     return(
        //         <View>
        //             <Image
        //                 source={{
        //                     uri: this.state.photo,
        //                 }}
        //                 style = {{
        //                     width: 400,
        //                     height: 400,
        //                     borderWidth: 5
        //                 }}
        //             />
        //             <Text>{this.state.userInfo.user_givenname}</Text>
        //             <Button
        //                 title="Add Friend"
        //                 onPress = {() => this.addFriend()}
        //             />
        //             <Text>{this.state.textForChecks}</Text>
        //         </View>
        //     )
        // }else{
        //     return(
        //         <View>
        //             <Image
        //                 source={{
        //                     uri: this.state.photo,
        //                 }}
        //                 style = {{
        //                     width: 400,
        //                     height: 400,
        //                     borderWidth: 5
        //                 }}
        //             />
        //             <Text>{this.state.userInfo.user_givenname}</Text>
        //             <Text>Add Post</Text>
        //             <TextInput
        //                 placeholder="What do you want to write about"
        //                 onChangeText={(inputForPosts) => this.setState({inputForPosts})}
        //                 value={this.state.inputForPosts}
        //             />
        //             <Text>{this.state.textForChecks}</Text>
        //             <Button
        //                 title="Add Post"
        //                 onPress={() => this.add_post()}
        //             />
        //             <FlatList
        //                 data={this.state.listsOfPosts}
        //                 renderItem={({item}) => (
        //                     <View>
        //                     <TouchableOpacity
        //                         onPress={() => this.props.navigation.navigate('Posts',{item: item.post_id, userInfo: this.state.userInfo.user_id})}
        //                     >
        //                     <Text>{item.text}</Text>
        //                     <Text>{item.numLikes} Likes</Text> 
        //                         </TouchableOpacity> 
        //                         {/* <Button
        //                             title={this.state.titleForLikes}
        //                             onPress={() => this.likePost(item)}
        //                         /> */}
        //                     </View>
        //                 )}
        //             />
        //         </View>
        //     );
        // }
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
