import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import AuthSuccess from './components/AuthSuccess.vue';
import Register from './components/Register.vue';
import ProcessMeeting from './components/ProcessMeeting.vue';
import ProcessWhatsApp from './components/ProcessWhatsApp.vue'; // Import
import Opportunities from './components/Opportunities.vue';
import Preparation from './components/Preparation.vue';
import Profile from './components/Profile.vue';

const routes = [
    { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
    { path: '/home', name: 'HomeAlt', component: Home, meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/process', name: 'ProcessMeeting', component: ProcessMeeting, meta: { requiresAuth: true } },
    { path: '/whatsapp', name: 'ProcessWhatsApp', component: ProcessWhatsApp, meta: { requiresAuth: true } }, // New Route
    { path: '/test', name: 'TestCapability', component: ProcessMeeting },
    { path: '/opportunities', name: 'Opportunities', component: Opportunities, meta: { requiresAuth: true } },
    { path: '/preparation', name: 'Preparation', component: Preparation, meta: { requiresAuth: true } },
    { path: '/login', name: 'Login', component: Login }, // Note: Login.vue is imported as Login
    { path: '/register', name: 'Register', component: Register },
    { path: '/auth-success', name: 'AuthSuccess', component: AuthSuccess },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if (to.path === '/login' && isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;
