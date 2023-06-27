import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			redirect: '/chat',
		},
		{
			path: '/chat',
			name: 'chat',
			component: () => import('../views/Chat.vue'),
		},
	],
});

export default router;
