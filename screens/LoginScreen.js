import * as React from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Image,
  Alert
} from "react-native";

export default class LoginScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      emailId: "",
      password: "",
    };
  }
  login = async (email, password) => {
    console.log(email + password)
    if(email && password){
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        console.log("Success")
        this.props.navigation.navigate("Transaction");
        Alert.alert("Login successfull")
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        Alert.alert(errorCode)
        console.log(errorCode)
        switch (error.code) {
          case "auth/user-not-found":
            Alert.alert("user doesnt exists");
          case "auth/invalid-email":
            Alert.alert("incorrect email or password");
        }
        var errorMessage = error.message;
      });
    }else{
      Alert.alert("Enter email and password correctly");
    }
  };
  render() {
    return (
      <KeyboardAvoidingView style = {{alignItems:'center',marginTop:20}}>
        <View>
          <Image source={require("../assets/booklogo.jpg")} style = {{width:70, height:70}} />
          <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
        </View>
        <View>
          <TextInput
            style={styles.loginBox}
            placeholder="abc@example.com"
            keyboardType="email-address"
            onChangeText={(text) => {
              this.setState({
                emailId: text,
              });
            }}
          />
          <TextInput
            style={styles.loginBox}
            placeholder="Enter Password"
            secureTextEntry={true}
            onChangeText={(text) => {
              this.setState({
                password: text,
              });
            }}
          />
        </View>
        <View>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              this.login(this.state.emailId, this.state.password);
            }}
          >
            <Text style={{ textAlign: "center" }}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  loginBox: {
    width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin: 10,
    paddingLeft: 10,
  },
  loginButton: {
    height: 30,
    width: 90,
    borderWidth: 1,
    marginTop: 20,
    paddingTop: 5,
    borderRadius: 7,
  },
});
