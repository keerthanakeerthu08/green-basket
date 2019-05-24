import UserFeedBack from 'components/customers/FeedBack';
import UserDetails from 'components/customers/UserDetails';
import React, { Fragment, PureComponent } from 'react';


class Customers extends PureComponent {

  frameLoad = () => {
    const { match: { params: { pageName } } } = this.props;
    switch (pageName) {
      case "details":
        return <UserDetails props={this.props} />
      case 'feedback':
        return <UserFeedBack props={this.props} />
      default:
        return;
    }
  }

  render() {
    return (
      <Fragment>
        {this.frameLoad()}
      </Fragment>
    )
  }
}

export default Customers;