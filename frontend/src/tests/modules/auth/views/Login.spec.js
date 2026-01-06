import { mount } from '@vue/test-utils';
import Login from '../../../../modules/auth/views/Login.vue';

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: vi.fn() }),
    routerLink: 'a'
}));

describe('Login.vue', () => {
    it('renders login form', () => {
        const wrapper = mount(Login, {
            global: {
                stubs: ['router-link']
            }
        });
        expect(wrapper.find('h1').text()).toContain('Bold Guidance');
        expect(wrapper.find('input#email').exists()).toBe(true);
        expect(wrapper.find('input#password').exists()).toBe(true);
    });
});
