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
            textForChecks: ""
        };
    }
    
    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
          this.checkLoggedIn();
          this.getData();
        });
      
        //this.updateUserItem();
      }
    
      componentWillUnmount() {
        this.unsubscribe();
      }

      getData = async () => {
        const token = await AsyncStorage.getItem('@session_token');
        const id = await AsyncStorage.getItem('@user_id');
        return fetch( serverBase+"user/" + id,{
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

        // Password Validation Checks to see whether the Password is a new one or not.
        if (this.state.password != this.state.orig_password) {
            to_send['password'] = (this.state.password);
        }

        // Checks to see whether the password is empty or not; 
        // if it is empty then check to see whether the passwords have names inside it.
        // If any one of the first names or second names are inside it then the passwords can't be updated.
        if(this.state.password_check != "" && this.state.password != ""){
            
            let temporaryFirstNameStorageString 
            let temporaryLastNameStorageString
            let passwordMain = this.state.password
            let passwordCheck = this.state.passwordCheck
      
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
           
            //Password Validation using regex which allows the user to input the data
            // in the field textboxes correctly - min 8 characters for password
            // Capitalised letters from [A-Z} will be used atleast once, 
            // Digits ranging from 0-9 will be used. 
            // Temp variables storing last name and first names.

            if(passwordMain.length > 8){
                if(/\d/.test(passwordMain)){
                    if(/[A-Z]/.test(passwordMain)){
                        if(!passwordMain.includes(temporaryLastNameStorageString) && !passwordMain.includes(temporaryFirstNameStorageString)){
                            if(passwordMain === passwordCheck){
                                to_send['password'] = passwordMain;
                            }else{
                                temporaryStorageString = temporaryStorageString + " Error: Error the Passwords that you have entered need to match! \n"
                                validationAuthorization = false
                            }
                        }else{
                        temporaryLastNameStorageString = temporaryLastNameStorageString + " Error: Error Names can't be used in Passwords \n"
                        validationAuthorization = false
                        }
                    }else{
                        temporaryStorageString = temporaryStorageString + "Error: Passwords Imperatively must contain a Capitalized Letter [A-Z] \n"
                        validationAuthorization = false
                    }
                }else{
                temporaryStorageString = temporaryStorageString + "Error: Passwords Imperatively must contain an Numerical Value [1-9] (Integer) \n"
                validationAuthorization = false
                }
            }else{
                temporaryStorageString = temporaryStorageString + "Error: Passwords Imperatively must be longer than 8 Characters \n"
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
                this.setState({textForChecks:temporaryStorageString})
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
        
                <View style={styles.itemsFormStyle}>
                <Text style={styles.labelsFormStyle}>First Name</Text>
                <TextInput
                    style={styles.inputFormStyle}
                    onChangeText={(value) => this.setState({first_name: value})}
                    defaultValue={this.state.orig_first_name}
                />
                </View>
        
                <View style={styles.itemsFormStyle}>
                <Text style={styles.labelsFormStyle}>Last Name</Text>
                <TextInput
                    defaultValue={this.state.orig_last_name}
                    onChangeText={(value) => this.setState({last_name: value})}
                />
                </View>
        
                <View style={styles.itemsFormStyle}>
                <Text style={styles.labelsFormStyle}>Email</Text>
                <TextInput
                    style={styles.inputFormStyle}
                    onChangeText={(value) => this.setState({email: value})}
                    defaultValue={this.state.orig_email}
                />
                </View>

                <View style={styles.itemsFormStyle}>
                <Text style={styles.labelsFormStyle}>Update Your Password</Text>
                <TextInput
                    style={styles.inputFormStyle}
                    placeholder="Password here"
                    onChangeText={(value) => this.setState({password: value})}
                />
                </View>
                <Button
                title="Update Display Photo"
                onPress={() => this.props.navigation.navigate('Photo Capture')}
                />
                <Button
                title="Save Information"
                onPress={() => this.updateUserItem()}
                />
                <Text>{this.state.textForChecks}</Text>
            </ScrollView>    
        </View>
        );
      }
}
const styles = StyleSheet.create({
    title: {
      fontSize: 25,
      color:'slateblue',
      backgroundColor:'lightblue',
      padding:10,
      flex: 1,
      justifyContent: 'center',
    },
    inputFormStyle: {
        borderWidth:1,
        borderRadius:5,
        borderColor: 'lightblue',
    },
    itemsFormStyle: {
      padding: 25,
      borderColor: 'slateblue',
      borderRadius: 3,
      borderWidth: 1
    },
    labelsFormStyle: {
      fontSize:18,
      color:'slateblue'
    }
  })

export default UserUpdateScreen;
