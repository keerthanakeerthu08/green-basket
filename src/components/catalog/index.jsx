import CatagoryList from 'components/catalog/CatagoryList';
import OfferList from 'components/catalog/OfferList';
import ProductList from 'components/catalog/ProductList';
import React, { Fragment, PureComponent } from 'react';


class Catalog extends PureComponent {


  async componentWillMount() {
  }

  frameLoad = () => {
    const { match: { params: { pageName } } } = this.props;
    switch (pageName) {
      case 'categories':
        return <CatagoryList props={this.props} />
      case 'products':
        return <ProductList  props={this.props} />
      case 'offers':
        return <OfferList  props={this.props} />
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

export default Catalog;