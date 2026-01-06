import { createRouter, createWebHistory } from 'vue-router';
import Home from './modules/dashboard/views/Home.vue';
import Login from './modules/auth/views/Login.vue';
import AuthSuccess from './modules/auth/views/AuthSuccess.vue';
import Register from './modules/auth/views/Register.vue';
import ProcessMeeting from './modules/meetings/views/ProcessMeeting.vue';
import ProcessWhatsApp from './modules/meetings/views/ProcessWhatsApp.vue';
import Opportunities from './modules/meetings/views/Opportunities.vue';
import Preparation from './modules/meetings/views/Preparation.vue';
import Profile from './modules/dashboard/views/Profile.vue';
import VerifyEmail from './modules/auth/views/VerifyEmail.vue';

const routes = [
    { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
    { path: '/home', name: 'HomeAlt', component: Home, meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/process', name: 'ProcessMeeting', component: ProcessMeeting, meta: { requiresAuth: true } },
    { path: '/whatsapp', name: 'ProcessWhatsApp', component: ProcessWhatsApp, meta: { requiresAuth: true } },
    { path: '/test', name: 'TestCapability', component: ProcessMeeting },
    { path: '/opportunities', name: 'Opportunities', component: Opportunities, meta: { requiresAuth: true } },
    { path: '/preparation', name: 'Preparation', component: Preparation, meta: { requiresAuth: true } },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/verify-email', name: 'VerifyEmail', component: VerifyEmail }, // New Route
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
