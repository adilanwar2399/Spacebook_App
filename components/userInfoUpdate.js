import React, { Component } from 'react';
import { View, Text, Button, Alert, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBase } from '../App';
import { ScrollView } from 'react-native-web';

class UserUpdateScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            orig_first_name: "",
            orig_last_name: "",
            orig_email: "",
            orig_password: "",
            first_name: "",
            last_name: "",
            email: "",
            password_check: "",
            textForChecks:""
        };
    }
    
    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
          this.checkLoggedIn();
          this.getData();
        });
      
        //this.updateItem();
      }
    
      componentWillUnmount() {
        this.unsubscribe();
      }

      getData = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        const id = await AsyncStorage.getItem('@user_id');
        return fetch("http://localhost:3333/api/1.0.0/user/" + id,{
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
            this.props.navigation.navigate("login");
          }else{
            throw 'Something went wrong';
          }
        })
        .then((responseJson) => {
          this.setState({
            orig_first_name: responseJson.first_name,
            orig_last_name: responseJson.last_name,
            orig_email: responseJson.email,
          })
        })
        .catch((error) => {
          console.log(error);
        })
      }  

    // Here the validation will take place for all the poassible fields that need to be updated.  
    updateUserItem = async () => {

        this.setState({
            textForChecks: ""
        })

        //we need to create two variables for name changes. 
        //That temporarily store the changed names.
        let temporaryStorageString = ""
        let changingFirstName = false
        let changingLastName = false
        let validationAuthorization = true

        let to_send = {};

        if (this.state.first_name != this.state.orig_first_name) {
            to_send['first_name'] = this.state.first_name;
            changingFirstName = true
        }

        if (this.state.last_name != this.state.orig_last_name) {
            to_send['last_name'] = this.state.last_name;
            changingLastName = true;
        }

        if (this.state.email != "" && this.state.email != this.state.orig_email) {
            if(this.state.email.includes("@")){
                to_send['email'] = this.state.email;
              }else{
                temporaryStorageString = temporaryStorageString + "Email doesn't contain an @ symbol \n"
                validationAuthorization = false
              }
        }

        if (this.state.password != this.state.orig_password) {
            to_send['password'] = (this.state.password);
        }

        if(this.state.password_check != "" && this.state.password != ""){
            let temporaryFirstNameStorageString 
            let temporaryLastNameStorageString
      
            if(changingFirstName){
              temporaryFirstNameStorageString = this.state.first_name
            }else{
              temporaryFirstNameStorageString = this.state.orig_first_name
            }
      
            if(changingLastName){
              temporaryLastNameStorageString = this.state.last_name
            }else{
              temporaryLastNameStorageString = this.state.orig_last_name
            }
           //Password Validation using regex - to determine the constraints to update the fields.
            if(this.state.password.length > 8){
                if(/\d/.test(this.state.password)){
                if(/[A-Z]/.test(this.state.password)){
                    if(!this.state.password.includes(temporaryLastNameStorageString) && !this.state.password.includes(temporaryFirstNameStorageString)){
                    if(this.state.password === this.state.password_check){
                        to_send['password'] = this.state.password;
                    }else{
                        temporaryStorageString = temporaryStorageString + ": Error the Passwords that you have entered need to match! \n"
                        validationAuthorization = false
                    }
                    }else{
                    temporaryLastNameStorageString = temporaryLastNameStorageString + ": Error Names can't be used in Passwords \n"
                    validationAuthorization = false
                    }
                }else{
                    temporaryStorageString = temporaryStorageString + ": Passwords Imperatively must contain a Capitalized Letter \n"
                    validationAuthorization = false
                }
                }else{
                temporaryStorageString = temporaryStorageString + ": Passwords Imperatively must contain an Numerical Value (Integer) \n"
                validationAuthorization = false
                }
            }else{
                temporaryStorageString = temporaryStorageString + ": Passwords Imperatively must be longer than 8 Characters \n"
                validationAuthorization = false
            }
            }
  

        console.log(JSON.stringify(to_send));

        const value = await AsyncStorage.getItem('@session_token');
        const userid = await AsyncStorage.getItem('@user_id')
        if(validationAuthorization) {
            return fetch(serverBase+"user/" + userid, {
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    'x-authorization': value,
                },
                body: JSON.stringify(to_send)
            })
                .then((response) => {
                    if(response.status ===200){
                    console.log("Item has been updated successfully") 
                    this.props.navigation.navigate('ProfileScreen')
                    }else if(response.status === 401){
                    this.props.navigation.navigate("login");
                    }else if(response.status === 403){
                    console.log("Error 403: Forbidden Request - Access Deniec")
                    }else if(response.status === 404){
                    console.log("404 Error: Not Found")
                    }else{
                    throw "Something went wrong"
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
            }else {
                this.setState(textForChecks,temporaryStorageString)
            }
    }

    checkLoggedIn = async () => {
        const value = await AsyncStorage.getItem('@session_token');
        if (value == null) {
            this.props.navigation.navigate('Login');
        }
      };

    render(){
        return(
          <View>
             <ScrollView>
                <Text style={styles.title}>S P A C E B O O K</Text>
                <Text style={styles.title}>APP</Text>
        
                <View style={styles.inputFormStyle}>
                <Text style={styles.labelsFormStyle}>First Name</Text>
                <TextInput
                    style={styles.inputFormStyle}
                    onChangeText={(value) => this.setState({first_name: value})}
                    defaultValue={this.state.orig_first_name}
                />
                </View>
        
                <View style={styles.itemsFormstyle}>
                <Text style={styles.labelsFormStyle}>Last Name</Text>
                <TextInput
                    defaultValue={this.state.orig_last_name}
                    onChangeText={(value) => this.setState({last_name: value})}
                />
                </View>
        
                <View style={styles.itemsFormstyle}>
                <Text style={styles.labelsFormStyle}>Email</Text>
                <TextInput
                    style={styles.inputFormStyle}
                    onChangeText={(value) => this.setState({email: value})}
                    defaultValue={this.state.orig_email}
                />
                </View>
        
                <View style={styles.itemsFormstyle}>
                <Text style={styles.labelsFormStyle}>Update Your Password</Text>
                <TextInput
                    style={styles.inputFormStyle}
                    placeholder="Password here"
                    onChangeText={(value) => this.setState({password: value})}
                />
                </View>
        
                <View style={styles.itemsFormstyle}>
                <Text style={styles.labelsFormStyle}> Password Verification</Text>
                <TextInput
                    style={styles.inputFormStyle}
                    placeholder="Password Here"
                    onChangeText={(value) => this.setState({password_check: value})}
                />
                </View>
                <Button
                title="Save Information"
                onPress={() => this.updateUserItem()}
                />
                <Button
                title="Update Profile Photo"
                onPress={() => this.props.navigation.navigate('Photo Capture')}
                />
                
                <Text>{this.state.textForChecks}</Text>
            </ScrollView>    
        </View>
        );
      }
}
const styles = StyleSheet.create({
    title: {
      color:'steelblue',
      backgroundColor:'lightblue',
      padding:10,
      flex: 1,
      justifyContent: 'center',
      fontSize:25
    },
    inputFormStyle: {
        borderWidth:1,
        borderColor: 'lightblue',
        borderRadius:5,
    },
    itemsFormstyle: {
      padding:25,
      borderColor: 'steelblue',
      borderRadius: 3,
      borderWidth: 1
    },
    labelsFormStyle: {
      fontSize:15,
      color:'steelblue'
    },
  })

export default UserUpdateScreen;

    // render() {
    //     return (
    //         <View>
    //             <Text>Update an Item</Text>

    //             <TextInput
    //                 placeholder="Enter first name..."
    //                 onChangeText={(first_name) => this.setState({ first_name })}
    //                 value={this.state.first_name}
    //                 style={{padding:5, borderWidth:1, margin:5}}
    //             />
    //             <TextInput
    //                 placeholder="Enter last name..."
    //                 onChangeText={(last_name) => this.setState({ last_name })}
    //                 value={this.state.last_name}
    //                 style={{padding:5, borderWidth:1, margin:5}}
    //             />
    //             <TextInput
    //                 placeholder="Enter email..."
    //                 onChangeText={(email) => this.setState({ email })}
    //                 value={this.state.email}
    //                 style={{padding:5, borderWidth:1, margin:5}}
    //             />
    //             <TextInput
    //                 placeholder="Enter password..."
    //                 onChangeText={(password) => this.setState({ password })}
    //                 value={this.state.password}
    //                 style={{padding:5, borderWidth:1, margin:5}}
    //             />
    //             <Button
    //                 title="Update"
    //                 onPress={() => this.updateItem()}
    //                 style={{padding:5, borderWidth:1, margin:5}}
    //             />
    //         </View>
    //     );
    // }
