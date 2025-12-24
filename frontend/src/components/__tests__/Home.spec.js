import { mount } from '@vue/test-utils';
import Home from '../Home.vue';

describe('Home.vue', () => {
    it('renders intelligence hub title', () => {
        const wrapper = mount(Home, {
            global: {
                stubs: ['router-link']
            }
        });
        expect(wrapper.find('h1').text()).toBe('Intelligence hub');
    });

    it('shows empty state when history is empty', () => {
        const wrapper = mount(Home, {
            global: {
                stubs: ['router-link']
            }
        });
        expect(wrapper.find('.empty-state').exists()).toBe(true);
        expect(wrapper.text()).toContain('No meetings found');
    });
});
