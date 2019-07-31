import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Grid, Typography } from '@material-ui/core';
import { ProductsToolbar, ProductCard } from './components';
import {database} from '../../firebase-config';
import { NotificationManager} from 'react-notifications';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withRouter} from 'react-router-dom';
import OptionTextField from './components/ProductCard/OptionTextField'

const recyclingMaterialRef = database.ref('recyclingMaterial');
const marketplaceRef = database.ref('marketplace')

const recyclingorderRef = database.ref('recyclingOrders')
const marketplaceorderRef = database.ref('marketplaceOrders')

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  pagination: {
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  center : {
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  progress: {
    margin: theme.spacing(2),
  },
}));

const AdminProductList = props => {
  const {marketplace, history } = props;
  const [products, setProducts] = useState([]);
  const [location, setLocation] = useState('');
  const [limit, setLimit] = useState(6);
  const [numRetrived, setNumRetrieved] = useState(0)
  const [order, setOrder] = useState([])
  const [loaded, setLoaded] = useState(false)
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
      console.log('here: ', userData)
      setUserData({
        ...userData,
        phone: '',
        state: 'Cairo',
        city: 'Cairo',
        country: 'Egypt'
      });
    }
  }, [userData]);

  let addRef = null
  let orderRef = null
  if(marketplace === true) {
    addRef = marketplaceRef
    orderRef = marketplaceorderRef
  } else {
    addRef = recyclingMaterialRef
    orderRef = recyclingorderRef
  }

  const classes = useStyles();
  useEffect(() => {
    if(!products || products.length == 0){
      let products = []
      let counter = 0
      addRef.limitToFirst(limit).once('value')
        .then(snapshot => {
          snapshot.forEach(doc => {
            counter++
            products.push({id: doc.key, title: doc.val().name ,description: doc.val().description, imageUrl: doc.val().imageUrl});
          });
          if(loaded === false){
            setLoaded(true);
          }
          setProducts(products);
          setNumRetrieved(counter);
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });

    }
  
  })

  const increment = () => {
    if(limit <= numRetrived) {
      setLimit(limit + 6)
    }
  }

  const makeOrder = async () => {
    const orderToSend = {
      order: order,
      address: location
    }
    try {
      const doc = await orderRef.push(orderToSend)
      console.log( { message: `doccument ${doc.key} created successfully` });
      localStorage.setItem('gaeaOrder', JSON.stringify(orderToSend));
      NotificationManager.success('Order placed successfully','Success',2000);
      history.push('/map');
    } catch (err) {
      console.log(err)
      NotificationManager.error('Something went wrong, try again in a bit.','Error',2000);
    }
  }

  if(!loaded)
    return (
      <div className={classes.root}>
        <div className={classes.center}>
          <CircularProgress className={classes.progress} />
        </div>
      </div>
    )
  
  return (
    <div className={classes.root}>
      { userData.isAdmin?
        <ProductsToolbar marketplace={marketplace} />
        : null
      }
      <div className={classes.content}>
        <Grid className={classes.center}>

          {
            products.length === 0?
              <h1>Nothing to display</h1>
              : null
          
          }
        </Grid>
        <Grid
          container
          spacing={3}
        >
          {products.map(product => (
            <Grid
              item
              key={product.id}
              lg={4}
              md={6}
              xs={12}
            >
              <ProductCard
                isAdmin={userData.isAdmin}
                order = {order}
                product={product}
                setOrder = {setOrder}

              />
            </Grid>
          ))}
        </Grid>
      </div>
      <div className={classes.pagination}>
        <Typography variant="caption">{`1-${numRetrived}`}</Typography>
        <Button
          color="primary"
          onClick={increment}
        >
          Show More
        </Button>
      </div>
      { userData.isAdmin? null
        :
        <div className={classes.center}>
          <OptionTextField
            id={null}
            isAmount={false}
            order={location}
            setOrder={setLocation}
          />
          <Button
            color="primary"
            onClick={makeOrder}
            variant="contained"
          >
           Place order
          </Button>
        </div>
      }
     
    </div>

  );
};

export default withRouter(AdminProductList);
