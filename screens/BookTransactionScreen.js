import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import firebase from "firebase";
import db from "../config";
export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedBookId: "",
      scannedStudentId: "",
      buttonState: "normal",
    };
  }

  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
      hasCameraPermissions: status === "granted",
      buttonState: id,
      scanned: false,
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const { buttonState } = this.state;

    if (buttonState === "BookId") {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: "normal",
      });
    } else if (buttonState === "StudentId") {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: "normal",
      });
    }
  };

  checkStudentEligibilityForBookIssue = async () => {
    console.log(
      "checkStudentEligibilityForBookIssue executed " +
        this.state.scannedStudentId
    );
    const studentRef = await db
      .collection("Students")
      .where("studentId", "==", this.state.scannedStudentId)
      .get();
    var isStudentEligible = "";
    if (studentRef.docs.length == 0) {
      isStudentEligible = false;
      Alert.alert("The Student doesnt exist in the db");
      this.setState({
        scannedBookId: "",
        scannedStudentId: "",
      });
    } else {
      studentRef.docs.map((doc) => {
        var student = doc.data();
        console.log(student);
        if (student.booksIssued < 2) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          Alert.alert("The Student already issued two books");
          this.setState({
            scannedBookId: "",
            scannedStudentId: "",
          });
        }
      });
    }
    return isStudentEligible;
  };

  checkStudentEligibilityForBookReturn = async () => {
    console.log(
      "checkStudentEligibilityForBookReturn executed " +
        this.state.scannedStudentId
    );
    const transactionref = await db
      .collection("Transactions")
      .where("bookId", "==", this.state.scannedBookId)
      .limit(1)
      .get();
    var isStudentEligible = "";

    transactionref.docs.map((doc) => {
      var transaction = doc.data();
      console.log(transaction);
      if (transaction.studentId == this.state.scannedStudentId) {
        isStudentEligible = true;
      } else {
        isStudentEligible = false;
        Alert.alert("The book was issued by some other student");
        this.setState({
          scannedBookId: "",
          scannedStudentId: "",
        });
      }
    });

    return isStudentEligible;
  };

  checkBookEligibility = async () => {
    console.log("checkBookEligibility executed");
    const bookRef = await db
      .collection("Books")
      .where("bookId", "==", this.state.scannedBookId)
      .get();
    var transactionType = "";
    if (bookRef.docs.length == 0) {
      transactionType = false;
    } else {
      bookRef.docs.map((doc) => {
        var book = doc.data();
        console.log(book);
        if (book.bookAvailability) {
          transactionType = "Issue";
        } else {
          transactionType = "Return";
        }
      });
    }
    return transactionType;
  };
  handleTransaction = async () => {
    try {
      var transactiontype = await this.checkBookEligibility();
      console.log(transactiontype);
      if (!transactiontype) {
        Alert.alert("The book doesnt exist in the db");

        this.setState({
          scannedBookId: "",
          scannedStudentId: "",
        });
      } else if (transactiontype === "Issue") {
        var isStudentEligible =
          await this.checkStudentEligibilityForBookIssue();
        if (isStudentEligible) {
          this.initiateBookIssue();
          Alert.alert("The book issued to the student");
        }
      } else if (transactiontype === "Return") {
        var isStudentEligible =
          await this.checkStudentEligibilityForBookReturn();
        if (isStudentEligible) {
          this.initiateBookReturn();
          Alert.alert("The book was returned to the library");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  initiateBookIssue = () => {
    console.log("Issue executed");
    try {
      //transaction collection
      db.collection("Transactions").add({
        studentId: this.state.scannedStudentId,
        bookId: this.state.scannedBookId,
        transactionType: "Issue",
        date: firebase.firestore.Timestamp.now().toDate(),
      });

      //books collection change bookAvailability
      db.collection("Books").doc(this.state.scannedBookId).update({
        bookAvailability: false,
      });

      //student collection noOfIssued +1
      db.collection("Students")
        .doc(this.state.scannedStudentId)
        .update({
          booksIssued: firebase.firestore.FieldValue.increment(1),
        });
    } catch (error) {
      console.log(error);
    }
  };
  initiateBookReturn = () => {
    console.log("Return executed");
    try {
      db.collection("Transactions").add({
        studentId: this.state.scannedStudentId,
        bookId: this.state.scannedBookId,
        transactionType: "Return",
        date: firebase.firestore.Timestamp.now().toDate(),
      });

      //books collection change bookAvailability
      db.collection("Books").doc(this.state.scannedBookId).update({
        bookAvailability: true,
      });

      //student collection noOfIssued +1
      db.collection("Students")
        .doc(this.state.scannedStudentId)
        .update({
          booksIssued: firebase.firestore.FieldValue.increment(-1),
        });
    } catch (error) {
      console.log(error);
    }
  };
  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;

    if (buttonState !== "normal" && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === "normal") {
      return (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
          enabled
        >
          <View>
            <Image
              source={require("../assets/booklogo.jpg")}
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ textAlign: "center", fontSize: 30 }}>Wily</Text>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={(text) => {
                this.setState({
                  scannedBookId: text,
                });
              }}
              value={this.state.scannedBookId}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions("BookId");
              }}
            >
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={(text) => {
                this.setState({
                  scannedStudentId: text,
                });
              }}
              value={this.state.scannedStudentId}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions("StudentId");
              }}
            >
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={async () => {
              var transactionMessage = await this.handleTransaction();
            }}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  displayText: {
    fontSize: 15,
    textDecorationLine: "underline",
  },
  scanButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 10,
  },
  buttonText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
  },
  inputView: {
    flexDirection: "row",
    margin: 20,
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20,
  },
  scanButton: {
    backgroundColor: "#66BB6A",
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
  },
  submitButton: {
    backgroundColor: "#FBC02D",
    width: 100,
    height: 50,
  },
  submitButtonText: {
    padding: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});
