import React, {Component} from "react";
import {Text, Button, TextInput, View, ScrollView, StyleSheet} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { serverBase } from '../App';

class PostsScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            userID: this.props.route.params.userInfo,
            userName: this.props.route.params.userName,
            // userID: 1,
            // postID: 2,
            dataPosting: [],
            textPosting: "",
            postEditing: false,
            postID: this.props.route.params.item,
            //To see whether the user is verified or not.
            verifiedUser: false,
            updating: false, 
            titleForLikes: "Like", 
            //likesQuantity: 0, 
            textForChecks: "",
            myProfile: false,
           // numLikes: ""
            
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
                console.log(responseJson)
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
        const token = await AsyncStorage.getItem('@session_token')
        const id = await AsyncStorage.getItem('@user_id')
        if(id != this.state.userID){
            return fetch(serverBase+"user/"+this.state.userID+"/post/"+this.state.postID+"/like", {
                'method': 'POST',
                'headers':{
                    'X-Authorization': token
                }
            })
            .then((response) => {
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

    likePosts = async (user_id, post_id) => {
        const value = await AsyncStorage.getItem('@session_token');
        const valueId = await AsyncStorage.getItem('@user_id');
            return fetch(serverBase + "user/" +valueId+ "/post/" +post_id+ "/like", {
            method: 'Post',
            headers: {
                'X-Authorization': value 
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
        .then((responseJson) => {
            console.log('Liked: ', responseJson)
        })
        .catch((error) => {
            console.log(error)
        })
    }

    unLikePosts = async (user_id, post_id) => {
        const value = await AsyncStorage.getItem('@session_token');
        const idValue = await AsyncStorage.getItem('@user_id');
        return fetch(serverBase + "user/" +idValue+ "/post/" +post_id+ "/like", {
          method: 'Delete',
          headers: {
            'X-Authorization': value 
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
        .then((responseJson) => {
            console.log('Un-Liked: ', responseJson)
        })
        .catch((error) => {
            console.log(error)
        })
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
                                <Text style={styles.stylesForLabels}>
                                    Notification: Post has been made to..
                                </Text>
                                <Text style={styles.stylesForLabels}>
                                    {this.state.userName}'s Account Feed.
                                </Text>
                                <Text style={styles.stylesForLabels}>
                                    The Post was made by {this.state.authorName}
                                </Text>
                            </View>

                            <TextInput style={styles.styleOfPosts}
                                multiline // ensures that the user text imput accepts multiple lines
                                editable={this.state.postEditing} // checks whether the text is editable or not
                                numberOfLines={10} // the maximum number of lines the text input can store
                                onChangeText={(value) => this.setState({textPosting: value})}
                                defaultValue={this.state.dataPosting.text}
                            />
                            <Text>
                                {this.state.textForChecks}
                            </Text>
                            <Text 
                                style={styles.stylesForLabels}>Likes: {this.state.dataPosting.numLikes}
                            </Text>
                            <Button style = {styles.buttonStyle}
                                title="Save"
                                onPress={() => this.postUpdate()}
                            />
                            <Button style = {styles.buttonStyle}
                                title="Back"
                                onPress={(value) => this.setState({postEditing: false}, () => this.getPostData())}Yea
                                value={this.state.postEditing}
                            />
                        </ScrollView>
                    </View>
                )
            }else{
                return(
                    <View>
                        <ScrollView>
                            <View>
                                <Text style={styles.stylesForLabels}>
                                    Notification: Someone has Posted.
                                </Text>
                                <Text style={styles.stylesForLabels}>
                                    Posted to {this.state.userName}'s Account Feed.
                                </Text>
                                <Text style={styles.stylesForLabels}>
                                    The Post was made by {this.state.authorName}
                                </Text>
                            </View>

                            <TextInput style={styles.styleOfPosts}
                                multiline // ensures that the user text imput accepts multiple lines
                                editable={this.state.postEditing} // checks whether the text is editable or not
                                numberOfLines={10} // the maximum number of lines the text input can store
                                onChangeText={(value) => this.setState({textPosting: value})}
                                defaultValue={this.state.dataPosting.text}
                            />
                            <Text style={styles.stylesForLabels}>
                                Likes: {this.state.dataPosting.numLikes}
                            </Text>
                            <Button style = {styles.buttonStyle}
                                title="Update"
                                onPress={(value) => this.setState({postEditing: value})}
                                value={this.state.postEditing}
                                
                            />
                            <Button style = {styles.buttonStyle}
                                title="Delete"
                                onPress={() => this.postDelete()}
                            />
                        </ScrollView>
                    </View>
                )
            }
        }else{
            if(this.state.myProfile){
                return(
                    <View>
                        <ScrollView>
                            <View>
                                <Text style={styles.stylesForLabels}>
                                    Notification: Someone has Posted.
                                </Text>
                                <Text style={styles.stylesForLabels}>
                                    Posted to {this.state.userName}'s Account Feed.
                                </Text>
                                <Text style={styles.stylesForLabels}>
                                    The Post was made by {this.state.authorName}
                                </Text>
                            </View>

                            <TextInput style={styles.styleOfPosts}
                                multiline // ensures that the user text imput accepts multiple lines
                                editable={this.state.postEditing} // checks whether the text is editable or not
                                numberOfLines={10} // the maximum number of lines the text input can store
                                defaultValue={this.state.dataPosting.text}
                            />
                            <Text style={styles.stylesForLabels}> 
                                Number of Likes: {this.state.dataPosting.numLikes}
                            </Text>
                        </ScrollView>
                    </View>
                )
            }else{
                return(
                    <View>
                        <ScrollView>
                            <View>
                                <Text style={styles.stylesForLabels}>
                                    Notification: Someone has Posted.
                                </Text>
                                <Text style={styles.stylesForLabels}>
                                    Posted to {this.state.userName}'s Account Feed.
                                </Text>
                                <Text style={styles.stylesForLabels}>
                                    The Post was made by {this.state.authorName}
                                </Text>
                            </View>

                            <TextInput style={styles.styleOfPosts}
                                multiline // ensures that the user text imput accepts multiple lines
                                editable={this.state.postEditing} // checks whether the text is editable or not
                                numberOfLines={10} // the maximum number of lines the text input can store
                                defaultValue={this.state.dataPosting.text}
                            />
                            <Button
                                title={this.state.titleForLikes}
                                onPress={() => this.postLike()}
                            />
                            <Text style={styles.stylesForLabels}> 
                                Number of Likes: {this.state.dataPosting.numLikes}
                            </Text>
                        </ScrollView>
                    </View>
         
                )
            }
        }
    }
}

const styles = StyleSheet.create({
    styleOfPosts: {
        borderWidth:2,
        borderColor: 'lightblue',
        borderRadius:5,
    },
    stylesForLabels: {
        fontSize: 16,
        color:'slateblue'
    },
    buttonStyle: {
        color: 'steelblue'

    }
})

export default PostsScreen;
