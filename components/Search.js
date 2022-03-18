import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, TextInput, FlatList, View, Switch, TouchableOpacity, StyleSheet } from 'react-native-web';
import { serverBase } from '../App';

class SearchScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
            userInput: "",
            listData: [],
            selectedUserID: 0,
            offset: 0,
            textForChecks: "",
            disabledNextPagination: true,
            disabledPreviousPagination: true,
            searchFriends: false,
            limit: 10,

        }
    }

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
          this.checkLoggedIn();
        });
    }
    
    componentWillUnmount(){
        this.unsubscribe();
    }
    
    getData = async (page) => {

    //Here Pagination should occur when the value of the page is -1,0 or 1.
    //Here if the value is 1 the page should move to the next one.
    //If the value is 0 then the page should stay as it is.
    //If the value is -1 then the page should move to previous page.
    
    //Pagination is not currently working: attempt to fix it later.

    let offsetValue = this.state.offset
    let limitValue = this.state.limit
        if(page == 1){
            //let temporaryStorageValue = this.state.offset + this.state.limit
            let temporaryStorageValue = offsetValue + limitValue
            this.setState({
                offset: temporaryStorageValue,
                disabledPreviousPagination: false
            })
        }else if(page ==0){
            this.setState({
                offset: 0,
                disabledNextPagination: false
            })
        }else if(page == -1){
            //let temporaryStorageValue = this.state.offset - this.state.limit
            let temporaryStorageValue = offsetValue - limitValue
            this.setState({
                offset: temporaryStorageValue,
                disabledNextPagination: false
            }) 
            if(temporaryStorageValue==0) {
                this.setState({
                    disabledPreviousPagination: true
                })
            }
        }
        
        this.setState({
            textForChecks: ""
        })

        let searchProcedure = 'all'

        if(this.state.searchFriends){
            searchProcedure = 'friends'
        }
        if(this.state.userInput !== ""){
            const value = await AsyncStorage.getItem('@session_token');
            return fetch(`http://localhost:3333/api/1.0.0/search?q=${this.state.userInput}&search_in=${searchProcedure}&limit=${limitValue}&offset=${offsetValue}`,{
                'headers': {
                     'X-Authorization': value
                }
            })
            .then((response) => {
                if(response.status ===200){
                    this.setState({
                        userInput: ""
                    })
                    return response.json()
                }else if(response.status === 400){
                    console.log("Error 400: Invalid Request has been made")
                }else if(response.status === 401){
                    this.props.navigation.navigate("login");
                }else{
                    throw 'Something went wrong';
                }
            })
            .then((responseJson) => {
                console.log(responseJson.length)
                if(responseJson.length < 10){
                    this.setState({
                        listData: responseJson,
                        limit: 10,
                        disabledNextPagination: true
                    })
                }else{
                    this.setState({
                        listData: responseJson,
                        limit: 10
                    })
                }
            })
            .catch((error) => {
                console.log(error);
            })
        }else{
            this.setState({
                textForChecks: "Please enter text in the text box; text boxes can't be left empty",
                disabledPreviousPagination: true
            })
        }
    }
    
    addFriend = async (user_id) =>{
        //Send a friend request.
        const value = await AsyncStorage.getItem('@session_token');
        //const id = await AsyncStorage.getItem('user_id');
        
        return fetch(serverBase+"user/"+user_id+"/friends",{
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
    
    checkLoggedIn = async () => {
        const value = await AsyncStorage.getItem('@session_token');
        if(value == null){
            this.props.navigation.navigate('login');
        }
    };


    render() {
        return(
            <View style={{backgroundColor: 'lightblue'}}>
                <View style={styles.searchContainerStyling}>
                    <Button
                        title="Search:"
                        onPress = {() => this.getData(0)}
                    />
                    <TextInput
                        style = {styles.searchBoxStyling}
                        placeholder="Enter name: "
                        onChangeText={(userInput) => this.setState({userInput})}
                        value={this.state.userInput}
                    />
                </View>
//                 <View style={styles.searchButtonContainer1Styling}>
//                     <Button
//                         title='Previous'
//                         onPress={() => this.getData(-1)}
//                         disabled={this.state.disabledPreviousPagination}
//                     />
//                 </View>
//                 <View style={styles.searchButtonContainer2Styling}>
//                     <Button
//                         title='Next'
//                         onPress={() => this.getData(1)}
//                         disabled={this.state.disabledNextPagination}
//                     />
//                 </View> 
                <FlatList
                    data={this.state.listData}
                    renderItem={({item}) => (
                        <View style={styles.searchItemStyling}>
                        {/* <TouchableOpacity onPress={() => this.props.navigation.navigate('User',{id: item.user_id })}> */}
                        <Text style={styles.searchTextStyling}>{item.user_givenname} {item.user_familyname}</Text>
                        <Button onPress={() => this.addFriend(item.user_id)}>Add Friend</Button>
                        {/* </TouchableOpacity> */}
                        </View>
                    )}
                />  
            </View>
        );      
      }
}

const styles = StyleSheet.create({
    searchContainerStyling:{
        flexDirection: 'row',
        height: 30,
    },
    searchItemStyling: {
        padding:15,
        borderColor: 'slateblue',
        borderWidth: 1,
        borderRadius: 1
    },
    searchTextStyling:{
        textAlign: 'center',
        fontSize: 18,
    },
    searchBoxStyling: {
        width: 400
    },
    searchButtonContainer1Styling: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    searchButtonContainer2Styling: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    addFriendButton: {
        color: 'slateblue'
    }

})

export default SearchScreen;
