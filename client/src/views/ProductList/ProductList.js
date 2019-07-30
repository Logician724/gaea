import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Grid, Typography } from '@material-ui/core';
import { ProductsToolbar, ProductCard } from './components';
import {database} from '../../firebase-config';
import { NotificationManager} from 'react-notifications';
import CircularProgress from '@material-ui/core/CircularProgress';

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
  const {marketplace, ...rest } = props;

  const [products, setProducts] = useState([]);
  const [limit, setLimit] = useState(6);
  const [numRetrived, setNumRetrived] = useState(0)
  const [order, setOrder] = useState([])
  const [loaded, setLoaded] = useState(false)
  const isAdmin = JSON.parse(localStorage.getItem('gaeaUserData')).isAdmin

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
    
      let products = []
      let counter = 0
      addRef.limitToFirst(limit).once("value")
      .then(snapshot => {
        snapshot.forEach(doc => {
          counter++
          products.push({id: doc.key, title: doc.val().name ,description: doc.val().description, imageUrl: doc.val().imageUrl});
        });
          if(loaded === false)
            setLoaded(true)
          setProducts(products)
          setNumRetrived(counter)
      })
      .catch(err => {
          console.log('Error getting documents', err);
      });

  
    })

  const increment = () => {
    if(limit <= numRetrived) {
      setLimit(limit + 6)
    }
  }

  const makeOrder = async () => {
    console.log('here')
    const orderToSend = {
      order: order,
      address: "bla bla"
    }
    try {
      const doc = await orderRef.push(orderToSend)
      console.log( { message: `doccument ${doc.key} created successfully` })
      NotificationManager.success('Order placed successfully','Success',2000);
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
     { isAdmin?
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
              <ProductCard product={product} order = {order} setOrder = {setOrder} isAdmin={isAdmin} />
            </Grid>
          ))}
        </Grid>
      </div>
      <div className={classes.pagination}>
        <Typography variant="caption">{`1-${numRetrived}`}</Typography>
        <Button
        color="primary"
        onClick={increment}>
          Show More
        </Button>
      </div>
      { isAdmin? null
        :
         <div className={classes.center}>
         <Button
         color="primary"
         variant="contained"
         onClick={makeOrder}>
           Place order
         </Button>
       </div>
      }
     
    </div>

  );
};

export default AdminProductList;
