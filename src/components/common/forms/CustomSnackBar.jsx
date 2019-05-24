import Snackbar from '@material-ui/core/Snackbar';
import React, { Fragment, PureComponent } from 'react';


class CustomSnackBar extends PureComponent {
  render() {
    const { open, message, varient } = this.props;
    return (
      <Fragment>
        <Snackbar
          // anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={open}
          onClose={this.handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
            'className': `bg-${varient}`
          }}
          autoHideDuration={2000}
          message={<span id="message-id">{message}</span>}
        />
      </Fragment>
    )
  }
}

export default CustomSnackBar;