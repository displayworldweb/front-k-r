import OurWorksSlider from '../components/OurWorksSlider';
import PathPage from '../components/PathPage';
import SidebarCatalogMenu from '../components/Sidebar/SidebarCatalogMenu';
import SidebarStickyHelp from '../components/Sidebar/SidebarStickyHelp';
import SidebarInfoMenu from '../components/Sidebar/SidebarInfoMenu';
import SidebarInfoDropdown from '../components/Sidebar/SidebarInfoDropdown';
import { PageDescriptionBlock } from '../components/PageDescriptionBlock';

const PaymentDeliveryPage = () => {
    return (
        <>
            <section className="page-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarInfoMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
                    <div className="w-[100%] block lg:hidden"><SidebarInfoDropdown /></div>
                    <div className='ml-5 lg:ml-0'><PathPage /></div>
                    <div className='p-5 lg:p-7.5 shadow-sm font-[600]'>
                        <h1 className="text-black text-[28px] mb-5 lg:mb-7.5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Оплата и доставка</h1>
                        <PageDescriptionBlock pageSlug="payment" />
                    </div>
                </div>
            </section>

            {/* OurWorksSlider внизу страницы */}
            <OurWorksSlider />
        </>
    );
};

export default PaymentDeliveryPage;