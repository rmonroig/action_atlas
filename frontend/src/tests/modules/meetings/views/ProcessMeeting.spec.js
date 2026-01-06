import { mount } from '@vue/test-utils';
import ProcessMeeting from '../../../../modules/meetings/views/ProcessMeeting.vue';
import FileDrop from '../../../../components/ui/FileDrop.vue';

// Mock router
vi.mock('vue-router', () => ({
    useRoute: () => ({ query: {} }),
    useRouter: () => ({ push: vi.fn() }),
    routerLink: 'a'
}));

describe('ProcessMeeting.vue', () => {
    it('renders upload section initially', () => {
        const wrapper = mount(ProcessMeeting, {
            global: {
                stubs: ['router-link']
            }
        });
        expect(wrapper.findComponent(FileDrop).exists()).toBe(true);
        expect(wrapper.text()).toContain('New Meeting Analysis');
    });

    it('shows participant inputs', () => {
        const wrapper = mount(ProcessMeeting, {
            global: {
                stubs: ['router-link']
            }
        });
        expect(wrapper.findAll('input[type="email"]').length).toBeGreaterThan(0);
    });
});
