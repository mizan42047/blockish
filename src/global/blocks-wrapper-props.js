import { createHigherOrderComponent } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';
import clsx from 'clsx';
import { useMemo } from '@wordpress/element';
import useDeviceType from '../helpers/use-device-type';

const BlockishBlocksWrapperProps = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const { attributes, name, clientId } = props;
		const deviceType = useDeviceType();
		const { wrapperClassList, resolveThemeOverrideLevel } = window.blockish.helpers;

		// Synced pattern: apply alignfull/alignwide only when align is set.
		if ( name === 'core/block' ) {
			const align = attributes?.align;
			if ( align === 'full' || align === 'wide' ) {
				const wrapperProps = {
					...props.wrapperProps,
					className: clsx(
						props.wrapperProps?.className,
						align === 'full' ? 'alignfull' : 'alignwide'
					),
				};
				return <BlockListBlock { ...props } wrapperProps={ wrapperProps } />;
			}
			return <BlockListBlock { ...props } />;
		}

		if ( name?.includes( 'blockish' ) ) {
			const hash = useMemo( () => clientId?.slice( -6 ), [ clientId ] );
			const overrideLevel = resolveThemeOverrideLevel( attributes );

			const globalWrapperProps = {
				...props.wrapperProps,
				className: clsx( ...wrapperClassList( hash, overrideLevel ) ),
			};

			const wrapperProps = applyFilters(
				'blockish.blockWrapper.attributes',
				globalWrapperProps,
				attributes,
				{ deviceType }
			);

			return <BlockListBlock { ...props } wrapperProps={ wrapperProps } />;
		}

		return <BlockListBlock { ...props } />;
	},
	'BlockishBlocksWrapperProps'
);

export default BlockishBlocksWrapperProps;
