import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import { makeStyles } from '@material-ui/styles';
import {withRouter} from 'react-router-dom';
import {
  Card,
  CardActions,
  CardContent,
  Avatar,
  Typography,
  Divider,
  Button,
  LinearProgress
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {},
  details: {
    display: 'flex'
  },
  avatar: {
    marginLeft: 'auto',
    height: 110,
    width: 100,
    flexShrink: 0,
    flexGrow: 0
  },
  progress: {
    marginTop: theme.spacing(2)
  },
  uploadButton: {
    marginRight: theme.spacing(2)
  }
}));

const AccountProfile = props => {
  const { className, history, ...rest } = props;

  const classes = useStyles();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    state: 'Cairo',
    city: 'Cairo',
    country: 'Egypt',
    type: false
  });

  useEffect(() => {
    if (!(userData && userData.email)) {
      const userData = JSON.parse(localStorage.getItem('gaeaUserData'));
      if (!userData) {
        return history.push('/sign-in');
      }
      setUserData({
        ...userData,
        phone: '',
        state: 'Cairo',
        city: 'Cairo',
        country: 'Egypt'
      });
    }
  }, [userData]);

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <div className={classes.details}>
          <div>
            <Typography
              gutterBottom
              variant="h2"
            >
              {`${userData.firstName} ${userData.lastName}`}
            </Typography>
            <Typography
              className={classes.locationText}
              color="textSecondary"
              variant="body1"
            >
              {
                
                `Account type: ${userData.type ? 'Admin' : 'User'}`
              }
            </Typography>
            <Typography
              className={classes.dateText}
              color="textSecondary"
              variant="body1"
            />
            <Typography
              className={classes.locationText}
              color="textSecondary"
              variant="body1"
            >
              {userData.city}, {userData.country}
            </Typography>
            <Typography
              className={classes.dateText}
              color="textSecondary"
              variant="body1"
            >
              {moment().format('hh:mm A')} ({userData.timezone})
            </Typography>
          </div>
          <Avatar
            className={classes.avatar}
            src={userData.avatar}
          />
        </div>
        <div className={classes.progress}>
          <Typography variant="body1">Profile Completeness: 70%</Typography>
          <LinearProgress
            value={70}
            variant="determinate"
          />
        </div>
      </CardContent>
      <Divider />
      <CardActions>
        <Button
          className={classes.uploadButton}
          color="primary"
          variant="text"
        >
          Upload picture
        </Button>
        <Button variant="text">Remove picture</Button>
      </CardActions>
    </Card>
  );
};

AccountProfile.propTypes = {
  className: PropTypes.string
};

export default withRouter(AccountProfile);
