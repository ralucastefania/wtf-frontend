import React, { useEffect, useState } from "react";
import ReactMapGL, {
  Marker,
  Popup,
  NavigationControl,
  WebMercatorViewport,
} from "react-map-gl";
import {
  Badge,
  Typography,
  Container,
  Card,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { HomeIcon, HotelIcon, BalloonIcon, CityIcon, FoodIcon } from "./Icons";
import MenuIcon from "@material-ui/icons/Menu";

import { useMapContext } from "../context/map-context";

import { useStyles } from "../Layout/useStyles";
import "mapbox-gl/dist/mapbox-gl.css";

const mapboxAccessToken = process.env.REACT_APP_API_KEY;

function Result() {
  const classes = useStyles();

  const {
    middlePoint,
    peopleCoordinates,
    boundsCoordinates,
    closestCity,
    hotels,
    restaurants,
    filteredBounds,
  } = useMapContext();

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [copySuccess, setCopySuccess] = useState(0);
  const [viewport, setViewport] = useState({
    latitude: middlePoint.latitude,
    longitude: middlePoint.longitude,
    zoom: 10,
  });
  const [filterMenu, setFilterMenu] = useState(false);
  const [filter, setFilter] = useState({
    location: false,
    hotels: false,
    restaurants: false,
  });

  const navControlStyle = {
    right: 10,
    top: 10,
  };

  useEffect(() => {
    // changing view port on the map to have all the markers visible
    if (boundsCoordinates) {
      const { longitude, latitude, zoom } = new WebMercatorViewport(
        viewport
      ).fitBounds(
        [
          [boundsCoordinates.minLng, boundsCoordinates.minLat],
          [boundsCoordinates.maxLng, boundsCoordinates.maxLat],
        ],
        {
          padding: { top: 100, bottom: 50, left: 50, right: 50 },
        }
      );
      setViewport({
        ...viewport,
        longitude,
        latitude,
        zoom,
      });
    } else {
      setViewport({
        ...viewport,
        latitude: middlePoint.latitude,
        longitude: middlePoint.longitude,
      });
    }
  }, [middlePoint, boundsCoordinates]);

  function copyToClipboard() {
    const el = document.createElement("input");
    // el.value = `${selectedMarker.latitude}, ${selectedMarker.longitude}, ${selectedMarker.address}`;
    el.value = `${selectedMarker.address}`;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    setCopySuccess("Copied!");
    document.body.removeChild(el);
    setTimeout(() => {
      setCopySuccess(0);
    }, 3000);
  }

  function handleClickFilterMenu() {
    setFilterMenu(!filterMenu)
  }

  function handleChangeFilter(e) {
    setFilter({ ...filter, [e.target.name]: !filter[e.target.name] });
  }

  function handleClickFilter() {
    if (filter.hotels || filter.restaurants) {
      if (filteredBounds) {
        const { longitude, latitude, zoom } = new WebMercatorViewport(
          viewport
        ).fitBounds(
          [
            [filteredBounds.minLng, filteredBounds.minLat],
            [filteredBounds.maxLng, filteredBounds.maxLat],
          ],
          {
            padding: { top: 100, bottom: 50, left: 50, right: 50 },
          }
        );
        setViewport({
          ...viewport,
          longitude,
          latitude,
          zoom,
        });
      } else {
        setViewport({
          ...viewport,
          latitude: middlePoint.latitude,
          longitude: middlePoint.longitude,
          zoom: 12,
        });
      }
    } else {
      setViewport({
        ...viewport,
        latitude: middlePoint.latitude,
        longitude: middlePoint.longitude,
        zoom: 12,
      });
    }
  }

console.log(closestCity);
  
  return (
    <Container maxWidth="lg">
      <Card className={classes.cardMap}>
        <Card className={classes.cardFilter}>
          <MenuIcon onClick={handleClickFilterMenu}/>
          {filterMenu && (
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Filter:</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filter.location}
                      onChange={handleChangeFilter}
                      name="location"
                    />
                  }
                  label="Closest city"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filter.hotels}
                      onChange={handleChangeFilter}
                      name="hotels"
                    />
                  }
                  label={`Hotels (${hotels.length ? hotels.length : "0"})`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filter.restaurants}
                      onChange={handleChangeFilter}
                      name="restaurants"
                    />
                  }
                  label={`Restaurants (${hotels.length ? hotels.length : "0"})`}
                />
              </FormGroup>
              <Button
                onClick={handleClickFilter}
                variant="contained"
                color="primary"
              >
                Take me there
              </Button>
            </FormControl>
          )}
        </Card>
        <ReactMapGL
          {...viewport}
          mapboxApiAccessToken={mapboxAccessToken}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          width="100%"
          height="100%"
          onViewportChange={(viewport) => setViewport(viewport)}
        >
          <NavigationControl style={navControlStyle} />

          <Marker
            className={classes.marker}
            latitude={middlePoint.latitude}
            longitude={middlePoint.longitude}
            offsetTop={-50}
            offsetLeft={-25}
            className={classes.middlePointIcon}
            onClick={(e) => {
              e.preventDefault();
              setSelectedMarker(middlePoint);
            }}
          >
            <BalloonIcon />
          </Marker>
          {filter.hotels &&
            hotels.map((hotel, index) => (
              <Marker
                className={classes.markerFilter}
                latitude={hotel.latitude}
                longitude={hotel.longitude}
                offsetTop={-50}
                offsetLeft={-25}
                key={`${index}hotel`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedMarker(hotel);
                }}
              >
                <HotelIcon />
              </Marker>
            ))}

          {filter.restaurants &&
            restaurants.map((restaurant, index) => (
              <Marker
                className={classes.markerFilter}
                latitude={restaurant.latitude}
                longitude={restaurant.longitude}
                offsetTop={-50}
                offsetLeft={-25}
                key={`${index}hotel`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedMarker(restaurant);
                }}
              >
                <FoodIcon />
              </Marker>
            ))}

          {peopleCoordinates.map((el, index) => {
            return (
              <Marker
                className={classes.marker}
                key={index}
                latitude={el.latitude}
                longitude={el.longitude}
                offsetTop={-50}
                offsetLeft={-25}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedMarker(el);
                }}
              >
                <HomeIcon />
              </Marker>
            );
          })}

          {selectedMarker && (
            <Popup
              latitude={selectedMarker.latitude}
              longitude={selectedMarker.longitude}
              closeButton={true}
              closeOnClick={false}
              onClose={() => setSelectedMarker(null)}
              anchor="left"
              tipSize={20}
            >
              <Badge
                badgeContent={copySuccess}
                color="primary"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <div onClick={copyToClipboard}>
                  <Typography>Press to copy</Typography>
                  <Typography>
                    {selectedMarker.address}
                    {/* ,{selectedMarker.latitude},
                      {selectedMarker.longitude} */}
                  </Typography>
                </div>
              </Badge>
            </Popup>
          )}
        </ReactMapGL>
      </Card>
    </Container>
  );
}

export default Result;
