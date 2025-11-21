import OurWorksSlider from "../components/OurWorksSlider";
import PathPage from "../components/PathPage";
import SidebarInfoDropdown from "../components/Sidebar/SidebarInfoDropdown";
import SidebarInfoMenu from "../components/Sidebar/SidebarInfoMenu";
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp";

export const metadata = {
  title: "Политика использования файлов cookie | Каменная Роза",
  description: "Информация о том, как мы используем файлы cookie на нашем сайте.",
};

const CookiesPage = () => {
  return (
    <>
      <section className="page-centered lg:mt-5 max-w-[1300px] flex">
        <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
          <SidebarCatalogMenu />
          <SidebarInfoMenu />
          <SidebarStickyHelp />
        </div>
        <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
          <div className="w-[100%] block lg:hidden"><SidebarInfoDropdown /></div>
          <div className="ml-5 lg:ml-0 "><PathPage /></div>
          <div className="shadow-sm p-5 lg:p-7.5 w-full">
            <h1 className="text-black text-[28px] leading-8 lg:text-[40px] lg:leading-12 font-[600]">
              Политика использования файлов cookie
            </h1>
            <div className="mt-5 lg:mt-7.5 text-[11pt] text-[#2c3a54]">
              <p>
                Настоящая Политика использования файлов cookie объясняет, как сайт k-r.by использует файлы cookie и аналогичные технологии для улучшения вашего опыта использования сайта.
              </p>
              <br />
              <h2 className="leading-7.5 mt-10">
                <strong>1. Что такое файлы cookie?</strong>
              </h2>
              <p className="mt-3.75">
                Файлы cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении сайта. Они помогают сайту запоминать ваши предпочтения и улучшать работу.
              </p>
              <br />
              <h2 className="leading-7.5 mt-10">
                <strong>2. Как мы используем файлы cookie?</strong>
              </h2>
              <p className="mt-3.75">
                Мы используем файлы cookie для следующих целей:
                <br />
                - Аналитика посещаемости сайта (Яндекс.Метрика)
                <br />
                - Улучшение функциональности сайта
                <br />
                - Запоминание ваших предпочтений
              </p>
              <br />
              <h2 className="leading-7.5 mt-10">
                <strong>3. Управление файлами cookie</strong>
              </h2>
              <p className="mt-3.75">
                Вы можете управлять использованием файлов cookie через настройки вашего браузера. Также на нашем сайте есть баннер с согласием на использование cookie.
              </p>
              <br />
              <h2 className="leading-7.5 mt-10">
                <strong>4. Контакты</strong>
              </h2>
              <p className="mt-3.75">
                Если у вас есть вопросы по поводу файлов cookie, свяжитесь с нами по email: k-r2007@mail.ru
              </p>
            </div>
          </div>
        </div>
      </section>
      <OurWorksSlider />
    </>
  );
};

export default CookiesPage;