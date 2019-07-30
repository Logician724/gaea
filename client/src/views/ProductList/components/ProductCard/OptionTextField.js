import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  dense: {
    marginTop: theme.spacing(2),
  },
  menu: {
    width: 200,
  },
}));

const amounts = [
  {
    value: 0,
    label: '0',
  },
  {
    value: 1,
    label: '1',
  },
  {
    value: 2,
    label: '2',
  },
  {
    value: 3,
    label: '3',
  },
  {
    value: 4,
    label: '4',
  },
  {
    value: 5,
    label: '5',
  },
];

const OptionTextField = props => {

  const {id, order, setOrder, ...rest } = props;
  const classes = useStyles();

  const [values, setValues] = React.useState(0);
  const handleChange = (event) => {
    const amount = event.target.value
    if(amount !== 0){
      const newOrder = order
      newOrder.push({id: id, amount: amount})
      setOrder(newOrder)
      console.log(order)
      setValues(amount);
    }
    
  };

  return ( 
 <TextField
        id={id}
        select
        label="Select"
        className={classes.textField}
        value={values}
        onChange={handleChange}
        SelectProps={{
          MenuProps: {
            className: classes.menu,
          },
        }}
        helperText="Please select your amount"
        margin="normal"
        variant="outlined"
      >
        {amounts.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      );
    }

OptionTextField.propTypes = {
  id: PropTypes.string.isRequired,
  order: PropTypes.array.isRequired,
  setOrder: PropTypes.func.isRequired
};

export default OptionTextField;
