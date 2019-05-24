import OrdersList from 'components/orders/OrderList';
import ViewOrders from 'components/orders/ViewOrders';
import React, { Fragment, PureComponent } from 'react';


// import Statistics from 'components/orders/Statistics'
class Orders extends PureComponent {

  frameLoad = () => {
    const { match: { params: { pageName } } } = this.props;
    switch (pageName) {
      case "order-list":
        return <OrdersList props={this.props} />
      case 'order-view':
        return <ViewOrders props={this.props} />
      // case 'order-statistics':
      //   return <Statistics props={this.props} />
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

export default Orders;