import { useState } from '@wordpress/element';
import Sidebar from '../components/Sidebar';
import LibraryList from '../components/LibraryList';
import CreateFlow from '../components/CreateFlow';
import {
	getItemEditUrl,
	getStoredLibraryFilter,
	navigateToUrl,
	storeLibraryFilter,
} from './navigation';

export default function App() {
	const [ filter, setFilter ] = useState( getStoredLibraryFilter );
	const [ isCreating, setIsCreating ] = useState( false );

	const createKind = filter === 'part' ? 'part' : 'template';

	const handleFilter = ( nextFilter ) => {
		setFilter( nextFilter );
		storeLibraryFilter( nextFilter );
	};

	const handleCreated = ( item ) => {
		setIsCreating( false );
		if ( item?.id ) {
			navigateToUrl( getItemEditUrl( item.id ) );
		}
	};

	return (
		<div className="blockish-tb-library-app">
			<Sidebar activeFilter={ filter } onFilter={ handleFilter } />
			<main className="blockish-tb-main">
				<LibraryList
					filter={ filter }
					onCreate={ () => setIsCreating( true ) }
				/>
			</main>
			{ isCreating ? (
				<CreateFlow
					kind={ createKind }
					onCancel={ () => setIsCreating( false ) }
					onSuccess={ handleCreated }
				/>
			) : null }
		</div>
	);
}
