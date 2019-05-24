import Feedback from 'components/common/forms/feedlocation';
import Footers from 'components/common/forms/Footers';
import Headers from 'components/common/forms/Headers';
import Location from 'components/common/forms/location';
import PaymentStatus from 'components/payment/PaymentStatus';
import Cart from 'components/user/form/Cart';
import ChangePassword from 'components/user/form/Changepassword';
import Details from 'components/user/form/Details';
import Orders from 'components/user/form/Order';
import UserDashboard from 'components/user/form/userDashboard';
import Home from 'components/user/form/userHome';
import Wishlist from 'components/user/form/Wishlist';
import React, { Fragment, PureComponent } from 'react';
import { getCurrentUser, getJwt } from 'service/authService';
import { searchProduct } from 'service/catalogService';
import { getProductsbyId } from 'service/dashboardService';



class User extends PureComponent {

  state = {
    data: [],
    categoryId: '',
    isLogedIn: false
  }

  componentDidMount = async () => {
    await this.getUserInfo();
  }


  getUserInfo = async () => {
    try {
      if (this.stateCheck()) {
        let res = await getJwt('__info');
        const { userRole } = res;
        await this.setState({ isLogedIn: true, userRole });
      }
    }
    catch (err) {
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

  async catagoryId(id) {
    await this.setState({ categoryId: id });

    this.getProducts(id)
  }

  getProducts = async (categoryid) => {
    let params = `categoryId=${categoryid}`
    let res = await getProductsbyId(params)
    if (res.data.statusCode === 1) {
      await this.setState({ data: res.data.data });
    } else {
      await this.setState({ data: [] })
    }
  }


  frameLoad = () => {
    const { data } = this.state;
    const { match: { params: { pageName } } } = this.props;
    switch (pageName) {
      case 'home':
        return <Home props={this.props} />;
      case 'profile':
        return <Details props={this.props} />;
      case 'orders':
        return <Orders props={this.props} />;
      case 'cart':
        return <Cart props={this.props} />;
      case 'payment':
        return <PaymentStatus props={this.props} />;
      case 'wishlist':
        return <Wishlist props={this.props} />;
      case 'changepassword':
        return <ChangePassword props={this.props} />;
      default:
        return <UserDashboard props={this.props} data={data} />
    }
  }

  searchProdItems = async (term) => {
    const { history } = this.props;
    const res = await searchProduct(term);
    const { data: { data } } = res;
    await this.setState({ data });
    history.replace(`search?ref=${term}`)
  }

  render() {
    const { isLogedIn } = this.state
    return (
      <Fragment>
        <Headers props={this.props} onClick={(id) => this.catagoryId(id)} onChange={(term) => this.searchProdItems(term)} />
        <div>
          {this.frameLoad()}
        </div>
        <Footers props={this.props} onClick={(id) => this.catagoryId(id)} />
        {isLogedIn && <Feedback />}
        <Location />
      </Fragment>
    )
  }
}

export default User;