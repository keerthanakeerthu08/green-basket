import Auth from 'auth';
import { loadProgressBar } from 'axios-progress-bar';
import ServerError from 'components/common/forms/servererror';
import User from 'components/user';
import Wrapper from 'components/Wrapper';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { getCurrentUser, getJwt } from 'service/authService';


class App extends PureComponent {

  state = {
    isLogedIn: false,
    isWrapper: false,
    isUser: true
  }

  componentDidMount = async () => {
    await this.verifyUser();
    await this.getUserInfo();
    await loadProgressBar()
  }


  verifyUser = async () => {
    const isStateCheck = this.stateCheck();
    if (!isStateCheck) {
    } else {
      await this.setState({ isUser: false })
    }
  }

  stateCheck = async () => {
    try {
      let isLogedIn = getCurrentUser();
      return isLogedIn;
    } catch (err) {
      return false;
    }
  }

  getUserInfo = async () => {
    try {
      if (this.stateCheck()) {
        let res = await getJwt('__info');
        const { userRole } = res;
        switch (userRole) {
          case 'A':
          case 'D':
            await this.setState({ isUser: false, isWrapper: true, isLogedIn: true, userRole });
            return;
          case 'U':
            await this.setState({ isUser: true, isWrapper: false, isLogedIn: true, userRole });
            return;
          default:
            await this.setState({ isUser: true, isWrapper: false, isLogedIn: false, userRole });
            break;
        }
      }
    }
    catch (err) {
    }
  }

  render() {
    const { isWrapper, isUser, isLogedIn, userRole } = this.state;
    return (
      <Fragment>

        {isWrapper && !isUser && isLogedIn && <Wrapper userRole={userRole} />}
        {!isWrapper && <Switch>
          <Redirect from="/" to="/user/home" exact component={User} />
          <Route path='/' exact component={User} />
          <Route path='/auth/:pageName' exact component={Auth} />
          <Route path='/user/:pageName' exact component={User} />
          <Route path='/Error' exact component={ServerError} />
        </Switch>

        }
      </Fragment>
    );
  }
}



export default withSnackbar(App);
