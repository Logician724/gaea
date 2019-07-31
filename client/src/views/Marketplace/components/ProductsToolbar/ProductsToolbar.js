import React from 'react';
import { useRef } from 'react'
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle  } from '@material-ui/core';
import { NotificationManager} from 'react-notifications';

import {database} from '../../../../firebase-config';

const marketplaceRef = database.ref('marketplace');

const useStyles = makeStyles(theme => ({
  root: {},
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  }
}));

const ProductsToolbar = props => {
  const { className, ...rest } = props;

  let addRef = marketplaceRef
   

  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const nameRef = useRef(null)
  const descRef = useRef(null)
  const urlRef = useRef(null)

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleClose= () => {
    setOpen(false);
  }

  const handleAdd = () => {
    const name = nameRef.current.value
    const description = descRef.current.value
    const url = urlRef.current.value
    console.log(`Name: ${name} Description: ${description} Url: ${url}`)
    const result = addRecyclingMaterial(name, description, url)
    console.log(result)
    setOpen(false);
  }

  const addRecyclingMaterial = async (name, desc, url) => {
    const newRecyclingMaterial = {
      name: name,
      description: desc,
      imageUrl: url
    }
  
    try {
      const doc = await addRef.push(newRecyclingMaterial)
      console.log( { message: `doccument ${doc.key} created successfully` })
      NotificationManager.success('Item added successfully','Success',2000);
    } catch (err) {
      console.log(err)
      NotificationManager.error('Something went wrong, try again in a bit.','Error',2000);
    }
  }

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <div className={classes.row}>
        <span className={classes.spacer} />
        <Button
          color="primary"
          onClick={handleClickOpen}
          variant="contained"
        >
          Add product
        </Button>

        <Dialog
          aria-labelledby="form-dialog-title"
          onClose={handleClose}
          open={open}
        >
          <DialogTitle id="form-dialog-title">Add Item</DialogTitle>
          <DialogContent>
            <DialogContentText>
            Please add the item name, decription and an image url
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              id="name"
              inputRef= {nameRef}
              label="Name"
              margin="dense"
              type="string"
            />
            <TextField
              autoFocus
              fullWidth
              id="description"
              inputRef={descRef}
              label="Description"
              margin="dense"
              type="string"
            />
            <TextField
              autoFocus
              fullWidth
              id="url"
              inputRef={urlRef}
              label="Image Url"
              margin="dense"
              type="string"
            />

          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={handleClose}
            >
            Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleAdd}
            >
            Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      {/* <div className={classes.row}>
        <SearchInput
          className={classes.searchInput}
          placeholder="Search product"
        />
      </div> */}
    </div>
  );
};

ProductsToolbar.propTypes = {
  className: PropTypes.string
};

export default ProductsToolbar;
