import React, {Component} from "react";
import {Text, ScrollView, Button, View, FlatList, StyleSheet} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

class FriendRequestsScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            friendRequestList: [],
            UserID:"",
        }
    }

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
          this.checkLoggedIn();
        });
        this.getData();
    }

    componentWillUnmount(){
        this.unsubscribe();
    }

    checkLoggedIn = async () => {
        const value = await AsyncStorage.getItem('@session_token');
        if(value == null){
            this.props.navigation.navigate('Login');
        }
    };

    getData = async () =>{
        const token = await AsyncStorage.getItem('@session_token');
        return fetch("http://localhost:3333/api/1.0.0/friendrequests",{
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
                this.props.navigation.navigate("Login");
            }else if(response.status === 500){
                console.log("Server Error")
            }else{
                throw 'Something Unexpected has occurred.';
            }
        })
        .then((responseJson) => {
            this.setState({
                friendRequestList: responseJson
            })
        })
        .catch((error) => {
            console.log('Something Unexpected has occurred.')
            console.log(error);
        })
    }

    friendRequestAcceptingOption =  async (requestID) =>{
        //Once the request is accepted need to recall the get data 
        //Here the friend request is accepteds
        console.log("Method is working")
        console.log(requestID)
        
        const token = await AsyncStorage.getItem('@session_token');
        return fetch("http://localhost:3333/api/1.0.0/friendrequests/"+ requestID, {
            'method': 'post',
            'headers':{
                'X-Authorization': token
            },
        })
        .then((response) => {
            if(response.status ===200){
                this.getData()
            }else if(response.status === 401){
                this.props.navigation.navigate("Login");
            }else if(response.status === 404){
                console.log("404 Error: Not found")
            }else{
                throw 'Something Unexpected has occurred.';
            }
        })
        .catch((error) => {
            console.log(error);
        })
        
    }

    deleteFriendRequest =  async (requestID) =>{
        //Here the friend request is deleted
        const token = await AsyncStorage.getItem('@session_token');
        return fetch("http://localhost:3333/api/1.0.0/friendrequests/"+ requestID, {
            'method': 'Delete',
            'headers':{
                'X-Authorization': token
            },
        })
        .then((response) => {
            if(response.status ===200){
                this.getData()
            }else if(response.status === 401){
                this.props.navigation.navigate("Login");
            }else if(response.status === 404){
                console.log("404 Error: Not found")
            }else if(response.status === 500){
                
            }else{
                throw 'Something Unexpected has occurred.';
            }
        })
        .catch((error) => {
            console.log(error);
        })
    }

    render(){
        return(
            <View>
                <ScrollView>
                    <Text style={styles.title} >Friend requests</Text>
                    <FlatList
                        data={this.state.friendRequestList}
                        renderItem={({item}) => (
                            <View style={styles.containerForRequestsDiv}>
                                <Text style={styles.stylesForNames}>{item.user_id} {item.first_name} {item.last_name}</Text>
                                <Button
                                    title="Accept"
                                    onPress={() => this.friendRequestAcceptingOption(item.user_id)}
                                />
                                <Button
                                    title="Decline"
                                    onPress={() => this.deleteFriendRequest(item.user_id)}
                                />
                            </View>
                        )}
                    />
                    <Button
                    title='Total Friends'
                    onPress={() => this.props.navigation.navigate('Friends',{userID: this.state.userID})} 
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
        fontSize:22,
        backgroundColor:'lightblue',
        padding:12,
        flex: 1
      },
    containerForRequestsDiv: {
        flex:1,
        margin: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: 'lightblue'
    },
    stylesForNames:{
        fontSize: 19,
    },
})

export default FriendRequestsScreen;

