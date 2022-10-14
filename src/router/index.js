import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/stitch'
        },
        {
            path: '/stitch',
            component: () => import('../components/page/stitch.vue'),
            meta: { title: '截图拼接' }
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});
