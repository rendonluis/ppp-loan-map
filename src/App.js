import React, {useState, useEffect} from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {ScatterplotLayer} from '@deck.gl/layers';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';
import "firebase/database";
var firebase = require("firebase/app");

// Set the configuration for firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Viewport settings
const INITIAL_VIEW_STATE = {
    latitude: 39.8283,
    longitude: -98.5795,
    zoom: 4,
    bearing: 0,
    pitch: 0
  };

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

// Colors for each Loan Range
const COLORS = {
  a: [228,26,28],
  b: [55,126,184],
  c: [77,175,74],
  d: [152,78,163],
  e: [255,127,0]
}

const useStyles = makeStyles({
  root: {
    background: 'white',
    border: 0,
    borderRadius: 3,
    padding: '20px',
    margin: '10px',
  },
  legend: {
    position: 'fixed',
    top: '15px',
    fontSize: '14px'
  },
  tooltip: {
    position: 'absolute',
    pointerEvents: 'none',
    backgroundColor: 'white',
    padding: '6px 8px',
    font: '14px/16px Arial, Helvetica, sans-serif',
    background: 'rgba(255,255,255,0.8)',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    borderRadius: '5px',
  },

});

function getColor(b) {
    let tier = b.charAt(0);
    return tier === 'a' ? COLORS.a :
           tier === 'b'  ? COLORS.b :
           tier === 'c'  ? COLORS.c :
           tier === 'd'  ? COLORS.d :
           tier === 'e'   ? COLORS.e :
                      '#252525';
}

export default function App({
  radius = 2500,
  mapStyle = 'mapbox://styles/mapbox/dark-v9'
}) {

  const [hoverInfo, setHoverInfo] = useState({});
  const [data, setData] = useState([]);
  const [visibility, setVisibility] = useState({
    '0': true,
    '1': true,
    '2': true,
    '3': true,
    '4': true
  });

  useEffect( () => {
    firebase.database().ref('/a/features').once('value').then(function(snapshot) {
      setData(prevData => 
        [...prevData, snapshot.val()]
      );
    });
    firebase.database().ref('/b/features').once('value').then(function(snapshot) {
      setData(prevData => 
        [...prevData, snapshot.val()]
      );
    });
    firebase.database().ref('/c/features').once('value').then(function(snapshot) {
      setData(prevData => 
        [...prevData, snapshot.val()]
      );
    });
    firebase.database().ref('/d/features').once('value').then(function(snapshot) {
      setData(prevData => 
        [...prevData, snapshot.val()]
      );
    });
    firebase.database().ref('/e/features').once('value').then(function(snapshot) {
      setData(prevData => 
        [...prevData, snapshot.val()]
      );
    });
  }, []);

  const handleChange = (event) => {
    setVisibility({ ...visibility, [event.target.id]: event.target.checked });
  };

  const classes = useStyles();

  return (
    <>
      <DeckGL layers={data.map( (dataChunk, index) => {
        return new ScatterplotLayer({
          id: 'chunk-' + index,
          data: dataChunk,
          visible: visibility[index],
          // props added by Scatterplot
          getPosition: d => [d.geometry.coordinates[1], d.geometry.coordinates[0]],
          getFillColor: d => getColor(d.properties.LoanRange),
          getRadius: radius,
          radiusMinPixels: 1,
          radiusMaxPixels: 4,
          stroked: true,
          pickable: true,
          onHover: info => setHoverInfo(info)
          });
        })}
      initialViewState={INITIAL_VIEW_STATE} controller={true}>
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        />
        {hoverInfo.object && (
              <div className={classes.tooltip} style={{top: hoverInfo.y, left: hoverInfo.x}}>
                <h4 style={{margin: '0'}}>{hoverInfo.object.properties.BusinessName}</h4>
                <br /> <b>Business Type:</b> {hoverInfo.object.properties.BusinessType}
                <br /> <b>Loan Amount:</b> {hoverInfo.object.properties.LoanRange.substring(1)}
                <br /> <b>Lender:</b> {hoverInfo.object.properties.Lender}
                <br /> <b>Gender:</b> {hoverInfo.object.properties.Gender}
                <br /> <b>Race/Ethnicity:</b> {hoverInfo.object.properties.RaceEthnicity}
              </div>)
        }        
      </DeckGL>

      <FormControl component="fieldset" className={classes.root}>
        <FormLabel component="legend" className={classes.legend}>Reveal Loan Type</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={visibility[0]} onChange={handleChange} id="0" />}
            label="$5-10 million"
          />
          <FormControlLabel
            control={<Switch checked={visibility[1]} onChange={handleChange} id="1" />}
            label="$2-5 million"
          />
          <FormControlLabel
            control={<Switch checked={visibility[2]} onChange={handleChange} id="2" />}
            label="$1-2 million"
          />
          <FormControlLabel
            control={<Switch checked={visibility[3]} onChange={handleChange} id="3" />}
            label="$350,000-1 million"
          />
          <FormControlLabel
            control={<Switch checked={visibility[4]} onChange={handleChange} id="4" />}
            label="$150,000-350,000"
          />
        </FormGroup>
        <FormHelperText>{data.length !== 5 && 'Loading... ' + (data.length*20).toString() + '%'}</FormHelperText>
      </FormControl>
    </>
  );
}
