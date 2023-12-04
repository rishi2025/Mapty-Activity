'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];

const inputDistance = document.querySelector('.inpdistance');
const inputDuration = document.querySelector('.inpduration');
const inputCadence = document.querySelector('.inpcadence');
const inputElevation = document.querySelector('.inpelev');
const workoutParent = document.querySelector('.workoutParent');
const inputType = document.querySelector('.inpType');

class App {

    #map;
    #mapEvent;

    constructor() {
        this._getPosition();

        const form = document.querySelector('.workoutInput');
        form.addEventListener('submit', this._newWorkout.bind(this));

        inputType.addEventListener('change', this._toggleElevationField.bind(this));
    }


    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() {
                alert('Location Access not Enabled.')
            });
        }
        else
            alert('Web Browser not compatible.');
    }


    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const link = `https://www.google.com/maps/@${latitude},${longitude}`;

        const cords = [latitude, longitude];

        console.log(this);
        this.#map = L.map('map').setView(cords, 13);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Clicks on map
        this.#map.on('click', this._showForm.bind(this));
    }


    _showForm(mapE) {
        this.#mapEvent = mapE;

        // Rendering input form
        workoutParent.classList.remove('hidden');
        inputDistance.focus();
    }


    _toggleElevationField() {
        inputElevation.closest('.formCell').classList.toggle('hide');
        inputCadence.closest('.formCell').classList.toggle('hide');
    }


    _newWorkout(e) {
        // Preventing auto reload on form submission
        e.preventDefault();

        // clearing input fields
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';

        // Marking the cordinates
        const { lat, lng } = this.#mapEvent.latlng;
        L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup'
            }))
            .setPopupContent('Workout')
            .openPopup();
    }
}

const app = new App();