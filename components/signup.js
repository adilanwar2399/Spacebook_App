import React, { Component } from 'react';
import { Text, ScrollView, TextInput, Button, StyleSheet, View } from 'react-native-web';
import { serverBase } from '../App';

class SignupScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            alternativePassword: "",
            textForChecks:""
        }
    }

    verificationOfPassword() {
        //Validation here ensures that user fills in the details correctly - using Regex.
        let passWord = this.state.password
        // min 8 characters - can consist of [0-9] Integer digit values and atleast 1 Capitalized Letter [A-Z]
        if(passWord.length > 8){
            if(/\d/.test(passWord)){
                if(/[A-Z]/.test(passWord)){

                    let temporaryFirstNameStorageString = String(this.state.first_name)
                    let temporaryLastNameStorageString = String(this.state.last_name)

                    if(!passWord.includes(temporaryLastNameStorageString) && !passWord.includes(temporaryFirstNameStorageString)){
                        return true;
                    }else{
                        this.setState({
                            textForChecks: "Error : Error Names can't be used in Passwords \n"
                        })
                        return false   
                    }
                }else{
                   this.setState({
                        textForChecks: "Error: Passwords Imperatively must contain a Capitalized Letter \n"
                   })
                }
            }else{
                this.setState({
                    textForChecks: "Error: Passwords Imperatively must contain an Numerical Value (Integer) \n"
                })
            }
        }else{
            this.setState({
                textForChecks: "Error: Passwords Imperatively must be longer than 8 Characters \n"
            })
        }
    }

    signup = () => {
    //Validation here ensures that user fills in the details correctly. 
        this.setState({
            textForChecks: ""
          })

        let emailTemp = this.state.email
        let passwordTemp = this.state.password
        let nameFirstTemp = this.state.first_name
        let nameLastTemp = this.state.last_name
        let passAltTemp = this.state.alternativePassword

        if(emailTemp != "" && passwordTemp != "" && passAltTemp != "" && 
        nameFirstTemp != "" && nameLastTemp != "" ) {
            if(emailTemp.includes("@")) {  
                if(this.verificationOfPassword()) {
                    if(passAltTemp == passwordTemp) {
                            return fetch(serverBase+"user", {
                                method: 'post',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(this.state)
                            })
                            .then((response) => {
                                if(response.status === 201){
                                    return response.json()
                                }else if(response.status === 400){
                                    throw 'Failed validation';
                                }else{
                                    throw 'Something went wrong';
                                }
                            })
                            .then((responseJson) => {
                                console.log("User created with ID: ", responseJson);
                                this.props.navigation.navigate("Login");
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                        }else {
                            this.setState()({
                                textForChecks: " Error: the Passwords must Match with one another."
                            })
                        }
                    }
                }else{
                    this.setState({
                      textForChecks: "Error: Invalid Email Address. Email Addresses Must contain an @."
                 })
            }
        }else{
            this.setState({
              textForChecks: "Error: Text-Boxes contain missing data."
            })
        }
    }       

    render(){
        return (
            <View>
                <Text style={styles.title}>S P A C E B O O K</Text>
                <Text style={styles.title}>APP</Text>
                <ScrollView>
                    <View style={styles.formItemStyles}>
                    <Text style={styles.formLabelsStyles}>First Name: </Text>
                        <TextInput
                            placeholder="Enter your first name..."
                            style={styles.inputFormStyles}
                            onChangeText={(first_name) => this.setState({first_name})}
                            value={this.state.first_name}
                            //style={{padding:5, borderWidth:1, margin:5}}
                        />
                    </View>  
                    <View style={styles.formItemStyles}>
                    <Text style={styles.formLabelsStyles}>Last Name: </Text>
                        <TextInput
                            placeholder="Enter your last name..."
                            style={styles.inputFormStyles}
                            onChangeText={(last_name) => this.setState({last_name})}
                            value={this.state.last_name}
                            //style={{padding:5, borderWidth:1, margin:5}}
                        />
                    </View>  
                    <View style={styles.formItemStyles}>  
                    <Text style={styles.formLabelsStyles}>Email Address ID: </Text>    
                        <TextInput
                            placeholder="Enter your email..."
                            style={styles.inputFormStyles}
                            onChangeText={(email) => this.setState({email})}
                            value={this.state.email}
                            //style={{padding:5, borderWidth:1, margin:5}}
                        />
                    </View>  
                    <View style={styles.formItemStyles}> 
                    <Text style={styles.formLabelsStyles}>Password: </Text>     
                        <TextInput
                            placeholder="Enter your password..."
                            style={styles.inputFormStyles}
                            onChangeText={(password) => this.setState({password})}
                            value={this.state.password}
                            secureTextEntry
                            //style={{padding:5, borderWidth:1, margin:5}}
                        />
                    </View>      
                    <View style={styles.formItemStyles}> 
                    <Text style={styles.formLabelsStyles}>Password Confirmation: </Text>     
                        <TextInput
                            placeholder="Enter your password again please..."
                            style={styles.inputFormStyles}
                            onChangeText={(alternativePassword) => this.setState({alternativePassword})}
                            value={this.state.alternativePassword}
                            secureTextEntry
                            //style={{padding:5, borderWidth:1, margin:5}}
                        />
                    </View>  
                        <Button
                            title="Create an account"
                            onPress={() => this.signup()}
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
    formLabelsStyles: {
        fontSize:15,
        color:'slateblue'
    },
    formItemStyles: {
      padding:25,
      borderColor: 'slateblue',
      borderRadius: 3.5,
      borderWidth: 1
    },
    inputFormStyles: {
      borderWidth:1,
      borderColor: 'lightblue',
      borderRadius:5,
    }
  })

export default SignupScreen;
