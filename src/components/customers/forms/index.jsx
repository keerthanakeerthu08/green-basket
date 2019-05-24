import AddUser from 'components/customers/forms/AddUser';
import React, { Fragment, PureComponent } from 'react';

class CustomerForms extends PureComponent {

  frameLoad = () => {
    const { match: { params: { formType, pageName } } } = this.props;
    switch (pageName) {
      case "details":      
        return <AddUser formType={formType} props={this.props} />; 
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

export default CustomerForms;