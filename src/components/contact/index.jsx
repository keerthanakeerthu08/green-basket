import ContactList from 'components/contact/ContactList';
import AddContact from 'components/contact/forms';
import ViewDetails from 'components/contact/ViewDetails';
import React, { Fragment, PureComponent } from 'react';


class Contact extends PureComponent {


  frameLoad = () => {
    const { match: { params: { pageName } } } = this.props;
    switch (pageName) {
      case 'list':
        return <ContactList props={this.props} />
      case 'addform':
        return <AddContact props={this.props} />
      case 'editform':
        return <AddContact props={this.props} />
      case 'viewform':
        return <ViewDetails props={this.props} />
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

export default Contact;