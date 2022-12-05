import { useEffect, useRef, useState } from 'react'
import './App.css';

let apiKey = 'AIzaSyA882ZOQshxE8c-NQIZ1MtxuYiGJcSK5IY'
let mapApi = 'https://maps.googleapis.com/maps/api/js'
let geocodeJson = 'https://maps.googleapis.com/maps/api/geocode/json';

function loadAsyncScript(src) {

  return new Promise(resolve => {
    const script = document.createElement("script");

    Object.assign(script, {
      type: 'text/javascript',
      async: true,
      src
    })


    script.addEventListener('load', () => resolve(script));
    document.head.appendChild(script)

  })
}

const extractAddress = (place) => {
  const address = {
    city: "",
    state: "",
    zip: "",
    country: "",

    plain() {
      const city = this.city ? this.city : "";
      const state = this.state ? this.state : "";
      const zip = this.zip ? this.zip : "";
      return city + state + zip + this.country
    }
  }

  if (!Array.isArray(place.address_components)) {
    return address
  }

  place.address_components.forEach(component => {

    const types = component.types;
    const value = component.long_name;


    if (types.includes("locality")) {
      address.city = value;
    }

    if (types.includes("admisitrative_area_level_2")) {
      address.state = value;
    }

    if (types.includes("postal_code")) {
      address.zip = value;
    }
    if (types.includes("country")) {
      address.country = value;
    }



  });
  console.log('address', address)

  return address;

}


function App() {

  const searcInput = useRef(null)
  const [address, setAddress] = useState({ city: "", state: "", zip: "", country: "" })

  // init map script
  const initMapScript = () => {

    // if script already loaded
    if (window.google) {
      return Promise.resolve();
    }

    const src = `${mapApi}?key=${apiKey}&libraries=places&v=weekly`;
    return loadAsyncScript(src)
  }

  const onChangeAddress = async (autocomplete) => {
    const location = autocomplete.getPlace();
    const exact = await extractAddress(location)
    console.log(exact, 'exact')
    setAddress(extractAddress(location))

  }

  // init autoComplete
  const initAutoComplete = () => {

    if (!searcInput.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(searcInput.current);


    autocomplete.setFields(["address_component", "geometry"])
    autocomplete.addListener("place_changed", () => onChangeAddress(autocomplete))
  }


  const reverseGeocode = ({ latitude: lat, longitude: lng }) => {
    const url = `${geocodeJson}?key=${apiKey}&latlng=${lat},${lng}`;

    searcInput.current.value = 'getting my current address...'

    fetch(url)
      .then((res) => res.json())
      .then((location) => {
        const place = location.results[0];
        const _address = extractAddress(place)
        setAddress(_address)
        searcInput.current.value = _address.plain();
      })
  }


  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        reverseGeocode(position.coords)
      })
    }
  }

  // load map script after mouted
  useEffect(() => {
    initMapScript().then((res) => initAutoComplete())
  }, [])

  return (
    <div className="App">
      <div>
        <div className='search'>
          <input type="text" ref={searcInput} placeholder="Search place here" />
          <button onClick={findMyLocation}>find loaction</button>
        </div>

        <div></div>
        <p>City : {address.city} </p>
        <p>State : {address.state} </p>
        <p>Zip : {address.zip} </p>
        <p>Country : {address.country} </p>
      </div>
    </div>
  );
}

export default App;
