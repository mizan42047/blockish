<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Simple “Show on” matching for Theme Builder parts.
 *
 * Stored as a one-item include list (UI writes this shape):
 * [ { "type": "include", "rule": "entire_site"|"front_page"|"singular"|"archive"|"search"|"404"|"post_type", "value"?: "post"|"page" } ]
 *
 * Empty / invalid → entire site.
 */
class Conditions {

	const RULE_ENTIRE_SITE = 'entire_site';
	const RULE_FRONT_PAGE  = 'front_page';
	const RULE_SINGULAR    = 'singular';
	const RULE_ARCHIVE     = 'archive';
	const RULE_SEARCH      = 'search';
	const RULE_404         = '404';
	const RULE_POST_TYPE   = 'post_type';

	/**
	 * @return array<int, array{type:string,rule:string}>
	 */
	public static function default_conditions() {
		return array(
			array(
				'type' => 'include',
				'rule' => self::RULE_ENTIRE_SITE,
			),
		);
	}

	/**
	 * @param mixed $raw Raw meta value.
	 * @return array<int, array<string, string>>
	 */
	public static function sanitize( $raw ) {
		if ( is_string( $raw ) ) {
			$decoded = json_decode( $raw, true );
			$raw     = is_array( $decoded ) ? $decoded : array();
		}

		if ( ! is_array( $raw ) || empty( $raw[0] ) || ! is_array( $raw[0] ) ) {
			return self::default_conditions();
		}

		$allowed = array(
			self::RULE_ENTIRE_SITE,
			self::RULE_FRONT_PAGE,
			self::RULE_SINGULAR,
			self::RULE_ARCHIVE,
			self::RULE_SEARCH,
			self::RULE_404,
			self::RULE_POST_TYPE,
		);

		$row  = $raw[0];
		$rule = isset( $row['rule'] ) ? sanitize_key( (string) $row['rule'] ) : '';
		if ( ! in_array( $rule, $allowed, true ) ) {
			return self::default_conditions();
		}

		$item = array(
			'type' => 'include',
			'rule' => $rule,
		);

		if ( self::RULE_POST_TYPE === $rule ) {
			$value = ! empty( $row['value'] ) ? sanitize_key( (string) $row['value'] ) : 'post';
			if ( ! in_array( $value, array( 'post', 'page' ), true ) ) {
				$value = 'post';
			}
			$item['value'] = $value;
		}

		return array( $item );
	}

	/**
	 * @param mixed $conditions Conditions array or JSON.
	 * @return string Stable key for uniqueness (area pairing happens separately).
	 */
	public static function signature( $conditions ) {
		$rules = self::sanitize( $conditions );
		$rule  = $rules[0];
		if ( self::RULE_POST_TYPE === $rule['rule'] ) {
			$value = isset( $rule['value'] ) ? (string) $rule['value'] : 'post';
			return self::RULE_POST_TYPE . ':' . $value;
		}
		return (string) $rule['rule'];
	}

	/**
	 * @param mixed $conditions Conditions array or JSON.
	 * @param array $context    Optional request overrides.
	 * @return bool
	 */
	public static function matches( $conditions, array $context = array() ) {
		$rules = self::sanitize( $conditions );
		$rule  = $rules[0];

		$ctx = array_merge(
			array(
				'is_front_page' => is_front_page(),
				'is_home'       => is_home(),
				'is_singular'   => is_singular(),
				'is_archive'    => is_archive(),
				'is_search'     => is_search(),
				'is_404'        => is_404(),
				'post_type'     => get_post_type() ? (string) get_post_type() : '',
			),
			$context
		);

		switch ( $rule['rule'] ) {
			case self::RULE_ENTIRE_SITE:
				return true;
			case self::RULE_FRONT_PAGE:
				return ! empty( $ctx['is_front_page'] );
			case self::RULE_SINGULAR:
				return ! empty( $ctx['is_singular'] );
			case self::RULE_ARCHIVE:
				return ! empty( $ctx['is_archive'] )
					|| ( ! empty( $ctx['is_home'] ) && empty( $ctx['is_front_page'] ) );
			case self::RULE_SEARCH:
				return ! empty( $ctx['is_search'] );
			case self::RULE_404:
				return ! empty( $ctx['is_404'] );
			case self::RULE_POST_TYPE:
				$value = isset( $rule['value'] ) ? (string) $rule['value'] : '';
				return '' !== $value
					&& ! empty( $ctx['is_singular'] )
					&& $value === (string) $ctx['post_type'];
			default:
				return true;
		}
	}
}
