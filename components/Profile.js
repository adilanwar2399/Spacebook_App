import React, {Component} from 'react';
import {View, Text, TextInput, FlatList, ScrollView, Button, StyleSheet, Image, TouchableWithoutFeedback , TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBase } from '../App';

class ProfileScreen extends Component {
  constructor(props){
    super(props);

    this.state = {
      isLoading: true,
      userID: "",
      ownProfile: true,
      photo: null,
      first_name: "",
      last_name: "",
      postList: [],
      postInput: "",
      titleForLikes: "Like",
      userInfo: [], 
      textForChecks: "",
      selectionOfUserID: 0
    }
  }

  async componentDidMount() {

        this.unsubscribe = this.props.navigation.addListener('focus', () => {
          this.checkLoggedIn();
          this.getData();
          this.get_profile_image();
        });
  
    this.getData();
    this.get_profile_image();
    this.get_posts;
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
    const value = await AsyncStorage.getItem('@session_token');
    const idValue = await AsyncStorage.getItem('@user_id');
    return fetch(serverBase + "user/" + idValue, {
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
            nameFirst: responseJson.first_name,
            nameLast: responseJson.last_name

          })
          console.log(this.state.nameFirst)
        })
        .catch((error) => {
            console.log(error);
        })
  }

  get_profile_image = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    const idValue = await AsyncStorage.getItem('@user_id');

    return fetch(serverBase+"user/" + idValue+ "/photo?" + Date.now(),{
      'method': 'get',
      'headers': {
        'X-Authorization': value,
      }
    })
    .then((response) => {
      if(response.status === 200){
        return response.blob();
      }else if (response.status === 401){
        this.props.navigation.navigate("Login")
      }else if (response.status === 404) {
        console.log("404 Error: Not found")
      }else {
        throw "Something Unexpected happened with the server."
      }
    })
    .then((responseBlob) => {
      let data = URL.createObjectURL(responseBlob);
      this.setState({
        photo: data,
      });
    })
    .catch((err) => {
      console.log(err)
    });
  }

  get_posts = async () =>{
    //Post data will be retrieved here - stored in a list
    // Here the addition of the data occurs - the utilization of the Postman App shows the whole process.
    const token = await AsyncStorage.getItem("@session_token");
    const idValue = await AsyncStorage.getItem('@user_id');
    return fetch(serverBase + "user/" + idValue + "/post", {
      'method':'get',
      'headers': {
        'X-Authorization': token
      },
    })
    .then((response) => {
      if(response.status ===200){
        console.log("Everything is working; 200")
        return response.json()
      }else if(response.status === 401){
        this.props.navigation.navigate("Login")
      }else if(response.status === 403){
        console.log("Only your and your friends' posts can be seen")
      }else if(response.status === 404){
        console.log("404 Error: Not Found")
      }else{
        throw "Unexpected Server Error!"
      }
    })
    .then((responseJson) => {
      this.setState({
        postList: responseJson
      })
    })
    .catch((error) => {
      console.log(error)
    })
  }

  likePosts = async (user_id, post_id) => {
    const value = await AsyncStorage.getItem('@session_token');
    const valueId = await AsyncStorage.getItem('@user_id');
        return fetch(serverBase + "user/" +valueId+ "/post/" +post_id+ "/like", {
        method: 'Post',
        headers: {
            'X-Authorization': value 
        }
    })
    .then((response) =>{
        if(response.status === 200){
            console.log("200: Good Respose")
        }else if(response.status === 401){
            this.props.navigation.navigate("Login")
        }else if(response.status === 403){
            console.log("403 Forbidden Request; restricted access ")
        }else{
            throw "Something went wrong"
        }
    })
    .then((responseJson) => {
        console.log('Liked: ', responseJson)
    })
    .catch((error) => {
        console.log(error)
    })
}

  unLikePosts = async (user_id, post_id) => {
    const value = await AsyncStorage.getItem('@session_token');
    const idValue = await AsyncStorage.getItem('@user_id');
    return fetch(serverBase + "user/" +idValue+ "/post/" +post_id+ "/like", {
      method: 'Delete',
      headers: {
        'X-Authorization': value 
    }
  })
    .then((response) =>{
        if(response.status === 200){
            console.log("200: Good Respose")
        }else if(response.status === 401){
            this.props.navigation.navigate("Login")
        }else if(response.status === 403){
            console.log("403 Forbidden Request; restricted access ")
        }else{
            throw "Something went wrong"
        }
    })
    .then((responseJson) => {
        console.log('Un-Liked: ', responseJson)
    })
    .catch((error) => {
        console.log(error)
    })
  }
  add_post = async () => {
    this.setState({
      textForChecks: ""
    })
    const token = await AsyncStorage.getItem('@session_token');
    const idValue = await AsyncStorage.getItem('@user_id');
    
    if(this.state.postInput != ""){
      let to_send = {
        text: this.state.postInput
      }
      return fetch(serverBase + "user/" + idValue + "/post", {
        'method': 'post',
        'headers': {
          "X-Authorization": token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(to_send)
      })
      .then((response) => {
        if(response.status ===201){
          this.setState({
            postInput: ""
          })
          this.get_posts()
        }else if(response.status === 401) {
          this.props.navigation.navigate("Login")
        }else if(response.status === 404){
          console.log("404 Error: Not Found")
        }else{
          throw 'Something Unexpected has happened'
        }
      })
      .catch((error) => {
        console.log(error)
      })
    }else{
      this.setState({
        textForChecks: "Add a post that has zero data present."
      })
    }
  }
  add_Friends = async () =>{
    this.setState({textForChecks:""})
    const value = await AsyncStorage.getItem('@session_token');
    const idValue = await AsyncStorage.getItem('@user_id');
    return fetch(serverBase+"user/"+idValue+"/friends",{
        'method': 'post',
        'headers' : {
                'X-Authorization': value
        }
    })
    .then((response) => {
        if(response.status ===200){
            console.log("200 Ok Response: Friend Request has successfully been sent.")
        }else if(response.status === 401){
            this.props.navigation.navigate("login");
        }else if(response.status === 403){
            this.setState({textForChecks:"You have already sent your request"})
        }else if(response.status === 404){
            console.log('Not found')
        }else{
            console.log("Really not sure now")
        }
    })
    .catch((error) => {
        console.log(error);
    })
    
}
  render() {
  //Here the rendering occurs of the Profile User's Page.
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
            <View style = {styles.buttonContainerDiv}>
              <Button
                title='Friends'
                onPress={() => this.props.navigation.navigate('Friends',{userID: this.state.userID})}
                />
              <Button
                title='Edit'
                onPress={() => this.props.navigation.navigate('User Update')}
              />
            </View>
            <View style={styles.addPostDivContainer}>
                <Text>Add Post</Text>
                  <TextInput
                    placeholder="Add posts"
                    onChangeText={(value) => this.setState({postInput: value})}
                    value={this.state.postInput}
                  />
                  <Text>{this.state.textForChecks}</Text>
                  <Button
                  title='Add Post'
                  onPress={() => this.add_post()}
                  />
              </View>
              <View>
                <FlatList
                    style={{flex: 1}}
                    scrollEnabled={true}
                    data={this.state.postList}
                    renderItem={({item}) => (
                      <TouchableOpacity
                          style={styles.postItem}
                          onPress={() => this.props.navigation.navigate('Posts',{item: item.post_id, userInfo: this.state.userInfo.user_id, userName: this.state.userInfo.first_name })}
                          >
                          <Text>{item.text}</Text>
                          <Text>{item.numLikes} Likes</Text>
                      </TouchableOpacity>
                     )}
                  />
              </View>
              <View >
                <Text>User ID: {this.state.userInfo.user_id} </Text>
              </View>
              <View >
                <Text>Full Name: {this.state.userInfo.first_name} {this.state.userInfo.last_name}</Text>
              </View>
              <View>
                <Text>Email ID: {this.state.userInfo.email}</Text>
              </View>
          </ScrollView>  
        </View>
      );
    }
  }

const styles = StyleSheet.create({
  buttonContainerDiv: {
    flex:1,
    flexDirection:'row-reverse',
    margin: 12.5
  },
  imagePhotoStyling: {
      width: 200,
      height: 200,
  },
  stylingForPostingItem: {
      padding:15,
      borderColor: 'slateblue',
      margin: 5,
      borderRadius: 1,
      borderWidth: 1,
      
  },
  stylingForNames:{
      flex:1,
      width:130,
      height: 110,
      textAlign: 'center',
      fontSize: 18,
      
  },
  addPostDivContainer:{
    flex:1,
    alignItems: 'center',
    flexDirection: 'row',
    margin: 0,
    justifyContent: 'space-evenly',
    backgroundColor: 'lightblue'
  },
  containerDiv: {
      flex: 1,
      height: 350,
      width:  400,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',    
  }
})

export default ProfileScreen;

