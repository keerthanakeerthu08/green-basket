import ProductDetails from 'components/dashboard/products/productDetails';
import ViewProductDetails from 'components/dashboard/products/viewProducts';
import React, { Fragment, PureComponent } from 'react';



class ProductStatusDetails extends PureComponent {
    frameLoad = () => {
        const { match: { params: { pageName } } } = this.props;
        switch (pageName) {
            case "product-details":
                return <ProductDetails props={this.props} />
            case "product-status":
                return <ProductDetails props={this.props} />
            case "view-product-status":
                return <ViewProductDetails props={this.props} />
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

export default ProductStatusDetails;