import OurWorksSlider from "../components/OurWorksSlider"
import PathPage from "../components/PathPage"
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu"
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp"
import Cards from "./Cards"
import Gallery from "./Gallery"
import Map from "./Map."

const ContactsPage = () => {
    return (
        <>
            <section className="page-centered mt-5 max-w-[1300px] flex">
                <div className="flex w-full">
                    <div className="max-w-[25%] w-full hidden lg:block space-y-7.5">
                        <SidebarCatalogMenu />
                        <SidebarStickyHelp />
                    </div>
                    <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
                        <div className="px-4 lg:px-0">
                            <PathPage />
                            <h1 className="text-black text-[28px] mb-5 lg:mb-7.5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Контакты</h1>
                        </div>
                        <Cards />
                        <Gallery />
                        <Map />
                    </div>
                </div>
            </section>
                <OurWorksSlider />
        </>
    )
}

export default ContactsPage