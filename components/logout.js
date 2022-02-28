import React, { Component } from 'react';
import { Text, ScrollView, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class HomeScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            token: ''
        }
    }

    componentDidMount(){
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.checkLoggedIn();
        });        
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    checkLoggedIn = async () => {
        const value = await AsyncStorage.getItem('@session_token');
        if(value !== null) {
          this.setState({token:value});
        }else{
            this.props.navigation.navigate("Login");
        }
    }

    logout = async () => {
        let token = await AsyncStorage.getItem('@session_token');
        await AsyncStorage.removeItem('@session_token');
        return fetch("http://localhost:3333/api/1.0.0/logout", {
            method: 'post',
            headers: {
                "X-Authorization": token
            }
        })
        .then((response) => {
            if(response.status === 200){
                this.props.navigation.navigate("Login");
            }else if(response.status === 401){
                this.props.navigation.navigate("Login");
            }else{
                throw 'Something went wrong';
            }
        })
        .catch((error) => {
            console.log(error);
            ToastAndroid.show(error, ToastAndroid.SHORT);
        })
    }

    render(){
        return (
            <ScrollView>
                <Text style={{fontSize:18, fontWeight:'bold', padding:5, margin:5}}>If you leave me now, you'll take away the biggest part of me...</Text>
                <Text style={{fontSize:18, fontWeight:'bold', padding:5, margin:5}}>...Oooooohh, baby please don't go!</Text>
                <Button
                    title="I'm outta here"
                    onPress={() => this.logout()}
                />
                <Button
                    title="OK, take me home, country roads"
                    color="darkblue"
                    onPress={() => this.props.navigation.navigate("Home")}
                />
            </ScrollView>
        )
    }
}

export default HomeScreen;