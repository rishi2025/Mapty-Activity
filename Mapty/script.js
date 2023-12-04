'use strict';

const inputDistance = document.querySelector('.inpdistance');
const inputDuration = document.querySelector('.inpduration');
const inputCadence = document.querySelector('.inpcadence');
const inputElevation = document.querySelector('.inpelev');
const workoutParent = document.querySelector('.workoutParent');
const inputType = document.querySelector('.inpType');

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(cords, distance, duration) {
        this.cords = cords;
        this.distance = distance;  // in km
        this.duration = duration;  // in m
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'];
        
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    type = 'running';
    constructor(cords, distance, duration, cadence) {
        super(cords, distance, duration);
        this.cadence = cadence;
        this.calculatePace();
        this._setDescription();
    }

    calculatePace() {
        // min / km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(cords, distance, duration, elevationGain) {
        super(cords, distance, duration);
        this.elevationGain = elevationGain;
        this.calculateSpeed();
        this._setDescription();
    }

    calculateSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

class App {

    #map;
    #mapEvent;
    #workouts = [];

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

        // Get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let activity;

        // If activity is running, create running object
        if (type === 'running') {
            const cadence = +inputCadence.value;

            // Check if data is valid or not
            if (!Number.isFinite(distance) ||
                !Number.isFinite(duration) ||
                !Number.isFinite(cadence)) {
                    return alert('❌ Inputs should be numerical');
            }

            if (distance < 0 ||
                duration < 0 ||
                cadence < 0) {
                    return alert('❌ Distance, Duration, Cadence should be POSITIVE');
            }

            activity = new Running([lat, lng], distance, duration, cadence);
            this.#workouts.push(activity);
        }

        // If activity is cycling, create cycling object
        if (type === 'cycling') {
            const elevationGain = +inputElevation.value;

            // Check if data is valaid or not
            if (!Number.isFinite(distance) ||
                !Number.isFinite(duration) ||
                !Number.isFinite(elevationGain)) {
                    return alert('❌ Inputs should be numerical');
            }

            if (distance < 0 ||
                duration < 0) {
                    return alert('❌ Distance, Duration should be POSITIVE');
            }

            activity = new Cycling([lat, lng], distance, duration, elevationGain);
        }

        // Add new object in workout array
        this.#workouts.push(activity);
        console.log(activity);

        // Render workout on map as marker
        this._renderWorkoutMarker(activity);

        // Render workout on list
        this._renderWorkout(activity);

        // hide input form and clearing input fields
        this._hideMap();
    }

    _renderWorkoutMarker(activity) {
        L.marker(activity.cords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${activity.type}-popup`
            }))
            .setPopupContent(`${activity.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${activity.description}`)
            .openPopup();
    }

    _renderWorkout(activity) {
        let html;
        if (activity.type === 'running') {
            html = `
            <div class="running" data-id="${activity.id}">
                <div class="subHeading">
                    <span class="date">${activity.description}</span>
                </div>
                <div class="info">
                    <div class="dist">
                        🏃‍♂️
                        <span class="value">${activity.distance}</span>
                        <span class="unit">KM</span>
                    </div>
                    <div class="time">
                        ⏱
                        <span class="value">${activity.duration}</span>
                        <span class="unit">MIN</span>
                    </div>
                    <div class="energy">
                        ⚡️
                        <span class="value">${activity.pace.toFixed(1)}</span>
                        <span class="unit">MIN/KM</span>
                    </div>
                    <div class="spm">
                        🦶🏼
                        <span class="value">${activity.cadence}</span>
                        <span class="unit">SPM</span>
                    </div>

                </div>
            </div>
            `
        }

        if (activity.type === 'cycling') {
            html = `
            <div class="cycling" data-id=${activity.id}>
                <div class="subHeading">
                <span class="date">${activity.description}</span>
                </div>
                <div class="info">
                    <div class="dist">
                        🚴‍♀️
                        <span class="value">${activity.distance}</span>
                        <span class="unit">KM</span>
                    </div>
                    <div class="time">
                        ⏱
                        <span class="value">${activity.duration}</span>
                        <span class="unit">MIN</span>
                    </div>
                    <div class="energy">
                        ⚡️
                        <span class="value">${activity.speed.toFixed(1)}</span>
                        <span class="unit">KM/H</span>
                    </div>
                    <div class="spm">
                        <span class="icon"> ⛰ </span>
                        <span class="value">${activity.elevationGain}</span>
                        <span class="unit">M</span>
                    </div>

                </div>
            </div>
            `
        }

        workoutParent.insertAdjacentHTML('afterend', html);
    }

    _hideMap() {
        // clearing input fields
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
        const form = document.querySelector('.workoutParent');
        form.classList.add('hidden');
    }
}

const app = new App();