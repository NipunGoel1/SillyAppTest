import React from "react";
import {
  Text,
  View,
  ScrollView,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import db from "../config.js";

export default class Searchscreen extends React.Component {
  constructor() {
    super();
    this.state = {
      alltransactions: [],
      lastVisibleTransaction: null,
      search: "",
    };
  }
  searchTransactions = async (search) => {
    var enteredText = search.split("");
    if (enteredText[0].toUpperCase() === "B") {
      const transaction = await db
        .collection("Transactions")
        .where("bookId", "==", search)
        .get();
      var filteredList = [];
      console.log(transaction);
      transaction.docs.map((doc) => {
        filteredList.push(doc.data());
        this.setState({
          lastVisibleTransaction: doc,
        });
      });
      this.setState({
        alltransactions: filteredList,
      });
    } else if (enteredText[0].toUpperCase() === "S") {
      const transaction = await db
        .collection("Transactions")
        .where("studentId", "==", search)
        .get();
      transaction.docs.map((doc) => {
        this.setState({
          alltransactions: [doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }
  };

  fetchMoreTransactions = async () => {
    var text = this.state.search;
    var enteredText = text.split("");
    if (enteredText[0].toUpperCase() === "B") {
      const transaction = await db
        .collection("Transactions")
        .where("bookId", "==", text)
        .startAfter(this.state.lastVisibleTransaction)
        .limit(10)
        .get();
      transaction.docs.map((doc) => {
        this.setState({
          alltransactions: [...this.state.alltransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    } else if (enteredText[0].toUpperCase() === "S") {
      const transaction = await db
        .collection("Transactions")
        .where("studentId", "==", text)
        .startAfter(this.state.lastVisibleTransaction)
        .limit(10)
        .get();
      transaction.docs.map((doc) => {
        this.setState({
          alltransactions: [...this.state.alltransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }
  };

  componentDidMount = async () => {
    // const query = await db.collection("Transactions").limit(10).get();
    // query.docs.map((doc) => {
    //   this.setState({
    //     alltransactions: [...this.state.alltransactions, doc.data()],
    //     lastVisibleTransaction: doc,
    //   });
    // });
    // console.log(this.state.alltransactions);
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.bar}
            placeholder="Enter Book Id or Student Id"
            onChangeText={(text) => {
              this.setState({ search: text });
            }}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              this.searchTransactions(this.state.search);
            }}
          >
            <Text>Search</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={this.state.alltransactions}
          renderItem={({ item }) => (
            <View style={{ borderBottomWidth: 2 }}>
              <Text>{"Book Id : " + item.bookId}</Text>
              <Text>{"Student Id : " + item.studentId}</Text>
              <Text>{"Transaction Type: " + item.transactionType}</Text>
              <Text>{"Date: " + item.date.toDate()}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshhold={0.7}
          onEndReached={this.fetchMoreTransactions}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: "row",
    height: 40,
    width: "auto",
    borderWidth: 0.5,
    alignItems: "center",
    backgroundColor: "grey",
  },
  bar: {
    borderWidth: 2,
    height: 30,
    width: 300,
    paddingLeft: 10,
  },
  searchButton: {
    borderWidth: 1,
    height: 30,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "green",
  },
});
