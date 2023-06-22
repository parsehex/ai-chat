import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faComment,
	faMicrophone,
	faPause,
	faPenToSquare,
	faPlay,
	faPlus,
	faStop,
	faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';
// import router from './router'

const app = createApp(App);

library.add(
	faComment,
	faMicrophone,
	faPause,
	faPenToSquare,
	faPlay,
	faPlus,
	faStop,
	faTrash
);

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(createPinia());
// app.use(router)

app.mount('#main');
