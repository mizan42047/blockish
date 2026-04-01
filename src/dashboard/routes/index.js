import { createContext, useState, useEffect, useContext } from '@wordpress/element';
import history from './history';
import { getLocationWithParams } from '../utils';

const RoutesContext = createContext();
const HistoryContext = createContext();

// Custom hooks to access the location and history
export function useLocation() {
    return useContext(RoutesContext);
}

export function useHistory() {
    return useContext(HistoryContext);
}

// The RouterProvider component for WordPress admin pages
export function RouterProvider({ children }) {
    const [location, setLocation] = useState(() =>
        getLocationWithParams(history.location)
    );

    useEffect(() => {
        return history.listen(({ location: updatedLocation }) => {
            setLocation(getLocationWithParams(updatedLocation));
        });
    }, []);

    return (
        <HistoryContext.Provider value={history}>
            <RoutesContext.Provider value={location}>
                {children}
            </RoutesContext.Provider>
        </HistoryContext.Provider>
    );
}
