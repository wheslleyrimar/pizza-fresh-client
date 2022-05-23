import { Routes, Route } from 'react-router-dom';
import { RoutePath } from 'types/routes';
import Settings from "pages/Settings/index";
import Login from 'pages/Login';
import ManageProducts from 'components/ManageProducts';
const Router = () => {
    return (
        <Routes>
            <Route path={RoutePath.LOGIN} element={<Login />} />
            <Route path={RoutePath.HOME} element={<Settings />} />
            <Route path={RoutePath.SETTINGS_PRODUCTS} element={<ManageProducts />} />
        </Routes>
    );
}

export default Router;