import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, TextInput, FlatList, View, Switch, TouchableOpacity, StyleSheet } from 'react-native-web';

class SearchScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
            userInput: "",
            listData: [],
            selectedUserID: 0,
            textForChecks: "",
            nextDisabled: true,
            backDisabled: true,
            friendSearch: false,
            limit: 10,
            offset: 0

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


        if(page == -1){
            let temp = this.state.offset - this.state.limit
            this.setState({
                offset: temp,
                nextDisabled: false
            })
            if(temp==0){
                this.setState({
                    backDisabled: true
                })
            }
        }else if(page ==0){
            this.setState({
                offset: 0,
                nextDisabled: false
            })
        }else if(page == 1){
            let temp = this.state.offset + this.state.limit
            this.setState({
                offset: temp,
                backDisabled: false
            }) 
        }
        this.setState({textForChecks: ""})
        let searchMethod = 'all'
        if(this.state.friendSearch){
            searchMethod = 'friends'
        }
        if(this.state.userInput !== ""){
            const value = await AsyncStorage.getItem('@session_token');
            return fetch(`http://localhost:3333/api/1.0.0/search?q=${this.state.userInput}&search_in=${searchMethod}&limit=${this.state.limit}&offset=${this.state.offset}`,{
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
                if(responseJson.length < 5){
                    this.setState({
                        listData: responseJson,
                        limit: 5,
                        nextDisabled: true
                    })
                }else{
                    this.setState({
                        listData: responseJson,
                        limit: 5
                    })
                }
            })
            .catch((error) => {
                console.log(error);
            })
        }else{
            this.setState({
                textForChecks: "You have not entered Text in the text box",
                backDisabled: true
            })
        }
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
                <View style={styles.searchContainer}>
                    <Button
                        title="Search:"
                        onPress = {() => this.getData(0)}
                    />
                    <TextInput
                        style = {styles.searchBoxStyle}
                        placeholder="Enter name to search for"
                        onChangeText={(userInput) => this.setState({userInput})}
                        value={this.state.userInput}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <Text>Friends</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={this.state.friendSearch ? "#f5dd4b" : "#f4f3f4"}
                        value={this.state.friendSearch}
                        onValueChange = {(value) => this.setState({friendSearch: value})}
                        
                    />
                    
                    <Text>{this.state.textForChecks}</Text>
                </View>
                <FlatList
                    data={this.state.listData}
                    renderItem={({item}) => (
                        <View style={styles.searchItem}>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('User',{id: item.user_id })}
                        >
                        <Text style={styles.searchText}>{item.user_givenname} {item.user_familyname}</Text>
                        </TouchableOpacity>
                        </View>
                    )}
                />
                <View style={styles.buttonContainer}>
                    <Button
                        title='Back'
                        onPress={() => this.getData(-1)}
                        disabled={this.state.backDisabled}
                    />
                    <Button
                        title='Next'
                        onPress={() => this.getData(1)}
                        disabled={this.state.nextDisabled}
                    />
                </View>   
            </View>
        );      
      }
}

const styles = StyleSheet.create({
    searchContainer:{
        flexDirection: 'row',
        height: 30,
    },
    searchBoxStyle: {
        width: 300
    },
    toggleContainer: {
        flexDirection: 'row',
        padding: 5
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    searchItem: {
        padding:15,
        borderColor: 'steelblue',
        borderRadius: 1,
        borderWidth: 1
    },
    searchText:{
        textAlign: 'center',
        fontSize: 18,
    }
})

export default SearchScreen;