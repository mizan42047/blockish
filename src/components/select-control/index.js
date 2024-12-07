import Select from "react-select";

const BoilerplateSelectControl = ({ label = 'Select', value, onChange, options=[], ...props }) => {

    return (
        <div className="boilerplate-blocks-control boilerplate-blocks-select-control">
			<label>{label}</label>
			<Select
				value={value}
				onChange={onChange}
				options={options}
				theme={(theme) => ({
					...theme,
					colors: {
						...theme.colors,
						primary25: '#F2F4F7',
						primary: '#3BAAFE10',
					},
				})}
				{
					...props
				}
			/>
        </div>
    );
}

export default BoilerplateSelectControl