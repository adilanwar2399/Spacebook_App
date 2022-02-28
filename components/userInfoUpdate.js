import React, { Component } from 'react';
import { View, Text, Button, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            orig_first_name: "",
            orig_last_name: "",
            orig_email: "",
            orig_password: "",
            id: "",
            item_name: "",
            last_name: "",
            email: "",
            password: ""
        };
    }
    
    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
          this.checkLoggedIn();
        });
      
        this.updateItem();
      }
    
      componentWillUnmount() {
        this.unsubscribe();
      }

    updateItem = async () => {
        let to_send = {};

        if (this.state.first_name != this.state.orig_first_name) {
            to_send['first_name'] = this.state.first_name;
        }

        if (this.state.last_name != this.state.orig_last_name) {
            to_send['last_name'] = this.state.last_name;
        }

        if (this.state.email != this.state.orig_email) {
            to_send['email'] = (this.state.email);
        }

        if (this.state.password != this.state.orig_password) {
            to_send['password'] = (this.state.password);
        }

        console.log(JSON.stringify(to_send));

        const value = await AsyncStorage.getItem('@session_token');
        const userid = await AsyncStorage.getItem('@session_id')

        return fetch("http://localhost:3333/api/1.0.0/user/" + userid, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json',
                'x-authorization': value,
            },
            body: JSON.stringify(to_send)
        })
            .then((response) => {
                console.log("Item updated");
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
        return (
            <View>
                <Text>Update an Item</Text>

                <TextInput
                    placeholder="Enter first name..."
                    onChangeText={(first_name) => this.setState({ first_name })}
                    value={this.state.first_name}
                    style={{padding:5, borderWidth:1, margin:5}}
                />
                <TextInput
                    placeholder="Enter last name..."
                    onChangeText={(last_name) => this.setState({ last_name })}
                    value={this.state.last_name}
                    style={{padding:5, borderWidth:1, margin:5}}
                />
                <TextInput
                    placeholder="Enter email..."
                    onChangeText={(email) => this.setState({ email })}
                    value={this.state.email}
                    style={{padding:5, borderWidth:1, margin:5}}
                />
                <TextInput
                    placeholder="Enter password..."
                    onChangeText={(password) => this.setState({ password })}
                    value={this.state.password}
                    style={{padding:5, borderWidth:1, margin:5}}
                />
                <Button
                    title="Update"
                    onPress={() => this.updateItem()}
                    style={{padding:5, borderWidth:1, margin:5}}
                />
            </View>
        );
    }
}


export default App;