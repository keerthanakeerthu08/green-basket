
import React, { PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';

import Dashboard from 'components/dashboard';
import ProductStatusDetails from 'components/dashboard/products';
import Orders from 'components/orders';
import Catalog from 'components/catalog';
import CatalogForms from 'components/catalog/forms';
import Customer from 'components/customers';
import Banner from 'components/banner';
import Contact from 'components/contact';
// import Profile from 'components/profile';
import ProductDetails from 'components/dashboard/products';
import CustomerForms from 'components/customers/forms';
import Configuration from 'components/configuration';

import HomeSettings from 'components/homesettings'

class Routes extends PureComponent {
  render() {
    return (
      <Switch>
        <Route path='/' exact component={Dashboard} />
        <Route path='/dashboard' exact component={Dashboard} />
        <Route path='/dashboard/:pageName' exact component={ProductStatusDetails} />
        <Route path='/orders/:pageName' exact component={Orders} />
        <Route path='/catalog/:pageName' exact component={Catalog} />
        <Route path='/catalog/:pageName/:formType' exact component={CatalogForms} />
        <Route path='/customer/home/config' exact component={HomeSettings} /> 
        <Route path='/customer/:pageName' exact component={Customer} />
        <Route path='/banner/:pageName' exact component={Banner} />
        <Route path='/contact/:pageName' exact component={Contact} />
        {/* <Route path='/profile/:pageName' exact component={Profile} /> */}
        <Route path='/dashboard/productdetails' exact component={ProductDetails} />
        <Route path='/customer/:pageName/:formType' exact component={CustomerForms} />


        <Route path='/project/config' exact component={Configuration} />
      </Switch>
    );
  }
}

export default Routes;