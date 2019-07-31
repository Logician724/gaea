import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { database } from '../../../../firebase-config';
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

  const { id, order, setOrder, isAmount } = props;
  const classes = useStyles();

  const [values, setValues] = React.useState(0);
  const [locations, setLocations] = React.useState([]);
  const handleChange = (event) => {
    const amount = event.target.value
    const newOrder = order
    newOrder.push({ id: id, amount: amount })
    setOrder(newOrder)
    setValues(amount);

  };

  const handleLocation = (event) => {
    const loc = event.target.value
    setOrder(loc)
    setValues(loc);

  };

  useEffect( () => {
    if (!locations || locations.length === 0) {
      const markersRef = database.ref('map/markers');
      const newLocations = [];
      markersRef.once('value').then(markersSnapshot=> {
        const markers = markersSnapshot.val();
        for(let marker of markers){
          if(marker.iconPath === '/images/dashboard/placemarker.png'){
            newLocations.push({
              value: marker.name,
              label: marker.name
            });
          }
        }
        setLocations(newLocations);
      });
    }
  })

  let choices = []
  if (isAmount === true) {
    choices = amounts
  } else {
    choices = locations
  }

  return (
    <TextField
      className={classes.textField}
      helperText={isAmount ? 'Please select your amount' : 'Please select your location'}
      id={id}
      label="Select"
      margin="normal"
      onChange={isAmount ? handleChange : handleLocation}
      select
      SelectProps={{
        MenuProps: {
          className: classes.menu,
        },
      }}
      value={values}
      variant="outlined"
    >
      {choices.map(option => (
        <MenuItem
          key={option.value}
          value={option.value}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}


export default OptionTextField;
