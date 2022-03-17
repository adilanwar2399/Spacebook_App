import React, { Component } from 'react';
import { Button } from 'react-native-web';
import { Text, ScrollView, TextInput, StyleSheet, View  } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LoginScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            //email: "ashK.williams@mmu.ac.uk",
            //password: "hello1234"
            email: "",
            password: "",
            textForChecks: ""
        }
    }

    login = async () => {
    //Validation: which allows the fields to be filled correctly.
    //The emails and the passwords will be filled correctly and in the right format.
        this.setState({
            textForChecks: ""
          })
          if(this.state.password != "" && this.state.email != ""){
            if(this.state.email.includes("@")){
                return fetch("http://localhost:3333/api/1.0.0/login", {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.state)
                })
                .then((response) => {
                    if(response.status === 200){
                        return response.json()
                    }else if(response.status === 400){
                        throw 'Invalid Email or Password';
                    }else{
                        throw 'Something went wrong';
                    }
                })
                .then(async (responseJson) => {
                        console.log(responseJson);
                        await AsyncStorage.setItem('@session_token', responseJson.token);
                        await AsyncStorage.setItem('@user_id', responseJson.id);

                        this.props.navigation.navigate("ProfileScreen");
                })
                .catch((error) => {
                    console.log(error);
                })
            }else{
                this.setState({
                    textForChecks: "Invalid Email address as @ symbol is required"
                })
            }
        }else{
            this.setState({
                textForChecks: "This box can't be left empty"
            })
        }    
    }

    render(){
        return (
           <View>
               <Text style={styles.title}>S P A C E B O O K</Text>
               <Text style={styles.title}>APP</Text>
                <ScrollView>
                    <View style={styles.textStyleForm}>
                         <Text style={styles.labelStyleForm}> Email Address: </Text>
                        <TextInput
                        placeholder="Enter your email"
                        onChangeText={(email) => this.setState({email})}
                        value={this.state.email}
                        style={styles.inputStyleForm}
                        //style={{padding:5, borderWidth:1, margin:5}}

                    />
                    </View>
                    <View style={styles.textStyleForm}>
                         <Text style={styles.labelStyleForm}> Password: </Text>
                    <TextInput
                        placeholder="Enter your password"
                        onChangeText={(password) => this.setState({password})}
                        value={this.state.password}
                        secureTextEntry
                        style={styles.inputStyleForm}
                        // style={{padding:5, borderWidth:1, margin:5}}
                    />
                    </View>
                    <Button
                        title="Login"
                        onPress={() => this.login()}
                    />
                    <Button
                        title="Don't have an account?"
                        color="darkblue"
                        onPress={() => this.props.navigation.navigate("Signup")}
                    />
                    <Text>{this.state.textForChecks}</Text>
                </ScrollView>
            </View> 
        )
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
    textStyleForm: {
      padding:25,
      borderColor: 'slateblue',
      borderRadius: 3,
      borderWidth: 1
    },
    labelStyleForm: {
      fontSize:15,
      color:'slateblue'
    },
    inputStyleForm: {
      borderWidth:1,
      borderColor: 'lightblue',
      borderRadius:5,
    }
  })

export default LoginScreen;
