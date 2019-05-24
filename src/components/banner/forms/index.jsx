import AddBanner from 'components/banner/forms/AddBanner';
import React, { Fragment, PureComponent } from 'react';

class BannerForms extends PureComponent {


  frameLoad = () => {
    return <AddBanner  props={this.props}  />
  }
  render() {
    return (
      <Fragment>
        {this.frameLoad()}
      </Fragment>
    )
  }
}

export default BannerForms;