import React, {useState, useEffect} from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {ScatterplotLayer} from '@deck.gl/layers';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';

import loanData_a from './complete-loan-data/loans_a.json';
import loanData_b from './complete-loan-data/loans_b.json';
import loanData_c from './complete-loan-data/loans_c.json';
import loanData_d from './complete-loan-data/loans_d.json';
import loanData_e from './complete-loan-data/loans_e.json';

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
    padding: '10px',
    margin: '10px'
  },
  legend: {
    top: '1000px'
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
  dataChunks = [loanData_a.features, loanData_b.features, loanData_c.features, loanData_d.features, loanData_e.features],
  radius = 2500,
  mapStyle = 'mapbox://styles/mapbox/dark-v9'
}) {
  const [hoverInfo, setHoverInfo] = useState({});
  const [visibility, setVisibility] = useState({
    a: true,
    b: true,
    c: true,
    d: true,
    e: true
  });

  const handleChange = (event) => {
    setVisibility({ ...visibility, [event.target.id]: event.target.checked });
  };

  const classes = useStyles();

  const layers = dataChunks.map( (dataChunk, index) => {

    return new ScatterplotLayer({
      id: 'chunk-' + index,
      data: dataChunk,
      visible: visibility[dataChunk[0].properties.LoanRange.charAt(0)],

      // props added by Scatterplot
      getPosition: d => [d.geometry.coordinates[1], d.geometry.coordinates[0]],
      getFillColor: d => getColor(d.properties.LoanRange),
      getRadius: radius,
      radiusMinPixels: 1,
      radiusMaxPixels: 4,
      stroked: true,
      pickable: true,
      onClick: info => console.log(dataChunk),
      onHover: info => setHoverInfo(info)

    });
  });

  return (
    <>
      <DeckGL layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
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
            control={<Switch checked={visibility.a} onChange={handleChange} id="a" />}
            label="$5-10 million"
          />
          <FormControlLabel
            control={<Switch checked={visibility.b} onChange={handleChange} id="b" />}
            label="$2-5 million"
          />
          <FormControlLabel
            control={<Switch checked={visibility.c} onChange={handleChange} id="c" />}
            label="$1-2 million"
          />
          <FormControlLabel
            control={<Switch checked={visibility.d} onChange={handleChange} id="d" />}
            label="$350,000-1 million"
          />
          <FormControlLabel
            control={<Switch checked={visibility.e} onChange={handleChange} id="e" />}
            label="$150,000-350,000"
          />
        </FormGroup>
      </FormControl>
    </>
  );
}
