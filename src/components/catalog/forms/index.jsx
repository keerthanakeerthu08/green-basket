import AddCatagory from 'components/catalog/forms/AddCatagory';
import AddOffer from 'components/catalog/forms/AddOffer';
import AddProduct from 'components/catalog/forms/AddProduct';
import React, { Fragment, PureComponent } from 'react';

class CatalogForms extends PureComponent {

  frameLoad = () => {
    const { match: { params: { formType, pageName } } } = this.props;

    switch (pageName) {
      case "catagory":
        return <AddCatagory formType={formType} props={this.props} />;
      case "product":
        return <AddProduct formType={formType} props={this.props} />;
      case "offers":
        return <AddOffer formType={formType} props={this.props} />;
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

export default CatalogForms;