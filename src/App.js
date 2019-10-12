import React from "react";
import "./App.css";
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";

import Axios from "axios";

import Sidebar from "react-sidebar";

import "@trendmicro/react-sidenav/dist/react-sidenav.css";

//global list
let finalList = [];
class App extends React.Component {
  //states used in the App
  state = {
    value: 500,
    months: 6,
    interest: 0,
    monthlyPayment: 0,
    sidebarOpen: false,
    list: []
  };

  //checking for whether the dataList is available in the local storage or not
  componentWillMount = () => {
    localStorage.getItem("dataList") &&
      this.setState({
        list: JSON.parse(localStorage.getItem("dataList")),
        value: JSON.parse(localStorage.getItem("recentlyUsedAmount")),
        months: JSON.parse(localStorage.getItem("recentlyUsedMonth")),
        interest: JSON.parse(localStorage.getItem("recentlyUsedInterest")),
        monthlyPayment: JSON.parse(
          localStorage.getItem("recentlyUsedMonthlyPayment")
        )
      });
  };

  //changes the state of the amount entered as well as does the api call for fetching the data
  amountChange = value => {
    this.setState({ value });
    if (this.state.months) {
      this.apiCall(value);
    }
  };
  //changes the state of the month entered as well as does the api call for fetching the data
  monthChange = value => {
    this.setState({ months: value });
    if (this.state.value) {
      this.apiCall(value);
    }
  };

  //function for opening of sidebar
  onSetSidebarOpen = open => {
    this.setState({ sidebarOpen: open });
  };

  //function for fetching the data from the api
  apiCall = value => {
    let month = this.state.months;
    let amount = this.state.value;
    if (value >= 500) {
      amount = value;
    } else {
      month = value;
    }

    // conditions for whether the value of amount and month are being changed or not  and then fetching data from the given API
    if (amount > 0 && month > 0) {
      Axios.get(
        `https://ftl-frontend-test.herokuapp.com/interest?amount=${amount}&numMonths=${month}`
      ).then(res => {
        let interestRate = res.data.interestRate;
        let monthlyPayment = res.data.monthlyPayment.amount;

        //this object contains the recently used values inputted by the user
        let obj = {
          amount,
          month,
          interestRate,
          monthlyPayment
        };

        //pushing the object created above to the global array and then setting the state accordingly
        finalList.push(obj);
        this.setState({ list: finalList });

        //local storage is set here
        localStorage.setItem("dataList", JSON.stringify(finalList));
        localStorage.setItem("recentlyUsedAmount", JSON.stringify(amount));
        localStorage.setItem("recentlyUsedMonth", JSON.stringify(month));
        localStorage.setItem(
          "recentlyUsedInterest",
          JSON.stringify(interestRate)
        );
        localStorage.setItem(
          "recentlyUsedMonthlyPayment",
          JSON.stringify(monthlyPayment)
        );

        this.setState({
          interest: interestRate,
          monthlyPayment: monthlyPayment
        });
      });
    } else {
      console.log("you have not entered the value ");
    }
  };

  // sets the value to be displayed over the sidebar
  sideBarOptionsClick = (amount, month, interestRate, monthlyPayment) => {
    this.setState({
      value: amount,
      months: month,
      interest: interestRate,
      monthlyPayment: monthlyPayment
    });
  };

  render() {
    return (
      <div className="App" style={{ margin: "80px auto" }}>
        <div
          style={{
            background: "white",
            margin: "auto",
            width: "700px",
            height: "600px",
            padding: "20px 20px",
            boxShadow: "0 10px 20px 3px #777"
          }}
        >
          <div>
            {/* SIDEBAR UI  */}
            <Sidebar
              sidebar={
                <div>
                  <h1>Records Made till Now:</h1>
                  <br />
                  {this.state.list.map(i => {
                    return (
                      <div>
                        <p
                          onClick={() =>
                            this.sideBarOptionsClick(
                              i.amount,
                              i.month,
                              i.interestRate,
                              i.monthlyPayment
                            )
                          }
                        >
                          Month:{i.month} | Amount:{i.amount}
                        </p>
                      </div>
                    );
                  })}
                </div>
              }
              open={this.state.sidebarOpen}
              onSetOpen={this.onSetSidebarOpen}
              styles={{ sidebar: { background: "white", width: "200px" } }}
            >
              <br />
              SideBar Here
              <button
                className="circle"
                onClick={() => this.onSetSidebarOpen(true)}
              >
                +
              </button>
            </Sidebar>

            {/* MAIN UI  */}

            <h1 style={{ textAlign: "center", fontWeight: "60px" }}>
              Loan Calculator
            </h1>
            <h2 style={{ textAlign: "center" }}>Enter the Loan Amount </h2>
            <InputRange
              step={50}
              formatLabel={value => `${value}$`}
              maxValue={5000}
              minValue={500}
              value={this.state.value}
              // onChange={value => this.setState({ value })}
              onChange={this.amountChange}
            />
            <br />
            <h2 style={{ textAlign: "center" }}>Enter the Duration</h2>
            <InputRange
              step={1}
              maxValue={24}
              minValue={6}
              value={this.state.months}
              onChange={this.monthChange}
            />
            <br />
            <h2>Your Entered Amount is ${this.state.value}</h2>
            <h2>YourEntered Duration is {this.state.months} months</h2>
            <br />
            <h2>Interest Rate : {this.state.interest}</h2>
            <h2>Monthly Payment : {this.state.monthlyPayment}</h2>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
