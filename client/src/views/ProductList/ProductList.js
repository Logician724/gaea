import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Grid, Typography } from '@material-ui/core';
import { ProductsToolbar, ProductCard } from './components';
import {database} from '../../firebase-config';


const recyclingMaterialRef = database.ref('recyclingMaterial');

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
  }
}));

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [limit, setLimit] = useState(6);
  const [numRetrived, setNumRetrived] = useState(0)
  const classes = useStyles();
  useEffect(() => {
    
      let products = []
      let counter = 0
      recyclingMaterialRef.limitToLast(limit).once("value")
      .then(snapshot => {
        snapshot.forEach(doc => {
          counter++
          products.push({id: doc.key, title: doc.val().name ,description: doc.val().description});
        });
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

  const decrement = () => {
    if(limit !== 6) {
      setLimit(limit - 6)
    }
  }
  
  return (
    <div className={classes.root}>
      <ProductsToolbar />
      <div className={classes.content}>
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
              <ProductCard product={product} />
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
    </div>
  );
};

export default AdminProductList;
