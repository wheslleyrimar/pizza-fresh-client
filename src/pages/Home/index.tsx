import Menu from "components/Menu";
import { DateTime } from "luxon";
import { ReactComponent as Search } from "assets/icons/search.svg";
import * as S from "./style";
import { RoutePath } from "types/routes";
import { navigationItems } from "data/navigation";
import ProductItemList from "components/ProductItemList";
import ProductItem from "components/ProductItem";
import OrderDetails from "components/OrderDetails";
import Overlay from "components/Overlay";
import CheckoutSection from "components/CheckoutSection";
import { useNavigate } from "react-router-dom";
import { ProductResponse } from "types/api/product";
import { OrderType } from 'types/orderType';
import { useEffect, useState } from "react";
import { OrderItemType } from "types/OrderItemType";
import { useQuery } from "react-query";
import { QueryKey } from "types/QueryKey";
import { ProductService } from "services/ProductService";
import { TableService } from "services/TableService";
import { Auth } from "helpers/Auth";
import { matchByText } from "helpers/Utils";

const Home = () => {
    const dateDescription = DateTime.now().toLocaleString({...DateTime.DATE_SHORT, weekday: 'long'});
    const navigate = useNavigate();

    const {data: productsData} = useQuery(
        QueryKey.PRODUCTS,
        ProductService.getLista
    );
    
    const {data: tablesData} = useQuery(
        QueryKey.TABLES,
        TableService.getLista
    );

    const tables = tablesData || [];

    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [activeOrderType, setActiverOrderType] = useState(
        OrderType.COMER_NO_LOCAL
    );

    const [orders, setOrders] = useState<OrderItemType[]>([]);
    const [selectedTable, setSelectedTable] = useState<number | undefined>();
    const [proceedToPayment, setProceedToPayment] = useState<boolean>(false);

    const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([]);

    const handleNavigation = (path: RoutePath) => navigate(path);
    
    const handleSelection = (product: ProductResponse) => {
        const existing = orders.find((i) => i.product.id === product.id);
        const quantity = existing ? existing.quantity + 1 : 1;
        const item: OrderItemType = {product, quantity};

        const list = existing
        ? orders.map((i) => (i.product.id === existing.product.id ? item : i))
        : [...orders, item];
        setOrders(list);
    }

    const handleRemoveOrderItem = (id: string) => {
        const filtered = orders.filter((i) => i.product.id !== id);
        setOrders(filtered);
    }

    const handleFilter = (title: string) => {
        const list = products.filter(({name}) => matchByText(name, title));
        setFilteredProducts(list);
    }

    useEffect(() => {
        setProducts(productsData || []);
        setFilteredProducts(productsData || []);
    },[productsData]);

    return (
        <S.Home>
            <Menu 
                active={RoutePath.HOME}
                navItems={navigationItems}
                onNavigate={handleNavigation}
                onLogout={Auth.logout}
            />
            <S.HomeContent>
                <header>
                    <S.HomeHeaderDetails>
                        <div>
                            <S.HomeHeaderDetailsLogo>Pizza Fresh</S.HomeHeaderDetailsLogo>
                            <S.HomeHeaderDetailsDate>{dateDescription}</S.HomeHeaderDetailsDate>
                        </div>
                        <S.HomeHeaderDetailsSearch>
                            <Search />
                            <input
                                type="text"
                                placeholder="Procure pelo sabor"
                                onChange={({target}) => handleFilter(target.value)}/>
                        </S.HomeHeaderDetailsSearch>
                    </S.HomeHeaderDetails>
                </header>
                <div>
                    <S.HomeProductTitle>
                        <b>Pizzas</b>
                    </S.HomeProductTitle>
                    <S.HomeProductList>
                        <ProductItemList tables={tables} onSelectTable={setSelectedTable}>
                            {Boolean(products.length) &&
                            filteredProducts.map((product, index) =>(
                            <ProductItem
                                product={product}
                                key={`ProductItem-${index}`}
                                onSelect={handleSelection}
                            />
                            ))}
                        </ProductItemList>
                    </S.HomeProductList>
                </div>
            </S.HomeContent>
            <aside>
                <OrderDetails
                    orders={orders}
                    onProceedToPayment={() => setProceedToPayment(true)}
                    onOrdersChange={(data) => setOrders(data)}
                    onChangeActiveOrderType={(data)=> setActiverOrderType(data)}
                    activeOrderType={activeOrderType}
                    onRemoveItem={handleRemoveOrderItem}
                    selectedTable={selectedTable} />
            </aside>
            {proceedToPayment && (
            <Overlay>
                <CheckoutSection
                    orders={orders}
                    onOrdersChange={(data) => setOrders(data)}
                    onChangeActiveOrderType={(data)=> setActiverOrderType(data)}
                    activeOrderType={activeOrderType}
                    onCloseSection={() => setProceedToPayment(false)}
                    selectedTable={selectedTable}/>
            </Overlay>
            )}
        </S.Home>
    );
}

export default Home;