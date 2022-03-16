import React, {Component} from "react";
import {Text, Button, TextInput, View, ScrollView, StyleSheet} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { serverBase } from '../App';

class PostsScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            userID: this.props.route.params.userInfo,
            postID: this.props.route.params.item,
            userName: this.props.route.params.userName,
            // userID: 1,
            // postID: 2,
            dataPosting: [],
            textPosting: "",
            postEditing: false,
            verifiedUser: false,
            updating: false, 
            titleForLikes: "Like", 
            //likesQuantity: 0, 
            textForChecks: "",
            myProfile: false
        }
    }

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
          this.checkLoggedIn();
          this.getPostData();
        });
        if(!this.state.verifiedUser){
            this.likedChecks();
        }

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

    getPostData = async () =>{
        const id = await AsyncStorage.getItem('@user_id')
        const token = await AsyncStorage.getItem('@session_token')
        return fetch(serverBase + "user/" + this.state.userID + "/post/" + this.state.postID, {
            'method': 'get',
            'headers':{
                'X-Authorization': token
            }
        })
        .then((response) => {
            if(response.status === 200){
                return response.json()
            }else if(response.status === 401){
                this.props.navigation.navigate("Login")
            }else if(response.status === 403){
                console.log("Can only view the posts of yourself or your added friends")
            }else if(response.status === 404){
                console.log("404 Error: Not Found")
            }else{
                throw "Something went wrong"
            }
        })
        .then((responseJson) => {
            if(id == responseJson.author.user_id){
                this.setState({
                    dataPosting: responseJson,
                    verifiedUser: true
                })
            }else{
                this.setState({
                    dataPosting: responseJson,
                    verifiedUser: false
                })
            }
            
        })
        .catch((error) => {
            console.log(error)
        })
    }

    postUpdate = async () =>{
        
        this.setState({textForChecks: ""})
        if(this.state.textPosting != ""){
            if(this.state.textPosting != this.state.dataPosting.text){
                //Doesn't need updating
                let to_send = {}
                to_send['text'] = this.state.textPosting
                const token = await AsyncStorage.getItem('@session_token');
                
                console.log(JSON.stringify(to_send))
                return fetch(serverBase + "user/" + this.state.userID + "/post/" + this.state.postID,{
                    'method': 'PATCH',
                    'headers': {
                        'X-Authorization':token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(to_send)
                })
                .then((response) => {
                    if(response.status === 200){
                        console.log('Perfect Response')
                    }else if(response.status === 400){

                    }else if(response.status === 401){
                        this.props.navigation.navigate("Login")
                    }else if(response.status === 403){
                        console.log("You can only update your own posts!")
                    }else if(response.status === 404){
                        console.log("404 Error: Not found")
                    }else{
                        throw "Unexpected Server Error "
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
            }
        }
        else{
            this.setState({textForChecks: "The post can't be updates - as it has zero data"})
        }
    }

    likedChecks = async () =>{
        //Here an instant check is performed to determine whether the post(s) are liked or not
        //What will happen is that the unliked posts will be liked.
        const id = await AsyncStorage.getItem('@user_id')
        const token = await AsyncStorage.getItem('@session_token')
        if(id != this.state.userID){
            return fetch(serverBase+"user/"+this.state.userID+"/post/"+this.state.postID+"/like", {
                'method': 'POST',
                'headers':{
                    'X-Authorization': token
                }
            })
            .then((response) => {
                // if(response.status === 200){
                //     return fetch(serverBase+"user/"+this.state.userID+"/post/"+this.state.postID+"/like", {
                //         'method': 'DELETE',
                //         'headers':{
                //             'X-Authorization': token
                //         }
                //     })
                
                // }else if(response.status === 403 || response.status === 400){
                //     this.setState({
                //         titleForLikes: "unlike"
                //     })
                // }

                if(response.status === 403 || response.status === 400){
                    this.setState({
                        titleForLikes: "unlike"
                    })
                
                }else if (response.status === 200){
                        return fetch(serverBase+"user/"+this.state.userID+"/post/"+this.state.postID+"/like", {
                            'method': 'DELETE',
                            'headers':{
                                'X-Authorization': token
                            }
                        })
                }
                
            })
        }else{
            this.setState({myProfile: true})
        }
    }


    postLike = async () =>{
        let requestForLikes
        if(this.state.titleForLikes =="Like"){
            requestForLikes = "POST"
            this.setState({
                titleForLikes: "Unlike"
            })
        }else{
            requestForLikes ="DELETE"
            this.setState({
                titleForLikes: "Like"
            })
        }

        const token = await AsyncStorage.getItem('@session_token')
        return fetch(serverBase + "user/" + this.state.userID + "/post/" + this.state.postID + "/like", {
            'method': requestForLikes,
            'headers': {
                'X-Authorization': token
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
        .catch((error) => {
            console.log(error)
        })
    }

    postDelete = async () =>{
        //Deletion of the post 
        const token = await AsyncStorage.getItem('@session_token');
        return fetch(serverBase+"user/"+this.state.userID+"/post/"+this.state.postID, {
            'method': 'Delete',
            'headers':{
                'X-Authorization': token
            },
        })
        .then((response) => {
            if(response.status ===200){
                console.log("200: Okay Response")
                this.props.navigation.navigate("ProfileScreen")
            }else if(response.status === 401){
                this.props.navigation.navigate("Login");
            }else if(response.status === 403){
                console.log("403: Only your own posts can be deleted.")
            }else if(response.status === 404){
                console.log("404 Error: Not found")
            }else{
                throw "Something Unexpected happened."
            }
        })
        .catch((error) => {
            console.log(error);
        })
    }

    render(){
        //Here is the ensuring that the user is verified and logged in if that is the case...
        //Then determine whether they can edit their posts or not.
        if(this.state.verifiedUser){
            if(this.state.postEditing){
                return(
                    <View>
                        <ScrollView>
                            <View>
                                <Text style={styles.stylesForLabels}>Notification: Someone has Posted.</Text>
                                <Text style={styles.stylesForLabels}>Posted to {this.state.userName}'s Account Feed.</Text>
                                <Text style={styles.stylesForLabels}>The Post was made by {this.state.authorName}</Text>
                            </View>

                            <TextInput
                                style={styles.styleOfPosts}
                                multiline
                                editable={this.state.postEditing}
                                numberOfLines={4}
                                onChangeText={(value) => this.setState({textPosting: value})}
                                defaultValue={this.state.dataPosting.text}
                            />
                            <Text>{this.state.textForChecks}</Text>
                            <Text style={styles.label}>Likes: {this.state.dataPosting.numLikes}</Text>
                            <Button
                                title="Save"
                                onPress={() => this.postUpdate()}
                            />
                            <Button
                                title="Back"
                                onPress={(value) => this.setState({postEditing: false}, () => this.getPostData())}Yea
                                value={this.state.postEditing}
                            />
                        </ScrollView>
                    </View>

                    // <ScrollView>
                    //     <TextInput
                    //         style={styles.styleOfPosts}
                    //         multiline
                    //         editable={this.state.postEditing}
                    //         numberOfLines={4}
                    //         onChangeText={(value) => this.setState({textPosting: value})}
                    //         defaultValue={this.state.dataPosting.text}
                    //     />
                    //     <Button
                    //         title="Update"
                    //         onPress={(value) => this.setState({postEditing: value})}
                    //         value={this.state.postEditing}
                            
                    //     />
                    //     <Button
                    //         title="Delete"
                    //         onPress={() => this.postDelete()}
                    //     />
                    // </ScrollView>
                )
            }else{
                return(
                    <View>
                        <ScrollView>
                            <View>
                                <Text style={styles.stylesForLabels}>Notification: Someone has Posted.</Text>
                                <Text style={styles.stylesForLabels}>Posted to {this.state.userName}'s Account Feed.</Text>
                                <Text style={styles.stylesForLabels}>The Post was made by {this.state.authorName}</Text>
                            </View>

                            <TextInput
                                style={styles.styleOfPosts}
                                multiline
                                editable={this.state.postEditing}
                                numberOfLines={4}
                                onChangeText={(value) => this.setState({textPosting: value})}
                                defaultValue={this.state.dataPosting.text}
                            />
                            <Text style={styles.label}>Likes: {this.state.dataPosting.numLikes}</Text>
                            <Button
                                title="Update"
                                onPress={(value) => this.setState({postEditing: value})}
                                value={this.state.postEditing}
                                
                            />
                            <Button
                                title="Delete"
                                onPress={() => this.postDelete()}
                            />
                        </ScrollView>
                    </View>
                    // <ScrollView>
                    //     <TextInput
                    //         style={styles.styleOfPosts}
                    //         multiline
                    //         editable={this.state.postEditing}
                    //         numberOfLines={4}
                    //         onChangeText={(value) => this.setState({textPosting: value})}
                    //         defaultValue={this.state.dataPosting.text}
                    //     />
                    //     <Text>{this.state.textForChecks}</Text>
                    //     <Button
                    //         title="Save"
                    //         onPress={() => this.postUpdate()}
                    //     />
                    //     <Button
                    //         title="Back"
                    //         onPress={(value) => this.setState({postEditing: false}, () => this.getPostData())}Yea
                    //         value={this.state.postEditing}
                    //     />
                    // </ScrollView>
                )
            }
        }else{
            if(this.state.myProfile){
                return(
                    <View>
                        <ScrollView>
                            <View>
                                <Text style={styles.stylesForLabels}>Notification: Someone has Posted.</Text>
                                <Text style={styles.stylesForLabels}>Posted to {this.state.userName}'s Account Feed.</Text>
                                <Text style={styles.stylesForLabels}>The Post was made by {this.state.authorName}</Text>
                            </View>

                            <TextInput
                                style={styles.styleOfPosts}
                                multiline
                                editable={false}
                                numberOfLines={4}
                                defaultValue={this.state.dataPosting.text}
                            />
                            <Text style={styles.label}> Number of Likes: {this.state.postData.numLikes}</Text>
                        </ScrollView>
                    </View>
                    // <ScrollView>
                    //     <TextInput
                    //         style={styles.styleOfPosts}
                    //         multiline
                    //         editable={false}
                    //         numberOfLines={4}
                    //         defaultValue={this.state.dataPosting.text}
                    //     />
                    //     <Button
                    //         title={this.state.titleForLikes}
                    //         onPress={() => this.postLike()}
                    //     />
                    // </ScrollView>
                )
            }else{
                return(
                    <View>
                        <ScrollView>
                            <View>
                                <Text style={styles.stylesForLabels}>Notification: Someone has Posted.</Text>
                                <Text style={styles.stylesForLabels}>Posted to {this.state.userName}'s Account Feed.</Text>
                                <Text style={styles.stylesForLabels}>The Post was made by {this.state.authorName}</Text>
                            </View>

                            <TextInput
                                style={styles.styleOfPosts}
                                multiline
                                editable={false}
                                numberOfLines={4}
                                defaultValue={this.state.dataPosting.text}
                            />
                            <Button
                                title={this.state.titleForLikes}
                                onPress={() => this.postLike()}
                            />
                            <Text style={styles.label}> Number of Likes: {this.state.postData.numLikes}</Text>
                        </ScrollView>
                    </View>
                    // <ScrollView>
                    //     <TextInput
                    //         style={styles.styleOfPosts}
                    //         multiline
                    //         editable={false}
                    //         numberOfLines={4}
                    //         defaultValue={this.state.dataPosting.text}
                    //     />
                    // </ScrollView>
                )
            }
        }
    }
}

const styles = StyleSheet.create({
    stylesForLabels: {
        fontSize:20,
        color:'slateblue'
    },
    styleOfPosts: {
        borderWidth:2,
        borderColor: 'lightblue',
        borderRadius:5,
      }
})

export default PostsScreen;